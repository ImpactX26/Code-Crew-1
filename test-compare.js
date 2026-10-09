async function runTest() {
  const urlBase = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
  const body = JSON.stringify({ contents: [{ parts: [{ text: "Hello!" }] }] });

  console.log("=== 1. Testing with ?key= ===");
  const res1 = await fetch(urlBase + "?key=" + process.env.GEMINI_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });
  console.log("Status:", res1.status);
  console.log("Body:", await res1.text());

  console.log("\n=== 2. Testing with x-goog-api-key header ===");
  const res2 = await fetch(urlBase, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
    body
  });
  console.log("Status:", res2.status);
  console.log("Body:", await res2.text());
}
runTest();
