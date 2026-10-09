const { GoogleGenerativeAI } = require('./apps/api/node_modules/@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function runTest() {
  try {
    console.log("Testing with SDK...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello!");
    console.log("SDK Success! Response:", result.response.text());
  } catch (e) {
    console.log("SDK Error:", e.name, e.message);
  }

  try {
    console.log("\nTesting with raw fetch...");
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: "Hello!" }] }] })
    });
    const data = await response.json();
    console.log("Fetch Result:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Fetch Error:", e.message);
  }
}

runTest();
