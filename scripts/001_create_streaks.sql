-- Create streaks table
create table if not exists public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak int not null default 0,
  last_active_day date,
  longest_streak int not null default 0,
  updated_at timestamptz not null default now()
);

-- RLS (example; adjust policies as you wire Supabase auth)
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
