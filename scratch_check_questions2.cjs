const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/AO_AAO_SUPABASE_URL=\"([^\"]+)\"/)[1];
const key = env.match(/AO_AAO_SUPABASE_SERVICE_ROLE_KEY=\"([^\"]+)\"/)[1];
const supabase = createClient(url, key);

async function check() {
  // Try to use RPC to run raw SQL, or just fetch all data for a subject to see what happens
  const { data, error } = await supabase.from('questions').select('paper_number, subject_id, count(*) as cnt');
  console.log(JSON.stringify(error || data, null, 2));
}
check();
