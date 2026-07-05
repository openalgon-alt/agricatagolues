import pkg from 'pg';
const { Client } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionString = "postgresql://postgres.tqssenyemstlqpionqyp:Combride%40123@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

async function deepScan() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log("Connected.");
    
    console.log("\nTables in all schemas:");
    const res = await client.query(`
      SELECT schemaname, tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
    `);
    console.table(res.rows);

    const dbs = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false");
    console.log("\nOther databases:", dbs.rows.map(r => r.datname));

  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
deepScan();
