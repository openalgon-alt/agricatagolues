const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/AO_AAO_SUPABASE_URL=\"([^\"]+)\"/)[1];
const key = env.match(/AO_AAO_SUPABASE_SERVICE_ROLE_KEY=\"([^\"]+)\"/)[1];
const supabase = createClient(url, key);

async function test() {
  const subjectId = 'ce580d09-378e-4b80-8fb9-83b66b6316dc'; // From my previous check script output

  console.log("Checking current questions...");
  const { data: before } = await supabase.from('questions').select('paper_number, count', { count: 'exact' }).eq('subject_id', subjectId);
  console.log(before);

  console.log("Inserting into paper 1...");
  const { error: err1 } = await supabase.from('questions').insert([
    { subject_id: subjectId, paper_number: 1, question_text: "Q1", option_a: "A", option_b: "B", option_c: "C", option_d: "D", correct_option: "A", explanation: "" }
  ]);
  console.log(err1 || 'Success');

  console.log("Inserting into paper 2...");
  const { error: err2 } = await supabase.from('questions').insert([
    { subject_id: subjectId, paper_number: 2, question_text: "Q2", option_a: "A", option_b: "B", option_c: "C", option_d: "D", correct_option: "A", explanation: "" }
  ]);
  console.log(err2 || 'Success');

  console.log("Checking current questions again...");
  const { data: after } = await supabase.from('questions').select('paper_number, id, question_text').eq('subject_id', subjectId);
  console.log(after);
}
test();
