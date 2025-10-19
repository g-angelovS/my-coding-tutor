'use client'
import Chat from '@/components/Chat'
import { useState } from 'react'

export default function Page() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState<'python'|'javascript'>('python')
  return (
    <main style={{maxWidth: 900, margin:'2rem auto', padding:'0 1rem'}}>
      <h1 style={{fontSize:'2rem', marginBottom:'1rem', color:'#10b981'}}>🚀 IT WORKS — Chat Enabled</h1>
      <div style={{display:'grid', gap:'1rem', gridTemplateColumns:'1fr'}}>
        <section style={{border:'1px solid #222', borderRadius:12, padding:16}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <strong>Chat</strong>
            <select value={language} onChange={e=>setLanguage(e.target.value as any)}>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
          <Chat language={language} code={code} />
        </section>
        <section style={{border:'1px solid #222', borderRadius:12, padding:16}}>
          <strong>Editor</strong>
          <textarea value={code} onChange={e=>setCode(e.target.value)} style={{width:'100%', height:250, marginTop:8}} spellCheck={false} placeholder={language==='python' ? '# Write Python here…' : '// Write JavaScript here…'} />
        </section>
      </div>
    </main>
  )
}
