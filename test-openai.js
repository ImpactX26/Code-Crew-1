const OpenAI = require('./apps/api/node_modules/openai');
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Set GEMINI_API_KEY before running this test.');
}

const openai = new OpenAI({
  apiKey,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function runTest() {
  try {
    const response = await openai.chat.completions.create({
      model: "gemini-1.5-flash",
      messages: [{ role: "user", content: "Hello!" }]
    });
    console.log("OpenAI SDK Result:", response.choices[0].message.content);
  } catch (e) {
    console.log("OpenAI SDK Error:", e.name, e.message);
  }
}
runTest();
