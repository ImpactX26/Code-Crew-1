const fs = require('fs');

async function runTest() {
  const API_URL = 'http://localhost:3000/api';
  console.log('--- STARTING E2E TEST ---');

  // 1. Register User
  let res = await fetch(`${API_URL}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'APPLICANT' })
  });
  const authData = await res.json();
  const token = authData.accessToken;
  const userId = authData.user.id;
  console.log('1. User registered/logged in:', userId);

  // 2. Chat Intake (Set Grad Year to 2021)
  res = await fetch(`${API_URL}/intake/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      userId,
      step: 'EDUCATION',
      message: 'I graduated in 2021 with a B.Tech',
      language: 'en'
    })
  });
  const intakeData = await res.json();
  console.log('2. Chat Intake response success:', intakeData.success);

  // 3. Create a fake degree certificate PDF with year 2022
  console.log('3. Creating fake degree certificate image for extraction...');
  const certText = "Anna University\nDegree Certificate\nField of Study: Computer Science\nDate / Year of Passing: 2022\nCGPA: 8.5\n";
  fs.writeFileSync('test_cert.txt', certText);

  const fileBlob = new Blob([fs.readFileSync('test_cert.txt')], { type: 'text/plain' });
  const form = new FormData();
  form.append('file', fileBlob, 'cert.txt');
  form.append('documentType', 'DEGREE_CERTIFICATE');
  form.append('filename', 'cert.txt');

  res = await fetch(`${API_URL}/extraction/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: form
  });
  const extractData = await res.json();
  console.log('4. Extraction result:', JSON.stringify(extractData, null, 2));

  // 5. Check Consistency
  res = await fetch(`${API_URL}/consistency/check`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const consistencyData = await res.json();
  console.log('5. Consistency Check:', JSON.stringify(consistencyData, null, 2));

  let discrepancyId;
  if (consistencyData.hasInconsistency && consistencyData.discrepancies.length > 0) {
    discrepancyId = consistencyData.discrepancies[0].id;
    console.log(`Found discrepancy comparing ${consistencyData.discrepancies[0].sourceA.value} and ${consistencyData.discrepancies[0].sourceB.value}`);
  }

  // 6. Resolve Inconsistency
  if (discrepancyId) {
    res = await fetch(`${API_URL}/consistency/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ discrepancyId, resolvedValue: '2022' })
    });
    const resolveData = await res.json();
    console.log('6. Resolve Response success:', resolveData.success);

    // Verify Profile Field
    res = await fetch(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profileData = await res.json();
    const gradYearField = profileData.fields.find(f => f.fieldKey === 'graduationYear');
    console.log('7. Updated Profile Field:', gradYearField);
  } else {
    console.log('NO DISCREPANCY FOUND - CHECK FAILED');
  }

  // 8. Payment Flow - Checkout Info
  res = await fetch(`${API_URL}/payment/checkout-info`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const checkoutData = await res.json();
  console.log('8. Checkout Info:', { upiId: checkoutData.upiId, upiUri: checkoutData.upiUri, hasQrCode: !!checkoutData.qrCodeDataUrl });

  // 9. Upload Receipt
  fs.writeFileSync('test_receipt.txt', "FAKE RECEIPT DATA");
  const receiptBlob = new Blob([fs.readFileSync('test_receipt.txt')], { type: 'image/png' });
  const receiptForm = new FormData();
  receiptForm.append('receipt', receiptBlob, 'test_receipt.png');
  receiptForm.append('utr', 'UTR123456789');

  res = await fetch(`${API_URL}/payment/submit`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: receiptForm
  });
  const submitData = await res.json();
  console.log('9. Payment Submit:', submitData);

  // 10. Confirm Purchase
  const purchaseId = submitData.id;
  res = await fetch(`${API_URL}/payment/confirm/${purchaseId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ notes: 'Confirmed via E2E Test' })
  });
  const confirmData = await res.json();
  console.log('10. Payment Confirm:', confirmData);

  // 11. Check Premium Status
  res = await fetch(`${API_URL}/payment/status`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const statusData = await res.json();
  console.log('11. Premium Status:', statusData);
}

runTest().catch(console.error);
