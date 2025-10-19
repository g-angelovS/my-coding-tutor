'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'

type Message = { role: string; content: string; ts: number }
type SessionMeta = { id: string; name: string; updatedAt: number }

const SESSIONS_KEY = 'mct.sessions.v1'
const SESSION_PREFIX = 'mct.session.'
const DRAFT_PREFIX = 'mct.draft.'

const now = () => Date.now()
function uid() { return Math.random().toString(36).slice(2, 10) }

function loadSessions(): SessionMeta[] {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]') } catch { return [] }
}
function saveSessions(list: SessionMeta[]) {
  try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(list)) } catch {}
}
function loadMessages(sessionId: string): Message[] {
  try { return JSON.parse(localStorage.getItem(SESSION_PREFIX + sessionId) || '[]') } catch { return [] }
}
function saveMessages(sessionId: string, msgs: Message[]) {
  try { localStorage.setItem(SESSION_PREFIX + sessionId, JSON.stringify(msgs)) } catch {}
}
function loadDraft(sessionId: string): string {
  try { return localStorage.getItem(DRAFT_PREFIX + sessionId) || '' } catch { return '' }
}
function saveDraft(sessionId: string, text: string) {
  try { localStorage.setItem(DRAFT_PREFIX + sessionId, text) } catch {}
}

export default function Chat() {
  const [sessions, setSessions] = useState<SessionMeta[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)

  // Load or initialize sessions
  useEffect(() => {
    const list = loadSessions()
    if (list.length === 0) {
      const id = uid()
      const first: SessionMeta = { id, name: 'My first chat', updatedAt: now() }
      saveSessions([first])
      setSessions([first])
      setSessionId(id)
      setMessages([])
      setInput('')
    } else {
      setSessions(list)
      const id = list[0].id
      setSessionId(id)
      setMessages(loadMessages(id))
      setInput(loadDraft(id))
    }
  }, [])

  useEffect(() => {
    if (!sessionId) return
    setMessages(loadMessages(sessionId))
    setInput(loadDraft(sessionId))
  }, [sessionId])

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (!sessionId) return
    saveMessages(sessionId, messages)
    if (messages.length) {
      const list = loadSessions().map(s => s.id === sessionId ? { ...s, updatedAt: now() } : s)
      saveSessions(list)
      setSessions(list)
    }
  }, [messages, sessionId])

  useEffect(() => {
    if (!sessionId) return
    saveDraft(sessionId, input)
  }, [input, sessionId])

  const stats = useMemo(() => {
    if (!messages.length) return 'No messages yet'
    const first = new Date(messages[0].ts).toLocaleString()
    return `${messages.length} msg · since ${first}`
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading || !sessionId) return
    const userMsg: Message = { role: 'user', content: input, ts: now() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content }),
      })
      const text = await r.text()
      let data: any = {}
      try { data = JSON.parse(text) } catch {}
      const payload = data?.reply ?? data?.error ?? text ?? 'No reply from server.'
      const role = data?.reply ? 'assistant' : 'system'
      setMessages([...next, { role, content: String(payload), ts: now() }])
    } catch (e: any) {
      setMessages([...next, { role: 'system', content: 'Network error: ' + (e?.message || e), ts: now() }])
    } finally {
      setLoading(false)
    }
  }

  function newSession() {
    const name = prompt('Name this chat:', 'New chat')
    if (!name) return
    const id = uid()
    const meta: SessionMeta = { id, name, updatedAt: now() }
    const list = [meta, ...loadSessions()]
    saveSessions(list)
    setSessions(list)
    setSessionId(id)
    setMessages([])
    setInput('')
  }

  function renameSession() {
    if (!sessionId) return
    const current = sessions.find(s => s.id === sessionId)
    const name = prompt('Rename chat:', current?.name || 'Chat')
    if (!name) return
    const list = sessions.map(s => s.id === sessionId ? { ...s, name } : s)
    saveSessions(list)
    setSessions(list)
  }

  function duplicateSession() {
    if (!sessionId) return
    const base = sessions.find(s => s.id === sessionId)
    const clonedId = uid()
    const clonedName = (base?.name ? base.name + ' (copy)' : 'Chat copy')
    const meta: SessionMeta = { id: clonedId, name: clonedName, updatedAt: now() }
    const msgs = loadMessages(sessionId)
    const draft = loadDraft(sessionId)
    saveMessages(clonedId, msgs)
    saveDraft(clonedId, draft)
    const list = [meta, ...loadSessions()]
    saveSessions(list)
    setSessions(list)
    setSessionId(clonedId)
    setMessages(msgs)
    setInput(draft)
  }

  function deleteSession() {
    if (!sessionId) return
    const ok = confirm('Delete this chat permanently?')
    if (!ok) return
    try { localStorage.removeItem(SESSION_PREFIX + sessionId) } catch {}
    try { localStorage.removeItem(DRAFT_PREFIX + sessionId) } catch {}
    const list = sessions.filter(s => s.id !== sessionId)
    saveSessions(list)
    setSessions(list)
    if (list.length) {
      setSessionId(list[0].id)
    } else {
      const id = uid()
      const meta: SessionMeta = { id, name: 'My first chat', updatedAt: now() }
      saveSessions([meta])
      setSessions([meta])
      setSessionId(id)
      setMessages([])
      setInput('')
    }
  }

  function exportSession() {
    const meta = sessions.find(s => s.id === sessionId)
    const blob = new Blob([JSON.stringify({ session: meta, messages }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `coding-tutor-${(meta?.name || 'chat').replace(/\\W+/g,'-')}-${new Date().toISOString().slice(0,19)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto p-4 gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={sessionId}
          onChange={e => setSessionId(e.target.value)}
          className="border border-white/20 bg-transparent rounded-xl p-2"
        >
          {sessions
            .slice()
            .sort((a,b)=> b.updatedAt - a.updatedAt)
            .map(s => (
              <option key={s.id} value={s.id}>
                {s.name} · {new Date(s.updatedAt).toLocaleTimeString()}
              </option>
            ))}
        </select>
        <button onClick={newSession} className="border border-white/20 rounded-xl px-3 py-2">New</button>
        <button onClick={renameSession} className="border border-white/20 rounded-xl px-3 py-2">Rename</button>
        <button onClick={duplicateSession} className="border border-white/20 rounded-xl px-3 py-2">Duplicate</button>
        <button onClick={deleteSession} className="border border-red-400 text-red-300 rounded-xl px-3 py-2">Delete</button>
        <button onClick={exportSession} className="border border-white/20 rounded-xl px-3 py-2">Export</button>
        <span style={{opacity:0.7, fontSize:12, marginLeft:'auto'}}>{stats}</span>
      </div>

      <div ref={scrollerRef} className="flex flex-col gap-2 min-h-[60vh] border border-white/20 rounded-xl p-3 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className="flex flex-col gap-1">
            <MessageBubble role={m.role} text={m.content} />
            <span style={{opacity:0.5, fontSize:11, alignSelf: m.role==='user'?'flex-end':'flex-start'}}>
              {new Date(m.ts).toLocaleTimeString()}
            </span>
          </div>
        ))}
        {loading && <MessageBubble role="assistant" text="Thinking..." />}
        {!messages.length && <MessageBubble role="system" text="Welcome! Ask me about Python or JavaScript." />}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border border-white/20 bg-transparent rounded-xl p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask me about code… (Press Enter to send)"
        />
        <button onClick={handleSend} disabled={loading} className="border border-white/20 rounded-xl px-4 py-2">
          {loading ? 'Thinking…' : 'Send'}
        </button>
      </div>
    </div>
  )
}
