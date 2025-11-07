-- =========================================
-- STREAKS SCHEMA (Recommended Version)
-- =========================================
-- Idempotent, safe to re-run.

-- ---------- TABLE ----------
create table if not exists public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,

  current_streak integer not null default 0,
  last_active_day date,
  longest_streak integer not null default 0,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  -- Guardrails
  constraint streaks_nonnegative check (current_streak >= 0 and longest_streak >= 0),
  constraint streaks_longest_ge_current check (longest_streak >= current_streak),
  constraint streaks_last_active_not_future
    check (last_active_day is null or last_active_day <= (timezone('utc', now()))::date)
);

comment on table public.streaks is 'Per-user activity streaks keyed to auth.users.';
comment on column public.streaks.current_streak is 'Current consecutive-day activity count.';
comment on column public.streaks.last_active_day is 'Date (UTC) of last activity that counted toward the streak.';
comment on column public.streaks.longest_streak is 'Historical max consecutive-day streak.';

-- Helpful if you query recent activity across users
create index if not exists idx_streaks_last_active_day on public.streaks(last_active_day);

-- ---------- UPDATED_AT TRIGGER ----------
drop trigger if exists trg_streaks_updated_at on public.streaks;
create trigger trg_streaks_updated_at
before update on public.streaks
for each row
execute function public.set_timestamp();

-- ---------- ROW LEVEL SECURITY ----------
alter table public.streaks enable row level security;

-- Clean existing policies (idempotent)
drop policy if exists "streaks_select_own"        on public.streaks;
drop policy if exists "streaks_insert_own"        on public.streaks;
drop policy if exists "streaks_update_own"        on public.streaks;
drop policy if exists "streaks_delete_own"        on public.streaks;
drop policy if exists "streaks_admin_full_access" on public.streaks;

-- Owner-only access
create policy "streaks_select_own"
  on public.streaks
  for select
  using (auth.uid() = user_id);

create policy "streaks_insert_own"
  on public.streaks
  for insert
  with check (auth.uid() = user_id);

create policy "streaks_update_own"
  on public.streaks
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "streaks_delete_own"
  on public.streaks
  for delete
  using (auth.uid() = user_id);

-- Optional: Admin / service role bypass (adjust to your JWT claims)
create policy "streaks_admin_full_access"
  on public.streaks
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ---------- OPTIONAL: SAFE UPSERT FUNCTION FOR DAILY TOUCH ----------
-- This function increments/reset the streak for a given (UTC) activity date.
-- It is RLS-aware (does not bypass RLS) and checks the caller matches p_user_id unless service role.
create or replace function public.touch_streak(
  p_user_id uuid,
  p_activity_date date default (timezone('utc', now()))::date
)
returns public.streaks
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.streaks%rowtype;
  v_current int;
  v_longest int;
  v_diff int;
begin
  -- Ensure only the owner or service role can mutate this row
  if auth.role() <> 'service_role' and auth.uid() <> p_user_id then
    raise exception 'insufficient_privilege';
  end if;

  -- Initialize row if missing (first touch => streak = 1)
  insert into public.streaks as t (user_id, current_streak, last_active_day, longest_streak)
  values (p_user_id, 1, p_activity_date, 1)
  on conflict (user_id) do nothing;

  -- Lock the row for safe concurrent updates
  select *
    into s
  from public.streaks
  where user_id = p_user_id
  for update;

  -- If never set, ensure first-day values
  if s.last_active_day is null then
    v_current := 1;
    v_longest := greatest(1, coalesce(s.longest_streak, 0));
    update public.streaks
       set current_streak = v_current,
           longest_streak = v_longest,
           last_active_day = p_activity_date
     where user_id = p_user_id
     returning * into s;
    return s;
  end if;

  -- Ignore same-day or backdated touches
  if p_activity_date <= s.last_active_day then
    return s;
  end if;

  -- Calculate day gap
  v_diff := p_activity_date - s.last_active_day;

  if v_diff = 1 then
    v_current := s.current_streak + 1;  -- continued streak
  else
    v_current := 1;                      -- reset after a break
  end if;

  v_longest := greatest(coalesce(s.longest_streak, 0), v_current);

  update public.streaks
     set current_streak = v_current,
         longest_streak = v_longest,
         last_active_day = p_activity_date
   where user_id = p_user_id
   returning * into s;

  return s;
end;
$$;

-- Grant execute to common Supabase roles
do $$
begin
  grant execute on function public.touch_streak(uuid, date) to authenticated;
  grant execute on function public.touch_streak(uuid, date) to service_role;
exception when undefined_object then null; -- roles may not exist outside Supabase
end$$;