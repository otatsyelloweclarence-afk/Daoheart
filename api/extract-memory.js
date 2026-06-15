export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages, existingMemory } = req.body;

  const prompt = `You are analyzing a conversation to extract important, lasting facts about Clarence that should be remembered permanently.

EXISTING MEMORY:
${existingMemory || '(none yet)'}

CONVERSATION TO ANALYZE:
${messages.map(m => {
  const role = m.role === 'user' ? 'Clarence' : 'AI';
  const content = Array.isArray(m.content) ? m.content.filter(b => b.type === 'text').map(b => b.text).join(' ') : m.content;
  return `${role}: ${content}`;
}).join('\n')}

Extract ONLY facts that are:
- Personal to Clarence (goals, preferences, background, projects, relationships, skills, habits)
- Likely to still be relevant weeks or months from now
- Not already captured in existing memory

Return ONLY a plain text paragraph or bullet list of new facts to ADD to memory. If nothing new and important was revealed, return exactly: NOTHING_NEW

Do not repeat existing memory. Do not include conversational filler. Be concise.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    const extracted = data.content?.[0]?.text || 'NOTHING_NEW';
    return res.status(200).json({ extracted });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
