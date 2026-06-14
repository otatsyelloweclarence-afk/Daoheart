import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { id } = req.query;
    const { data, error } = await supabase
      .from('clarence_data')
      .select('content')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ content: data?.content || null });
  }

  if (req.method === 'POST') {
    const { id, content } = req.body;
    const { error } = await supabase
      .from('clarence_data')
      .upsert({ id, content, updated_at: new Date().toISOString() });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
