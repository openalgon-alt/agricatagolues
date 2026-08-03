const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/AO_AAO_SUPABASE_URL=\"([^\"]+)\"/)[1];
const key = env.match(/AO_AAO_SUPABASE_SERVICE_ROLE_KEY=\"([^\"]+)\"/)[1];
const supabase = createClient(url, key);

async function test() {
  // We can try to query the information_schema using rpc if available, or we just write a sql query using standard supabase rpc if the user created one. 
  // Normally we can't query information_schema directly through PostgREST unless exposed.
  // Let's try to insert two papers again, with lots of rows and see if the old ones get deleted.
  // Wait, I already did this with 1 question each! What if I insert 100 questions into paper 1, and then 100 into paper 2?
  // Let's check how many questions are in the DB for that subject right now!
  const subjectId = 'ce580d09-378e-4b80-8fb9-83b66b6316dc';
  const { data, error } = await supabase.from('questions').select('paper_number, count', { count: 'exact' }).eq('subject_id', subjectId);
  console.log("Current DB count:", data ? data.length : 0);
  
  const { data: papersData } = await supabase.from('questions').select('paper_number').eq('subject_id', subjectId);
  const counts = {};
  if (papersData) {
      papersData.forEach(r => {
          counts[r.paper_number] = (counts[r.paper_number] || 0) + 1;
      });
  }
  console.log("Counts per paper:", counts);
}
test();
