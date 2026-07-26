// Serverless session endpoint (Vercel Node function).
//
// The browser never sees Supabase or Sarvam keys. This function reads them
// from Vercel environment variables and talks to Supabase PostgREST with the
// service_role key, which bypasses Row Level Security.
//
//   POST  /api/session            -> create a new session, returns { session }
//   PATCH /api/session            -> update { id, context?, language?, meta? }
//
// Required env vars (set in Vercel Project Settings -> Environment Variables):
//   SUPABASE_URL          e.g. https://<ref>.supabase.co
//   SUPABASE_SECRET_KEY   the service_role / secret key (server only)

const TABLE = "sessions";

function getConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    return null;
  }
  return { restUrl: `${url.replace(/\/+$/, "")}/rest/v1/${TABLE}`, key };
}

function supabaseHeaders(key, extra) {
  return Object.assign(
    {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    extra || {},
  );
}

function readBody(req) {
  // Vercel parses JSON bodies automatically, but guard against string/empty.
  if (!req.body) {
    return {};
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }
  return req.body;
}

function isPlainObject(value) {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
}

module.exports = async function handler(req, res) {
  const config = getConfig();
  if (!config) {
    res.status(503).json({
      error:
        "Session store is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.",
    });
    return;
  }

  try {
    if (req.method === "POST") {
      const body = readBody(req);
      const insert = {
        language: typeof body.language === "string" ? body.language : null,
        context: Array.isArray(body.context) ? body.context : [],
        meta: isPlainObject(body.meta) ? body.meta : {},
      };

      const response = await fetch(config.restUrl, {
        method: "POST",
        headers: supabaseHeaders(config.key, { Prefer: "return=representation" }),
        body: JSON.stringify(insert),
      });

      if (!response.ok) {
        res.status(502).json({ error: "Could not create session." });
        return;
      }

      const rows = await response.json();
      res.status(201).json({ session: rows[0] });
      return;
    }

    if (req.method === "PATCH") {
      const body = readBody(req);
      const id = typeof body.id === "string" ? body.id : "";
      if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
        res.status(400).json({ error: "A valid session id is required." });
        return;
      }

      const patch = {};
      if (Array.isArray(body.context)) {
        patch.context = body.context;
      }
      if (typeof body.language === "string") {
        patch.language = body.language;
      }
      if (isPlainObject(body.meta)) {
        patch.meta = body.meta;
      }
      if (Object.keys(patch).length === 0) {
        res.status(400).json({ error: "Nothing to update." });
        return;
      }

      const target = `${config.restUrl}?id=eq.${encodeURIComponent(id)}`;
      const response = await fetch(target, {
        method: "PATCH",
        headers: supabaseHeaders(config.key, { Prefer: "return=representation" }),
        body: JSON.stringify(patch),
      });

      if (!response.ok) {
        res.status(502).json({ error: "Could not update session." });
        return;
      }

      const rows = await response.json();
      if (!rows.length) {
        res.status(404).json({ error: "Session not found." });
        return;
      }
      res.status(200).json({ session: rows[0] });
      return;
    }

    res.setHeader("Allow", "POST, PATCH");
    res.status(405).json({ error: "Method not allowed." });
  } catch (error) {
    // Never surface internal details or secrets.
    res.status(500).json({ error: "Unexpected server error." });
  }
};
