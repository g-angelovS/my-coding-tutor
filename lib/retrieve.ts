export async function retrieveContext(query: string): Promise<string> {
  const cheats = [
    'Python for-loops iterate over iterables: for i in range(3): print(i)',
    'JS for-of iterates values; for-in iterates keys',
  ];
  const lower = query.toLowerCase();
  const hit = cheats.find(line => lower.split(/\W+/).some(tok => tok && line.toLowerCase().includes(tok)));
  return hit || cheats.join('\n');
}
