-- =========================================
-- GROUPS & GROUP_MEMBERSHIPS (Improved)
-- =========================================
-- Key Enhancements:
-- 1. Enum types for group type and membership role (data integrity).
-- 2. UTC timestamps + updated_at trigger.
-- 3. RLS with clearer, explicit policies (owner/admin/service role).
-- 4. Prevent deleting last admin from a group (trigger).
-- 5. Helper function to create a group and its creator membership atomically.
-- 6. Guardrails (non-blank names, normalization optional).
-- 7. Index improvements (role, lower(name)).
-- 8. Optional uniqueness constraints for (college_id, lower(name)) for college groups.
-- 9. Idempotent (safe re-run).
-- =========================================

create extension if not exists pgcrypto;

-- ---------- ENUM TYPES ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'group_type') then
    create type group_type as enum ('college','friends');
  end if;

  if not exists (select 1 from pg_type where typname = 'group_role') then
    create type group_role as enum ('member','admin');
  end if;
end$$;

-- ---------- TABLE: groups ----------
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type group_type not null,
  college_id uuid references public.colleges(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint groups_name_not_blank check (length(trim(name)) > 0)
);

comment on table public.groups is 'User-created or system college groups.';
comment on column public.groups.type is 'Group classification (college / friends).';

-- Optional uniqueness for college groups only (avoid duplicates per college)
-- Uses a partial unique index on lower(name), college_id when type='college'
create unique index if not exists uq_groups_college_name
  on public.groups (college_id, lower(name))
  where type = 'college' and college_id is not null;

-- Case-insensitive name search (all groups)
create index if not exists idx_groups_lower_name on public.groups (lower(name));
create index if not exists idx_groups_type on public.groups (type);
create index if not exists idx_groups_college_id on public.groups (college_id);
create index if not exists idx_groups_created_by on public.groups (created_by);

-- ---------- TABLE: group_memberships ----------
create table if not exists public.group_memberships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role group_role not null default 'member',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (group_id, user_id),

  constraint gm_role_valid check (role in ('member','admin'))
);

comment on table public.group_memberships is 'Links users to groups with role = member/admin.';

create index if not exists idx_gm_group_user on public.group_memberships (group_id, user_id);
create index if not exists idx_gm_user on public.group_memberships (user_id);
create index if not exists idx_gm_group_role on public.group_memberships (group_id, role);

-- ---------- TIMESTAMP TRIGGER (shared) ----------
create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- Apply to both tables
drop trigger if exists trg_groups_updated_at on public.groups;
create trigger trg_groups_updated_at
before update on public.groups
for each row execute function public.set_timestamp();

drop trigger if exists trg_group_memberships_updated_at on public.group_memberships;
create trigger trg_group_memberships_updated_at
before update on public.group_memberships
for each row execute function public.set_timestamp();

-- ---------- INTEGRITY: Prevent removing last admin ----------
create or replace function public.enforce_last_admin()
returns trigger
language plpgsql
as $$
declare
  remaining_admins int;
begin
  -- Fires on DELETE or role demotion (UPDATE)
  if tg_table_name = 'group_memberships' then
    if (tg_op = 'DELETE' and old.role = 'admin')
       or (tg_op = 'UPDATE' and old.role = 'admin' and new.role <> 'admin') then
      select count(*) into remaining_admins
      from public.group_memberships
      where group_id = old.group_id
        and id <> old.id
        and role = 'admin';
      if remaining_admins = 0 then
        raise exception 'cannot remove last admin from group %', old.group_id;
      end if;
    end if;
  end if;
  return case
    when tg_op = 'DELETE' then old
    else new
  end;
end;
$$;

drop trigger if exists trg_gm_enforce_last_admin on public.group_memberships;
create trigger trg_gm_enforce_last_admin
before delete or update of role on public.group_memberships
for each row execute function public.enforce_last_admin();

-- ---------- RLS ENABLE ----------
alter table public.groups enable row level security;
alter table public.group_memberships enable row level security;

-- ---------- RESET POLICIES ----------
drop policy if exists "groups_select_discoverable" on public.groups;
drop policy if exists "groups_insert_friends"      on public.groups;
drop policy if exists "groups_update_admin"        on public.groups;
drop policy if exists "groups_delete_admin"        on public.groups;
drop policy if exists "groups_admin_bypass"        on public.groups;

drop policy if exists "gm_select_members"          on public.group_memberships;
drop policy if exists "gm_insert_self"             on public.group_memberships;
drop policy if exists "gm_update_admin"            on public.group_memberships;
drop policy if exists "gm_delete_self_or_admin"    on public.group_memberships;
drop policy if exists "gm_admin_bypass"            on public.group_memberships;

