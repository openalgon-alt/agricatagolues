const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/AO_AAO_SUPABASE_URL=\"([^\"]+)\"/)[1];
const key = env.match(/AO_AAO_SUPABASE_SERVICE_ROLE_KEY=\"([^\"]+)\"/)[1];
const supabase = createClient(url, key);

async function test() {
  const subjectId = 'ce580d09-378e-4b80-8fb9-83b66b6316dc';
  const paperNum = NaN;
  const { data, error } = await supabase.from('questions')
      .select('id, paper_number')
      .eq('subject_id', subjectId)
      .eq('paper_number', paperNum);
  
  console.log("Error:", error);
  console.log("Data count:", data ? data.length : 0);
  if (data && data.length > 0) {
      console.log("Sample data:", data[0]);
  }
}
test();
