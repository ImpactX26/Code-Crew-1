// Phase 2 test: what happens to data AFTER a server restart?
// This must be run AFTER running persist_test.js to seed the account.

async function run() {
  const API_URL = 'http://localhost:3000/api';
  const email = 'persist4@educaro.com';
  const password = 'TestPass123!';

  console.log('====================================================');
  console.log('Attempting login with previously registered email after server restart');
  console.log('====================================================');

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const err = await res.json();
    console.log('❌ LOGIN FAILED:', err.message);
    console.log('ROOT CAUSE: pg-mem lost all data when the server process restarted.');
    console.log('The account never existed in a real persistent database.');
    return;
  }

  const session = await res.json();
  const token = session.accessToken;
  const h = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [profileRes, docsRes, payRes] = await Promise.all([
    fetch(`${API_URL}/profile`, { headers: h }),
    fetch(`${API_URL}/extraction/documents`, { headers: h }),
    fetch(`${API_URL}/payment/status`, { headers: h }),
  ]);

  const profile = await profileRes.json();
  const docs = await docsRes.json();
  const pay = await payRes.json();

  console.log('\nProfile fields:', profile.data.fields.length);
  console.log('Documents:', docs.length);
  console.log('Premium state:', pay.state, '| Active:', pay.isActive);
}

run().catch(console.error);
