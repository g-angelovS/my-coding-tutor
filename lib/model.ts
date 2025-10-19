export async function callModel({
  system,
  context,
  user,
}: {
  system: string
  context: string
  user: string
}): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY
  // Try a commonly available free model; you can change this later
  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free'

  if (!key) {
    return `🤖 (Demo reply – no API key set)\n\nContext:\n${context}\n\nUser:\n${user}`
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      // attribution headers (recommended)
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://vercel.app',
      'X-Title': 'My Coding Tutor',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'system', content: `Context (use when helpful):\n${context}` },
        { role: 'user', content: user },
      ],
      temperature: 0.3,
      max_tokens: 600,
    }),
  })

  const raw = await res.text()
  let data: any = {}
  try { data = JSON.parse(raw) } catch {}

  if (!res.ok) {
    const msg = data?.error?.message || data?.message || raw || `HTTP ${res.status}`
    throw new Error(`Model error: ${msg}`)
  }

  const content =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.content ??
    (Array.isArray(data?.choices?.[0]?.messages) ? data.choices[0].messages[0]?.content : undefined)

  if (!content || typeof content !== 'string') {
    throw new Error(`Empty response from model. Raw: ${raw.slice(0, 400)}...`)
  }

  return content
}
