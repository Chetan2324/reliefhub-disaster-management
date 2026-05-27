const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://127.0.0.1:8000/api/v1/login', {
      email: 'chetan123@gmail.com',
      password: '123'
    });
    const token = loginRes.data.data.access_token;

    const sosRes = await axios.post('http://127.0.0.1:8000/api/v1/emergency-requests', {
      requester_name: 'Chetan',
      phone: '9876543210',
      location: 'Test Location',
      latitude: '26.1445',
      longitude: '91.7362',
      request_details: 'Need help',
      request_type: 'Medical',
      priority: 'High'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Success:", sosRes.data);
  } catch (e) {
    console.error("Error Status:", e.response ? e.response.status : e.message);
    console.error("Error Data:", e.response ? JSON.stringify(e.response.data, null, 2) : '');
  }
}
test();
