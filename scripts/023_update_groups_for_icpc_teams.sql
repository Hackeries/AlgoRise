-- =========================================
-- Groups: add 'icpc' type, size limits, and schema improvements (idempotent)
-- =========================================

-- 1) Expand allowed group types to include 'icpc'
alter table public.groups
  drop constraint if exists groups_type_check;

alter table public.groups
  add constraint groups_type_check
  check (type in ('college','friends','icpc'));

comment on column public.groups.type is 'Group type: college, friends, icpc.';

-- 2) Add optional size limit and description
alter table public.groups
  add column if not exists max_members int default null,
  add column if not exists description text;

-- Guardrail: max_members must be positive if provided
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.groups'::regclass
      and conname = 'groups_max_members_positive'
  ) then
    alter table public.groups
      add constraint groups_max_members_positive
      check (max_members is null or max_members > 0);
  end if;
end$$;

comment on column public.groups.max_members is 'Optional cap on total members (admins, moderators, and members all count).';
comment on column public.groups.description is 'Free-form description for the group.';

-- 3) Update memberships to add 'moderator' as a valid role
alter table public.group_memberships
  drop constraint if exists group_memberships_role_check;

alter table public.group_memberships
  add constraint group_memberships_role_check
  check (role in ('member','admin','moderator'));

-- Helpful index for membership queries
create index if not exists idx_gm_group_count on public.group_memberships(group_id);
create index if not exists idx_gm_group_role on public.group_memberships(group_id, role);

-- 4) Member count helper (stable; respects RLS)
create or replace function public.get_group_member_count(group_uuid uuid)
returns int
language sql
stable
set search_path = public
as $$
  select count(*)::int
  from public.group_memberships
  where group_id = group_uuid
$$;

comment on function public.get_group_member_count(uuid) is
'Returns the number of memberships for a group. Result adheres to RLS visibility of group_memberships.';

-- 5) Optional helper to safely set max_members (prevents shrinking below current count)
create or replace function public.set_group_max_members(
  p_group_id uuid,
  p_max_members int
)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cnt int;
  v_row public.groups%rowtype;
begin
  -- Only service_role or a group admin can change cap
  if auth.role() <> 'service_role' and not exists (
    select 1
    from public.group_memberships gm
    where gm.group_id = p_group_id
      and gm.user_id = auth.uid()
      and gm.role in ('admin','moderator')
  ) then
    raise exception 'insufficient_privilege';
  end if;

  if p_max_members is not null and p_max_members <= 0 then
    raise exception 'max_members must be null or > 0';
  end if;

  -- Current visible count (requires appropriate RLS to see members; service_role recommended)
  select count(*)::int into v_cnt
  from public.group_memberships
  where group_id = p_group_id;

  if p_max_members is not null and v_cnt > p_max_members then
    raise exception 'cannot set max_members (%) below current member count (%)', p_max_members, v_cnt;
  end if;

  update public.groups
     set max_members = p_max_members
   where id = p_group_id
   returning * into v_row;

  if not found then
    raise exception 'group % not found', p_group_id;
  end if;

  return v_row;
end;
$$;

comment on function public.set_group_max_members(uuid, int) is
'Sets max_members for a group. Requires service_role or group admin/moderator. Fails if new cap is below current membership count.';

-- Note:
-- - Enforcement of membership capacity on join should be handled in application logic or via a
--   BEFORE INSERT trigger on public.group_memberships that counts rows for the target group and
--   compares with groups.max_members. Such a trigger will require appropriate RLS to read
--   group_memberships; consider running membership mutations via service_role to reliably enforce capacity.