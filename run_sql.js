import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

const connectionString = "postgresql://postgres:H%7BL6j%7C7kds%5BgbBRt@34.93.188.35:5432/postgres?sslmode=require";

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
