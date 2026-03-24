import pkg from 'pg';
const { Pool } = pkg;

// Use the backend DB url directly
const pool = new Pool({
  connectionString: 'postgresql://postgres:H%7BL6j%7C7kds%5BgbBRt@34.93.188.35:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    // 1. Get a mock test ID
    const { rows: tests } = await pool.query('SELECT id FROM mock_tests ORDER BY id DESC LIMIT 1');
    if (tests.length === 0) {
      console.log("No tests found to delete.");
      return;
    }
    const id = tests[0].id;
    console.log(`Trying to delete test ID: ${id}`);
    
    // First let's try to delete questions just in case
    await pool.query('DELETE FROM mock_questions WHERE mock_test_id = $1', [id]).catch(e => console.log('Mock questions err:', e.message));
    
    try {
      await pool.query(`DELETE FROM exam_submissions WHERE mock_test_id = $1`, [id]);
    } catch(e) { console.log('exam_submissions err', e.message); }
    
    try {
      await pool.query(`DELETE FROM test_attempts WHERE test_id = $1`, [id]);
    } catch(e) { console.log('test_attempts err', e.message); }

    try {
      await pool.query(`DELETE FROM user_purchases WHERE mock_test_id = $1`, [id]);
    } catch(e) { console.log('user_purchases err', e.message); }

    // Try deleting and see the exact error
    await pool.query('DELETE FROM mock_tests WHERE id = $1', [id]);
    console.log(`Success! Mock test ${id} deleted.`);
  } catch (err) {
    console.error("Failed to delete! Exact Error:");
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
