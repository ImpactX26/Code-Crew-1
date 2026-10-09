async function runTest() {
  const urlBase = "https://generativelanguage.googleapis.com/v1alpha/models/gemini-1.5-flash:generateContent";
  const body = JSON.stringify({ contents: [{ parts: [{ text: "Hello!" }] }] });
  
  const res1 = await fetch(urlBase + "?key=" + process.env.GEMINI_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });
  console.log("v1alpha Status:", res1.status);
  console.log("v1alpha Body:", await res1.text());
}
runTest();
