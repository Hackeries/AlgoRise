-- Complete Database Setup for CF Verification
-- Run this in your Supabase SQL Editor to fix the missing tables

-- 1. Create cf_handles table
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

-- 2. Create cf_snapshots table (for rating data)
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

-- 3. Create updated_at trigger function
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 4. Add updated_at triggers
drop trigger if exists trg_cf_handles_updated_at on public.cf_handles;
create trigger trg_cf_handles_updated_at
before update on public.cf_handles
for each row execute procedure public.set_updated_at();

-- 5. Enable RLS on cf_handles
alter table public.cf_handles enable row level security;

-- 6. RLS Policies for cf_handles
drop policy if exists "select own cf handle" on public.cf_handles;
create policy "select own cf handle"
on public.cf_handles
for select
using ( auth.uid() = user_id );

drop policy if exists "insert own cf handle" on public.cf_handles;
create policy "insert own cf handle"
on public.cf_handles
for insert
with check ( auth.uid() = user_id );

drop policy if exists "update own cf handle" on public.cf_handles;
create policy "update own cf handle"
on public.cf_handles
for update
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

-- 7. Enable RLS on cf_snapshots
alter table public.cf_snapshots enable row level security;

-- 8. RLS Policies for cf_snapshots
drop policy if exists "select own cf snapshots" on public.cf_snapshots;
create policy "select own cf snapshots"
on public.cf_snapshots
for select
using ( auth.uid() = user_id );

drop policy if exists "insert own cf snapshots" on public.cf_snapshots;
create policy "insert own cf snapshots"
on public.cf_snapshots
for insert
with check ( auth.uid() = user_id );

drop policy if exists "update own cf snapshots" on public.cf_snapshots;
create policy "update own cf snapshots"
on public.cf_snapshots
for update
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

-- 9. Create helpful indexes
create index if not exists idx_cf_handles_user_id on public.cf_handles(user_id);
create index if not exists idx_cf_snapshots_user_id on public.cf_snapshots(user_id);
create index if not exists idx_cf_snapshots_user_snapshot_at on public.cf_snapshots(user_id, snapshot_at desc);

-- 10. Create streaks table (referenced in dashboard-data.ts)
create table if not exists public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_problem_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- 11. Enable RLS on streaks
alter table public.streaks enable row level security;

-- 12. RLS Policies for streaks
drop policy if exists "select own streaks" on public.streaks;
create policy "select own streaks"
on public.streaks
for select
using ( auth.uid() = user_id );

drop policy if exists "insert own streaks" on public.streaks;
create policy "insert own streaks"
on public.streaks
for insert
with check ( auth.uid() = user_id );

drop policy if exists "update own streaks" on public.streaks;
create policy "update own streaks"
on public.streaks
for update
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

-- 13. Create index for streaks
create index if not exists idx_streaks_user_id on public.streaks(user_id);

-- Done! Your database is now ready for CF verification and user stats.
