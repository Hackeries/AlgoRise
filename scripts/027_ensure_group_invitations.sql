-- Ensure invite_code column on groups
alter table public.groups add column if not exists invite_code uuid;

-- Allow admins/moderators to update invite_code
alter table public.groups enable row level security;

drop policy if exists "groups_update_invite_code_admins" on public.groups;
create policy "groups_update_invite_code_admins" on public.groups
  for update
  using (
    exists (
      select 1 from public.group_memberships gm
      where gm.group_id = groups.id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  )
  with check (true);

-- Ensure group_invitations table
create table if not exists public.group_invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  email text not null,
  role text not null check (role in ('member','moderator')),
  code uuid not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.group_invitations enable row level security;

-- RLS: admin/moderator of the target group can see/insert
drop policy if exists "group_invitations_select_admin" on public.group_invitations;
create policy "group_invitations_select_admin" on public.group_invitations
  for select
  using (
    exists (
      select 1 from public.group_memberships gm
      where gm.group_id = group_invitations.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  );

drop policy if exists "group_invitations_insert_admin" on public.group_invitations;
create policy "group_invitations_insert_admin" on public.group_invitations
  for insert
  with check (
    exists (
      select 1 from public.group_memberships gm
      where gm.group_id = group_invitations.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  );

create index if not exists idx_group_invitations_group on public.group_invitations(group_id);
create index if not exists idx_group_invitations_email on public.group_invitations(email);