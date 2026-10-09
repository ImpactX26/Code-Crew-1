async function runTest() {
  try {
    console.log("Testing with raw fetch (x-goog-api-key header)...");
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hello!" }] }] })
    });
    const data = await response.json();
    console.log("Fetch Result:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Fetch Error:", e.message);
  }
}
runTest();
