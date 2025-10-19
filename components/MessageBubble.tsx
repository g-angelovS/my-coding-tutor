import clsx from 'clsx'
export default function MessageBubble({ role, text }: { role: 'user'|'assistant'|'system', text: string }) {
  return (
    <div className={clsx('rounded-2xl px-4 py-3 whitespace-pre-wrap', {
      'bg-black/10 border border-black/20 self-end': role === 'user',
      'bg-black/20 border border-black/20': role === 'assistant',
      'bg-black/30 border border-black/30': role === 'system',
    })}>{text}</div>
  )
}
