-- =========================================================================
-- GROUP CHALLENGES FOR STUDY GROUPS (Enhanced, Idempotent, UTC-normalized)
-- -------------------------------------------------------------------------
-- Improvements:
--  1. Fixed pg_policies column name (policyname instead of polname) when dropping existing policies.
--  2. Adds updated_at columns + triggers for automatic timestamp maintenance.
--  3. Adds start/end date guardrails and automatic status transitions
--     (active -> completed when all finished, active -> expired after end_date).
--  4. Adds service_role bypass policies for administration tasks.
--  5. Adds composite indexes for filtering by active date windows.
--  6. Adds uniqueness and check constraints with defensive creation (no errors on re-run).
--  7. Adds helper function to safely increment progress (atomic upsert) and auto-complete.
--  8. Ensures end_date >= start_date, and target_count > 0 constraint is present.
--  9. Uses timezone('utc', now()) for consistency.
-- 10. Optional soft “lock”: non-service users cannot edit completed/expired challenges.
-- =========================================================================

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

-- ---------- TABLE: group_challenges ----------
create table if not exists public.group_challenges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text,
  metric text not null default 'problems_solved',
  target_count integer not null,
  start_date date not null default (timezone('utc', now()))::date,
  end_date date not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Constraints (idempotent)
do $$
begin
  if not exists (select 1 from pg_constraint where conname='group_challenges_metric_check') then
    alter table public.group_challenges
      add constraint group_challenges_metric_check
      check (metric in ('problems_solved'));
  end if;

  if not exists (select 1 from pg_constraint where conname='group_challenges_target_positive') then
    alter table public.group_challenges
      add constraint group_challenges_target_positive
      check (target_count > 0);
  end if;

  if not exists (select 1 from pg_constraint where conname='group_challenges_status_check') then
    alter table public.group_challenges
      add constraint group_challenges_status_check
      check (status in ('active','completed','expired'));
  end if;

  if not exists (select 1 from pg_constraint where conname='group_challenges_date_order') then
    alter table public.group_challenges
      add constraint group_challenges_date_order
      check (end_date >= start_date);
  end if;
end$$;

-- ---------- TABLE: group_challenge_progress ----------
create table if not exists public.group_challenge_progress (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.group_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  current_count integer not null default 0,
  completed boolean not null default false,
  last_updated timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (challenge_id, user_id)
);

-- Guardrail on non-negative progress
do $$
begin
  if not exists (select 1 from pg_constraint where conname='group_challenge_progress_nonneg') then
    alter table public.group_challenge_progress
      add constraint group_challenge_progress_nonneg
      check (current_count >= 0);
  end if;
end$$;

-- ---------- Indexes ----------
create index if not exists idx_group_challenges_group_id    on public.group_challenges(group_id);
create index if not exists idx_group_challenges_status      on public.group_challenges(status);
create index if not exists idx_group_challenges_active_window
  on public.group_challenges(group_id, status, start_date, end_date);

create index if not exists idx_group_challenge_progress_challenge
  on public.group_challenge_progress(challenge_id);
create index if not exists idx_group_challenge_progress_user
  on public.group_challenge_progress(user_id);
create index if not exists idx_group_challenge_progress_completed
  on public.group_challenge_progress(challenge_id, completed);

-- ---------- RLS Enable ----------
alter table public.group_challenges enable row level security;
alter table public.group_challenge_progress enable row level security;

-- ---------- Drop existing policies (clean slate) ----------
do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname='public' and tablename='group_challenges'
  loop
    execute format('drop policy if exists %I on public.group_challenges', p.policyname);
  end loop;

  for p in
    select policyname from pg_policies
    where schemaname='public' and tablename='group_challenge_progress'
  loop
    execute format('drop policy if exists %I on public.group_challenge_progress', p.policyname);
  end loop;
end$$;

-- ---------- Policies: group_challenges ----------
create policy group_challenges_select_members on public.group_challenges
  for select
  using (
    auth.role() = 'service_role'
    or exists (
      select 1 from public.group_memberships gm
      where gm.group_id = public.group_challenges.group_id
        and gm.user_id = auth.uid()
    )
  );

