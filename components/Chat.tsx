'use client'
import { useState } from 'react'
import MessageBubble from './MessageBubble'

type Message = { role: string; content: string }

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!input.trim()) return
    const next = [...messages, { role: 'user', content: input }]
    setMessages(next); setInput(''); setLoading(true)

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      })
      const text = await r.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch {}
      const payload = data?.reply ?? data?.error ?? text ?? 'No reply from server.'
      setMessages([...next, { role: data?.reply ? 'assistant' : 'system', content: String(payload) }])
    } catch (e: any) {
      setMessages([...next, { role: 'system', content: 'Network error: ' + (e?.message || e) }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto p-4 gap-3">
      <div className="flex flex-col gap-2 min-h-[60vh] border border-white/20 rounded-xl p-3 overflow-y-auto">
        {messages.map((m, i) => (<MessageBubble key={i} role={m.role} text={m.content} />))}
        {loading && <MessageBubble role="assistant" text="Thinking..." />}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 border border-white/20 bg-transparent rounded-xl p-2"
               value={input} onChange={(e) => setInput(e.target.value)}
               placeholder="Ask me about code..." />
        <button onClick={handleSend} disabled={loading} className="border border-white/20 rounded-xl px-4 py-2">
          Send
        </button>
      </div>
    </div>
  )
}
