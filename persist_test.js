// Real Before/After Session Persistence Test
// Tests: register → fill data → logout → login again → verify data survived

const fs = require('fs');

async function run() {
  const API_URL = 'http://localhost:3000/api';
  const email = 'persist4@educaro.com';
  const password = 'TestPass123!';

  console.log('====================================================');
  console.log('STEP 1: Register new account with email:', email);
  console.log('====================================================');

  let res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role: 'APPLICANT', consent: true })
  });
  if (!res.ok) {
    const d = await res.json();
    console.log('Register failed (may already exist):', d.message);
    // Try login instead
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  }
  const session1 = await res.json();
  const token1 = session1.accessToken;
  const userId = session1.user.id;
  console.log('User ID:', userId);

  const h1 = { 'Authorization': `Bearer ${token1}`, 'Content-Type': 'application/json' };

  console.log('\n====================================================');
  console.log('STEP 2: Fill profile via chat intake');
  console.log('====================================================');

  await fetch(`${API_URL}/intake/message`, {
    method: 'POST', headers: h1,
    body: JSON.stringify({ userId, step: 'EDUCATION', message: 'I graduated in 2020 with a B.Tech in Mechanical Engineering', language: 'en' })
  });
  await fetch(`${API_URL}/intake/message`, {
    method: 'POST', headers: h1,
    body: JSON.stringify({ userId, step: 'EMPLOYMENT', message: '3 years as Mechanical Engineer at Tata Motors', language: 'en' })
  });
  await fetch(`${API_URL}/intake/message`, {
    method: 'POST', headers: h1,
    body: JSON.stringify({ userId, step: 'LANGUAGES', message: 'German: B1, English: Fluent', language: 'en' })
  });

  console.log('Profile fields filled.');

  console.log('\n====================================================');
  console.log('STEP 3: Upload a document (DEGREE_CERTIFICATE)');
  console.log('====================================================');
  const certText = 'TU Mumbai\nDegree Certificate\nDate / Year of Passing: 2020\n';
  fs.writeFileSync('persist_cert.txt', certText);
  const fileBlob = new Blob([fs.readFileSync('persist_cert.txt')], { type: 'text/plain' });
  const form = new FormData();
  form.append('file', fileBlob, 'degree.txt');
  form.append('documentType', 'DEGREE_CERTIFICATE');
  form.append('filename', 'degree.txt');
  res = await fetch(`${API_URL}/extraction/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}` },
    body: form
  });
  const docData = await res.json();
  console.log('Document uploaded, ID:', docData.id);

  console.log('\n====================================================');
  console.log('STEP 4: Submit and confirm a payment (Premium)');
  console.log('====================================================');
  const recBlob = new Blob(['fake receipt'], { type: 'image/png' });
  const rForm = new FormData();
  rForm.append('receipt', recBlob, 'receipt.png');
  rForm.append('utr', 'UTR999888777');
  res = await fetch(`${API_URL}/payment/submit`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}` },
    body: rForm
  });
  const purchaseData = await res.json();
  await fetch(`${API_URL}/payment/confirm/${purchaseData.id}`, {
    method: 'POST', headers: h1,
    body: JSON.stringify({ notes: 'Test confirmed' })
  });
  console.log('Purchase confirmed, ID:', purchaseData.id);

  console.log('\n====================================================');
  console.log('STEP 5: SNAPSHOT BEFORE LOGOUT');
  console.log('====================================================');

  const [profileRes, docsRes, payRes] = await Promise.all([
    fetch(`${API_URL}/profile`, { headers: h1 }),
    fetch(`${API_URL}/extraction/documents`, { headers: h1 }),
    fetch(`${API_URL}/payment/status`, { headers: h1 }),
  ]);
  const profileBefore = await profileRes.json();
  const docsBefore = await docsRes.json();
  const payBefore = await payRes.json();

  console.log('\n--- Profile Fields (before logout) ---');
  console.log(`  Count: ${profileBefore.data.fields.length}`);
  profileBefore.data.fields.forEach(f => console.log(`  [${f.fieldKey}] = "${f.value}" (${f.provenance})`));
  console.log(`  Completeness: ${profileBefore.data.completenessScore}`);

  console.log('\n--- Documents (before logout) ---');
  console.log(`  Count: ${docsBefore.length}`);
  docsBefore.forEach(d => console.log(`  [${d.documentType}] ${d.filename} — fields: ${d.extractedFields?.length}`));

  console.log('\n--- Premium Status (before logout) ---');
  console.log(`  State: ${payBefore.state}, isActive: ${payBefore.isActive}, expires: ${payBefore.accessExpiryDate}`);

  console.log('\n====================================================');
  console.log('STEP 6: LOGOUT (clear token from localStorage sim)');
  console.log('====================================================');
  await fetch(`${API_URL}/auth/logout`, { method: 'POST', headers: h1 });
  console.log('Logged out. Token discarded.');

  console.log('\n====================================================');
  console.log('STEP 7: LOGIN AGAIN with SAME email');
  console.log('====================================================');
  res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const session2 = await res.json();
  const token2 = session2.accessToken;
  console.log('New token issued for user ID:', session2.user.id);
  console.log('Same user ID as before?', session2.user.id === userId ? '✅ YES' : '❌ NO — NEW USER CREATED!');

  const h2 = { 'Authorization': `Bearer ${token2}`, 'Content-Type': 'application/json' };

  console.log('\n====================================================');
  console.log('STEP 8: SNAPSHOT AFTER LOGIN');
  console.log('====================================================');

  const [profileRes2, docsRes2, payRes2] = await Promise.all([
    fetch(`${API_URL}/profile`, { headers: h2 }),
    fetch(`${API_URL}/extraction/documents`, { headers: h2 }),
    fetch(`${API_URL}/payment/status`, { headers: h2 }),
  ]);
  const profileAfter = await profileRes2.json();
  const docsAfter = await docsRes2.json();
  const payAfter = await payRes2.json();

  console.log('\n--- Profile Fields (after login) ---');
  console.log(`  Count: ${profileAfter.data.fields.length} (was: ${profileBefore.data.fields.length})`);
  profileAfter.data.fields.forEach(f => console.log(`  [${f.fieldKey}] = "${f.value}" (${f.provenance})`));
  console.log(`  Completeness: ${profileAfter.data.completenessScore} (was: ${profileBefore.data.completenessScore})`);

  console.log('\n--- Documents (after login) ---');
  console.log(`  Count: ${docsAfter.length} (was: ${docsBefore.length})`);
  docsAfter.forEach(d => console.log(`  [${d.documentType}] ${d.filename}`));

  console.log('\n--- Premium Status (after login) ---');
  console.log(`  State: ${payAfter.state} (was: ${payBefore.state})`);
  console.log(`  isActive: ${payAfter.isActive} (was: ${payBefore.isActive})`);
  console.log(`  Expires: ${payAfter.accessExpiryDate} (was: ${payBefore.accessExpiryDate})`);

  console.log('\n====================================================');
  console.log('VERDICT');
  console.log('====================================================');
  const sameUser = session2.user.id === userId;
  const sameFields = profileAfter.data.fields.length === profileBefore.data.fields.length;
  const sameDocs = docsAfter.length === docsBefore.length;
  const samePremium = payAfter.isActive === payBefore.isActive;

  console.log(`Same user ID after re-login:        ${sameUser ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Profile fields preserved:           ${sameFields ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Documents preserved:                ${sameDocs ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Premium entitlement preserved:      ${samePremium ? '✅ PASS' : '❌ FAIL'}`);
}

run().catch(console.error);
