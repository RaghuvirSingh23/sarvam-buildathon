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
