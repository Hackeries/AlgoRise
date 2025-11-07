-- =========================================
-- Improve colleges insert policy
-- =========================================
-- Goals:
-- 1. Idempotent: only create policy if missing (no noisy exception handling).
-- 2. Ensure table has RLS enabled.
-- 3. Allow authenticated users to insert while enforcing minimal data integrity at RLS layer.
-- 4. Optionally allow service_role to bypass (already typical).
-- 5. Use a deterministic name consistent with other policies.
-- =========================================

-- Enable RLS if not already
alter table public.colleges enable row level security;

-- Drop old variant (if you want to replace it)
drop policy if exists "colleges_insert_authenticated" on public.colleges;

-- Create policy only if it does not exist (defensive)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename  = 'colleges'
      and policyname = 'colleges_insert_authenticated'
  ) then
    create policy "colleges_insert_authenticated"
      on public.colleges
      for insert
      to authenticated
      with check (
        auth.uid() is not null
        and length(trim(name)) > 0
        and length(trim(country)) > 0
      );
  end if;
end
$$;

-- (Optional) Service role bypass for inserts + updates if not already present:
drop policy if exists "colleges_admin_manage" on public.colleges;
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public'
      and tablename='colleges'
      and policyname='colleges_admin_manage'
  ) then
    create policy "colleges_admin_manage"
      on public.colleges
      for all
      to service_role
      using (true)
      with check (true);
  end if;
end
$$;

-- NOTE:
-- - Table constraints (e.g., colleges_name_not_blank) still apply; RLS check adds another layer.
-- - If you want to restrict inserts by normal users to only the default country 'India',
--   replace country check with: country = 'India'
-- - If you want to prevent duplicate names differing only by case, ensure the unique
--   case-insensitive index exists (created in prior migration):
--     create unique index if not exists uq_colleges_name_country_ci
--       on public.colleges (lower(name), lower(country));
