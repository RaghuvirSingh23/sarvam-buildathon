// GET /api/analytics -> conversations grouped by session_id (for the parent dashboard).
// Self-contained: reads SUPABASE_URL + SUPABASE_SECRET_KEY from env (service key, server-side only).
//   { sessions: [ { id, title, started_at, last_at, lang, count, messages:[{kind,lang,text,text_en,created_at,audio_url}] } ] }

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "GET only" });
    return;
  }
  const supaUrl = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const supaKey = process.env.SUPABASE_SECRET_KEY;
  if (!supaUrl || !supaKey) {
    res.status(503).json({ error: "Backend not configured (SUPABASE_URL / SUPABASE_SECRET_KEY)." });
    return;
  }
  try {
    const url =
      `${supaUrl}/rest/v1/utterances` +
      `?select=session_id,kind,lang,text,text_en,created_at,audio_url&order=created_at.asc&limit=1000`;
    const r = await fetch(url, { headers: { apikey: supaKey, Authorization: `Bearer ${supaKey}` } });
    if (!r.ok) {
      res.status(502).json({ error: `supabase ${r.status}: ${(await r.text()).slice(0, 200)}` });
      return;
    }
    const rows = await r.json();
    const map = new Map();
    for (const x of rows) {
      const sid = x.session_id || "unsessioned";
      if (!map.has(sid)) map.set(sid, []);
      map.get(sid).push(x);
    }
    const sessions = [];
    for (const [id, msgs] of map) {
      const firstInput = msgs.find((m) => m.kind === "input");
      sessions.push({
        id,
        title: (firstInput && (firstInput.text_en || firstInput.text)) || "(conversation)",
        started_at: msgs[0].created_at,
        last_at: msgs[msgs.length - 1].created_at,
        lang: (firstInput && firstInput.lang) || msgs[0].lang || "unknown",
        count: msgs.length,
        messages: msgs.map((m) => ({
          kind: m.kind, lang: m.lang, text: m.text, text_en: m.text_en,
          created_at: m.created_at, audio_url: m.audio_url,
        })),
      });
    }
    sessions.sort((a, b) => new Date(b.last_at) - new Date(a.last_at));
    res.status(200).json({ sessions });
  } catch (e) {
    res.status(502).json({ error: String((e && e.message) || e) });
  }
};
