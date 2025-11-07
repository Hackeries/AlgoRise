-- =========================================
-- User Progress: problems, levels, badges
-- Updated to avoid parameter rename errors
-- - Keeps function signatures identical to prior versions:
--   calculate_problem_xp(difficulty text)
--   calculate_level(total_xp integer)
-- =========================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ---------- Shared updated_at trigger ----------
create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- ---------- Difficulty normalization helper ----------
-- Returns a canonical, lowercase token for difficulty.
create or replace function public.normalize_difficulty(difficulty text)
returns text
language plpgsql
immutable
as $$
declare
  v text := lower(coalesce(difficulty, ''));
begin
  v := btrim(v);
  -- Normalize common variants
  if v in ('easy','e','ez') then return 'easy'; end if;
  if v in ('medium','med','mid') then return 'medium'; end if;
  if v in ('hard','hd') then return 'hard'; end if;

  -- Codeforces-style buckets
  if v in ('div3','div 3','div-3') then return 'div3'; end if;
  if v in ('div2-a','div2a','div 2 a','d2a') then return 'div2-a'; end if;
  if v in ('div2-b','div2b','div 2 b','d2b') then return 'div2-b'; end if;
  if v in ('div2-c','div2c','div 2 c','d2c') then return 'div2-c'; end if;
  if v in ('div2-d','div2d','div 2 d','d2d') then return 'div2-d'; end if;

  -- Fallback: return trimmed lower-case as-is
  return v;
end;
$$;

-- ---------- Difficulty -> XP mapping ----------
-- IMPORTANT: keep signature as (difficulty text) to avoid 42P13 error.
create or replace function public.calculate_problem_xp(difficulty text)
returns integer
language plpgsql
immutable
as $$
declare
  d text := public.normalize_difficulty(difficulty);
begin
  return case d
    when 'easy'   then 10
    when 'medium' then 25
    when 'hard'   then 50
    when 'div3'   then 15
    when 'div2-a' then 20
    when 'div2-b' then 30
    when 'div2-c' then 40
    when 'div2-d' then 60
    else 10
  end;
end;
$$;

-- ---------- Difficulty -> Category for counters (easy/medium/hard) ----------
create or replace function public.difficulty_category(difficulty text)
returns text
language plpgsql
immutable
as $$
declare
  d text := public.normalize_difficulty(difficulty);
begin
  -- Map CF buckets into E/M/H for aggregate counters
  if d in ('easy','div3','div2-a') then return 'easy'; end if;
  if d in ('medium','div2-b') then return 'medium'; end if;
  if d in ('hard','div2-c','div2-d') then return 'hard'; end if;
  return null; -- unknown bucket doesn't increment category counters
end;
$$;

-- ---------- Level from XP ----------
-- IMPORTANT: keep signature as (total_xp integer) to avoid 42P13 error.
create or replace function public.calculate_level(total_xp integer)
returns integer
language plpgsql
immutable
as $$
begin
  -- Level formula: level = floor(sqrt(total_xp / 100)) + 1
  return floor(sqrt(greatest(0, coalesce(total_xp, 0))::numeric / 100.0))::int + 1;
end;
$$;

-- =========================================
-- Tables
-- =========================================

-- user_problems: user-problem progress
create table if not exists public.user_problems (
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  solved boolean not null default false,
  solved_at timestamptz,
  attempts integer not null default 0,
  time_spent_minutes integer not null default 0,
  difficulty text,
  platform text,
  xp_earned integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, problem_id),

  -- Guardrails
  constraint up_attempts_nonneg check (attempts >= 0),
  constraint up_time_spent_nonneg check (time_spent_minutes >= 0),
  constraint up_xp_nonneg check (xp_earned >= 0),
  constraint up_solved_at_not_future check (solved_at is null or solved_at <= timezone('utc', now())),
  constraint up_difficulty_known check (
    difficulty is null or public.normalize_difficulty(difficulty) in (
      'easy','medium','hard','div3','div2-a','div2-b','div2-c','div2-d',''
    )
  )
);

comment on table public.user_problems is 'Per-user progress for problems (attempts, solved, XP).';

-- user_levels: gamification aggregate
create table if not exists public.user_levels (
  user_id uuid primary key references auth.users(id) on delete cascade,
  level integer not null default 1,
  total_xp integer not null default 0,
  problems_solved integer not null default 0,
  easy_solved integer not null default 0,
  medium_solved integer not null default 0,
  hard_solved integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  -- Guardrails
  constraint ul_level_min check (level >= 1),
  constraint ul_nonnegatives check (
    total_xp >= 0 and problems_solved >= 0 and
    easy_solved >= 0 and medium_solved >= 0 and hard_solved >= 0 and
    current_streak >= 0 and longest_streak >= 0
  ),
  constraint ul_activity_not_future check (last_activity_date is null or last_activity_date <= (timezone('utc', now()))::date)
);

