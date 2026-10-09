const { GoogleGenAI } = require('./apps/api/node_modules/@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function runTest() {
  try {
    const res = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Hello"
    });
    console.log(res.text);
  } catch (e) {
    console.log(e.name, e.message);
  }
}
runTest();
