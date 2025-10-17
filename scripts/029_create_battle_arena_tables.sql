-- Create tables for the Code Battle Arena feature

-- Drop existing tables if they exist (clean slate)
drop table if exists public.battle_submissions cascade;
drop table if exists public.battle_rounds cascade;
drop table if exists public.battle_participants cascade;
drop table if exists public.battles cascade;
drop table if exists public.battle_ratings cascade;

-- Create battles table
create table public.battles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  format text not null default 'best_of_3' check (format in ('best_of_1', 'best_of_3', 'best_of_5')),
  status text not null default 'waiting' check (status in ('waiting', 'in_progress', 'completed', 'cancelled')),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  guest_user_id uuid references auth.users(id) on delete cascade,
  winner_user_id uuid references auth.users(id) on delete cascade,
  current_round int not null default 1,
  max_rating_diff int not null default 400, -- Maximum rating difference allowed for matchmaking
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz
);

-- Create battle_participants table
create table public.battle_participants (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  handle_snapshot text,
  rating_before int not null default 1200,
  rating_after int,
  rating_delta int,
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  unique (battle_id, user_id)
);

-- Create battle_rounds table
create table public.battle_rounds (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  round_number int not null,
  problem_id text not null,
  title text not null,
  contest_id_cf int,
  index_cf text,
  rating int,
  winner_user_id uuid references auth.users(id) on delete cascade,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds int not null default 3600, -- 1 hour default
  unique (battle_id, round_number)
);

-- Create battle_submissions table
create table public.battle_submissions (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  round_id uuid not null references public.battle_rounds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  status text not null check (status in ('pending', 'solved', 'failed', 'compiling', 'running')),
  language text not null default 'cpp',
  code_text text,
  submitted_at timestamptz not null default now(),
  execution_time_ms int,
  memory_kb int
);

-- Create battle_ratings table for ELO ratings
create table public.battle_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null default 1200,
  battles_count int not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  last_updated timestamptz not null default now(),
  unique (user_id)
);

-- Enable RLS
alter table public.battles enable row level security;
alter table public.battle_participants enable row level security;
alter table public.battle_rounds enable row level security;
alter table public.battle_submissions enable row level security;
alter table public.battle_ratings enable row level security;

-- Drop ALL existing policies first
drop policy if exists "battles_select_policy" on public.battles;
drop policy if exists "battles_insert_policy" on public.battles;
drop policy if exists "battles_update_policy" on public.battles;
drop policy if exists "participants_select_policy" on public.battle_participants;
drop policy if exists "participants_insert_policy" on public.battle_participants;
drop policy if exists "rounds_select_policy" on public.battle_rounds;
drop policy if exists "rounds_insert_policy" on public.battle_rounds;
drop policy if exists "submissions_select_policy" on public.battle_submissions;
drop policy if exists "submissions_insert_policy" on public.battle_submissions;
drop policy if exists "ratings_select_policy" on public.battle_ratings;
drop policy if exists "ratings_upsert_policy" on public.battle_ratings;

-- RLS POLICIES

-- Battles: Simple direct policies
create policy "Anyone can view public battles" on public.battles
  for select using (true);

create policy "Users can create battles" on public.battles
  for insert with check (auth.uid() is not null);

create policy "Users can update their own battles" on public.battles
  for update using (
    host_user_id = auth.uid() or 
    guest_user_id = auth.uid() or
    exists (
      select 1 from public.battle_participants 
      where battle_participants.battle_id = id 
        and battle_participants.user_id = auth.uid()
    )
  );

-- Battle participants
create policy "Anyone can view participants" on public.battle_participants
  for select using (true);

create policy "Users can join battles" on public.battle_participants
  for insert with check (auth.uid() is not null);

-- Battle rounds
create policy "Anyone can view battle rounds" on public.battle_rounds
  for select using (true);

create policy "Hosts can manage rounds" on public.battle_rounds
  for all using (
    exists (
      select 1 from public.battles 
      where battles.id = battle_id 
        and battles.host_user_id = auth.uid()
    )
  );

-- Battle submissions
create policy "Anyone can view submissions" on public.battle_submissions
  for select using (true);

create policy "Users can create submissions" on public.battle_submissions
  for insert with check (auth.uid() is not null);

-- Battle ratings
create policy "Anyone can view ratings" on public.battle_ratings
  for select using (true);

create policy "Users can update their own ratings" on public.battle_ratings
  for update using (user_id = auth.uid());

-- Indexes
create index if not exists idx_battles_host on public.battles(host_user_id);
create index if not exists idx_battles_guest on public.battles(guest_user_id);
create index if not exists idx_battles_status on public.battles(status);
create index if not exists idx_battles_created on public.battles(created_at);
create index if not exists idx_participants_user on public.battle_participants(user_id);
create index if not exists idx_participants_battle on public.battle_participants(battle_id);
create index if not exists idx_rounds_battle on public.battle_rounds(battle_id);
create index if not exists idx_rounds_number on public.battle_rounds(round_number);
create index if not exists idx_submissions_battle on public.battle_submissions(battle_id);
create index if not exists idx_submissions_round on public.battle_submissions(round_id);
create index if not exists idx_submissions_user on public.battle_submissions(user_id);
create index if not exists idx_ratings_user on public.battle_ratings(user_id);
create index if not exists idx_ratings_rating on public.battle_ratings(rating);