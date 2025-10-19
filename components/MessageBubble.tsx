export default function MessageBubble(
  { role, text }: { role: 'user' | 'assistant' | 'system', text: string }
) {
  let classes = 'rounded-2xl px-4 py-3 whitespace-pre-wrap';
  if (role === 'user') classes += ' self-end bg-black/10 border border-black/20';
  else if (role === 'assistant') classes += ' bg-black/20 border border-black/20';
  else classes += ' bg-black/30 border border-black/30';

  return <div className={classes}>{text}</div>;
}
