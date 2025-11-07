-- =========================================
-- COLLEGES TABLE (India-focused) - Improved & Idempotent
-- =========================================
-- Key Enhancements:
-- 1. UTC timestamps (timezone('utc', now()))
-- 2. Data integrity constraints: non-blank name/country.
-- 3. Case-insensitive uniqueness per (name, country).
-- 4. Trigram + B-Tree indexes for both fast equality and fuzzy search.
-- 5. Safe FK backfill to profiles.college_id (only if absent).
-- 6. RLS: public read; write restricted to owner model (optional service_role bypass).
-- 7. Helper upsert function for consistent insertion.
-- =========================================

create extension if not exists pgcrypto;  -- for gen_random_uuid()
create extension if not exists pg_trgm;   -- for trigram search

-- ---------- TABLE ----------
create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null default 'India',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint colleges_name_not_blank check (length(trim(name)) > 0),
  constraint colleges_country_not_blank check (length(trim(country)) > 0)
);

comment on table public.colleges is 'Educational institutions, primarily India-focused.';
comment on column public.colleges.name is 'Official or commonly used college/institution name.';
comment on column public.colleges.country is 'Country name (default India).';

-- ---------- UPDATED_AT TRIGGER (shared utility) ----------
create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_colleges_updated_at on public.colleges;
create trigger trg_colleges_updated_at
before update on public.colleges
for each row
execute function public.set_timestamp();

-- ---------- UNIQUE INDEX (case-insensitive name + country) ----------
-- Ensures no duplicate college entries for same country regardless of case.
create unique index if not exists uq_colleges_name_country_ci
  on public.colleges (lower(name), lower(country));

-- ---------- SEARCH INDEXES ----------
-- Fast equality / filtering
create index if not exists idx_colleges_country on public.colleges (lower(country));

-- Trigram GIN index for fuzzy search on name
create index if not exists idx_colleges_name_trgm
  on public.colleges using gin (name gin_trgm_ops);

-- Optional: B-tree index on lower(name) for case-insensitive exact matches
create index if not exists idx_colleges_lower_name on public.colleges (lower(name));

-- ---------- FOREIGN KEY BACKFILL TO profiles.college_id ----------
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'college_id'
  )
  and not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'profiles'
      and constraint_name = 'profiles_college_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_college_id_fkey
      foreign key (college_id) references public.colleges(id)
      on delete set null
      deferrable initially immediate;
  end if;
end$$;

-- ---------- ROW LEVEL SECURITY ----------
alter table public.colleges enable row level security;

-- Reset policies
drop policy if exists "colleges_select_all"       on public.colleges;
drop policy if exists "colleges_insert_owner"     on public.colleges;
drop policy if exists "colleges_update_owner"     on public.colleges;
drop policy if exists "colleges_delete_owner"     on public.colleges;
drop policy if exists "colleges_admin_manage"     on public.colleges;

-- Public read (everyone, including anon if enabled at project level)
create policy "colleges_select_all"
  on public.colleges
  for select
  using (true);

-- If you want users to be able to propose new colleges under their auth.uid(),
-- you can model ownership by adding an owner column. Since schema does not have one,
-- we restrict writes to service_role by default. Uncomment owner-based policies if adding such a column later.

-- Service role full management (bypass)
create policy "colleges_admin_manage"
  on public.colleges
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- OPTIONAL (COMMENTED): Allow authenticated users to insert/update/delete.
-- Requires adding an owner column such as: owner uuid not null default auth.uid()
-- Uncomment after adding: alter table public.colleges add column owner uuid;
-- create policy "colleges_insert_owner"
--   on public.colleges
--   for insert
--   with check (auth.role() = 'service_role' or auth.uid() = owner);
-- create policy "colleges_update_owner"
--   on public.colleges
--   for update
--   using (auth.role() = 'service_role' or auth.uid() = owner)
--   with check (auth.role() = 'service_role' or auth.uid() = owner);
-- create policy "colleges_delete_owner"
--   on public.colleges
--   for delete
--   using (auth.role() = 'service_role' or auth.uid() = owner);

-- ---------- HELPER UPSERT FUNCTION ----------
-- Inserts a college if not present; returns existing otherwise.
-- Note: Security definer so service_role can seed data.
create or replace function public.upsert_college(
  p_name text,
  p_country text default 'India'
)
returns public.colleges
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.colleges%rowtype;
begin
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'college name required';
  end if;

  p_name := trim(p_name);
  p_country := trim(coalesce(p_country, 'India'));

  -- Try exact case-insensitive match
  select *
    into v_row
  from public.colleges
  where lower(name) = lower(p_name)
    and lower(country) = lower(p_country)
  limit 1;

  if found then
    return v_row;
  end if;

  insert into public.colleges (name, country)
  values (p_name, p_country)
  returning * into v_row;

  return v_row;
end;
$$;

-- Grants (best-effort)
do $$
begin
  begin
    grant execute on function public.upsert_college(text, text) to service_role;
    -- If you want authenticated users to propose new colleges:
    -- grant execute on function public.upsert_college(text, text) to authenticated;
  exception when undefined_object then null;
  end;
end$$;

-- ---------- OPTIONAL VIEW FOR SEARCH (CASE-INSENSITIVE) ----------
-- create or replace view public.colleges_ci as
-- select id, name, country, created_at, updated_at
-- from public.colleges;
-- grant select on public.colleges_ci to authenticated;

-- ---------- NOTES ----------
-- 1. Consider adding an ownership model if letting users crowdsource institutions.
-- 2. Trigram index aids fuzzy search (e.g., similarity(name, 'iit delhi') > 0.3).
-- 3. For large datasets, consider splitting country into a separate reference table.
-- 4. Use upsert_college for consistent normalization before insert.
-- =========================================