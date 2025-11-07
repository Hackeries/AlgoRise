-- =========================================
-- Update contests and contest_problems to support new fields
-- - Idempotent column additions and conversions
-- - Safe enum conversion for contest_mode (fixes default cast error)
-- - Adds defaults, NOT NULLs, and constraints where appropriate
-- - Adds tags array with normalization trigger and GIN index
-- - Adds CF problem detail fields on contest_problems
-- - Creates helpful indexes
-- =========================================

-- ---------- Ensure shared timestamp trigger exists (no-op if already defined) ----------
create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  -- Only set updated_at if the table has it
  if tg_op = 'UPDATE' then
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name   = tg_table_name
        and column_name  = 'updated_at'
    ) then
      new.updated_at := timezone('utc', now());
    end if;
  end if;
  return new;
end;
$$;

-- ---------- ENUM: contest_mode ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'contest_mode') then
    create type contest_mode as enum ('practice','icpc');
  end if;
end$$;

-- ---------- contests.contest_mode: add or convert to enum safely ----------
do $$
declare
  v_exists boolean;
  v_is_enum boolean;
  r record;
begin
  -- Does the column exist?
  select exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='contests' and column_name='contest_mode'
  ) into v_exists;

  if not v_exists then
    -- Add as enum directly
    alter table public.contests
      add column contest_mode contest_mode not null default 'practice';
  else
    -- Check if it's already the enum
    select (udt_name = 'contest_mode')
      into v_is_enum
    from information_schema.columns
    where table_schema='public' and table_name='contests' and column_name='contest_mode';

    if not v_is_enum then
      -- Drop any CHECK constraints that reference contest_mode (text form)
      for r in
        select conname
        from pg_constraint
        where conrelid = 'public.contests'::regclass
          and contype = 'c'
          and pg_get_constraintdef(oid) ilike '%contest_mode%'
      loop
        execute format('alter table public.contests drop constraint %I', r.conname);
      end loop;

      -- Drop existing default on text column to avoid cast errors
      alter table public.contests
        alter column contest_mode drop default;

      -- Sanitize existing values
      update public.contests
         set contest_mode = 'practice'
       where contest_mode is null
          or lower(contest_mode) not in ('practice','icpc');

      -- Convert type from text -> enum
      alter table public.contests
        alter column contest_mode type contest_mode
        using lower(contest_mode)::contest_mode;

      -- Reapply NOT NULL + default
      alter table public.contests
        alter column contest_mode set default 'practice',
        alter column contest_mode set not null;
    else
      -- Ensure enum column has default and not null
      alter table public.contests
        alter column contest_mode set default 'practice',
        alter column contest_mode set not null;
    end if;
  end if;
end$$;

-- ---------- contests.duration_minutes ----------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='contests' and column_name='duration_minutes'
  ) then
    alter table public.contests add column duration_minutes integer;
  end if;
end$$;

-- ---------- contests.problem_count (default + NOT NULL + constraint) ----------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='contests' and column_name='problem_count'
  ) then
    alter table public.contests add column problem_count integer;
  end if;

  -- Backfill then enforce
  update public.contests
     set problem_count = 5
   where problem_count is null;

  alter table public.contests
    alter column problem_count set default 5,
    alter column problem_count set not null;

  if not exists (
    select 1 from pg_constraint where conname = 'contests_problem_count_positive'
  ) then
    alter table public.contests
      add constraint contests_problem_count_positive
      check (problem_count > 0 and problem_count <= 20);
  end if;
end$$;

-- ---------- contests.rating_min / rating_max (defaults + NOT NULL + constraint) ----------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='contests' and column_name='rating_min'
  ) then
    alter table public.contests add column rating_min integer;
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='contests' and column_name='rating_max'
  ) then
    alter table public.contests add column rating_max integer;
  end if;

  -- Backfill sane defaults
  update public.contests set rating_min = 800 where rating_min is null;
  update public.contests set rating_max = 1600 where rating_max is null;

  alter table public.contests
    alter column rating_min set default 800,
    alter column rating_min set not null,
    alter column rating_max set default 1600,
    alter column rating_max set not null;

  if not exists (
    select 1 from pg_constraint where conname = 'contests_rating_bounds'
  ) then
    alter table public.contests
      add constraint contests_rating_bounds
      check (rating_min >= 0 and rating_max >= rating_min and rating_max <= 5000);
  end if;
end$$;

-- ---------- contests.tags (array) + normalization + index ----------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='contests' and column_name='tags'
  ) then
    alter table public.contests add column tags text[] default '{}'::text[];
  end if;

  -- Ensure not null default and backfill
  update public.contests set tags='{}'::text[] where tags is null;
  alter table public.contests alter column tags set default '{}'::text[];
end$$;

-- Tag normalization trigger (lowercase, trim, deduplicate)
create or replace function public.normalize_contest_tags()
returns trigger
language plpgsql
as $$
declare
  v text;
  out_tags text[] := '{}';
begin
  if new.tags is null then
    new.tags := '{}'::text[];
    return new;
  end if;

  foreach v in array new.tags loop
    v := btrim(lower(v));
    if v <> '' and not (out_tags @> array[v]) then
      out_tags := array_append(out_tags, v);
    end if;
  end loop;

  new.tags := out_tags;
  return new;
end;
$$;

drop trigger if exists trg_contests_tags_norm_ins on public.contests;
create trigger trg_contests_tags_norm_ins
before insert on public.contests
for each row execute function public.normalize_contest_tags();

drop trigger if exists trg_contests_tags_norm_upd on public.contests;
create trigger trg_contests_tags_norm_upd
before update of tags on public.contests
for each row execute function public.normalize_contest_tags();

-- GIN index for tag searches
create index if not exists idx_contests_tags_gin on public.contests using gin (tags);

-- ---------- contest_problems CF fields ----------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='contest_problems' and column_name='contest_id_cf'
  ) then
    alter table public.contest_problems add column contest_id_cf integer;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='contest_problems' and column_name='index_cf'
  ) then
    alter table public.contest_problems add column index_cf text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='contest_problems' and column_name='rating'
  ) then
    alter table public.contest_problems add column rating integer;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'contest_problems_rating_nonnegative'
  ) then
    alter table public.contest_problems
      add constraint contest_problems_rating_nonnegative
      check (rating is null or rating >= 0);
  end if;

  -- Unique problem per contest
  if not exists (
    select 1 from pg_indexes
    where schemaname='public' and indexname='uq_contest_problem'
  ) then
    create unique index uq_contest_problem on public.contest_problems (contest_id, problem_id);
  end if;
end$$;

-- ---------- Helpful indexes ----------
create index if not exists idx_contests_starts_at      on public.contests(starts_at);
create index if not exists idx_contests_status         on public.contests(status);
create index if not exists idx_contests_host_user_id   on public.contests(host_user_id);
create index if not exists idx_contests_starts_ends    on public.contests(starts_at, ends_at);

create index if not exists idx_problems_contest        on public.contest_problems(contest_id);
create index if not exists idx_problems_contest_points on public.contest_problems(contest_id, points desc);