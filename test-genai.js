const { GoogleGenAI } = require('./apps/api/node_modules/@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function runTest() {
  try {
    console.log("Testing with @google/genai SDK...");
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Hello!"
    });
    console.log("SDK Success! Response:", response.text);
  } catch (e) {
    console.log("SDK Error:", e.name, e.message);
  }
}
runTest();
