-- =========================================
-- PROFILE SCHEMA (Recommended Version)
-- =========================================
-- This script is idempotent and safe to re-run.

-- ---------- ENUM TYPES (use for data integrity) ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'profile_status') then
    create type profile_status as enum ('student', 'working');
  end if;

  if not exists (select 1 from pg_type where typname = 'degree_type_enum') then
    create type degree_type_enum as enum (
      'high_school',
      'associate',
      'bachelor',
      'master',
      'doctorate',
      'bootcamp',
      'other'
    );
  end if;
end$$;

-- ---------- TABLE ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  name text,
  profile_image_url text,
  show_profile_image boolean not null default true,

  -- Employment / student metadata
  status profile_status,
  degree_type degree_type_enum,
  company_id uuid,
  custom_company text,
  college_id uuid,
  year text,  -- consider: smallint with CHECK (year between 1900 and extract(year from now()) + 10)

  -- Preferences
  preferred_language text,
  programming_languages text[],

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  -- A company is either a referenced company_id OR a freeform custom_company, but not both
  constraint company_exclusive_check
    check (company_id is null or custom_company is null),

  -- Basic guardrail to avoid extreme array growth
  constraint programming_languages_len_check
    check (programming_languages is null or cardinality(programming_languages) <= 50)
);

comment on table public.profiles is 'User profile (1:1) linked to auth.users.';
comment on column public.profiles.status is 'Student vs working classification.';
comment on column public.profiles.year is 'Academic year or graduation year (free-form unless normalized).';
comment on column public.profiles.programming_languages is 'Array of preferred programming languages.';

-- ---------- INDEXES ----------
-- Filter/search helpers
create index if not exists idx_profiles_status       on public.profiles(status);
create index if not exists idx_profiles_college_id   on public.profiles(college_id);
create index if not exists idx_profiles_company_id   on public.profiles(company_id);

-- Optional composite for multi-dimensional filtering (uncomment if needed)
-- create index if not exists idx_profiles_status_degree on public.profiles(status, degree_type);

-- Optional functional index for name search (requires queries using lower(name))
-- create index if not exists idx_profiles_lower_name on public.profiles (lower(name));

-- ---------- UPDATED_AT TRIGGER FUNCTION ----------
do $$
begin
  if not exists (
    select 1
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'set_timestamp'
      and prorettype = 'pg_trigger'::regtype
  ) then
    execute $sql$
      create function public.set_timestamp()
      returns trigger
      language plpgsql
      as $func$
      begin
        new.updated_at := timezone('utc', now());
        return new;
      end;
      $func$;
    $sql$;
  end if;
end$$;

-- ---------- UPDATED_AT TRIGGER ----------
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_timestamp();

-- ---------- ROW LEVEL SECURITY ----------
alter table public.profiles enable row level security;

-- Clean existing policies (idempotent)
drop policy if exists "profiles_select_own"       on public.profiles;
drop policy if exists "profiles_insert_own"       on public.profiles;
drop policy if exists "profiles_update_own"       on public.profiles;
drop policy if exists "profiles_delete_own"       on public.profiles;
drop policy if exists "profiles_admin_full_access" on public.profiles;

-- Owner-only access
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles
  for delete
  using (auth.uid() = id);

-- Optional: Admin / service role full access (adjust claim logic)
create policy "profiles_admin_full_access"
  on public.profiles
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ---------- OPTIONAL PUBLIC VIEW (COMMENTED OUT) ----------
-- If you want limited public read without exposing all columns:
-- create or replace view public.public_profiles as
-- select
--   id,
--   name,
--   case when show_profile_image then profile_image_url else null end as profile_image_url,
--   status,
--   degree_type
-- from public.profiles;
--
-- revoke all on public.profiles from public;
-- grant select on public.public_profiles to authenticated;
-- (Optionally) grant select on public.public_profiles to anon;

-- ---------- OPTIONAL NORMALIZATION (NOT IMPLEMENTED) ----------
-- For programming_languages normalization, consider:
-- create table if not exists public.language_catalog (
--   code text primary key,
--   display_name text not null
-- );
-- create table if not exists public.profile_languages (
--   profile_id uuid references public.profiles(id) on delete cascade,
--   language_code text references public.language_catalog(code) on delete restrict,
--   primary key (profile_id, language_code)
-- );

-- ---------- NOTES ----------
-- 1. Add foreign key constraints for company_id / college_id to their respective tables when they exist.
-- 2. Consider converting year to smallint and validating range for graduation years.
-- 3. For high-read use cases add a materialized view or caching layer.
-- 4. Ensure your JWT includes role claim if using auth.role().