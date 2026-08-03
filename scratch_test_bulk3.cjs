async function test() {
  const subjectId = 'ce580d09-378e-4b80-8fb9-83b66b6316dc';
  const token = 'access-granted-token-123456';
  const payload = {
    action: 'ao-aao-admin-bulk-add-questions',
    payload: {
      token,
      subjectId,
      questions: [
        {
          paperNumber: 2,
          questionText: "Test Question Paper 2 Bulk Upload via API",
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

  try {
    const res = await fetch('http://localhost:3000/api/mock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("Bulk upload result:", data);

    const listPayload = {
      action: 'ao-aao-admin-list-questions',
      payload: { token, subjectId }
    };
    const listRes = await fetch('http://localhost:3000/api/mock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listPayload)
    });
    const listData = await listRes.json();
    console.log("Questions remaining for paper 1:", listData.questions.filter(q => q.paper_number === 1).length);
    console.log("Questions remaining for paper 2:", listData.questions.filter(q => q.paper_number === 2).length);
  } catch (err) {
    console.error(err);
  }
}
test();
