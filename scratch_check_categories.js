async function run() {
  try {
    const url = 'https://agri-backend-plux.vercel.app/api/mock-tests';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activeOnly: false })
    });
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("Response length:", json?.length);
    console.log("First item:", json?.[0]);
  } catch (e) {
    console.error("Fetch failed:", e.message);
  }
}
run();
