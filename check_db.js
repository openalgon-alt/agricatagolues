const URL = "https://ghjzaplzvbezwejopvfq.supabase.co/rest/v1/questions";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdoanphcGx6dmJlendlam9wdmZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkyMTA4NSwiZXhwIjoyMDk2NDk3MDg1fQ.oUQzZIIc4IrqzF8dSCo8q05f9Ptz0TID1oMzg6VPIxM";

async function main() {
  let allRows = [];
  let offset = 0;
  const limit = 1000;

  console.log("Fetching all questions...");
  while (true) {
    const res = await fetch(`${URL}?select=id,paper_number,question_text,created_at&offset=${offset}&limit=${limit}`, {
      headers: {
        "apikey": KEY,
        "Authorization": `Bearer ${KEY}`
      }
    });
    if (!res.ok) {
      console.error("Fetch failed", await res.text());
      return;
    }
    const data = await res.json();
    allRows.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }

  console.log(`Total rows in DB: ${allRows.length}`);

  const countsByPaper = {};
  for (const row of allRows) {
    const p = row.paper_number;
    countsByPaper[p] = (countsByPaper[p] || 0) + 1;
  }
  
  console.log("Counts per paper:");
  console.log(countsByPaper);
}

main().catch(console.error);
