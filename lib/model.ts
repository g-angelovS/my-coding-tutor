// lib/model.ts

export async function callModel(prompt: string) {
  const model = process.env.OPENROUTER_MODEL || "openrouter/auto";
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return "❌ No API key set — please add OPENROUTER_API_KEY in Vercel → Settings → Environment Variables.";
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a friendly AI coding tutor." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!res.ok) {
      return `❌ API error: ${res.status}`;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "⚠️ No reply received from model.";
  } catch (err: any) {
    return `❌ Network or fetch error: ${err.message}`;
  }
}
