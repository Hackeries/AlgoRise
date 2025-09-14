-- create groups and group_memberships with RLS
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('college','friends')),
  college_id uuid references public.colleges(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.group_memberships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member','admin')),
  created_at timestamptz not null default now(),
  unique (group_id, user_id)
);

alter table public.groups enable row level security;
alter table public.group_memberships enable row level security;

-- Groups RLS:
-- College groups are readable by everyone for discovery; friends groups readable by members only.
do $$ begin
  create policy "groups_select_discoverable" on public.groups
    for select using (
      type = 'college' or exists (
        select 1 from public.group_memberships gm
        where gm.group_id = id and gm.user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

-- Allow inserts for users creating friends groups; college groups are system-created via API with checks
do $$ begin
  create policy "groups_insert_owner" on public.groups
    for insert with check (created_by = auth.uid());
exception when duplicate_object then null; end $$;

-- Group memberships RLS:
-- Users can read their own memberships
do $$ begin
  create policy "memberships_select_own" on public.group_memberships
    for select using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- Users can insert their own membership
do $$ begin
  create policy "memberships_insert_self" on public.group_memberships
    for insert with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- Users can delete their own membership (leave group)
do $$ begin
  create policy "memberships_delete_self" on public.group_memberships
    for delete using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- Helpful indexes
create index if not exists idx_groups_type on public.groups(type);
create index if not exists idx_groups_college_id on public.groups(college_id);
create index if not exists idx_gm_user on public.group_memberships(user_id);
create index if not exists idx_gm_group on public.group_memberships(group_id);
