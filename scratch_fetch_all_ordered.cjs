const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/AO_AAO_SUPABASE_URL=\"([^\"]+)\"/)[1];
const key = env.match(/AO_AAO_SUPABASE_SERVICE_ROLE_KEY=\"([^\"]+)\"/)[1];
const supabase = createClient(url, key);

async function test() {
  const subjectId = 'ce580d09-378e-4b80-8fb9-83b66b6316dc';
  let allRows = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
      const { data, error } = await supabase.from('questions')
          .select('paper_number')
          .eq('subject_id', subjectId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allRows.push(...data);
      if (data.length < limit) break;
      offset += limit;
  }
  
  const counts = {};
  allRows.forEach(r => {
      counts[r.paper_number] = (counts[r.paper_number] || 0) + 1;
  });
  console.log("Counts per paper:", counts);
}
test();
