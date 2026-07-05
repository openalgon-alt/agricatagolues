import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const connectionString = "postgresql://postgres.tqssenyemstlqpionqyp:Combride%40123@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

async function executeSql() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log("Connected to Google Cloud SQL DB successfully.");
    
    // Read the SQL file
    const sql = fs.readFileSync('neon_init.sql', 'utf8');
    
    // Execute the SQL
    await client.query(sql);
    console.log("Tables created successfully.");
    
  } catch (error) {
    console.error("Error executing SQL:", error);
  } finally {
    await client.end();
  }
}

executeSql();
