const axios = require('axios');

async function test() {
  try {
    // 1. Login
    const loginRes = await axios.post('http://127.0.0.1:8000/api/v1/login', {
      email: 'chetan123@gmail.com',
      password: '123'
    });
    const token = loginRes.data.data.access_token;
    console.log("Logged in:", token.substring(0, 10));

    // 2. Fetch Dashboard (Alerts)
    const dashRes = await axios.get('http://127.0.0.1:8000/api/v1/dashboard/summary', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Alerts:", dashRes.data.data.feeds.length);

    // 3. Fetch Distributions
    const distRes = await axios.get('http://127.0.0.1:8000/api/v1/distributions?my_allocations=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Distributions:", distRes.data.length);
    
    // 4. Fetch Camps
    const campRes = await axios.get('http://127.0.0.1:8000/api/v1/camps', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Camps:", campRes.data.data.length);
    
  } catch (e) {
    console.error("Error:", e.response ? e.response.data : e.message);
  }
}
test();
