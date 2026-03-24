import pg from 'pg';
const { Client } = pg;

// Bypass SSL certificate validation issue in some Node environments
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

    if (!process.env.DATABASE_URL) {
        return res.status(500).json({ error: 'DATABASE_URL environment variable is not set.' });
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        await client.connect();
        const { rows } = await client.query(
            `SELECT id, title, description, category, price, image_url, is_active 
             FROM mock_tests 
             WHERE is_active = true 
             ORDER BY price ASC, id ASC`
        );
        return res.status(200).json(rows);
    } catch (err) {
        console.error('mock-tests error:', err.message);
        return res.status(500).json({ error: err.message });
    } finally {
        await client.end().catch(() => {});
    }
}
