'use client'
import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
type Msg = { role: 'user'|'assistant'|'system', content: string }

export default function Chat({ language, code }: { language: 'python'|'javascript', code: string }) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('Teach me for-loops in Python.')
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(()=>{ ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior:'smooth' }) }, [messages, loading])

  const send = async () => {
    if (!input.trim()) return
    const next = [...messages, { role:'user', content: input }]
    setMessages(next); setInput(''); setLoading(true)
    try {
      const r = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ message: input, code, language }) })
      const data = await r.json()
      setMessages([...next, { role:'assistant', content: data.reply || data.error || 'No reply' }])
    } catch (e:any) {
      setMessages([...next, { role:'assistant', content: 'Error: ' + e.message }])
    } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col gap-3 h-[70vh]">
      <div ref={ref} className="flex-1 overflow-y-auto flex flex-col gap-2">
        {messages.map((m,i)=> <MessageBubble key={i} role={m.role} text={m.content} />)}
      </div>
      <div className="flex gap-2">
        <input className="border rounded px-3 py-2 flex-1" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about loops, arrays, etc." />
        <button className="border rounded px-3 py-2" onClick={send} disabled={loading}>{loading?'Thinking…':'Send'}</button>
      </div>
    </div>
  )
}
