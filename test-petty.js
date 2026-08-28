async function test() {
  try {
    const res = await fetch('http://localhost:8080/api/finance/petty-cash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionType: 'WITHDRAWAL',
        amount: 10000,
        description: 'dtuydt6j',
        transactionDate: '2026-08-28',
        recordedBy: 'System Administrator'
      })
    });
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("BODY:", text);
  } catch (err) {
    console.log("ERROR:", err);
  }
}

test();
