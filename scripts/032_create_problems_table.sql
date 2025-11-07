-- =============================================================================
-- Problems System (Idempotent, RLS-ready, UTC timestamps)
-- - Non-destructive: no DROP TABLE; creates/extends existing schema safely
-- - Ensures columns, constraints, indexes, RLS policies, and helper functions
-- - Adds updated_at maintenance for problems and auto-refresh of stats
-- - Functions for matchmaking and recording views
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------- Shared updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- =============================================================================
-- TABLE: public.problems
-- =============================================================================
create table if not exists public.problems (
  id uuid primary key default gen_random_uuid()
);

-- Ensure required columns exist (add if missing)
alter table public.problems
  add column if not exists platform               text,
  add column if not exists external_id            text,
  add column if not exists title                  text,
  add column if not exists difficulty_rating      integer,
  add column if not exists topic                  text[],
  add column if not exists tags                   text[],
  add column if not exists time_limit             integer default 1000,
  add column if not exists memory_limit           integer default 256,
  add column if not exists problem_statement      text,
  add column if not exists input_format           text,
  add column if not exists output_format          text,
  add column if not exists constraints            text,
  add column if not exists editorial              text,
  add column if not exists test_cases             jsonb default '[]'::jsonb,
  add column if not exists hidden_test_cases      jsonb default '[]'::jsonb,
  add column if not exists judge0_language_id     integer default 54,
  add column if not exists reference_solution     text,
  add column if not exists solved_count           integer default 0,
  add column if not exists attempt_count          integer default 0,
  add column if not exists successful_submission_rate double precision default 0.0,
  add column if not exists average_solve_time     integer default 0,
  add column if not exists source_url             text,
  add column if not exists author                 text,
  add column if not exists contest_name           text,
  add column if not exists is_active              boolean default true,
  add column if not exists created_at             timestamptz default timezone('utc', now()),
  add column if not exists updated_at             timestamptz default timezone('utc', now());

-- Basic constraints (add if missing)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'problems_platform_check') then
    alter table public.problems
      add constraint problems_platform_check
      check (platform in ('codeforces','atcoder','leetcode','codechef','usaco','cses','custom'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'problems_difficulty_rating_check') then
    alter table public.problems
      add constraint problems_difficulty_rating_check
      check (difficulty_rating between 800 and 3500);
  end if;
end$$;

-- Required NOT NULLs (set after backfill-safe defaults)
do $$
begin
  -- Backfill minimal values where required before setting NOT NULL
  update public.problems set platform='custom' where platform is null;
  update public.problems set external_id=coalesce(external_id, left(id::text, 8)) where external_id is null;
  update public.problems set title=coalesce(title, 'Untitled Problem') where title is null;
  update public.problems set difficulty_rating=coalesce(difficulty_rating, 800) where difficulty_rating is null;
  update public.problems set problem_statement=coalesce(problem_statement,'') where problem_statement is null;

  alter table public.problems
    alter column platform set not null,
    alter column external_id set not null,
    alter column title set not null,
    alter column difficulty_rating set not null,
    alter column time_limit set not null,
    alter column memory_limit set not null,
    alter column problem_statement set not null;

  -- Ensure defaults are set going forward
  alter table public.problems
    alter column time_limit set default 1000,
    alter column memory_limit set default 256,
    alter column test_cases set default '[]'::jsonb,
    alter column hidden_test_cases set default '[]'::jsonb,
    alter column judge0_language_id set default 54,
    alter column is_active set default true,
    alter column created_at set default timezone('utc', now()),
    alter column updated_at set default timezone('utc', now());
end$$;

-- Uniqueness for (platform, external_id) via unique index (idempotent)
create unique index if not exists uq_problems_platform_external_id
  on public.problems(platform, external_id);

-- Helpful indexes
create index if not exists idx_problems_platform on public.problems(platform);
create index if not exists idx_problems_difficulty on public.problems(difficulty_rating);
create index if not exists idx_problems_topic on public.problems using gin(topic);
create index if not exists idx_problems_tags on public.problems using gin(tags);
create index if not exists idx_problems_active on public.problems(is_active) where is_active = true;
create index if not exists idx_problems_rating_active on public.problems(difficulty_rating, is_active) where is_active = true;

-- updated_at trigger for problems
drop trigger if exists trg_problems_set_updated_at on public.problems;
create trigger trg_problems_set_updated_at
before update on public.problems
for each row execute function public.set_updated_at();

-- =============================================================================
-- TABLE: public.problem_history
-- =============================================================================
create table if not exists public.problem_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_attempted_at timestamptz,
  solved_at timestamptz,
  view_count integer default 1,
  attempt_count integer default 0,
  time_spent_seconds integer default 0,
  battle_id uuid,
  battle_round_id uuid
);

-- Uniqueness per user-problem
create unique index if not exists uq_problem_history_user_problem on public.problem_history(user_id, problem_id);

-- Helpful indexes
create index if not exists idx_problem_history_user on public.problem_history(user_id);
create index if not exists idx_problem_history_problem on public.problem_history(problem_id);
create index if not exists idx_problem_history_user_seen on public.problem_history(user_id, first_seen_at desc);
create index if not exists idx_problem_history_user_problem on public.problem_history(user_id, problem_id);

-- =============================================================================
-- TABLE: public.problem_hints
-- =============================================================================
create table if not exists public.problem_hints (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  level integer not null,
  hint_type text not null,
  content text not null,
  created_at timestamptz default timezone('utc', now())
);

