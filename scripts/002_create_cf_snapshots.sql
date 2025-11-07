-- ============================================================
-- PATCH MIGRATION: Bring existing cf_snapshots table up to date
-- Safely adds/renames columns, constraints, indexes, trigger,
-- policies, and helper function without losing existing data.
-- ============================================================

-- Ensure gen_random_uuid() is available
create extension if not exists pgcrypto;

-- 0. Ensure table exists (if it never existed, create minimal then patch)
create table if not exists public.cf_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  handle text not null
);

-- 1. Add or rename columns to match canonical spec
do $$
begin
  -- last_rating
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='cf_snapshots' and column_name='last_rating'
  ) then
    if exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='cf_snapshots' and column_name='rating'
    ) then
      execute 'alter table public.cf_snapshots rename column rating to last_rating';
    else
      execute 'alter table public.cf_snapshots add column last_rating integer';
    end if;
  end if;

  -- last_contest
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='cf_snapshots' and column_name='last_contest'
  ) then
    execute 'alter table public.cf_snapshots add column last_contest text';
  end if;

  -- rating_delta
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='cf_snapshots' and column_name='rating_delta'
  ) then
    execute 'alter table public.cf_snapshots add column rating_delta integer';
  end if;

  -- fetched_at
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='cf_snapshots' and column_name='fetched_at'
  ) then
    execute $sql$
      alter table public.cf_snapshots
      add column fetched_at timestamptz not null default timezone('utc', now())
    $sql$;
  end if;

  -- created_at
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='cf_snapshots' and column_name='created_at'
  ) then
    execute $sql$
      alter table public.cf_snapshots
      add column created_at timestamptz not null default timezone('utc', now())
    $sql$;
  end if;

  -- updated_at
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='cf_snapshots' and column_name='updated_at'
  ) then
    execute $sql$
      alter table public.cf_snapshots
      add column updated_at timestamptz not null default timezone('utc', now())
    $sql$;
  end if;

  -- is_latest
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='cf_snapshots' and column_name='is_latest'
  ) then
    execute $sql$
      alter table public.cf_snapshots
      add column is_latest boolean not null default false
    $sql$;
  end if;
end
$$;

-- 2. Constraints (skip if already exist)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='cf_snapshots_handle_not_blank'
  ) then
    execute $sql$
      alter table public.cf_snapshots
      add constraint cf_snapshots_handle_not_blank
      check (length(trim(handle)) > 0)
    $sql$;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname='cf_snapshots_rating_nonnegative'
  ) then
    execute $sql$
      alter table public.cf_snapshots
      add constraint cf_snapshots_rating_nonnegative
      check (last_rating is null or last_rating >= 0)
    $sql$;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname='cf_snapshots_rating_delta_reasonable'
  ) then
    execute $sql$
      alter table public.cf_snapshots
      add constraint cf_snapshots_rating_delta_reasonable
      check (rating_delta is null or abs(rating_delta) <= 1000)
    $sql$;
  end if;
end
$$;

comment on table public.cf_snapshots is 'Historical Codeforces rating snapshots per user.';
comment on column public.cf_snapshots.handle is 'Codeforces handle (external identifier).';
comment on column public.cf_snapshots.last_rating is 'Rating after last contest fetch.';
comment on column public.cf_snapshots.last_contest is 'Identifier or name of last contest included.';
comment on column public.cf_snapshots.rating_delta is 'Delta vs previous latest snapshot.';
comment on column public.cf_snapshots.fetched_at is 'UTC timestamp when fetched from Codeforces.';
comment on column public.cf_snapshots.is_latest is 'Exactly one true per (user_id, handle).';

-- 3. Indexes (idempotent)
create index if not exists idx_cf_snapshots_user_latest
  on public.cf_snapshots(user_id)
  where is_latest;

create index if not exists idx_cf_snapshots_user_fetched_at
  on public.cf_snapshots(user_id, fetched_at desc);

create index if not exists idx_cf_snapshots_lower_handle
  on public.cf_snapshots (lower(handle));

create unique index if not exists uq_cf_snapshots_user_handle_latest
  on public.cf_snapshots(user_id, lower(handle))
  where is_latest;

-- 4. Shared timestamp trigger function (if not already defined)
create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- 5. Trigger
drop trigger if exists trg_cf_snapshots_updated_at on public.cf_snapshots;
create trigger trg_cf_snapshots_updated_at
before update on public.cf_snapshots
for each row
execute function public.set_timestamp();

-- 6. RLS policies (reset)
alter table public.cf_snapshots enable row level security;

drop policy if exists "cf_snapshots_select_own"        on public.cf_snapshots;
drop policy if exists "cf_snapshots_insert_own"        on public.cf_snapshots;
drop policy if exists "cf_snapshots_update_own"        on public.cf_snapshots;
drop policy if exists "cf_snapshots_delete_own"        on public.cf_snapshots;
drop policy if exists "cf_snapshots_admin_full_access" on public.cf_snapshots;

create policy "cf_snapshots_select_own"
  on public.cf_snapshots
  for select
  using (auth.uid() = user_id);

create policy "cf_snapshots_insert_own"
  on public.cf_snapshots
  for insert
  with check (auth.uid() = user_id);

create policy "cf_snapshots_update_own"
  on public.cf_snapshots
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- (Optional delete policy omitted to keep history)
create policy "cf_snapshots_admin_full_access"
  on public.cf_snapshots
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- 7. Upsert function (recreated to match final spec)
create or replace function public.upsert_cf_snapshot(
  p_user_id uuid,
  p_handle text,
  p_last_rating integer,
  p_last_contest text,
  p_fetched_at timestamptz default timezone('utc', now()),
  p_rating_delta integer default null
)
returns public.cf_snapshots
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prev public.cf_snapshots%rowtype;
  v_new  public.cf_snapshots%rowtype;
  v_delta integer;
begin
  if auth.role() <> 'service_role' and auth.uid() <> p_user_id then
    raise exception 'insufficient_privilege';
  end if;

  -- Lock current latest for this handle
  select *
    into v_prev
  from public.cf_snapshots
  where user_id = p_user_id
    and lower(handle) = lower(p_handle)
    and is_latest
  for update;

  if p_rating_delta is not null then
    v_delta := p_rating_delta;
  elsif v_prev.id is not null and v_prev.last_rating is not null and p_last_rating is not null then
    v_delta := p_last_rating - v_prev.last_rating;
  else
    v_delta := null;
  end if;

  if v_prev.id is not null then
    update public.cf_snapshots
       set is_latest = false
     where id = v_prev.id;
  end if;

  insert into public.cf_snapshots (
    user_id, handle, last_rating, last_contest, rating_delta,
    fetched_at, created_at, updated_at, is_latest
  ) values (
    p_user_id, p_handle, p_last_rating, p_last_contest, v_delta,
    p_fetched_at, timezone('utc', now()), timezone('utc', now()), true
  )
  returning * into v_new;

  return v_new;
end;
$$;

do $$
begin
  -- Grant execute to common Supabase roles; ignore if roles don't exist
  begin
    grant execute on function public.upsert_cf_snapshot(
      uuid, text, integer, text, timestamptz, integer
    ) to authenticated, service_role;
  exception when undefined_object then
    null;
  end;
end
$$;

-- 8. View for latest snapshots
create or replace view public.cf_latest_snapshots as
select *
from public.cf_snapshots
where is_latest;

grant select on public.cf_latest_snapshots to authenticated;