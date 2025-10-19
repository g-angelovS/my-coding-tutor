// lib/model.ts
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
  // A reliable free model on OpenRouter:
  const model =
    process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free";

  // Fallback so the site still works without a key
  if (!key) {
    return `🤖 (Demo reply – no API key set)
Context:
${context}

User:
${user}`;
  }

  const endpoint = "https://openrouter.ai/api/v1/chat/completions";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      // These help OpenRouter attribute traffic (optional but recommended)
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://vercel.app",
      "X-Title": "My Coding Tutor",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "system", content: `Context (use when helpful):\n${context}` },
        { role: "user", content: user },
      ],
      temperature: 0.3,
      max_tokens: 600,
    }),
  });

  let data: any;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error(`Model response was not JSON (status ${res.status}).`);
  }

  if (!res.ok) {
    const msg =
      data?.error?.message ||
      data?.message ||
      JSON.stringify(data, null, 2);
    throw new Error(`Model error (${res.status}): ${msg}`);
  }

  // Be tolerant of different shapes
  const choice = data?.choices?.[0];
  const content =
    choice?.message?.content ??
    choice?.content ??
    (Array.isArray(choice?.messages) ? choice.messages[0]?.content : undefined);

  if (!content || typeof content !== "string") {
    throw new Error("Empty response from model.");
  }

  return content;
}
