-- Add 'icpc' group type and update schema for ICPC teams
alter table public.groups
  drop constraint if exists groups_type_check;

alter table public.groups
  add constraint groups_type_check check (type in ('college','friends','icpc'));

-- Add max_members column for group size limits
alter table public.groups
  add column if not exists max_members int default null;

-- Add description column
alter table public.groups
  add column if not exists description text;

-- Update group_memberships to support moderator role
alter table public.group_memberships
  drop constraint if exists group_memberships_role_check;

alter table public.group_memberships
  add constraint group_memberships_role_check check (role in ('member','admin','moderator'));

-- Create index for faster member count queries
create index if not exists idx_gm_group_count on public.group_memberships(group_id);

-- Add function to get member count
create or replace function get_group_member_count(group_uuid uuid)
returns int
language sql
stable
as $$
  select count(*)::int from public.group_memberships where group_id = group_uuid;
$$;