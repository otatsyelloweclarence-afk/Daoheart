export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'Missing env vars', url: !!SUPABASE_URL, key: !!SUPABASE_ANON_KEY });
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  };

  if (req.method === 'GET') {
    const { id } = req.query;
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/clarence_data?id=eq.${id}&select=content`,
        { headers }
      );
      const text = await response.text();
      if (!response.ok) return res.status(500).json({ error: text, status: response.status });
      const data = JSON.parse(text);
      return res.status(200).json({ content: data[0]?.content || null });
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    const { id, content } = req.body;
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/clarence_data`,
        {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
          body: JSON.stringify({ id, content, updated_at: new Date().toISOString() })
        }
      );
      const text = await response.text();
      if (!response.ok) return res.status(500).json({ error: text, status: response.status });
      return res.status(200).json({ success: true });
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
