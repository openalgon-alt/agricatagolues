const fetch = require('node-fetch'); // wait, node-fetch might not be installed, we can just use native fetch if node > 18.
async function test() {
  const subjectId = 'ce580d09-378e-4b80-8fb9-83b66b6316dc';
  const token = 'access-granted-token-123456';
  const payload = {
    action: 'ao-aao-admin-bulk-add-questions',
    token,
    payload: {
      subjectId,
      questions: [
        {
          paperNumber: 2,
          questionText: "Test Question Paper 2 Bulk Upload",
          optionA: "A",
          optionB: "B",
          optionC: "C",
          optionD: "D",
          correctOption: "A",
          explanation: ""
        }
      ]
    }
  };

  const res = await fetch('http://localhost:3000/api/mock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log(data);
}
test();
