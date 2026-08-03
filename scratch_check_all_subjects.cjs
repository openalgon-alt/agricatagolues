const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/AO_AAO_SUPABASE_URL=\"([^\"]+)\"/)[1];
const key = env.match(/AO_AAO_SUPABASE_SERVICE_ROLE_KEY=\"([^\"]+)\"/)[1];
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('questions').select('paper_number, subject_id, count', { count: 'exact' });
  console.log("Total DB count:", data ? data.length : 0);
  
  if (data && data.length > 0) {
      // Group by subject_id and paper_number
      const groups = {};
      data.forEach(r => {
          if (!groups[r.subject_id]) groups[r.subject_id] = {};
          groups[r.subject_id][r.paper_number] = (groups[r.subject_id][r.paper_number] || 0) + 1;
      });
      console.log(groups);
  }
}
test();
