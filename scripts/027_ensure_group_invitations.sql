-- Ensure group_invitations table exists (idempotent)
create table if not exists public.group_invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('member','moderator','admin')),
  code text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.group_invitations enable row level security;

-- Admins can see invitations for their groups
drop policy if exists "group_invitations_select_admin" on public.group_invitations;
create policy "group_invitations_select_admin" on public.group_invitations
for select using (
  exists(
    select 1 from public.group_memberships gm
    where gm.group_id = group_invitations.group_id
      and gm.user_id = auth.uid()
      and gm.role in ('admin','moderator')
  )
);

-- Admins can create invitations
drop policy if exists "group_invitations_insert_admin" on public.group_invitations;
create policy "group_invitations_insert_admin" on public.group_invitations
for insert with check (
  exists(
    select 1 from public.group_memberships gm
    where gm.group_id = group_invitations.group_id
      and gm.user_id = auth.uid()
      and gm.role in ('admin','moderator')
  )
);

-- Indexes
create index if not exists idx_group_invitations_group on public.group_invitations(group_id);
create index if not exists idx_group_invitations_email on public.group_invitations(email);