comment on table public.user_levels is 'Per-user aggregated gamification stats and XP/level.';

-- user_badges: earned badges
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_type text not null,
  badge_name text not null,
  badge_description text,
  earned_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint ub_type_not_blank check (length(trim(badge_type)) > 0),
  constraint ub_name_not_blank check (length(trim(badge_name)) > 0)
);

-- Prevent duplicate badges of same type/name for a user
create unique index if not exists uq_user_badge_type_name on public.user_badges(user_id, lower(badge_type), lower(badge_name));

-- =========================================
-- Indexes
-- =========================================

create index if not exists idx_user_problems_user on public.user_problems(user_id);
create index if not exists idx_user_problems_user_solved on public.user_problems(user_id, solved);
create index if not exists idx_user_problems_user_solved_time on public.user_problems(user_id, solved, solved_at desc);
create index if not exists idx_user_problems_platform on public.user_problems(user_id, lower(platform));
create index if not exists idx_user_problems_difficulty on public.user_problems(user_id, public.normalize_difficulty(difficulty));

create index if not exists idx_user_levels_user on public.user_levels(user_id);

create index if not exists idx_user_badges_user on public.user_badges(user_id);
create index if not exists idx_user_badges_earned_at on public.user_badges(user_id, earned_at desc);
create index if not exists idx_user_badges_metadata_gin on public.user_badges using gin (metadata);

-- =========================================
-- Triggers
-- =========================================

-- updated_at triggers
drop trigger if exists trg_user_problems_updated on public.user_problems;
create trigger trg_user_problems_updated
before update on public.user_problems
for each row execute function public.set_timestamp();

drop trigger if exists trg_user_levels_updated on public.user_levels;
create trigger trg_user_levels_updated
before update on public.user_levels
for each row execute function public.set_timestamp();

drop trigger if exists trg_user_badges_updated on public.user_badges;
create trigger trg_user_badges_updated
before update on public.user_badges
for each row execute function public.set_timestamp();

-- Normalize difficulty on insert/update
create or replace function public.normalize_user_problem_row()
returns trigger
language plpgsql
as $$
begin
  if new.difficulty is not null then
    new.difficulty := public.normalize_difficulty(new.difficulty);
  end if;

  -- If transitioning to solved and solved_at not provided, stamp it
  if coalesce(old.solved, false) = false and new.solved = true and new.solved_at is null then
    new.solved_at := timezone('utc', now());
  end if;

  return new;
end;
$$;

drop trigger if exists trg_user_problems_normalize on public.user_problems;
create trigger trg_user_problems_normalize
before insert or update on public.user_problems
for each row execute function public.normalize_user_problem_row();

-- Update user_levels when a problem becomes solved (transition false->true)
create or replace function public.update_user_level_on_solve()
returns trigger
language plpgsql
as $$
declare
  xp_amount integer;
  cat text;
begin
  if coalesce(old.solved, false) = false and new.solved = true then
    xp_amount := public.calculate_problem_xp(new.difficulty);
    cat := public.difficulty_category(new.difficulty);

    insert into public.user_levels (user_id, total_xp, problems_solved, level, last_activity_date,
                                    easy_solved, medium_solved, hard_solved)
    values (new.user_id, xp_amount, 1, public.calculate_level(xp_amount), (timezone('utc', now()))::date,
            case when cat = 'easy' then 1 else 0 end,
            case when cat = 'medium' then 1 else 0 end,
            case when cat = 'hard' then 1 else 0 end)
    on conflict (user_id) do update set
      total_xp = public.user_levels.total_xp + xp_amount,
      problems_solved = public.user_levels.problems_solved + 1,
      level = public.calculate_level(public.user_levels.total_xp + xp_amount),
      last_activity_date = (timezone('utc', now()))::date,
      easy_solved = public.user_levels.easy_solved + case when cat = 'easy' then 1 else 0 end,
      medium_solved = public.user_levels.medium_solved + case when cat = 'medium' then 1 else 0 end,
      hard_solved = public.user_levels.hard_solved + case when cat = 'hard' then 1 else 0 end,
      updated_at = timezone('utc', now());

    -- Persist the XP awarded on the problem record
    new.xp_earned := xp_amount;

    -- Ensure solved_at is set (if not already by normalize trigger)
    if new.solved_at is null then
      new.solved_at := timezone('utc', now());
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_user_problems_award_xp on public.user_problems;
create trigger trg_user_problems_award_xp
before insert or update on public.user_problems
for each row execute function public.update_user_level_on_solve();

