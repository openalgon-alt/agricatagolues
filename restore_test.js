import pkg from 'pg';
const { Client } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionString = "postgresql://postgres:H%7BL6j%7C7kds%5BgbBRt@34.93.188.35:5432/postgres?sslmode=require";

async function restoreFreeTest() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log("Connected to DB.");

    // 1. Create the table if it doesn't exist
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
    console.log("Table 'mock_tests' checked/created.");

    // 2. Check if Mock Test 1 exists
    const checkRes = await client.query("SELECT * FROM mock_tests WHERE title = 'Mock Test 1' AND price = 0");
    
    if (checkRes.rows.length === 0) {
      // 3. Insert Mock Test 1
      await client.query(`
        INSERT INTO mock_tests (title, description, category, price, is_active)
        VALUES (
          'Mock Test 1', 
          'Free introductory mock test covering agricultural specimen identification. Includes 50 practical questions.', 
          'Agriculture', 
          0, 
          true
        )
      `);
      console.log("Inserted 'Mock Test 1'.");
    } else {
      console.log("'Mock Test 1' already exists.");
    }

    // 4. Verify
    const finalRes = await client.query("SELECT id, title, price, is_active FROM mock_tests");
    console.table(finalRes.rows);

  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await client.end();
  }
}

restoreFreeTest();
