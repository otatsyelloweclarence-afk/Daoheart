export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  };

  if (req.method === 'GET') {
    const { id } = req.query;
    const url = id
      ? `${SUPABASE_URL}/rest/v1/clarence_conversations?id=eq.${id}&select=*`
      : `${SUPABASE_URL}/rest/v1/clarence_conversations?select=id,title,updated_at&order=updated_at.desc`;
    try {
      const response = await fetch(url, { headers });
      const data = await response.json();
      return res.status(200).json(data);
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'POST') {
    const { id, title, messages } = req.body;
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/clarence_conversations`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({ id, title, messages, updated_at: new Date().toISOString() })
      });
      if (!response.ok) { const err = await response.text(); return res.status(500).json({ error: err }); }
      return res.status(200).json({ success: true });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/clarence_conversations?id=eq.${id}`, { method: 'DELETE', headers });
      return res.status(200).json({ success: true });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
