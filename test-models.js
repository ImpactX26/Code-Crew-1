const { GoogleGenerativeAI } = require('./apps/api/node_modules/@google/generative-ai');

async function runTest() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY);
    const data = await response.json();
    console.log("Models:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.log("Fetch Error:", e.message);
  }
}
runTest();
