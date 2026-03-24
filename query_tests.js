import pkg from 'pg';
const { Client } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionString = "postgresql://postgres:H%7BL6j%7C7kds%5BgbBRt@34.93.188.35:5432/postgres?sslmode=require";

async function queryTests() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log("Connected.");
    
    console.log("\nMock Tests Table Content:");
    const res = await client.query('SELECT id, title, price, is_active FROM mock_tests');
    console.table(res.rows);

  } catch (e) {
    console.error("Query failed:", e.message);
  } finally {
    await client.end();
  }
}
queryTests();