-- ---------- GROUPS POLICIES ----------
-- Select: Anyone can see college groups; friends groups only visible to members (or admins/service_role)
create policy "groups_select_discoverable"
  on public.groups
  for select
  using (
    type = 'college'
    or exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = id
        and gm.user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

-- Insert: Users can create friends groups; college groups restricted (allow service_role)
create policy "groups_insert_friends"
  on public.groups
  for insert
  with check (
    (type = 'friends' and created_by = auth.uid())
    or auth.role() = 'service_role'
  );

-- Update: Only admins of the group or service_role
create policy "groups_update_admin"
  on public.groups
  for update
  using (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
    or auth.role() = 'service_role'
  )
  with check (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
    or auth.role() = 'service_role'
  );

-- Delete: Only admins or service_role (rare; consider soft-delete instead)
create policy "groups_delete_admin"
  on public.groups
  for delete
  using (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
    or auth.role() = 'service_role'
  );

-- Service role bypass (already implicitly covered but explicit for clarity)
create policy "groups_admin_bypass"
  on public.groups
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ---------- GROUP_MEMBERSHIPS POLICIES ----------
-- Select: Member sees own memberships; also allow viewing memberships of groups user belongs to (for roster),
-- plus service_role
create policy "gm_select_members"
  on public.group_memberships
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.group_memberships gm2
      where gm2.group_id = group_id
        and gm2.user_id = auth.uid()
    )
    or auth.role() = 'service_role'
  );

-- Insert: User can join a friends group they are not in; college group join may be open (here we allow).
-- Could add more checks (e.g., college_id matches profile). Admin or service_role may add others.
create policy "gm_insert_self"
  on public.group_memberships
  for insert
  with check (
    user_id = auth.uid()
    or auth.role() = 'service_role'
    or exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );

-- Update: Only admins may change roles (including promoting/demoting) or service_role
create policy "gm_update_admin"
  on public.group_memberships
  for update
  using (
    auth.role() = 'service_role'
    or exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  )
  with check (
    auth.role() = 'service_role'
    or exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );

-- Delete: User can remove self (leave); admins remove others; service_role bypass
create policy "gm_delete_self_or_admin"
  on public.group_memberships
  for delete
  using (
    auth.role() = 'service_role'
    or user_id = auth.uid()
    or exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = group_id
        and gm.user_id = auth.uid()
        and gm.role = 'admin'
    )
  );

-- Explicit admin bypass policy
create policy "gm_admin_bypass"
  on public.group_memberships
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ---------- HELPER FUNCTION: create group + membership ----------
-- Atomically create a group AND assign creator as admin.
create or replace function public.create_group_with_admin(
  p_creator uuid,
  p_name text,
  p_type group_type,
  p_college_id uuid default null
)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.groups%rowtype;
begin
  if auth.role() <> 'service_role' and auth.uid() <> p_creator then
    raise exception 'insufficient_privilege';
  end if;

  if p_type is null then
    raise exception 'group type required';
  end if;

  if length(trim(coalesce(p_name,''))) = 0 then
    raise exception 'group name required';
  end if;

  insert into public.groups (name, type, college_id, created_by)
  values (trim(p_name), p_type, p_college_id, p_creator)
  returning * into v_group;

  -- Creator becomes admin membership
  insert into public.group_memberships (group_id, user_id, role)
  values (v_group.id, p_creator, 'admin');

  return v_group;
end;
$$;

-- ---------- HELPER FUNCTION: add member (optionally as admin) ----------
create or replace function public.add_member_to_group(
  p_actor uuid,
  p_group_id uuid,
  p_user_id uuid,
  p_role group_role default 'member'
)
returns public.group_memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membership public.group_memberships%rowtype;
begin
  if auth.role() <> 'service_role'
     and not exists (
       select 1
       from public.group_memberships gm
       where gm.group_id = p_group_id
         and gm.user_id = p_actor
         and gm.role = 'admin'
     ) then
    raise exception 'actor not admin of group';
  end if;

  insert into public.group_memberships (group_id, user_id, role)
  values (p_group_id, p_user_id, p_role)
  on conflict (group_id, user_id) do update
    set role = excluded.role
  returning * into v_membership;

  return v_membership;
end;
$$;

-- ---------- GRANTS (best-effort) ----------
do $$
begin
  begin
    grant execute on function public.create_group_with_admin(uuid, text, group_type, uuid) to authenticated;
    grant execute on function public.add_member_to_group(uuid, uuid, uuid, group_role) to authenticated;
    grant execute on function public.create_group_with_admin(uuid, text, group_type, uuid) to service_role;
    grant execute on function public.add_member_to_group(uuid, uuid, uuid, group_role) to service_role;
  exception when undefined_object then null;
  end;
end$$;

-- ---------- OPTIONAL VIEW: discoverable college groups only ----------
-- Uncomment if you want a simple public listing.
-- create or replace view public.college_groups as
-- select g.*
-- from public.groups g
-- where g.type = 'college';
-- grant select on public.college_groups to authenticated;
-- grant select on public.college_groups to anon;

-- =========================================
-- USAGE EXAMPLES
-- select create_group_with_admin(auth.uid(), 'My Friends', 'friends', null);
-- select add_member_to_group(auth.uid(), 'group-uuid', 'other-user-uuid', 'member');
-- =========================================