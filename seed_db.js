const jwt = require('jsonwebtoken');

const secret = Buffer.from('c3RvcnlsaW5lLWVycC1zZWNyZXQta2V5LXRoaXMtaXMtYS12ZXJ5LWxvbmctc2VjcmV0LWtleS1mb3Itand0LXNpZ25pbmctcHVycG9zZQ==', 'base64');
const token = jwt.sign({ sub: 'admin', roles: 'ROLE_ADMIN' }, secret, { expiresIn: '1h' });

async function seed() {
  try {
    const res = await fetch('http://localhost:8080/api/dev/seed', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      }
    });
    const text = await res.text();
    console.log("STATUS:", res.status);
    console.log("BODY:", text);
  } catch (err) {
    console.log("ERROR:", err);
  }
}

seed();
