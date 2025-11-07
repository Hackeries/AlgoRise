-- =========================================
-- Profiles: add coding platform handles (idempotent, improved)
-- =========================================
-- Adds columns if missing, lightweight length checks, optional stricter regex checks (NOT VALID),
-- normalization trigger (trim and strip leading '@'), and helpful case-insensitive indexes.

-- 1) Add columns (safe if already present)
alter table if exists public.profiles
  add column if not exists leetcode_handle  text,
  add column if not exists codechef_handle  text,
  add column if not exists atcoder_handle   text,
  add column if not exists gfg_handle       text;

comment on column public.profiles.leetcode_handle is 'LeetCode username/handle';
comment on column public.profiles.codechef_handle is 'CodeChef username/handle';
comment on column public.profiles.atcoder_handle  is 'AtCoder username/handle';
comment on column public.profiles.gfg_handle      is 'GeeksForGeeks username/handle';

-- 2) Keep the simple length checks (only add if missing)
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_leetcode_len') then
    alter table public.profiles add constraint profiles_leetcode_len check (char_length(leetcode_handle) <= 64);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_codechef_len') then
    alter table public.profiles add constraint profiles_codechef_len check (char_length(codechef_handle) <= 64);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_atcoder_len') then
    alter table public.profiles add constraint profiles_atcoder_len check (char_length(atcoder_handle) <= 64);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_gfg_len') then
    alter table public.profiles add constraint profiles_gfg_len check (char_length(gfg_handle) <= 64);
  end if;
end $$;

-- 3) Optional stricter format checks (alnum, underscore, dot, hyphen), added as NOT VALID to avoid breaking existing data.
--    You can validate later with: ALTER TABLE public.profiles VALIDATE CONSTRAINT <name>;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_leetcode_format') then
    alter table public.profiles add constraint profiles_leetcode_format
      check (leetcode_handle is null or leetcode_handle ~ '^[A-Za-z0-9_.-]{1,64}$') not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_codechef_format') then
    alter table public.profiles add constraint profiles_codechef_format
      check (codechef_handle is null or codechef_handle ~ '^[A-Za-z0-9_.-]{1,64}$') not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_atcoder_format') then
    alter table public.profiles add constraint profiles_atcoder_format
      check (atcoder_handle is null or atcoder_handle ~ '^[A-Za-z0-9_.-]{1,64}$') not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_gfg_format') then
    alter table public.profiles add constraint profiles_gfg_format
      check (gfg_handle is null or gfg_handle ~ '^[A-Za-z0-9_.-]{1,64}$') not valid;
  end if;
end $$;

-- 4) Normalization helper: trim whitespace and strip leading '@'
create or replace function public.normalize_handle(p text)
returns text
language sql
immutable
as $$
  select
    case
      when nullif(btrim(coalesce(p, '')), '') is null then null
      else regexp_replace(btrim(p), '^\s*@', '', 'g')
    end
$$;

-- Trigger to normalize handles on write (does not lower-case; preserves user casing)
create or replace function public.normalize_profile_handles()
returns trigger
language plpgsql
as $$
begin
  if tg_op in ('INSERT','UPDATE') then
    if new.leetcode_handle is distinct from old.leetcode_handle then
      new.leetcode_handle := public.normalize_handle(new.leetcode_handle);
    end if;
    if new.codechef_handle is distinct from old.codechef_handle then
      new.codechef_handle := public.normalize_handle(new.codechef_handle);
    end if;
    if new.atcoder_handle is distinct from old.atcoder_handle then
      new.atcoder_handle := public.normalize_handle(new.atcoder_handle);
    end if;
    if new.gfg_handle is distinct from old.gfg_handle then
      new.gfg_handle := public.normalize_handle(new.gfg_handle);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_normalize_handles on public.profiles;
create trigger trg_profiles_normalize_handles
before insert or update of leetcode_handle, codechef_handle, atcoder_handle, gfg_handle
on public.profiles
for each row
execute function public.normalize_profile_handles();

-- 5) Helpful case-insensitive search indexes (do not enforce uniqueness)
create index if not exists idx_profiles_leetcode_handle_ci on public.profiles (lower(leetcode_handle)) where leetcode_handle is not null;
create index if not exists idx_profiles_codechef_handle_ci on public.profiles (lower(codechef_handle)) where codechef_handle is not null;
create index if not exists idx_profiles_atcoder_handle_ci  on public.profiles (lower(atcoder_handle))  where atcoder_handle  is not null;
create index if not exists idx_profiles_gfg_handle_ci      on public.profiles (lower(gfg_handle))      where gfg_handle      is not null;

-- OPTIONAL (commented): Enforce uniqueness per platform (case-insensitive).
-- NOTE: Creating these may fail if duplicates already exist. Deduplicate first, then uncomment.
-- create unique index uq_profiles_leetcode_handle_ci on public.profiles (lower(leetcode_handle)) where leetcode_handle is not null;
-- create unique index uq_profiles_codechef_handle_ci on public.profiles (lower(codechef_handle)) where codechef_handle is not null;
-- create unique index uq_profiles_atcoder_handle_ci  on public.profiles (lower(atcoder_handle))  where atcoder_handle  is not null;
-- create unique index uq_profiles_gfg_handle_ci      on public.profiles (lower(gfg_handle))      where gfg_handle      is not null;