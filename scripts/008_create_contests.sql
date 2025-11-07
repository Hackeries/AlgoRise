-- =========================================
-- Contests schema (robust, idempotent, RLS-aware)
-- =========================================
-- Key improvements:
-- - Enums for visibility/status/mode/submission status
-- - UTC timestamps + updated_at triggers
-- - Integrity checks (time windows, rating range, counts)
-- - Helper functions: can_read_contest, can_manage_contest for clean RLS
-- - Safer RLS on child tables (no data leaks from private contests)
-- - Indexes for common access patterns
-- =========================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ---------- ENUMS ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'contest_visibility') then
    create type contest_visibility as enum ('private','public');
  end if;
  if not exists (select 1 from pg_type where typname = 'contest_status') then
    create type contest_status as enum ('draft','upcoming','running','ended');
  end if;
  if not exists (select 1 from pg_type where typname = 'contest_mode') then
    create type contest_mode as enum ('practice','icpc');
  end if;
  if not exists (select 1 from pg_type where typname = 'submission_status') then
    create type submission_status as enum ('solved','failed');
  end if;
end$$;

-- ---------- TABLES ----------
create table if not exists public.contests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  visibility contest_visibility not null default 'private',
  status contest_status not null default 'draft',
  host_user_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz,
  ends_at timestamptz,
  max_participants int,
  allow_late_join boolean not null default true,
  contest_mode contest_mode not null default 'practice',
  duration_minutes int,
  problem_count int not null default 5,
  rating_min int not null default 800,
  rating_max int not null default 1600,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint contests_name_not_blank check (length(trim(name)) > 0),
  constraint contests_time_window check (
    starts_at is null or ends_at is null or starts_at < ends_at
  ),
  constraint contests_duration_positive check (duration_minutes is null or duration_minutes > 0),
  constraint contests_problem_count_positive check (problem_count > 0 and problem_count <= 20),
  constraint contests_rating_bounds check (
    rating_min >= 0 and rating_max >= rating_min and rating_max <= 5000
  ),
  constraint contests_max_participants_positive check (max_participants is null or max_participants > 0)
);

comment on table public.contests is 'Programming contests hosted by users; supports public/private with RLS.';
comment on column public.contests.contest_mode is 'practice: simple scoring, icpc: penalties and rank by solves then penalty.';

create table if not exists public.contest_participants (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  handle_snapshot text,
  joined_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (contest_id, user_id),

  constraint participants_handle_optional_blank_ok check (handle_snapshot is null or length(trim(handle_snapshot)) > 0)
);

create table if not exists public.contest_problems (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  problem_id text not null,
  title text not null,
  points int not null default 1,
  contest_id_cf int,
  index_cf text,
  rating int,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint problems_title_not_blank check (length(trim(title)) > 0),
  constraint problems_points_nonnegative check (points >= 0),
  constraint problems_rating_nonnegative check (rating is null or rating >= 0)
);

-- Prevent duplicate problems per contest
create unique index if not exists uq_contest_problem on public.contest_problems (contest_id, problem_id);

create table if not exists public.contest_submissions (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  status submission_status not null,
  penalty_s int not null default 0,
  submitted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint submissions_penalty_nonnegative check (penalty_s >= 0)
);

create table if not exists public.contest_results (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rank int not null,
  score int not null,
  penalty_s int not null,
  rating_delta int not null,
  computed_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (contest_id, user_id),

  constraint results_rank_positive check (rank > 0),
  constraint results_penalty_nonnegative check (penalty_s >= 0)
);

-- ---------- INDEXES ----------
create index if not exists idx_contests_host on public.contests(host_user_id);
create index if not exists idx_contests_visibility on public.contests(visibility);
create index if not exists idx_contests_status on public.contests(status);
create index if not exists idx_contests_starts_ends on public.contests(starts_at, ends_at);

create index if not exists idx_participants_user on public.contest_participants(user_id);
create index if not exists idx_participants_contest on public.contest_participants(contest_id);

create index if not exists idx_problems_contest on public.contest_problems(contest_id);
create index if not exists idx_problems_contest_points on public.contest_problems(contest_id, points desc);

create index if not exists idx_submissions_contest_user on public.contest_submissions(contest_id, user_id);
create index if not exists idx_submissions_contest_user_problem_time
  on public.contest_submissions(contest_id, user_id, problem_id, submitted_at);

create index if not exists idx_results_contest on public.contest_results(contest_id);
create index if not exists idx_results_contest_rank on public.contest_results(contest_id, rank);

-- ---------- SHARED TIMESTAMP TRIGGER FUNCTION ----------
create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- ---------- APPLY UPDATED_AT TRIGGERS ----------
drop trigger if exists trg_contests_updated on public.contests;
create trigger trg_contests_updated
before update on public.contests
for each row execute function public.set_timestamp();

drop trigger if exists trg_participants_updated on public.contest_participants;
create trigger trg_participants_updated
before update on public.contest_participants
for each row execute function public.set_timestamp();

drop trigger if exists trg_problems_updated on public.contest_problems;
create trigger trg_problems_updated
before update on public.contest_problems
for each row execute function public.set_timestamp();

