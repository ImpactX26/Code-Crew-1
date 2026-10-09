async function runTest() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hello!" }] }] })
    });
    const data = await response.json();
    console.log("Bearer Token Result:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Fetch Error:", e.message);
  }
}
runTest();
