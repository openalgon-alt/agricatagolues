import pg from 'pg';
const { Client } = pg;
async function test() {
  const client = new Client({ connectionString: 'postgresql://postgres.tqssenyemstlqpionqyp:Combride%40123@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres', ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_name = 'student_profiles'");
  console.log(res.rows);
  await client.end();
}
test();
