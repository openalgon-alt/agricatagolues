import pkg from 'pg';
const { Client } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Decode the URL to see the actual password
const raw = "postgresql://postgres:H%7BL6j%7C7kds%5BgbBRt@34.93.188.35:5432/postgres?sslmode=require";
console.log("Decoded URL:", decodeURIComponent(raw));

// Try connecting to different database names common in these setups
const dbNames = ['postgres', 'agricatalogues', 'agri', 'neondb', 'mydb', 'app', 'main'];

async function tryDb(dbName) {
  const url = `postgresql://postgres:H%7BL6j%7C7kds%5BgbBRt@34.93.188.35:5432/${dbName}?sslmode=require`;
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    if (tables.rows.length > 0) {
      console.log(`\n✅ DB "${dbName}" has tables:`, tables.rows.map(r => r.table_name));
    } else {
      console.log(`   DB "${dbName}": empty (no tables)`);
    }
  } catch(e) {
    console.log(`   DB "${dbName}": ERROR - ${e.message.split('\n')[0]}`);
  } finally {
    await client.end();
  }
}

for (const db of dbNames) {
  await tryDb(db);
}
