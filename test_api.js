const API_BASE_URL = 'https://agricatalogues.in';
async function test() {
    console.log("Testing POST /api/mock-tests");
    let res = await fetch(`${API_BASE_URL}/api/mock-tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeOnly: true })
    });
    console.log("POST /api/mock-tests Status:", res.status);
    try { console.log(await res.json()); } catch(e) { console.log("Not JSON"); }

    console.log("\nTesting POST /api with get-mock-tests");
    let res2 = await fetch(`${API_BASE_URL}/api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-mock-tests', payload: { activeOnly: true } })
    });
    console.log("POST /api Status:", res2.status);
    try { console.log(await res2.json()); } catch(e) { console.log("Not JSON"); }
}
test();
