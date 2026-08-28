const jwt = require('jsonwebtoken');

const secret = Buffer.from('c3RvcnlsaW5lLWVycC1zZWNyZXQta2V5LXRoaXMtaXMtYS12ZXJ5LWxvbmctc2VjcmV0LWtleS1mb3Itand0LXNpZ25pbmctcHVycG9zZQ==', 'base64');
const token = jwt.sign({ sub: 'admin', roles: 'ROLE_ADMIN' }, secret, { expiresIn: '1h' });

async function test() {
  try {
    const res = await fetch('http://localhost:8080/api/finance/petty-cash', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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
