import pkg from 'pg';
const { Client } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionString = "postgresql://postgres:H%7BL6j%7C7kds%5BgbBRt@34.93.188.35:5432/postgres?sslmode=require";

async function init() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log("Connected to Cloud SQL.");

    // 1. Create mock_tests table
    console.log("Creating mock_tests table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS mock_tests (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        price NUMERIC DEFAULT 0,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create mock_questions table
    console.log("Creating mock_questions table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS mock_questions (
        id SERIAL PRIMARY KEY,
        mock_test_id INTEGER REFERENCES mock_tests(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_option_index INTEGER NOT NULL,
        image_url TEXT,
        marks INTEGER DEFAULT 1,
        topic TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Insert Mock Test 1 if not exists
    const checkRes = await client.query("SELECT id FROM mock_tests WHERE title = 'Mock Test 1' AND price = 0");
    if (checkRes.rows.length === 0) {
      const res = await client.query(`
        INSERT INTO mock_tests (title, description, category, price, is_active)
        VALUES (
          'Mock Test 1', 
          'Free introductory mock test covering agricultural specimen identification. Includes 50 practical questions.', 
          'Agriculture', 
          0, 
          true
        ) RETURNING id
      `);
      console.log("Inserted 'Mock Test 1' with ID:", res.rows[0].id);
    } else {
      console.log("'Mock Test 1' already exists with ID:", checkRes.rows[0].id);
    }

    console.log("\nInitialization complete!");
  } catch (e) {
    console.error("Init failed:", e.message);
  } finally {
    await client.end();
  }
}

init();
