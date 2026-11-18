-- Run once in the Supabase SQL editor (Project -> SQL Editor).
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz not null default now(),
  name text,
  email text not null,
  interest text,
  message text not null,
  consent boolean not null default false,
  source text default 'website'
);

-- IMPORTANT: tables made in the SQL editor have row-level security OFF by default, which would expose this
-- table to Supabase's public API. Turn it on and add NO policies: only the server's service-role key can use it.
alter table public.leads enable row level security;
