import pg from 'pg';
const { Client } = pg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

export default async function handler(req, res) {
    Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    const dbUrl = process.env.CLOUD_SQL_URL || process.env.VITE_CLOUD_SQL_URL || process.env.DATABASE_URL;
    if (!dbUrl) {
        return res.status(500).json({ error: 'DATABASE_URL or CLOUD_SQL_URL environment variable is not set.' });
    }

    let testId;
    if (req.method === 'POST') {
        testId = req.body?.test_id;
    } else {
        testId = req.query?.test_id;
    }

    if (!testId) {
        return res.status(400).json({ error: 'test_id is required' });
    }

    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await client.connect();

        const testResult = await client.query(
            `SELECT id, title, description, category, price, image_url 
             FROM mock_tests WHERE id = $1`,
            [testId]
        );

        if (testResult.rows.length === 0) {
            return res.status(404).json({ error: 'Test not found' });
        }

        const qResult = await client.query(
            `SELECT id, mock_test_id, question_text, options,
                    correct_option_index, image_url, marks, topic
             FROM mock_questions 
             WHERE mock_test_id = $1 
             ORDER BY id ASC`,
            [testId]
        );

        console.log('[mock-questions] Fetched', qResult.rows.length,
            'questions for test_id:', testId,
            '| first correct_option_index sample:',
            qResult.rows[0]?.correct_option_index);


        return res.status(200).json({
            test: testResult.rows[0],
            questions: qResult.rows,
        });
    } catch (err) {
        console.error('mock-questions error:', err.message);
        return res.status(500).json({ error: err.message });
    } finally {
        await client.end().catch(() => {});
    }
}
