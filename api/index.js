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
    const connectionString = process.env.CLOUD_SQL_URL || process.env.VITE_CLOUD_SQL_URL || process.env.DATABASE_URL;
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

    const dbUrl = process.env.CLOUD_SQL_URL || process.env.VITE_CLOUD_SQL_URL || process.env.DATABASE_URL;
    if (!dbUrl) {
        return res.status(500).json({ error: 'CLOUD_SQL_URL or VITE_CLOUD_SQL_URL not set.' });
    }

    let parsedAction = null;
    let parsedPayload = {};

    if (req.method === 'POST') {
        parsedAction = req.body?.action || null;
        parsedPayload = req.body?.payload || req.body || {};
    } else if (req.method === 'GET' || req.method === 'DELETE') {
        parsedPayload = req.query || {};
        if (req.method === 'DELETE' && req.body) {
            parsedPayload = { ...parsedPayload, ...req.body };
        }
    }

    if (!parsedAction) {
        // Fallback: extract action directly from URL segment
        const urlParts = (req.url || '').split('?')[0].split('/');
        const endpoint = urlParts[urlParts.length - 1];
        
        if (endpoint && endpoint !== 'api' && endpoint !== 'index') {
            parsedAction = endpoint;
            
            // Map legacy frontend URLs to exact action string names
            if (endpoint === 'user-purchases' && req.method === 'GET') parsedAction = 'get-user-purchases';
            if (endpoint === 'user-submissions' && req.method === 'GET') parsedAction = 'get-user-submissions';
            if (endpoint === 'user-performance' && req.method === 'GET') parsedAction = 'get-user-performance';
            if (endpoint === 'offline-coaching' && req.method === 'GET') parsedAction = 'list-offline-coaching';
            if (endpoint === 'save-offline-coaching') parsedAction = 'save-offline-coaching';
            if (endpoint === 'delete-offline-coaching') parsedAction = 'delete-offline-coaching';
        }
    }

    const action = parsedAction;
    const payload = parsedPayload;

    if (!action) {
        return res.status(400).json({ error: 'action is required' });
    }

    let client;
    try {
        client = await getClient();

        if (action === 'get-profile') {
            const { firebase_uid } = payload || {};
            if (!firebase_uid) return res.status(400).json({ error: 'firebase_uid required' });
            try {
                const r = await client.query(`SELECT * FROM student_profiles WHERE firebase_uid=$1`, [firebase_uid]);
                return res.status(200).json({ profile: r.rows[0] });
            } catch (e) {
                return res.status(200).json({ profile: null });
            }
        }

        if (action === 'save-profile') {
            const { firebase_uid, name, mobile, email, college, district, guardian_name, guardian_profession, guardian_contact } = payload || {};
            if (!firebase_uid) return res.status(400).json({ error: 'firebase_uid required' });

            await client.query(`
                CREATE TABLE IF NOT EXISTS student_profiles (
                    firebase_uid TEXT PRIMARY KEY,
                    name TEXT,
                    email TEXT,
                    mobile TEXT,
                    college TEXT,
                    district TEXT,
                    guardian_name TEXT,
                    guardian_profession TEXT,
                    guardian_contact TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);

            const r = await client.query(`
                INSERT INTO student_profiles (firebase_uid, name, email, mobile, college, district, guardian_name, guardian_profession, guardian_contact)
                VALUES ($1, COALESCE($2, ''), COALESCE($3, ''), COALESCE($4, ''), COALESCE($5, ''), COALESCE($6, ''), COALESCE($7, ''), COALESCE($8, ''), COALESCE($9, ''))
                ON CONFLICT (firebase_uid) DO UPDATE SET
                    name = EXCLUDED.name,
                    email = COALESCE(EXCLUDED.email, student_profiles.email),
                    mobile = EXCLUDED.mobile,
                    college = EXCLUDED.college,
                    district = EXCLUDED.district,
                    guardian_name = EXCLUDED.guardian_name,
                    guardian_profession = EXCLUDED.guardian_profession,
                    guardian_contact = EXCLUDED.guardian_contact,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING *
            `, [firebase_uid, name, email, mobile, college, district, guardian_name, guardian_profession, guardian_contact]);

            return res.status(200).json({ success: true, profile: r.rows[0] });
        }

        if (action === 'start-test') {
            const { user_id, test_id, name, phone, email, college, total_questions, retake } = payload || {};

            // ── STRICT UID TRACE — verify what user_id reaches the backend
            console.log('[start-test] >>> user_id received:', JSON.stringify(user_id));
            console.log('[start-test] test_id:', test_id, '| retake:', retake);

            if (!user_id) return res.status(400).json({ error: 'user_id is required' });
            if (!test_id) return res.status(400).json({ error: 'test_id is required' });

            // Ensure table exists
            await client.query(`
                CREATE TABLE IF NOT EXISTS exam_submissions (
                    id               SERIAL PRIMARY KEY,
                    user_id          TEXT,
                    test_id          INTEGER,
                    name             TEXT,
                    phone            TEXT,
                    email            TEXT,
                    college          TEXT,
                    score            INTEGER DEFAULT NULL,
                    total_questions  INTEGER DEFAULT 50,
                    answers          JSONB,
                    submitted_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    is_completed     BOOLEAN DEFAULT false
                );
            `);

            // Fix old rows that have score=0 with is_completed=false (old DEFAULT 0 artefacts)
            await client.query(`
                UPDATE exam_submissions SET score = NULL
                WHERE is_completed = false AND score = 0
            `);

            // ── Explicit SELECT → UPDATE or INSERT (avoids ON CONFLICT dependency) —
            const existing = await client.query(
                `SELECT id FROM exam_submissions WHERE user_id = $1 AND test_id = $2 LIMIT 1`,
                [user_id, String(test_id)]
            );

            let attempt_id;

            if (existing.rows.length > 0) {
                // Row already exists — reset it (handles first attempt AND retake uniformly)
                attempt_id = existing.rows[0].id;
                await client.query(
                    `UPDATE exam_submissions
                     SET score = NULL, answers = NULL, is_completed = false,
                         submitted_at = NOW(), total_questions = $3,
                         name = $4, phone = $5, email = $6, college = $7
                     WHERE id = $1 AND user_id = $2`,
                    [attempt_id, user_id, total_questions || 50, name || '', phone || '', email || '', college || '']
                );
                console.log('[start-test] RESET existing row. attempt_id:', attempt_id, '| user_id:', user_id);
            } else {
                // No existing row — create one
                const ins = await client.query(
                    `INSERT INTO exam_submissions
                        (user_id, test_id, name, phone, email, college, total_questions, is_completed, score)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, false, NULL)
                     RETURNING id`,
                    [user_id, String(test_id), name || '', phone || '', email || '', college || '', total_questions || 50]
                );
                attempt_id = ins.rows[0].id;
                console.log('[start-test] INSERTED new row. attempt_id:', attempt_id, '| user_id:', user_id);
            }

            // Final verification log
            const verify = await client.query(
                `SELECT id, user_id, test_id, score, is_completed FROM exam_submissions WHERE id = $1`,
                [attempt_id]
            );
            console.log('[start-test] DB row after start:', JSON.stringify(verify.rows[0]));

            return res.status(200).json({ attempt_id });
        }

        if (action === 'submit-test') {
            const { submission_id, answers, total_questions, user_id } = payload || {};

            // ── STRICT UID TRACE — verify what reaches the backend
            console.log('[submit-test] >>> submission_id:', submission_id, '| user_id:', user_id);

            if (!submission_id) return res.status(400).json({ error: 'submission_id required' });

            const subResult = await client.query(
                `SELECT id, test_id, user_id FROM exam_submissions WHERE id = $1`,
                [submission_id]
            );
            if (subResult.rows.length === 0) {
                console.error('[submit-test] No row found for attempt_id:', submission_id);
                return res.status(404).json({ error: 'Submission not found. attempt_id: ' + submission_id });
            }

            const row = subResult.rows[0];
            console.log('[submit-test] DB row user_id:', row.user_id, '| incoming user_id:', user_id);

            // Sanity check: warn if UID mismatch (don't block, just log)
            if (user_id && row.user_id !== user_id) {
                console.error('[submit-test] ⚠️ UID MISMATCH! DB has:', row.user_id, 'but request says:', user_id);
            }

            const testId = row.test_id;
            console.log('[submit-test] Scoring test_id:', testId, 'attempt_id:', submission_id);

            const qResult = await client.query(
                `SELECT id, options, correct_option_index FROM mock_questions WHERE mock_test_id = $1`,
                [testId]
            );
            const questions = qResult.rows;
            let score = 0;

            // ── DEFINITIVE DEBUG: dump raw answers object and question IDs ─────────
            console.log('[submit-test] answers object:', JSON.stringify(answers));
            console.log('[submit-test] question IDs from DB:', questions.map(q => `${q.id}(${typeof q.id})`).join(', '));
            console.log('[submit-test] answers keys:', Object.keys(answers || {}).join(', '));

            questions.forEach((q) => {
                // JSON always has string keys — use String(q.id) as primary lookup
                const qIdStr    = String(q.id);
                const rawAnswer = answers?.[qIdStr] ?? answers?.[q.id];
                const userIndex    = parseInt(String(rawAnswer ?? ''), 10);
                const correctIndex = parseInt(String(q.correct_option_index ?? ''), 10);

                const isCorrect = !isNaN(userIndex) && !isNaN(correctIndex)
                    && userIndex === correctIndex;

                if (isCorrect) score++;

                const optArray = Array.isArray(q.options)
                    ? q.options : JSON.parse(q.options || '[]');
                console.log(`[submit-test] Q${q.id}:`,
                    `answers["${qIdStr}"]="${rawAnswer}"`,
                    `userIdx=${userIndex} → "${optArray[userIndex] ?? 'N/A'}"`,
                    `correctIdx=${correctIndex} → "${optArray[correctIndex] ?? 'N/A'}"`,
                    isCorrect ? '✓' : isNaN(userIndex) ? '⚠ skipped(bad format)' : '✗'
                );
            });

            console.log('[submit-test] Score computed:', score, '/', (total_questions || questions.length));

            // UPDATE only — never insert
            const updated = await client.query(
                `UPDATE exam_submissions
                 SET score = $1, answers = $2, is_completed = true,
                     submitted_at = NOW(), total_questions = $3
                 WHERE id = $4
                 RETURNING id, user_id, score, total_questions, is_completed`,
                [score, JSON.stringify(answers || {}), total_questions || questions.length, submission_id]
            );

            console.log('[submit-test] Updated row:', JSON.stringify(updated.rows[0]));

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

            // 1. Try student_profiles table first (most up-to-date, populated on signup)
            try {
                const profileResult = await client.query(
                    `SELECT firebase_uid AS user_id, name, email, mobile AS phone FROM student_profiles WHERE email = $1 OR firebase_uid = $1 LIMIT 1`,
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

            // Check if student_profiles table exists
            const profilesExist = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'student_profiles'
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
                            (SELECT email FROM student_profiles WHERE firebase_uid = up.user_id LIMIT 1),
                            (SELECT email FROM exam_submissions es WHERE es.user_id = up.user_id LIMIT 1)
                        ) as user_email,
                        COALESCE(
                            (SELECT name FROM student_profiles WHERE firebase_uid = up.user_id LIMIT 1),
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
        // ---- Legacy Action Maps ----
        if (action === 'get-user-submissions') {
            const userId = String(payload.userId || '').trim();
            if (!userId) return res.status(400).json({ error: 'userId required' });
            console.log('[get-user-submissions] >>> userId:', JSON.stringify(userId));
            try {
                const r = await client.query(
                    `SELECT id,
                            user_id,
                            test_id          AS "mockTestId",
                            score,
                            total_questions  AS "totalQuestions",
                            is_completed     AS "isCompleted",
                            submitted_at     AS "submittedAt",
                            answers
                     FROM exam_submissions
                     WHERE user_id = $1
                     ORDER BY submitted_at DESC`,
                    [userId]
                );
                console.log('[get-user-submissions] Rows found:', r.rows.length);
                return res.status(200).json(r.rows);
            } catch(e) {
                console.error('[get-user-submissions] Error:', e.message);
                return res.status(200).json([]);
            }
        }

        if (action === 'get-user-performance') {
            const userId = String(payload.userId || '').trim();
            if (!userId) return res.status(400).json({ error: 'userId required' });

            // ── STRICT UID TRACE — what user_id is this query using?
            console.log('[get-user-performance] >>> userId received:', JSON.stringify(userId));
            try {
                // ════════════════════════════════════════════════════════════
                // DEBUG STEP 1: ALL rows in the entire table (no filter)
                // Shows if data was stored under a different user_id
                // ════════════════════════════════════════════════════════════
                const allRows = await client.query(`
                    SELECT id, user_id, score, is_completed, submitted_at
                    FROM exam_submissions
                    ORDER BY submitted_at DESC
                    LIMIT 50
                `);
                console.log('[DEBUG] ALL rows in exam_submissions:',
                    JSON.stringify(allRows.rows));

                // ════════════════════════════════════════════════════════════
                // DEBUG STEP 2: Rows for THIS userId (unfiltered)
                // ════════════════════════════════════════════════════════════
                const filteredRows = await client.query(`
                    SELECT id, user_id, score, is_completed, submitted_at
                    FROM exam_submissions
                    WHERE user_id = $1
                    ORDER BY submitted_at DESC
                `, [userId]);
                console.log('[DEBUG] Rows WHERE user_id =', JSON.stringify(userId), ':',
                    JSON.stringify(filteredRows.rows));

                // ════════════════════════════════════════════════════════════
                // DEBUG STEP 3: Rows that pass the metrics filter
                // ════════════════════════════════════════════════════════════
                const metricRows = await client.query(`
                    SELECT id, score
                    FROM exam_submissions
                    WHERE user_id = $1
                      AND is_completed = true
                      AND score IS NOT NULL
                    ORDER BY submitted_at DESC
                `, [userId]);
                console.log('[DEBUG] metric_rows (is_completed=true, score NOT NULL):',
                    JSON.stringify(metricRows.rows));

                // ── 1. Single aggregate query — total, avg, best from SAME dataset ──
                const aggResult = await client.query(`
                    SELECT
                        COUNT(*)                              AS total_tests,
                        COALESCE(ROUND(AVG(score), 0), 0)    AS avg_score,
                        COALESCE(MAX(score), 0)               AS best_score
                    FROM exam_submissions
                    WHERE user_id = $1
                      AND is_completed = true
                      AND score IS NOT NULL
                `, [userId]);

                const agg = aggResult.rows[0];
                const totalAttempts = parseInt(agg.total_tests)  || 0;
                const averageScore  = Math.round(parseFloat(agg.avg_score)  || 0);
                const bestScore     = Math.round(parseFloat(agg.best_score) || 0);

                console.log('[get-user-performance] Aggregate:', { totalAttempts, averageScore, bestScore });

                // ── 2. Per-test history (display only, not used for metrics) ────
                const history = await client.query(`
                    SELECT
                        s.id,
                        s.test_id      AS "testId",
                        t.title        AS "testTitle",
                        COALESCE(s.score, 0)            AS score,
                        COALESCE(s.total_questions, 50) AS "totalQuestions",
                        s.submitted_at AS "submittedAt",
                        ROUND(
                            COALESCE(s.score, 0) * 100.0
                            / NULLIF(COALESCE(s.total_questions, 50), 0)
                        , 1) AS percentage
                    FROM exam_submissions s
                    LEFT JOIN mock_tests t ON s.test_id = t.id
                    WHERE s.user_id = $1 AND s.is_completed = true AND s.score IS NOT NULL
                    ORDER BY s.submitted_at DESC
                `, [userId]);

                // ── 3. Subject Analysis — latest score per mock test ────────────────
                let subjectPerformance = [];
                try {
                    const fallback = await client.query(`
                        SELECT 
                            COALESCE(t.title, 'Unknown Test') AS subject,
                            ROUND(
                                COALESCE(s.score, 0) * 100.0 
                                / NULLIF(COALESCE(s.total_questions, 50), 0)
                            , 0) AS percentage
                        FROM (
                            SELECT test_id, score, total_questions, submitted_at,
                                   ROW_NUMBER() OVER(PARTITION BY test_id ORDER BY submitted_at DESC) as rn
                            FROM exam_submissions
                            WHERE user_id = $1 AND is_completed = true AND score IS NOT NULL
                        ) s
                        LEFT JOIN mock_tests t ON s.test_id = t.id
                        WHERE s.rn = 1
                        ORDER BY s.submitted_at DESC
                    `, [userId]);
                    subjectPerformance = fallback.rows.map(r => ({
                        subject:    r.subject,
                        percentage: Math.round(parseFloat(r.percentage) || 0)
                    }));
                } catch (err) {
                    console.error('[get-user-performance] Subject query failed:', err.message);
                }

                const response = {
                    totalAttempts,
                    totalTestsTaken: totalAttempts,
                    averageScore,
                    bestScore,
                    history: history.rows,
                    subjectPerformance,
                    // ── DEBUG payload: included temporarily for diagnosis ──
                    _debug: {
                        firebase_user_id: userId,
                        all_rows:         allRows.rows,
                        filtered_rows:    filteredRows.rows,
                        metric_rows:      metricRows.rows,
                    }
                };

                console.log('[get-user-performance] Final response:', {
                    totalAttempts, averageScore, bestScore,
                    subjectCount: subjectPerformance.length,
                    debug_all_row_count:    allRows.rows.length,
                    debug_filtered_count:   filteredRows.rows.length,
                    debug_metric_count:     metricRows.rows.length,
                });

                return res.status(200).json(response);
            } catch(e) {
                console.error('[get-user-performance] Error:', e.message);
                return res.status(200).json({
                    totalAttempts: 0, totalTestsTaken: 0,
                    averageScore: 0, bestScore: 0,
                    history: [], subjectPerformance: [],
                    _debug: { firebase_user_id: userId, error: e.message }
                });
            }
        }

        if (action === 'list-offline-coaching') {
            try {
                const r = await client.query(`SELECT * FROM offline_coaching_centers ORDER BY id ASC`);
                return res.status(200).json(r.rows);
            } catch(e) { return res.status(200).json([]); }
        }

        if (action === 'save-offline-coaching') {
            const { id, name, location, contact, is_active } = payload || {};
            await client.query(`CREATE TABLE IF NOT EXISTS offline_coaching_centers (id SERIAL PRIMARY KEY, name TEXT, location TEXT, contact TEXT, is_active BOOLEAN DEFAULT true)`);
            if (id) {
                const r = await client.query(`UPDATE offline_coaching_centers SET name=$1, location=$2, contact=$3, is_active=$4 WHERE id=$5 RETURNING *`, [name, location, contact, is_active ?? true, id]);
                return res.status(200).json(r.rows[0]);
            } else {
                const r = await client.query(`INSERT INTO offline_coaching_centers (name, location, contact, is_active) VALUES ($1,$2,$3,$4) RETURNING *`, [name, location, contact, is_active ?? true]);
                return res.status(200).json(r.rows[0]);
            }
        }

        if (action === 'delete-offline-coaching') {
            const { id } = payload || {};
            if (!id) return res.status(400).json({ error: 'id required' });
            await client.query(`DELETE FROM offline_coaching_centers WHERE id=$1`, [id]);
            return res.status(200).json({ success: true });
        }

        // ---- Manual Payment System ----
        if (action === 'submit-payment-request') {
            const { user_email, utr, amount } = payload || {};
            if (!user_email || !utr) return res.status(400).json({ error: 'Email and UTR are required' });

            await client.query(`
                CREATE TABLE IF NOT EXISTS payment_requests (
                    id SERIAL PRIMARY KEY,
                    user_email TEXT NOT NULL,
                    utr TEXT NOT NULL,
                    amount NUMERIC NOT NULL,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);

            const r = await client.query(
                `INSERT INTO payment_requests (user_email, utr, amount, status) VALUES ($1, $2, $3, 'pending') RETURNING *`,
                [user_email, utr, amount || 0]
            );
            return res.status(200).json({ success: true, request: r.rows[0] });
        }

        if (action === 'list-payment-requests') {
            try {
                const r = await client.query(`SELECT * FROM payment_requests ORDER BY created_at DESC`);
                return res.status(200).json(r.rows);
            } catch (err) {
                return res.status(200).json([]);
            }
        }

        if (action === 'update-payment-request') {
            const { id, status } = payload || {};
            if (!id || !status) return res.status(400).json({ error: 'ID and Status required' });
            const r = await client.query(
                `UPDATE payment_requests SET status = $1 WHERE id = $2 RETURNING *`,
                [status, id]
            );
            return res.status(200).json({ success: true, request: r.rows[0] });
        }
        if (action === 'get-settings') {
            await client.query(`
                CREATE TABLE IF NOT EXISTS global_settings (
                    setting_key TEXT PRIMARY KEY,
                    setting_value TEXT
                )
            `);
            const r = await client.query(`SELECT * FROM global_settings`);
            const settingsObj = {};
            r.rows.forEach(row => {
                settingsObj[row.setting_key] = row.setting_value;
            });
            return res.status(200).json(settingsObj);
        }

        if (action === 'update-settings') {
            const { settings } = payload || {};
            if (!settings || typeof settings !== 'object') return res.status(400).json({ error: 'Settings object required' });

            await client.query(`
                CREATE TABLE IF NOT EXISTS global_settings (
                    setting_key TEXT PRIMARY KEY,
                    setting_value TEXT
                )
            `);

            for (const [k, v] of Object.entries(settings)) {
                await client.query(
                    `INSERT INTO global_settings (setting_key, setting_value) VALUES ($1, $2)
                     ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`,
                    [k, String(v)]
                );
            }
            return res.status(200).json({ success: true });
        }

        return res.status(200).json({ success: true, message: 'Default action completed successfully' });

    } catch (err) {
        console.error(`api/index error [${action}]:`, err.message);
        return res.status(500).json({ error: err.message });
    } finally {
        if (client) await client.end().catch(() => {});
    }
}
