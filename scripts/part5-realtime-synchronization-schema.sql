-- ============================================================================
-- PART 5: REAL-TIME SYNCHRONIZATION DATABASE SCHEMA
-- ============================================================================
-- This migration hardens the Code Battle Arena schema for real-time use:
--   * Adds authoritative timestamps and metadata to submissions
--   * Tracks per-user problem state inside battles
--   * Records battle lifecycle events for replay/debug flows
--   * Tightens RLS policies to match application access rules
-- ============================================================================

-- --------------------------------------------------------------------------
-- Battle submissions ? ensure required columns & indexes exist
-- --------------------------------------------------------------------------
alter table if exists public.battle_submissions
  add column if not exists round_id uuid references public.battle_rounds(id) on delete cascade,
  add column if not exists code text,
  add column if not exists language text,
  add column if not exists execution_time_ms integer,
  add column if not exists memory_kb integer,
  add column if not exists test_cases_passed integer,
  add column if not exists total_test_cases integer,
  add column if not exists judged_at timestamptz,
  add column if not exists client_submitted_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_battle_submissions_battle
  on public.battle_submissions(battle_id);
create index if not exists idx_battle_submissions_user
  on public.battle_submissions(user_id);
create index if not exists idx_battle_submissions_problem
  on public.battle_submissions(problem_id);
create index if not exists idx_battle_submissions_submitted_at
  on public.battle_submissions(submitted_at);
create index if not exists idx_battle_submissions_battle_problem
  on public.battle_submissions(battle_id, problem_id);
create index if not exists idx_battle_submissions_battle_problem_time
  on public.battle_submissions(battle_id, problem_id, submitted_at);

drop trigger if exists trg_battle_submissions_touch on public.battle_submissions;
create trigger trg_battle_submissions_touch
  before update on public.battle_submissions
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------------
-- Battle problems ? per-user state tracking for scoreboard & realtime UI
-- --------------------------------------------------------------------------
create table if not exists public.battle_problems (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  problem_id text not null,
  problem_name text not null,
  problem_rating integer,
  user_id uuid references auth.users(id) on delete cascade,
  status text not null default 'unsolved'
    check (status in ('unsolved','solving','accepted','wrong-answer')),
  first_viewed_at timestamptz,
  first_submitted_at timestamptz,
  accepted_at timestamptz,
  submission_count integer not null default 0,
  wrong_attempts integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (battle_id, problem_id, user_id)
);

create index if not exists idx_battle_problems_battle
  on public.battle_problems(battle_id);
create index if not exists idx_battle_problems_user
  on public.battle_problems(user_id);
create index if not exists idx_battle_problems_status
  on public.battle_problems(status);

drop trigger if exists trg_battle_problems_touch on public.battle_problems;
create trigger trg_battle_problems_touch
  before update on public.battle_problems
  for each row execute function public.set_updated_at();

