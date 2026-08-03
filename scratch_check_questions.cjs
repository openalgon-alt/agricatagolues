const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/AO_AAO_SUPABASE_URL=\"([^\"]+)\"/)[1];
const key = env.match(/AO_AAO_SUPABASE_SERVICE_ROLE_KEY=\"([^\"]+)\"/)[1];
const supabase = createClient(url, key);
async function check() {
  const { data, error } = await supabase.from('questions').select('*').limit(1);
  console.log(JSON.stringify(error || data, null, 2));
}
check();
