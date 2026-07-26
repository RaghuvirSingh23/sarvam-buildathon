-- Voice Note session store
-- Run this once in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
--
-- Each visit to the site creates one row here. The row owns its own
-- conversation context, which the Sarvam-backed endpoints read and update.
-- Only the server (service_role key, used from Vercel serverless functions)
-- may read or write these rows; Row Level Security denies the public/anon key.

create extension if not exists "pgcrypto";

create table if not exists public.sessions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  language    text,
  -- Ordered conversation turns, e.g. [{ "role": "user", "content": "..." }].
  context     jsonb not null default '[]'::jsonb,
  -- Free-form session metadata (client hints, counters, flags).
  meta        jsonb not null default '{}'::jsonb
);

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
  before update on public.sessions
  for each row
  execute function public.set_updated_at();

-- Lock the table down: no anon/publishable access. The service_role key
-- bypasses RLS, so the Vercel functions keep working while the browser cannot
-- touch these rows directly.
alter table public.sessions enable row level security;

-- Utterances: every voice turn, both child input and spoken reply.
-- Populated by the /api/listen (voice in) and /api/speak (voice out) functions.
create table if not exists public.utterances (
  id          uuid primary key default gen_random_uuid(),
  session_id  text,                              -- our session id (public.sessions.id)
  speaker_id  text,
  kind        text not null default 'input',     -- 'input' (child) | 'reply' (spoken back)
  lang        text,                              -- language of `text`, e.g. 'pa-IN'
  text        text,                              -- input: original transcript. reply: localized reply.
  text_en     text,                              -- input: English translation. reply: English source.
  audio_url   text,                              -- reply rows: public URL of the spoken wav
  created_at  timestamptz not null default now()
);

create index if not exists utterances_session_idx
  on public.utterances (session_id, created_at);

alter table public.utterances enable row level security;

-- Storage: a PUBLIC bucket named "audio" holds the spoken-reply wavs so the
-- browser can play them back by URL. Created via the Storage API in setup.
