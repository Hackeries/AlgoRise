-- =========================================================================
-- PART 7: TEAM & SOCIAL FEATURES - MENTORSHIP SYSTEM
-- Defines mentor request workflow and helper views for mentor matching.
-- =========================================================================

-- 1. Mentor Requests Table -------------------------------------------------
create table if not exists public.mentor_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  mentor_id uuid not null references auth.users(id) on delete cascade,
  topics text[] not null,
  message text,
  status text not null default 'pending' check (status in ('pending','accepted','declined','cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  UNIQUE (requester_id, mentor_id, created_at)
);

create index if not exists idx_mentor_requests_requester on public.mentor_requests(requester_id);
create index if not exists idx_mentor_requests_mentor on public.mentor_requests(mentor_id);
create index if not exists idx_mentor_requests_status on public.mentor_requests(status);

alter table public.mentor_requests enable row level security;

-- Allow requesters to manage their own requests
create policy if not exists "mentor_requests_select_own"
  on public.mentor_requests for select
  using (auth.uid() = requester_id or auth.uid() = mentor_id);

create policy if not exists "mentor_requests_insert_own"
  on public.mentor_requests for insert
  with check (auth.uid() = requester_id);

create policy if not exists "mentor_requests_update_participants"
  on public.mentor_requests for update
  using (auth.uid() = requester_id or auth.uid() = mentor_id)
  with check (auth.uid() = requester_id or auth.uid() = mentor_id);

-- 2. Mentor Candidate Helper View -----------------------------------------
create or replace view public.mentor_topic_candidates as
select
  utm.user_id,
  utm.topic,
  utm.problems_solved,
  utm.success_rate,
  usp.current_streak,
  usp.total_problems_solved,
  usp.last_activity_at
from public.user_topic_mastery utm
join public.user_skill_profiles usp on usp.user_id = utm.user_id
where utm.problems_solved >= 100 and utm.success_rate >= 0.9;

comment on view public.mentor_topic_candidates is 'Users who qualify as mentors for specific topics based on solve counts and success rate criteria.';

-- 3. RPC for Mentor Matching ----------------------------------------------
create or replace function public.match_mentors_for_user(
  p_user_id uuid,
  p_topics text[] default null,
  p_limit integer default 5
)
returns table (
  mentor_id uuid,
  topic text,
  problems_solved integer,
  success_rate real,
  current_streak integer,
  last_activity_at timestamptz
)
language plpgsql
security definer
as $$
declare
  target_topics text[];
begin
  if p_user_id is null then
    raise exception 'p_user_id required';
  end if;

  if p_topics is not null and array_length(p_topics, 1) > 0 then
    target_topics := p_topics;
  else
    select weak_topics
    into target_topics
    from public.user_skill_profiles
    where user_id = p_user_id;
  end if;

  if target_topics is null or array_length(target_topics, 1) = 0 then
    target_topics := ARRAY['dynamic programming','graphs','math'];
  end if;

  return query
    select
      c.user_id as mentor_id,
      c.topic,
      c.problems_solved,
      c.success_rate,
      c.current_streak,
      c.last_activity_at
    from public.mentor_topic_candidates c
    where c.user_id <> p_user_id
      and c.topic = any(target_topics)
    order by c.problems_solved desc, c.success_rate desc, coalesce(c.last_activity_at, now()) desc
    limit p_limit * greatest(array_length(target_topics, 1), 1);
end;
$$;

comment on function public.match_mentors_for_user is 'Returns qualifying mentors for the requesting user based on weak topics and performance thresholds.';

grant execute on function public.match_mentors_for_user to anon, authenticated;

-- 4. Helper Function for Badge Title --------------------------------------
create or replace function public.topic_badge_label(p_topic text)
returns text
language sql
as $$
  select
    case
      when p_topic ilike 'dynamic programming' then 'Expert in DP'
      when p_topic ilike 'graphs' then 'Graph Guru'
      when p_topic ilike 'math%' then 'Math Master'
      else initcap(p_topic) || ' Expert'
    end
$$;

grant execute on function public.topic_badge_label to anon, authenticated;

-- =========================================================================
-- END OF FILE
-- =========================================================================
