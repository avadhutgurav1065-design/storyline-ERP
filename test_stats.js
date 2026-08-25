async function test() {
  try {
    const login = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({email:'admin@storyline.com', password:'Admin@123'})
    });
    const loginData = await login.json();
    const token = loginData.data.token;
    const stats = await fetch('http://localhost:8080/api/dashboard/stats', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const statsData = await stats.json();
    console.log(JSON.stringify(statsData, null, 2));
  } catch(e) { console.error(e.message); }
}
test();
