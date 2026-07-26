# Voice Note

An install-free voice recorder served as the site root, with a server-side
session store (Supabase) that gives every visit its own conversation context
for use with the Sarvam APIs.

- **Frontend:** `index.html` — a self-contained static recorder (no build).
- **Backend:** `api/session.js` — Vercel serverless function; holds all secrets.
- **Database:** Supabase `sessions` table (see `supabase/schema.sql`).

The browser only ever calls our own `/api/*` endpoints. Supabase and Sarvam
keys live in serverless environment variables and are never sent to the client.

## How sessions work

1. On every page load the browser calls `POST /api/session`.
2. The function inserts a row into `public.sessions` (its own `context` jsonb)
   using the Supabase **secret** key and returns the new session.
3. The session id is kept in memory only — a fresh session per open, never
   persisted client-side. `window.voiceSession.update({ context })` appends
   turns as the Sarvam-backed flow grows.

```
Browser (index.html)
  -> POST /api/session          (create)
  -> PATCH /api/session         (update context)
        -> Supabase PostgREST (service_role, bypasses RLS)
```

## Setup

### 1. Supabase table (once)

Supabase Dashboard -> SQL Editor -> New query -> paste `supabase/schema.sql`
-> Run. This creates `public.sessions` with RLS enabled (server-only access).

### 2. Vercel environment variables

Project Settings -> Environment Variables (Production + Preview), copy the
values from your local `.env`:

| Variable              | Used by            |
| --------------------- | ------------------ |
| `SUPABASE_URL`        | `/api/session`     |
| `SUPABASE_SECRET_KEY` | `/api/session`     |
| `SARVAM_API_KEY`      | upcoming `/api/*`  |

Redeploy after adding them. When configured, the page footer shows
`SESSION xxxxxxxx`; before that it shows `SESSION OFFLINE` and the recorder
still works fully.

## Local notes

- Static page can be served with any static server, but the microphone only
  works over **HTTPS** (Vercel provides this) or on `localhost`.
- To exercise the serverless function locally, use `vercel dev` with a local
  `.env` (see `.env.example`).
