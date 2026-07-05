import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres.tqssenyemstlqpionqyp:Combride%40123@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

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