-- Constraints (add if missing)
do $$
begin
  if not exists (select 1 from pg_constraint where conname='problem_hints_level_check') then
    alter table public.problem_hints
      add constraint problem_hints_level_check check (level between 1 and 4);
  end if;

  if not exists (select 1 from pg_constraint where conname='problem_hints_type_check') then
    alter table public.problem_hints
      add constraint problem_hints_type_check check (hint_type in ('restatement','algorithm','pseudocode','solution'));
  end if;
end$$;

-- Uniqueness per (problem_id, level)
create unique index if not exists uq_problem_hints_problem_level on public.problem_hints(problem_id, level);

-- Helpful indexes
create index if not exists idx_problem_hints_problem on public.problem_hints(problem_id);
create index if not exists idx_problem_hints_level on public.problem_hints(problem_id, level);

-- =============================================================================
-- RLS: enable and policies
-- =============================================================================
alter table public.problems enable row level security;
alter table public.problem_history enable row level security;
alter table public.problem_hints enable row level security;

-- Reset policies (safe drop)
drop policy if exists "problems_select_active" on public.problems;
drop policy if exists "Admins can manage problems" on public.problems;

drop policy if exists "Users can view own problem history" on public.problem_history;
drop policy if exists "Users can insert own problem history" on public.problem_history;
drop policy if exists "Users can update own problem history" on public.problem_history;

drop policy if exists "Anyone can view hints for active problems" on public.problem_hints;
drop policy if exists "Admins can manage hints" on public.problem_hints;

-- Problems: anyone can view active; service_role bypass
create policy "problems_select_active" on public.problems
  for select
  using (auth.role() = 'service_role' or is_active = true);

create policy "Admins can manage problems" on public.problems
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Problem history: owner-only
create policy "Users can view own problem history" on public.problem_history
  for select using (auth.role() = 'service_role' or auth.uid() = user_id);

create policy "Users can insert own problem history" on public.problem_history
  for insert with check (auth.role() = 'service_role' or auth.uid() = user_id);

create policy "Users can update own problem history" on public.problem_history
  for update
  using (auth.role() = 'service_role' or auth.uid() = user_id)
  with check (auth.role() = 'service_role' or auth.uid() = user_id);

-- Problem hints: visible if problem is active; service_role bypass
create policy "Anyone can view hints for active problems" on public.problem_hints
  for select
  using (
    auth.role() = 'service_role'
    or exists (
      select 1
      from public.problems p
      where p.id = public.problem_hints.problem_id
        and p.is_active = true
    )
  );

-- Optional admin manage hints
create policy "Admins can manage hints" on public.problem_hints
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- =============================================================================
-- Statistics refresh trigger function (UTC)
-- =============================================================================
create or replace function public.refresh_problem_statistics()
returns trigger
language plpgsql
as $$
declare
  v_problem_id uuid := coalesce(new.problem_id, old.problem_id);
  v_solved integer := 0;
  v_attempts integer := 0;
begin
  if v_problem_id is null then
    return coalesce(new, old);
  end if;

  select
    count(*) filter (where solved_at is not null),
    coalesce(sum(coalesce(attempt_count, 0)), 0)
  into v_solved, v_attempts
  from public.problem_history
  where problem_id = v_problem_id;

  update public.problems
     set solved_count = v_solved,
         attempt_count = v_attempts,
         successful_submission_rate = case when v_attempts > 0 then (v_solved::numeric / v_attempts::numeric) * 100 else 0 end,
         updated_at = timezone('utc', now())
   where id = v_problem_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trigger_update_problem_stats on public.problem_history;
create trigger trigger_update_problem_stats
after insert or update or delete on public.problem_history
for each row
execute function public.refresh_problem_statistics();

-- =============================================================================
-- Functions: matchmaking and recording
-- =============================================================================

-- Get random problems for matchmaking (excludes recently seen)
create or replace function public.get_matchmaking_problems(
  p_user_id uuid,
  p_target_rating integer,
  p_rating_range integer default 200,
  p_count integer default 2,
  p_days_threshold integer default 7
)
returns table (
  problem_id uuid,
  platform text,
  external_id text,
  title text,
  difficulty_rating integer,
  topic text[],
  time_limit integer,
  memory_limit integer
)
language plpgsql
as $$
begin
  return query
  select
    p.id,
    p.platform,
    p.external_id,
    p.title,
    p.difficulty_rating,
    p.topic,
    p.time_limit,
    p.memory_limit
  from public.problems p
  where
    p.is_active = true
    and p.difficulty_rating between (p_target_rating - p_rating_range) and (p_target_rating + p_rating_range)
    and p.id not in (
      select ph.problem_id
      from public.problem_history ph
      where ph.user_id = p_user_id
        and ph.first_seen_at > timezone('utc', now()) - (interval '1 day' * p_days_threshold)
    )
  order by random()
  limit p_count;
end;
$$;

-- Record a problem view (upsert history)
create or replace function public.record_problem_view(
  p_user_id uuid,
  p_problem_id uuid,
  p_battle_id uuid default null,
  p_battle_round_id uuid default null
)
returns void
language plpgsql
as $$
begin
  insert into public.problem_history (
    user_id,
    problem_id,
    battle_id,
    battle_round_id,
    first_seen_at,
    view_count
  )
  values (
    p_user_id,
    p_problem_id,
    p_battle_id,
    p_battle_round_id,
    timezone('utc', now()),
    1
  )
  on conflict (user_id, problem_id)
  do update set
    view_count = public.problem_history.view_count + 1,
    last_attempted_at = timezone('utc', now());
end;
$$;