-- --------------------------------------------------------------------------
-- Battle events ? append-only event log for realtime visibility
-- --------------------------------------------------------------------------
create table if not exists public.battle_events (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  event_type text not null,
  user_id uuid references auth.users(id) on delete set null,
  event_data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  client_timestamp timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_battle_events_battle
  on public.battle_events(battle_id);
create index if not exists idx_battle_events_type
  on public.battle_events(event_type);
create index if not exists idx_battle_events_occurred_at
  on public.battle_events(occurred_at desc);

-- --------------------------------------------------------------------------
-- Battles table ? realtime metadata
-- --------------------------------------------------------------------------
alter table if exists public.battles
  add column if not exists connection_status jsonb default '{}'::jsonb,
  add column if not exists last_activity_at timestamptz default now(),
  add column if not exists is_paused boolean default false,
  add column if not exists paused_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update public.battles
  set connection_status = coalesce(connection_status, '{}'::jsonb),
      last_activity_at = coalesce(last_activity_at, created_at)
  where connection_status is null or last_activity_at is null;

-- --------------------------------------------------------------------------
-- Helper functions & triggers
-- --------------------------------------------------------------------------
create or replace function public.update_battle_last_activity()
returns trigger
language plpgsql
as $$
begin
  update public.battles
    set last_activity_at = now(),
        updated_at = now()
  where id = new.battle_id;
  return new;
end;
$$;

drop trigger if exists trg_battle_activity_insert on public.battle_submissions;
create trigger trg_battle_activity_insert
  after insert on public.battle_submissions
  for each row execute function public.update_battle_last_activity();

create or replace function public.sync_battle_problem_status()
returns trigger
language plpgsql
as $$
declare
  v_title text;
  v_rating integer;
begin
  select br.title, br.rating
    into v_title, v_rating
  from public.battle_rounds br
  where br.id = new.round_id;

  insert into public.battle_problems (battle_id, problem_id, problem_name, problem_rating, user_id)
  values (new.battle_id, new.problem_id, coalesce(v_title, new.problem_id), v_rating, new.user_id)
  on conflict (battle_id, problem_id, user_id) do nothing;

  update public.battle_problems bp
  set
    submission_count = stats.submission_count,
    wrong_attempts = stats.wrong_attempts,
    status = stats.status,
    first_submitted_at = stats.first_submitted_at,
    accepted_at = stats.accepted_at,
    updated_at = now()
  from (
    select
      bs.battle_id,
      bs.problem_id,
      bs.user_id,
      count(*) as submission_count,
      count(*) filter (where bs.verdict in ('WA','TLE','RE','CE','MLE')) as wrong_attempts,
      min(bs.submitted_at) as first_submitted_at,
      max(case when bs.verdict = 'AC' then bs.submitted_at end) as accepted_at,
      case
        when max(case when bs.verdict = 'AC' then 1 end) = 1 then 'accepted'
        when count(*) filter (where bs.verdict in ('WA','TLE','RE','CE','MLE')) > 0 then 'wrong-answer'
        else 'solving'
      end as status
    from public.battle_submissions bs
    where bs.battle_id = new.battle_id
      and bs.problem_id = new.problem_id
      and bs.user_id = new.user_id
    group by bs.battle_id, bs.problem_id, bs.user_id
  ) stats
  where bp.battle_id = stats.battle_id
    and bp.problem_id = stats.problem_id
    and bp.user_id = stats.user_id;

  return new;
end;
$$;

drop trigger if exists trg_battle_problem_status_insert on public.battle_submissions;
create trigger trg_battle_problem_status_insert
  after insert on public.battle_submissions
  for each row execute function public.sync_battle_problem_status();

drop trigger if exists trg_battle_problem_status_update on public.battle_submissions;
create trigger trg_battle_problem_status_update
  after update of verdict on public.battle_submissions
  for each row execute function public.sync_battle_problem_status();

create or replace function public.log_battle_event(
  p_battle_id uuid,
  p_event_type text,
  p_user_id uuid,
  p_event_data jsonb,
  p_client_timestamp timestamptz default null
)
returns uuid
language plpgsql
as $$
declare
  v_event_id uuid;
begin
  insert into public.battle_events (battle_id, event_type, user_id, event_data, client_timestamp)
  values (p_battle_id, p_event_type, p_user_id, coalesce(p_event_data, '{}'::jsonb), p_client_timestamp)
  returning id into v_event_id;
  return v_event_id;
end;
$$;

create or replace function public.get_submission_order(
  p_battle_id uuid,
  p_problem_id text
)
returns table (
  submission_id uuid,
  user_id uuid,
  submitted_at timestamptz,
  rank integer
)
language sql
as $$
  select
    bs.id,
    bs.user_id,
    bs.submitted_at,
    row_number() over (order by bs.submitted_at asc)::integer as rank
  from public.battle_submissions bs
  where bs.battle_id = p_battle_id
    and bs.problem_id = p_problem_id
  order by bs.submitted_at asc;
$$;

create or replace function public.pause_battle(p_battle_id uuid)
returns void
language plpgsql
as $$
begin
  update public.battles
    set is_paused = true,
        paused_at = now(),
        updated_at = now()
  where id = p_battle_id;
end;
$$;

create or replace function public.resume_battle(p_battle_id uuid)
returns void
language plpgsql
as $$
begin
  update public.battles
    set is_paused = false,
        paused_at = null,
        updated_at = now()
  where id = p_battle_id;
end;
$$;

-- --------------------------------------------------------------------------
-- Row Level Security ? tighten scopes to participants/hosts/spectators
-- --------------------------------------------------------------------------
alter table public.battle_submissions enable row level security;
alter table public.battle_problems enable row level security;
alter table public.battle_events enable row level security;

drop policy if exists "Anyone can view submissions" on public.battle_submissions;
drop policy if exists "Users can view submissions" on public.battle_submissions;
drop policy if exists "Users can view submissions in their battles" on public.battle_submissions;
create policy "battle_submissions_select_access" on public.battle_submissions
  for select
  using (
    auth.role() = 'service_role'
    or user_id = auth.uid()
    or exists (
      select 1 from public.battles b
      where b.id = battle_id
        and (b.host_user_id = auth.uid() or b.guest_user_id = auth.uid())
    )
    or exists (
      select 1 from public.battle_participants bp
      where bp.battle_id = battle_id
        and bp.user_id = auth.uid()
    )
    or exists (
      select 1 from public.battle_spectators bs
      where bs.battle_id = battle_id
        and bs.user_id = auth.uid()
    )
  );

drop policy if exists "Users can create submissions" on public.battle_submissions;
drop policy if exists "Users can insert their own submissions" on public.battle_submissions;
create policy "battle_submissions_insert_access" on public.battle_submissions
  for insert with check (
    auth.role() = 'service_role'
    or user_id = auth.uid()
  );

drop policy if exists "Users can update their own submissions" on public.battle_submissions;
create policy "battle_submissions_update_access" on public.battle_submissions
  for update
  using (
    auth.role() = 'service_role'
    or user_id = auth.uid()
  )
  with check (
    auth.role() = 'service_role'
    or user_id = auth.uid()
  );

drop policy if exists "Users can view problems in their battles" on public.battle_problems;
create policy "battle_problems_select_access" on public.battle_problems
  for select
  using (
    auth.role() = 'service_role'
    or exists (
      select 1 from public.battles b
      where b.id = battle_id
        and (b.host_user_id = auth.uid() or b.guest_user_id = auth.uid())
    )
    or exists (
      select 1 from public.battle_participants bp
      where bp.battle_id = battle_id
        and bp.user_id = auth.uid()
    )
    or exists (
      select 1 from public.battle_spectators bs
      where bs.battle_id = battle_id
        and bs.user_id = auth.uid()
    )
  );

drop policy if exists "Users can view events in their battles" on public.battle_events;
create policy "battle_events_select_access" on public.battle_events
  for select
  using (
    auth.role() = 'service_role'
    or exists (
      select 1 from public.battles b
      where b.id = battle_id
        and (b.host_user_id = auth.uid() or b.guest_user_id = auth.uid())
    )
    or exists (
      select 1 from public.battle_participants bp
      where bp.battle_id = battle_id
        and bp.user_id = auth.uid()
    )
    or exists (
      select 1 from public.battle_spectators bs
      where bs.battle_id = battle_id
        and bs.user_id = auth.uid()
    )
  );

drop policy if exists "battle_events_insert_access" on public.battle_events;
create policy "battle_events_insert_access" on public.battle_events
  for insert with check (
    auth.role() = 'service_role'
    or exists (
      select 1 from public.battles b
      where b.id = battle_id
        and (b.host_user_id = auth.uid() or b.guest_user_id = auth.uid())
    )
    or exists (
      select 1 from public.battle_participants bp
      where bp.battle_id = battle_id
        and bp.user_id = auth.uid()
    )
  );

-- --------------------------------------------------------------------------
-- Helper view for leaderboards & analytics
-- --------------------------------------------------------------------------
create or replace view public.battle_leaderboard as
select
  b.id as battle_id,
  bp.user_id,
  pr.codeforces_handle as handle,
  count(*) filter (where bp.status = 'accepted') as problems_solved,
  sum(bp.wrong_attempts) as penalty,
  max(bp.accepted_at) as last_solve_time,
  extract(epoch from (max(bp.accepted_at) - b.started_at))::integer as total_time_seconds
from public.battles b
join public.battle_problems bp on bp.battle_id = b.id
left join public.profiles pr on pr.id = bp.user_id
group by b.id, bp.user_id, pr.codeforces_handle, b.started_at
order by problems_solved desc, penalty asc, total_time_seconds asc nulls last;

-- --------------------------------------------------------------------------
-- Comments & documentation
-- --------------------------------------------------------------------------
comment on table public.battle_submissions is 'Code Battle Arena submissions with authoritative server timestamps';
comment on column public.battle_submissions.submitted_at is 'Server timestamp when submission was received';
comment on column public.battle_submissions.judged_at is 'Server timestamp when execution verdict was recorded';
comment on column public.battle_submissions.client_submitted_at is 'Client-submitted timestamp (diagnostic only)';

comment on table public.battle_events is 'Audit log of realtime battle events used for replay and synchronization';
comment on function public.get_submission_order(uuid, text) is 'Returns ordered submissions for a battle/problem pair based on server timestamps';

create index if not exists idx_battles_status on public.battles(status);
create index if not exists idx_battles_started_at on public.battles(started_at);
create index if not exists idx_battles_last_activity on public.battles(last_activity_at);
