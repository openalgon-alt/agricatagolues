import pg from 'pg';
const { Client } = pg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

async function getClient() {
    const connectionString = process.env.DATABASE_URL || process.env.VITE_CLOUD_SQL_URL;
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    return client;
}

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
        return res.status(200).json({});
    }

    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

    const dbUrl = process.env.DATABASE_URL || process.env.VITE_CLOUD_SQL_URL;
    if (!dbUrl) {
        return res.status(500).json({ error: 'DATABASE_URL or VITE_CLOUD_SQL_URL not set.' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, payload } = req.body || {};

    if (!action) {
        return res.status(400).json({ error: 'action is required' });
    }

    let client;
    try {
        client = await getClient();

        if (action === 'start-test') {
            const { user_id, test_id, name, phone, email, college, total_questions } = payload || {};

            await client.query(`
                CREATE TABLE IF NOT EXISTS exam_submissions (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT,
                    test_id INTEGER,
                    name TEXT,
                    phone TEXT,
                    email TEXT,
                    college TEXT,
                    score INTEGER DEFAULT 0,
                    total_questions INTEGER DEFAULT 50,
                    answers JSONB,
                    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    is_completed BOOLEAN DEFAULT false
                );
            `);

            const insertResult = await client.query(
                `INSERT INTO exam_submissions (user_id, test_id, name, phone, email, college, total_questions, is_completed)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, false)
                 RETURNING id`,
                [user_id, test_id, name, phone, email, college, total_questions || 50]
            );

            return res.status(200).json({ attempt_id: insertResult.rows[0].id });
        }

        if (action === 'submit-test') {
            const { submission_id, answers, total_questions } = payload || {};

            if (!submission_id) return res.status(400).json({ error: 'submission_id required' });

            const subResult = await client.query(`SELECT test_id FROM exam_submissions WHERE id = $1`, [submission_id]);
            if (subResult.rows.length === 0) return res.status(404).json({ error: 'Submission not found' });

            const testId = subResult.rows[0].test_id;
            const qResult = await client.query(`SELECT id, options, correct_option_index FROM mock_questions WHERE mock_test_id = $1`, [testId]);
            const questions = qResult.rows;
            let score = 0;

            questions.forEach((q) => {
                const userAnswer = answers?.[q.id];
                const optArray = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]');
                const correctAnswer = optArray[q.correct_option_index];
                if (userAnswer && userAnswer === correctAnswer) score++;
            });

            await client.query(
                `UPDATE exam_submissions SET score = $1, answers = $2, is_completed = true, submitted_at = NOW(), total_questions = $3 WHERE id = $4`,
                [score, JSON.stringify(answers || {}), total_questions || questions.length, submission_id]
            );

            return res.status(200).json({ score, success: true });
        }

        // ---- save-mock-test (admin) ----
        if (action === 'save-mock-test') {
            const { id, title, description, category, price } = payload || {};
            const imageUrl = payload.imageUrl || payload.image_url;
            const isActive = payload.isActive !== undefined ? payload.isActive : payload.is_active;
            
            if (id) {
                const r = await client.query(
                    `UPDATE mock_tests SET title=$1, description=$2, category=$3, price=$4, image_url=$5, is_active=$6 WHERE id=$7 RETURNING *`,
                    [title, description, category, price ?? 0, imageUrl, isActive ?? true, id]
                );
                return res.status(200).json(r.rows[0]);
            } else {
                const r = await client.query(
                    `INSERT INTO mock_tests (title, description, category, price, image_url, is_active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
                    [title, description, category, price ?? 0, imageUrl, isActive ?? true]
                );
                return res.status(200).json(r.rows[0]);
            }
        }

        // ---- save-mock-question (admin) ----
        if (action === 'save-mock-question') {
            const { id, mockTestId, question, options, correctOptionIndex, marks, topic } = payload || {};
            const imageUrl = payload.image || payload.imageUrl || payload.image_url || null;
            
            if (id) {
                const r = await client.query(
                    `UPDATE mock_questions SET question_text=$1, options=$2, correct_option_index=$3, image_url=$4, marks=$5, topic=$6 WHERE id=$7 RETURNING *`,
                    [question, JSON.stringify(options), correctOptionIndex, imageUrl, marks ?? 4, topic, parseInt(id)]
                );
                if (r.rows.length === 0) {
                    return res.status(404).json({ error: `Question with id ${id} not found.` });
                }
                return res.status(200).json(r.rows[0]);
            } else {
                const r = await client.query(
                    `INSERT INTO mock_questions (mock_test_id, question_text, options, correct_option_index, image_url, marks, topic) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
                    [mockTestId, question, JSON.stringify(options), correctOptionIndex, imageUrl, marks ?? 4, topic]
                );
                return res.status(200).json(r.rows[0]);
            }
        }

        // ---- delete-mock-test (admin) ----
        if (action === 'delete-mock-test') {
            const { id } = payload || {};
            if (!id) return res.status(400).json({ error: 'Missing required id' });

            const tablesWithMockTestId = ['mock_questions', 'exam_submissions', 'user_purchases'];
            for (const table of tablesWithMockTestId) {
                try { await client.query(`DELETE FROM ${table} WHERE mock_test_id = $1`, [id]); } catch(e) { console.warn(`Skipped ${table} deletion`, e.message); }
            }
            try { await client.query(`DELETE FROM test_attempts WHERE test_id = $1`, [id]); } catch(e) {}

            await client.query('DELETE FROM mock_tests WHERE id = $1', [id]);
            return res.status(200).json({ success: true });
        }

        // ---- delete-mock-question (admin) ----
        if (action === 'delete-mock-question') {
            const { id } = payload || {};
            if (!id) return res.status(400).json({ error: 'Missing required id' });
            await client.query('DELETE FROM mock_questions WHERE id = $1', [id]);
            return res.status(200).json({ success: true });
        }

        // ---- User Access Management (Admin) ----
        if (action === 'lookup-user-by-email') {
            const { email } = payload || {};
            if (!email) return res.status(400).json({ error: 'Missing email' });

            const trimmed = email.trim();

            // 1. Try user_profiles table first (most up-to-date, populated on signup)
            try {
                const profileResult = await client.query(
                    `SELECT firebase_uid AS user_id, name, email, mobile AS phone FROM user_profiles WHERE email = $1 OR firebase_uid = $1 LIMIT 1`,
                    [trimmed]
                );
                if (profileResult.rows.length > 0) {
                    return res.status(200).json(profileResult.rows[0]);
                }
            } catch (e) { /* user_profiles table may not exist, ignore */ }

            // 2. Fallback: search exam_submissions (users who have taken at least one test)
            const r = await client.query(
                `SELECT user_id, name, email, phone FROM exam_submissions WHERE email = $1 OR user_id = $1 ORDER BY submitted_at DESC LIMIT 1`,
                [trimmed]
            );
            if (r.rows.length === 0) {
                // 3. Last resort: the input might be a raw Firebase UID or email — create a synthetic record
                // so admin can still grant access without the user having taken any test yet.
                return res.status(200).json({
                    user_id: trimmed,
                    name: null,
                    email: trimmed.includes('@') ? trimmed : null,
                    phone: null,
                    _synthetic: true  // flag for frontend to show a warning
                });
            }
            return res.status(200).json(r.rows[0]);
        }

        if (action === 'grant-access') {
            const { userId, mockTestId, amount, paymentMethod } = payload || {};
            if (!userId || mockTestId === undefined || mockTestId === null || !paymentMethod) {
                return res.status(400).json({ error: `Missing required fields. Got: userId=${userId}, mockTestId=${mockTestId}, paymentMethod=${paymentMethod}` });
            }

            const parsedTestId = parseInt(mockTestId);
            if (isNaN(parsedTestId)) {
                return res.status(400).json({ error: `Invalid mockTestId: ${mockTestId}` });
            }

            // Ensure table exists with all required columns
            await client.query(`
                CREATE TABLE IF NOT EXISTS user_purchases (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    mock_test_id INTEGER NOT NULL,
                    amount NUMERIC NOT NULL DEFAULT 0,
                    status TEXT NOT NULL DEFAULT 'active',
                    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    payment_method TEXT DEFAULT 'Online',
                    granted_by_admin BOOLEAN DEFAULT false
                );
            `);

            // Add columns/constraints if missing on older tables (ignore errors if already exist)
            const migrations = [
                `ALTER TABLE user_purchases ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Online'`,
                `ALTER TABLE user_purchases ADD COLUMN IF NOT EXISTS granted_by_admin BOOLEAN DEFAULT false`,
                `ALTER TABLE user_purchases ADD COLUMN IF NOT EXISTS email TEXT`,
            ];
            for (const sql of migrations) {
                try { await client.query(sql); } catch (e) { /* ignore */ }
            }

            // Add unique constraint if missing
            try {
                await client.query(`ALTER TABLE user_purchases ADD CONSTRAINT user_purchases_user_test_unique UNIQUE (user_id, mock_test_id)`);
            } catch (e) { /* already exists, ignore */ }

            // Store email separately so list can display it even if user hasn't done exam_submissions
            const emailToStore = userId.includes('@') ? userId : null;

            const r = await client.query(`
                INSERT INTO user_purchases (user_id, mock_test_id, amount, status, payment_method, granted_by_admin, email)
                VALUES ($1, $2, $3, 'active', $4, true, $5)
                ON CONFLICT (user_id, mock_test_id) DO UPDATE
                SET status = 'active', payment_method = $4, granted_by_admin = true, amount = $3,
                    email = COALESCE(EXCLUDED.email, user_purchases.email)
                RETURNING *
            `, [userId, parsedTestId, amount || 0, paymentMethod, emailToStore]);

            console.log(`[grant-access] Granted access for user=${userId}, test=${parsedTestId}, method=${paymentMethod}`);
            return res.status(200).json(r.rows[0]);
        }

        if (action === 'list-user-access') {
            // Ensure table exists
            await client.query(`
                CREATE TABLE IF NOT EXISTS user_purchases (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    mock_test_id INTEGER NOT NULL,
                    amount NUMERIC NOT NULL DEFAULT 0,
                    status TEXT NOT NULL DEFAULT 'active',
                    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    payment_method TEXT DEFAULT 'Online',
                    granted_by_admin BOOLEAN DEFAULT false
                );
            `);

            // Add email column if missing (safe migration)
            try { await client.query(`ALTER TABLE user_purchases ADD COLUMN IF NOT EXISTS email TEXT`); } catch(e) {}

            // Check if user_profiles table exists
            const profilesExist = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'user_profiles'
                ) as exists
            `);
            const hasProfiles = profilesExist.rows[0]?.exists === true;

            let r;
            if (hasProfiles) {
                r = await client.query(`
                    SELECT 
                        up.*,
                        mt.title as test_title,
                        COALESCE(
                            up.email,
                            (SELECT email FROM user_profiles WHERE firebase_uid = up.user_id LIMIT 1),
                            (SELECT email FROM exam_submissions es WHERE es.user_id = up.user_id LIMIT 1)
                        ) as user_email,
                        COALESCE(
                            (SELECT name FROM user_profiles WHERE firebase_uid = up.user_id LIMIT 1),
                            (SELECT name FROM exam_submissions es WHERE es.user_id = up.user_id LIMIT 1),
                            up.user_id
                        ) as user_name
                    FROM user_purchases up
                    LEFT JOIN mock_tests mt ON up.mock_test_id = mt.id
                    ORDER BY up.purchased_at DESC
                `);
            } else {
                // Safe fallback: no user_profiles table
                r = await client.query(`
                    SELECT 
                        up.*,
                        mt.title as test_title,
                        COALESCE(
                            up.email,
                            (SELECT email FROM exam_submissions es WHERE es.user_id = up.user_id LIMIT 1)
                        ) as user_email,
                        COALESCE(
                            (SELECT name FROM exam_submissions es WHERE es.user_id = up.user_id LIMIT 1),
                            up.email,
                            up.user_id
                        ) as user_name
                    FROM user_purchases up
                    LEFT JOIN mock_tests mt ON up.mock_test_id = mt.id
                    ORDER BY up.purchased_at DESC
                `);
            }

            console.log(`[list-user-access] Found ${r.rows.length} records (hasProfiles=${hasProfiles})`);
            return res.status(200).json(r.rows);
        }

        if (action === 'revoke-access') {
            const { userId, mockTestId } = payload || {};
            if (!userId || !mockTestId) return res.status(400).json({ error: 'Missing required fields' });

            const r = await client.query(
                `UPDATE user_purchases SET status = 'revoked' WHERE user_id = $1 AND mock_test_id = $2 RETURNING *`,
                [userId, mockTestId]
            );
            return res.status(200).json({ success: true, updated: r.rows[0] });
        }

        if (action === 'get-user-purchases') {
            const { userId } = payload || {};
            if (!userId) return res.status(400).json({ error: 'Missing required userId' });

            try {
                const r = await client.query(
                    `SELECT id, user_id as "userId", mock_test_id as "mockTestId", amount, status, purchased_at as "purchasedAt", payment_method as "paymentMethod", granted_by_admin as "grantedByAdmin"
                     FROM user_purchases WHERE user_id = $1 AND status = 'active'`,
                    [userId]
                );
                return res.status(200).json(r.rows);
            } catch (err) {
                // Table might not exist yet
                return res.status(200).json([]);
            }
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error(`api/index error [${action}]:`, err.message);
        return res.status(500).json({ error: err.message });
    } finally {
        if (client) await client.end().catch(() => {});
    }
}
