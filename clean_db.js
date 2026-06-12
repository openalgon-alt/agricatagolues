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

  console.log(`Total rows fetched: ${allRows.length}`);

  // Group by paper_number and question_text
  const groups = {};
  for (const row of allRows) {
    const key = `${row.paper_number}___${row.question_text}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  }

  const idsToDelete = [];
  for (const [key, rows] of Object.entries(groups)) {
    if (rows.length > 1) {
      // Sort by created_at descending (newest first)
      rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      // Keep the first one (newest), delete the rest
      for (let i = 1; i < rows.length; i++) {
        idsToDelete.push(rows[i].id);
      }
    }
  }

  console.log(`Found ${idsToDelete.length} duplicates to delete.`);

  // Delete in batches of 200
  const batchSize = 200;
  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const batch = idsToDelete.slice(i, i + batchSize);
    console.log(`Deleting batch ${i} to ${i + batch.length}...`);
    
    const params = new URLSearchParams();
    params.append('id', `in.(${batch.join(',')})`);
    
    const delRes = await fetch(`${URL}?${params.toString()}`, {
      method: 'DELETE',
      headers: {
        "apikey": KEY,
        "Authorization": `Bearer ${KEY}`
      }
    });
    
    if (!delRes.ok) {
      console.error("Delete failed", await delRes.text());
    }
  }
  
  console.log("Cleanup complete!");
}

main().catch(console.error);
