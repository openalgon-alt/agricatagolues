import pkg from 'pg';
const { Client } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionString = "postgresql://postgres:H%7BL6j%7C7kds%5BgbBRt@34.93.188.35:5432/postgres?sslmode=require";

async function insertFreeTest() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log("Connected to DB successfully.");

    // First, show what currently exists
    const existing = await client.query('SELECT id, title, price, is_active FROM mock_tests ORDER BY id');
    console.log("\nExisting mock tests:");
    console.table(existing.rows);

    // Check if Mock Test 1 (price=0, free) already exists
    const freeTest = existing.rows.find(r => r.title === 'Mock Test 1' || (Number(r.price) === 0 && r.title.toLowerCase().includes('mock test')));
    
    if (freeTest) {
      console.log(`\nFree test already exists: ID=${freeTest.id}, Title="${freeTest.title}", is_active=${freeTest.is_active}`);
      // Make sure it's active
      if (!freeTest.is_active) {
        await client.query('UPDATE mock_tests SET is_active = true WHERE id = $1', [freeTest.id]);
        console.log(`Activated test ID=${freeTest.id}`);
      }
    } else {
      // Insert the free Mock Test 1
      const result = await client.query(`
        INSERT INTO mock_tests (title, description, category, price, is_active) 
        VALUES ($1, $2, $3, $4, $5) RETURNING *
      `, [
        'Mock Test 1',
        'Free introductory mock test covering agricultural specimen identification. Includes 50 practical questions.',
        'Agriculture',
        0,
        true
      ]);
      console.log("\nCreated free Mock Test 1:", result.rows[0]);
    }

    // Final state
    const final = await client.query('SELECT id, title, price, is_active FROM mock_tests ORDER BY id');
    console.log("\nFinal mock tests in DB:");
    console.table(final.rows);

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.end();
  }
}

insertFreeTest();