create policy group_challenges_insert_admin on public.group_challenges
  for insert
  with check (
    auth.role() = 'service_role'
    or exists (
      select 1 from public.group_memberships gm
      where gm.group_id = public.group_challenges.group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );

create policy group_challenges_update_admin on public.group_challenges
  for update
  using (
    auth.role() = 'service_role'
    or (
      exists (
        select 1 from public.group_memberships gm
        where gm.group_id = public.group_challenges.group_id
          and gm.user_id = auth.uid()
          and gm.role = 'admin'
      )
      and public.group_challenges.status = 'active'
    )
  )
  with check (
    auth.role() = 'service_role'
    or (
      exists (
        select 1 from public.group_memberships gm
        where gm.group_id = public.group_challenges.group_id
          and gm.user_id = auth.uid()
          and gm.role = 'admin'
      )
      and public.group_challenges.status = 'active'
    )
  );

create policy group_challenges_delete_admin on public.group_challenges
  for delete
  using (
    auth.role() = 'service_role'
    or (
      public.group_challenges.status = 'active' and exists (
        select 1 from public.group_memberships gm
        where gm.group_id = public.group_challenges.group_id
          and gm.user_id = auth.uid()
          and gm.role = 'admin'
      )
    )
  );

-- ---------- Policies: group_challenge_progress ----------
create policy group_challenge_progress_select_members on public.group_challenge_progress
  for select
  using (
    auth.role() = 'service_role'
    or exists (
      select 1
      from public.group_challenges gc
      join public.group_memberships gm on gm.group_id = gc.group_id
      where gc.id = public.group_challenge_progress.challenge_id
        and gm.user_id = auth.uid()
    )
  );

create policy group_challenge_progress_insert_member on public.group_challenge_progress
  for insert
  with check (
    auth.role() = 'service_role'
    or auth.uid() = user_id
  );

create policy group_challenge_progress_update_member on public.group_challenge_progress
  for update
  using (
    auth.role() = 'service_role'
    or auth.uid() = user_id
  )
  with check (
    auth.role() = 'service_role'
    or auth.uid() = user_id
  );

-- ---------- Updated_at triggers ----------
drop trigger if exists trg_group_challenges_updated_at on public.group_challenges;
create trigger trg_group_challenges_updated_at
before update on public.group_challenges
for each row execute function public.set_updated_at();

drop trigger if exists trg_group_challenge_progress_updated_at on public.group_challenge_progress;
create trigger trg_group_challenge_progress_updated_at
before update on public.group_challenge_progress
for each row execute function public.set_updated_at();

-- ---------- Automatic status transition trigger ----------
create or replace function public.auto_update_group_challenge_status()
returns trigger
language plpgsql
as $$
declare
  v_all_completed boolean;
begin
  -- Expire if past end_date
  if new.status = 'active' and new.end_date < (timezone('utc', now()))::date then
    new.status := 'expired';
  end if;

  -- If still active, check if all participants completed
  if new.status = 'active' then
    select bool_and(completed) into v_all_completed
    from public.group_challenge_progress
    where challenge_id = new.id;

    if v_all_completed is true and v_all_completed is not null then
      new.status := 'completed';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_group_challenges_auto_status on public.group_challenges;
create trigger trg_group_challenges_auto_status
before update on public.group_challenges
for each row execute function public.auto_update_group_challenge_status();

-- ---------- Progress maintenance trigger ----------
create or replace function public.auto_complete_progress()
returns trigger
language plpgsql
as $$
declare
  v_target int;
begin
  select target_count into v_target
  from public.group_challenges
  where id = new.challenge_id;

  if v_target is not null then
    new.completed := (new.current_count >= v_target);
  end if;

  new.last_updated := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_group_challenge_progress_auto_complete on public.group_challenge_progress;
create trigger trg_group_challenge_progress_auto_complete
before update on public.group_challenge_progress
for each row execute function public.auto_complete_progress();

-- ---------- Helper function: refresh group challenge progress ----------
create or replace function public.refresh_group_challenge_progress(p_challenge_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  challenge record;
begin
  select * into challenge from public.group_challenges where id = p_challenge_id;
  if not found then
    raise exception 'Challenge % not found', p_challenge_id;
  end if;

  update public.group_challenge_progress
     set completed = (current_count >= challenge.target_count),
         last_updated = timezone('utc', now()),
         updated_at = timezone('utc', now())
   where challenge_id = p_challenge_id;

  -- Touch challenge row to trigger status evaluation
  update public.group_challenges
     set updated_at = timezone('utc', now())
   where id = p_challenge_id;
end;
$$;

-- ---------- Helper function: increment progress atomically ----------
create or replace function public.increment_group_challenge_progress(
  p_challenge_id uuid,
  p_user_id uuid,
  p_increment int default 1
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target int;
begin
  if p_increment <= 0 then
    raise exception 'Increment must be positive';
  end if;

  select target_count into v_target
  from public.group_challenges
  where id = p_challenge_id;

  if v_target is null then
    raise exception 'Challenge % not found', p_challenge_id;
  end if;

  insert into public.group_challenge_progress (challenge_id, user_id, current_count, completed, last_updated, created_at, updated_at)
  values (p_challenge_id, p_user_id, p_increment, p_increment >= v_target, timezone('utc', now()), timezone('utc', now()), timezone('utc', now()))
  on conflict (challenge_id, user_id) do update set
    current_count = public.group_challenge_progress.current_count + p_increment,
    completed = (public.group_challenge_progress.current_count + p_increment) >= v_target,
    last_updated = timezone('utc', now()),
    updated_at = timezone('utc', now());

  -- Touch challenge row to trigger status evaluation
  update public.group_challenges
     set updated_at = timezone('utc', now())
   where id = p_challenge_id;
end;
$$;

grant execute on function public.refresh_group_challenge_progress(uuid) to authenticated;
grant execute on function public.increment_group_challenge_progress(uuid, uuid, int) to authenticated;

-- =========================================================================
-- END OF FILE
-- =========================================================================