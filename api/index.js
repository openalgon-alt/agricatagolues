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

        // ---- User Access Management (Admin) ----
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

        if (action === 'students' || action === 'admin-students') {
            try {
                // Return all student profiles safely
                const result = await client.query(`
                    SELECT 
                        firebase_uid, 
                        name, 
                        email, 
                        mobile, 
                        college, 
                        district, 
                        guardian_name, 
                        guardian_profession, 
                        guardian_contact, 
                        created_at 
                    FROM student_profiles 
                    ORDER BY created_at DESC
                `);
                return res.status(200).json({ students: result.rows });
            } catch (err) {
                console.error('[students] Error:', err);
                // Return empty safely
                return res.status(200).json({ students: [] });
            }
        }

        return res.status(200).json({ success: true, message: 'Default action completed successfully' });

    } catch (err) {
        console.error(`api/index error [${action}]:`, err.message);
        return res.status(500).json({ error: err.message });
    } finally {
        if (client) await client.end().catch(() => {});
    }
}