-- =========================================
-- RLS
-- =========================================

alter table public.user_problems enable row level security;
alter table public.user_levels enable row level security;
alter table public.user_badges enable row level security;

-- Reset policies: user_problems
drop policy if exists "up_select_own" on public.user_problems;
drop policy if exists "up_insert_own" on public.user_problems;
drop policy if exists "up_update_own" on public.user_problems;
drop policy if exists "up_admin_bypass" on public.user_problems;

create policy "up_select_own"
  on public.user_problems
  for select
  using (auth.uid() = user_id);

create policy "up_insert_own"
  on public.user_problems
  for insert
  with check (auth.uid() = user_id);

create policy "up_update_own"
  on public.user_problems
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "up_admin_bypass"
  on public.user_problems
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Reset policies: user_levels
drop policy if exists "ul_select_own" on public.user_levels;
drop policy if exists "ul_insert_own" on public.user_levels;
drop policy if exists "ul_update_own" on public.user_levels;
drop policy if exists "ul_admin_bypass" on public.user_levels;

create policy "ul_select_own"
  on public.user_levels
  for select
  using (auth.uid() = user_id);

create policy "ul_insert_own"
  on public.user_levels
  for insert
  with check (auth.uid() = user_id);

create policy "ul_update_own"
  on public.user_levels
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ul_admin_bypass"
  on public.user_levels
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Reset policies: user_badges
drop policy if exists "ub_select_own" on public.user_badges;
drop policy if exists "ub_insert_service" on public.user_badges;
drop policy if exists "ub_update_service" on public.user_badges;
drop policy if exists "ub_delete_service" on public.user_badges;

-- Only owner can view their badges (or service role)
create policy "ub_select_own"
  on public.user_badges
  for select
  using (auth.uid() = user_id or auth.role() = 'service_role');

-- Awarding/updating/removing badges restricted to service role (adjust if you want self-awards)
create policy "ub_insert_service"
  on public.user_badges
  for insert
  with check (auth.role() = 'service_role');

create policy "ub_update_service"
  on public.user_badges
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "ub_delete_service"
  on public.user_badges
  for delete
  using (auth.role() = 'service_role');

-- =========================================
-- Optional: Backfill helper to recompute user_levels
-- =========================================
create or replace function public.recompute_user_level(p_user_id uuid)
returns public.user_levels
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_xp integer := 0;
  v_easy int := 0;
  v_medium int := 0;
  v_hard int := 0;
  v_solved int := 0;
  v_last date := null;
  v_row public.user_levels%rowtype;
begin
  -- Only the user or service role may run this
  if auth.role() <> 'service_role' and auth.uid() <> p_user_id then
    raise exception 'insufficient_privilege';
  end if;

  select
    coalesce(sum(public.calculate_problem_xp(up.difficulty)), 0),
    coalesce(sum(case when public.difficulty_category(up.difficulty) = 'easy' then 1 else 0 end), 0),
    coalesce(sum(case when public.difficulty_category(up.difficulty) = 'medium' then 1 else 0 end), 0),
    coalesce(sum(case when public.difficulty_category(up.difficulty) = 'hard' then 1 else 0 end), 0),
    coalesce(count(*), 0),
    max(up.solved_at)::date
  into v_total_xp, v_easy, v_medium, v_hard, v_solved, v_last
  from public.user_problems up
  where up.user_id = p_user_id
    and up.solved = true;

  insert into public.user_levels (user_id, level, total_xp, problems_solved,
                                  easy_solved, medium_solved, hard_solved, last_activity_date)
  values (p_user_id, public.calculate_level(v_total_xp), v_total_xp, v_solved,
          v_easy, v_medium, v_hard, v_last)
  on conflict (user_id) do update set
    total_xp = excluded.total_xp,
    problems_solved = excluded.problems_solved,
    easy_solved = excluded.easy_solved,
    medium_solved = excluded.medium_solved,
    hard_solved = excluded.hard_solved,
    level = excluded.level,
    last_activity_date = excluded.last_activity_date,
    updated_at = timezone('utc', now())
  returning * into v_row;

  return v_row;
end;
$$;

do $$
begin
  begin
    grant execute on function public.recompute_user_level(uuid) to authenticated;
    grant execute on function public.recompute_user_level(uuid) to service_role;
  exception when undefined_object then null;
  end;
end$$;