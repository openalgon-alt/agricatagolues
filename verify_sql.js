import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:H%7BL6j%7C7kds%5BgbBRt@34.93.188.35:5432/postgres?sslmode=require";

async function verifySql() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log("Connected to Google Cloud SQL DB successfully.");
    
    // Insert a dummy mock test
    await client.query(`
        INSERT INTO mock_tests (title, description, price, is_active) 
        VALUES ('System Verification Test', 'Testing GCP Connection', 0, true)
    `);
    
    // Select the dummy test
    const res = await client.query('SELECT * FROM mock_tests LIMIT 1');
    console.table(res.rows);
    
    console.log("Verification successful! Tables are readable and writable.");
    
  } catch (error) {
    console.error("Error executing SQL:", error);
  } finally {
    await client.end();
  }
}

verifySql();
