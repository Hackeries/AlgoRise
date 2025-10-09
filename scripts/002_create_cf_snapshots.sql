create table if not exists public.cf_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  handle text not null,
  last_rating int,
  last_contest text,
  rating_delta int,
  fetched_at timestamptz not null default now()
);

alter table public.cf_snapshots enable row level security;

do $$ begin
  create policy "cf_snapshots_select_own" on public.cf_snapshots
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "cf_snapshots_upsert_own" on public.cf_snapshots
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "cf_snapshots_update_own" on public.cf_snapshots
    for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;