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
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/clarence_data?id=eq.${id}&select=content`,
      { headers }
    );
    const data = await response.json();
    const content = data && data[0] ? data[0].content : null;
    return res.status(200).json({ content });
  }

  if (req.method === 'POST') {
    const { id, content } = req.body;
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/clarence_data`,
      {
        method: 'POST',
        headers: {
          ...headers,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ id, content, updated_at: new Date().toISOString() })
      }
    );
    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
