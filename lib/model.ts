export async function callModel({
  system,
  context,
  user,
}: {
  system: string;
  context: string;
  user: string;
}): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "meta-llama/Meta-Llama-3.1-8B-Instruct";

  // Fallback if no key set
  if (!key) {
    return `🤖 (Demo reply – no API key set)\n\nContext:\n${context}\n\nUser:\n${user}`;
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "system", content: `Context (use when relevant):\n${context}` },
        { role: "user", content: user },
      ],
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Model error (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "No reply";
}
