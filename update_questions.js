import pkg from 'pg';
const { Client } = pkg;

const connectionString = "postgresql://postgres:H%7BL6j%7C7kds%5BgbBRt@34.93.188.35:5432/postgres?sslmode=require";

async function updateQuestions() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log("Connected to DB successfully.");
    
    // Count before
    const countRes = await client.query('SELECT COUNT(*) FROM mock_questions');
    console.log(`Total questions: ${countRes.rows[0].count}`);
    
    // Update all questions
    const result = await client.query(
      "UPDATE mock_questions SET question_text = 'Identify the Specimen?'"
    );
    console.log(`Updated ${result.rowCount} questions to 'Identify the Specimen?'`);
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}

updateQuestions();
