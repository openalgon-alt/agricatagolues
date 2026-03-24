import pkg from 'pg';
const { Client } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionString = "postgresql://postgres:H%7BL6j%7C7kds%5BgbBRt@34.93.188.35:5432/postgres?sslmode=require";

async function findTables() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log("Connected to Cloud SQL.");

    // List all databases
    const dbsRes = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false");
    console.log("\nDatabases found:", dbsRes.rows.map(r => r.datname));

    for (const db of dbsRes.rows) {
      console.log(`\nChecking database: ${db.datname}`);
      const dbClient = new Client({
        connectionString: `postgresql://postgres:H%7BL6j%7C7kds%5BgbBRt@34.93.188.35:5432/${db.datname}?sslmode=require`,
        ssl: { rejectUnauthorized: false }
      });
      try {
        await dbClient.connect();
        const tablesRes = await dbClient.query(`
          SELECT table_schema, table_name 
          FROM information_schema.tables 
          WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
          ORDER BY table_schema, table_name
        `);
        if (tablesRes.rows.length > 0) {
          console.table(tablesRes.rows);
        } else {
          console.log("No user tables found.");
        }
      } catch (err) {
        console.log(`Error connecting to ${db.datname}: ${err.message}`);
      } finally {
        await dbClient.end();
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}

findTables();