drop trigger if exists trg_submissions_updated on public.contest_submissions;
create trigger trg_submissions_updated
before update on public.contest_submissions
for each row execute function public.set_timestamp();

drop trigger if exists trg_results_updated on public.contest_results;
create trigger trg_results_updated
before update on public.contest_results
for each row execute function public.set_timestamp();

-- ---------- ACCESS HELPERS FOR RLS ----------
-- True if caller can read a contest: public visibility, host, participant, or service_role.
create or replace function public.can_read_contest(p_contest_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select
    auth.role() = 'service_role'
    or c.visibility = 'public'
    or c.host_user_id = auth.uid()
    or exists (
      select 1
      from public.contest_participants cp
      where cp.contest_id = p_contest_id
        and cp.user_id = auth.uid()
    )
  from public.contests c
  where c.id = p_contest_id
$$;

-- True if caller manages a contest: host or service_role.
create or replace function public.can_manage_contest(p_contest_id uuid)
returns boolean
language sql
stable
set search_path = public
as $$
  select
    auth.role() = 'service_role'
    or c.host_user_id = auth.uid()
  from public.contests c
  where c.id = p_contest_id
$$;

-- ---------- RLS ENABLE ----------
alter table public.contests enable row level security;
alter table public.contest_participants enable row level security;
alter table public.contest_problems enable row level security;
alter table public.contest_submissions enable row level security;
alter table public.contest_results enable row level security;

-- ---------- RESET POLICIES ----------
drop policy if exists "contests_select_access"          on public.contests;
drop policy if exists "contests_insert_own"             on public.contests;
drop policy if exists "contests_update_manage"          on public.contests;

drop policy if exists "participants_select_access"      on public.contest_participants;
drop policy if exists "participants_insert_self"        on public.contest_participants;
drop policy if exists "participants_delete_self"        on public.contest_participants;

drop policy if exists "problems_select_access"          on public.contest_problems;
drop policy if exists "problems_insert_manage"          on public.contest_problems;
drop policy if exists "problems_update_manage"          on public.contest_problems;
drop policy if exists "problems_delete_manage"          on public.contest_problems;

drop policy if exists "submissions_select_access"       on public.contest_submissions;
drop policy if exists "submissions_insert_self"         on public.contest_submissions;

drop policy if exists "results_select_access"           on public.contest_results;
drop policy if exists "results_manage"                  on public.contest_results;

-- ---------- CONTESTS POLICIES ----------
create policy "contests_select_access"
  on public.contests
  for select
  using (public.can_read_contest(id));

create policy "contests_insert_own"
  on public.contests
  for insert
  with check (auth.uid() is not null and host_user_id = auth.uid());

create policy "contests_update_manage"
  on public.contests
  for update
  using (public.can_manage_contest(id))
  with check (public.can_manage_contest(id));

-- ---------- PARTICIPANTS POLICIES ----------
-- Read participants only if you can read the contest
create policy "participants_select_access"
  on public.contest_participants
  for select
  using (public.can_read_contest(contest_id));

-- Join a contest yourself if you can read it
create policy "participants_insert_self"
  on public.contest_participants
  for insert
  with check (
    user_id = auth.uid()
    and public.can_read_contest(contest_id)
  );

-- Leave a contest (delete your own membership)
create policy "participants_delete_self"
  on public.contest_participants
  for delete
  using (user_id = auth.uid());

-- ---------- PROBLEMS POLICIES ----------
create policy "problems_select_access"
  on public.contest_problems
  for select
  using (public.can_read_contest(contest_id));

create policy "problems_insert_manage"
  on public.contest_problems
  for insert
  with check (public.can_manage_contest(contest_id));

create policy "problems_update_manage"
  on public.contest_problems
  for update
  using (public.can_manage_contest(contest_id))
  with check (public.can_manage_contest(contest_id));

create policy "problems_delete_manage"
  on public.contest_problems
  for delete
  using (public.can_manage_contest(contest_id));

-- ---------- SUBMISSIONS POLICIES ----------
create policy "submissions_select_access"
  on public.contest_submissions
  for select
  using (public.can_read_contest(contest_id));

create policy "submissions_insert_self"
  on public.contest_submissions
  for insert
  with check (
    user_id = auth.uid()
    and public.can_read_contest(contest_id)
    and exists (
      select 1
      from public.contest_participants cp
      where cp.contest_id = contest_id
        and cp.user_id = auth.uid()
    )
  );

-- ---------- RESULTS POLICIES ----------
create policy "results_select_access"
  on public.contest_results
  for select
  using (public.can_read_contest(contest_id));

create policy "results_manage"
  on public.contest_results
  for all
  using (public.can_manage_contest(contest_id))
  with check (public.can_manage_contest(contest_id));

-- =========================================
-- NOTES
-- - This migration is non-destructive (no drops). If you truly want a clean slate, run explicit DROP TABLE statements first.
-- - Policies prevent leaking private contest data via child tables.
-- - Consider adding procedures to compute results based on submissions if needed.
-- =========================================