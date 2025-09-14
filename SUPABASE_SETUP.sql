-- Complete database setup for AlgoRise
-- Run this script in your Supabase SQL editor

-- 1. Create streaks table
create table if not exists public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak int not null default 0,
  last_active_day date,
  longest_streak int not null default 0,
  updated_at timestamptz not null default now()
);

-- RLS for streaks
alter table public.streaks enable row level security;
do $$ begin
  create policy "streaks_select_own" on public.streaks
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "streaks_upsert_own" on public.streaks
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "streaks_update_own" on public.streaks
    for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- 2. Create cf_handles table (REQUIRED for OAuth to work)
create table if not exists public.cf_handles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  handle text not null,
  verified boolean not null default false,
  verification_token text,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- Triggers for updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_cf_handles_updated_at on public.cf_handles;
create trigger trg_cf_handles_updated_at
before update on public.cf_handles
for each row execute procedure public.set_updated_at();

-- RLS for cf_handles
alter table public.cf_handles enable row level security;

-- Policy: users can select their own row
drop policy if exists "select own cf handle" on public.cf_handles;
create policy "select own cf handle"
on public.cf_handles
for select
using ( auth.uid() = user_id );

-- Policy: users can insert their own row
drop policy if exists "insert own cf handle" on public.cf_handles;
create policy "insert own cf handle"
on public.cf_handles
for insert
with check ( auth.uid() = user_id );

-- Policy: users can update their own row
drop policy if exists "update own cf handle" on public.cf_handles;
create policy "update own cf handle"
on public.cf_handles
for update
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

-- Helpful index
create index if not exists idx_cf_handles_user_id on public.cf_handles(user_id);

-- 3. Create other essential tables for the application to work properly
-- You may need to run the other scripts (002_create_cf_snapshots.sql, etc.) 
-- depending on what features you're using.

-- For now, let's create the basic tables that are commonly referenced:

-- CF Snapshots table
create table if not exists public.cf_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  handle text not null,
  rating int,
  max_rating int,
  rank text,
  problems_solved int,
  snapshot_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- RLS for cf_snapshots
alter table public.cf_snapshots enable row level security;
create policy "cf_snapshots_select_own" on public.cf_snapshots
  for select using (auth.uid() = user_id);
create policy "cf_snapshots_insert_own" on public.cf_snapshots
  for insert with check (auth.uid() = user_id);

create index if not exists idx_cf_snapshots_user_id on public.cf_snapshots(user_id);
create index if not exists idx_cf_snapshots_snapshot_at on public.cf_snapshots(snapshot_at);
