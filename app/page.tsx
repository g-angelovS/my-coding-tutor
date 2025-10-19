'use client'
import Chat from '../components/Chat'

export default function Page() {
  return (
    <main style={{maxWidth: 900, margin:'2rem auto', padding:'0 1rem'}}>
      <h1 style={{fontSize:'2rem', marginBottom:'1rem', color:'#10b981'}}>🚀 IT WORKS — Chat Enabled</h1>
      <Chat />
    </main>
  )
}
