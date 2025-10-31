-- Ensure invite_code column on groups (text with uniqueness)
alter table public.groups
  add column if not exists invite_code text;

create unique index if not exists idx_groups_invite_code on public.groups(invite_code);

alter table public.groups enable row level security;

drop policy if exists "groups_update_invite_code_admins" on public.groups;
create policy "groups_update_invite_code_admins" on public.groups
  for update using (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = groups.id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  )
  with check (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = groups.id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  );

-- Ensure group_invitations table matches application schema
create table if not exists public.group_invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  email text,
  user_id uuid references auth.users(id) on delete cascade,
  invite_code text not null,
  role text not null default 'member' check (role in ('member','moderator')),
  status text not null default 'pending' check (status in ('pending','accepted','declined','expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

alter table public.group_invitations enable row level security;

drop policy if exists "group_invitations_select" on public.group_invitations;
create policy "group_invitations_select" on public.group_invitations
  for select using (
    user_id = auth.uid()
    or invited_by = auth.uid()
    or exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = group_invitations.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  );

drop policy if exists "group_invitations_insert_admin" on public.group_invitations;
create policy "group_invitations_insert_admin" on public.group_invitations
  for insert with check (
    exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = group_invitations.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  );

create index if not exists idx_group_invitations_group_id on public.group_invitations(group_id);
create index if not exists idx_group_invitations_user_id on public.group_invitations(user_id);
create index if not exists idx_group_invitations_invite_code on public.group_invitations(invite_code);