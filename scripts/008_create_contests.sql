-- Drop existing tables if they exist (clean slate)
drop table if exists public.contest_submissions cascade;
drop table if exists public.contest_results cascade;
drop table if exists public.contest_problems cascade;
drop table if exists public.contest_participants cascade;
drop table if exists public.contests cascade;

-- Create contests table with consistent schema
create table public.contests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  visibility text not null default 'private' check (visibility in ('private','public')),
  status text not null default 'draft' check (status in ('draft','running','ended','upcoming')),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz,
  ends_at timestamptz,
  max_participants int,
  allow_late_join boolean not null default true,
  contest_mode text not null default 'practice' check (contest_mode in ('practice','icpc')),
  duration_minutes int,
  problem_count int not null default 5,
  rating_min int not null default 800,
  rating_max int not null default 1600,
  created_at timestamptz not null default now()
);

create table public.contest_participants (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  handle_snapshot text,
  joined_at timestamptz not null default now(),
  unique (contest_id, user_id)
);

create table public.contest_problems (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  problem_id text not null,
  title text not null,
  points int not null default 1,
  contest_id_cf int,
  index_cf text,
  rating int
);

create table public.contest_submissions (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  status text not null check (status in ('solved','failed')),
  penalty_s int not null default 0,
  submitted_at timestamptz not null default now()
);

create table public.contest_results (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rank int not null,
  score int not null,
  penalty_s int not null,
  rating_delta int not null,
  computed_at timestamptz not null default now(),
  unique (contest_id, user_id)
);

-- Enable RLS
alter table public.contests enable row level security;
alter table public.contest_participants enable row level security;
alter table public.contest_problems enable row level security;
alter table public.contest_submissions enable row level security;
alter table public.contest_results enable row level security;

-- Drop ALL existing policies first
drop policy if exists "contests_select_policy" on public.contests;
drop policy if exists "contests_insert_policy" on public.contests;
drop policy if exists "contests_update_policy" on public.contests;
drop policy if exists "participants_select_policy" on public.contest_participants;
drop policy if exists "participants_insert_policy" on public.contest_participants;
drop policy if exists "problems_select_policy" on public.contest_problems;
drop policy if exists "problems_insert_policy" on public.contest_problems;
drop policy if exists "submissions_select_policy" on public.contest_submissions;
drop policy if exists "submissions_insert_policy" on public.contest_submissions;
drop policy if exists "results_select_policy" on public.contest_results;
drop policy if exists "results_upsert_policy" on public.contest_results;
drop policy if exists "results_update_policy" on public.contest_results;

-- SIMPLIFIED RLS POLICIES WITHOUT ANY RECURSION

-- Contests: Simple direct policies
create policy "Anyone can view public contests" on public.contests
  for select using (visibility = 'public');

create policy "Users can view contests they host" on public.contests
  for select using (host_user_id = auth.uid());

create policy "Users can view contests they participate in" on public.contests
  for select using (
    exists (
      select 1 from public.contest_participants 
      where contest_participants.contest_id = id 
        and contest_participants.user_id = auth.uid()
    )
  );

create policy "Users can create contests" on public.contests
  for insert with check (auth.uid() is not null);

create policy "Users can update their own contests" on public.contests
  for update using (host_user_id = auth.uid());

-- Contest participants
create policy "Anyone can view participants" on public.contest_participants
  for select using (true);

create policy "Users can join contests" on public.contest_participants
  for insert with check (auth.uid() is not null);

-- Contest problems
create policy "Anyone can view contest problems" on public.contest_problems
  for select using (true);

create policy "Hosts can add problems" on public.contest_problems
  for insert with check (
    exists (
      select 1 from public.contests 
      where contests.id = contest_id 
        and contests.host_user_id = auth.uid()
    )
  );

-- Contest submissions
create policy "Anyone can view submissions" on public.contest_submissions
  for select using (true);

create policy "Users can create submissions" on public.contest_submissions
  for insert with check (auth.uid() is not null);

-- Contest results
create policy "Anyone can view results" on public.contest_results
  for select using (true);

create policy "Hosts can manage results" on public.contest_results
  for all using (
    exists (
      select 1 from public.contests 
      where contests.id = contest_id 
        and contests.host_user_id = auth.uid()
    )
  );

-- Indexes
create index if not exists idx_contests_host on public.contests(host_user_id);
create index if not exists idx_contests_visibility on public.contests(visibility);
create index if not exists idx_contests_status on public.contests(status);
create index if not exists idx_participants_user on public.contest_participants(user_id);
create index if not exists idx_participants_contest on public.contest_participants(contest_id);
create index if not exists idx_problems_contest on public.contest_problems(contest_id);
create index if not exists idx_submissions_contest_user on public.contest_submissions(contest_id, user_id);
create index if not exists idx_results_contest on public.contest_results(contest_id);