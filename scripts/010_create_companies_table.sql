-- =========================================
-- College membership enforcement for group joins
-- - Adds profiles.college_id if missing and wires FK to colleges
-- - Adds trigger on group_memberships to enforce college-only groups
-- - Idempotent and RLS-safe design (works with existing RLS)
-- =========================================

-- 1) Add profiles.college_id when missing
alter table if exists public.profiles
  add column if not exists college_id uuid;

-- 2) Ensure FK to public.colleges exists (only if table exists)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'college_id'
  )
  and to_regclass('public.colleges') is not null
  and not exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name   = 'profiles'
      and constraint_type = 'FOREIGN KEY'
      and constraint_name = 'profiles_college_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_college_id_fkey
      foreign key (college_id)
      references public.colleges(id)
      on delete set null
      deferrable initially immediate;
  end if;
end
$$;

-- Helpful index for joins/filtering (if not already present)
create index if not exists idx_profiles_college_id on public.profiles(college_id);

-- Also ensure supporting indexes on groups / memberships (no-ops if they exist already)
create index if not exists idx_groups_college_id on public.groups(college_id);
create index if not exists idx_groups_type on public.groups(type);
create index if not exists idx_gm_group on public.group_memberships(group_id);

-- 3) Trigger function to enforce membership rules for college groups
-- Notes:
-- - Groups use enum group_type ('college','friends'); enforcement applies only to 'college'.
-- - We structure the SELECT to only read college groups, which is allowed by typical RLS
--   (discoverability for college groups). If the group is 'friends', the SELECT returns 0 rows
--   (no error), and we skip enforcement.
-- - Profiles RLS usually only allows a user to read their own profile; therefore, we enforce
--   strictly when a user joins themselves (NEW.user_id = auth.uid()).
--   For admins adding others, prefer using a server/service role which bypasses RLS to ensure
--   enforcement; otherwise we cannot reliably read the target user's profile due to RLS.
create or replace function public.enforce_college_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group_college uuid;
begin
  -- Service role bypass (administrative flows)
  if auth.role() = 'service_role' then
    return new;
  end if;

  -- Only consider college groups; for friends groups this returns no row and we skip.
  select g.college_id
    into v_group_college
  from public.groups g
  where g.id = new.group_id
    and g.type = 'college'
  limit 1;

  -- Not a college group (or not visible): no enforcement
  if not found then
    return new;
  end if;

  if v_group_college is null then
    raise exception 'Group % requires a college_id to accept members', new.group_id;
  end if;

  -- Enforce only for self-join (RLS lets a user read their own profile)
  if new.user_id = auth.uid() then
    perform 1
    from public.profiles p
    where p.id = new.user_id
      and p.college_id = v_group_college;

    if not found then
      raise exception 'User % must belong to college % to join group %',
        new.user_id, v_group_college, new.group_id;
    end if;
  else
    -- If someone else is adding this membership, we cannot reliably check due to RLS.
    -- Recommended: perform such operations via service_role to allow the SELECT above to run
    -- and/or validate at the API layer as well.
    null;
  end if;

  return new;
end;
$$;

-- 4) Hook trigger on group_memberships (validate on insert and when group_id/user_id changes)
drop trigger if exists trg_group_memberships_college_check on public.group_memberships;
create trigger trg_group_memberships_college_check
before insert or update of group_id, user_id on public.group_memberships
for each row
execute function public.enforce_college_membership();