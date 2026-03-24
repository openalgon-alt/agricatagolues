import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.VITE_CLOUD_SQL_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    // 1. Get a mock test ID
    const { rows: tests } = await pool.query('SELECT id FROM mock_tests LIMIT 1');
    if (tests.length === 0) {
      console.log("No tests found to delete.");
      return;
    }
    const id = tests[0].id;
    console.log(`Trying to delete test ID: ${id}`);

    // Try deleting and see the exact error
    await pool.query('DELETE FROM mock_tests WHERE id = $1', [id]);
    console.log(`Success! Mock test ${id} deleted.`);
  } catch (err) {
    console.error("Failed to delete! Error:");
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
