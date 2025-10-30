-- =========================================================================
-- GROUP CHALLENGES FOR STUDY GROUPS
-- Tracks weekly problem-solving challenges inside groups.
-- =========================================================================

create table if not exists public.group_challenges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  description text,
  metric text not null default 'problems_solved' check (metric in ('problems_solved')),
  target_count integer not null check (target_count > 0),
  start_date date not null default current_date,
  end_date date not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','expired')),
  created_at timestamptz not null default now()
);

create index if not exists idx_group_challenges_group_id on public.group_challenges(group_id);
create index if not exists idx_group_challenges_status on public.group_challenges(status);

create table if not exists public.group_challenge_progress (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.group_challenges(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  current_count integer not null default 0,
  completed boolean not null default false,
  last_updated timestamptz not null default now(),
  unique (challenge_id, user_id)
);

create index if not exists idx_group_challenge_progress_challenge on public.group_challenge_progress(challenge_id);
create index if not exists idx_group_challenge_progress_user on public.group_challenge_progress(user_id);

alter table public.group_challenges enable row level security;
alter table public.group_challenge_progress enable row level security;

-- Policies: group admins can insert/update, members can view progress
do $$ begin
  create policy "group_challenges_select_members" on public.group_challenges
    for select using (
      exists (
        select 1 from public.group_memberships gm
        where gm.group_id = group_id and gm.user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "group_challenges_insert_admin" on public.group_challenges
    for insert with check (
      exists (
        select 1 from public.group_memberships gm
        where gm.group_id = group_id and gm.user_id = auth.uid() and gm.role = 'admin'
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "group_challenges_update_admin" on public.group_challenges
    for update using (
      exists (
        select 1 from public.group_memberships gm
        where gm.group_id = group_id and gm.user_id = auth.uid() and gm.role = 'admin'
      )
    )
    with check (
      exists (
        select 1 from public.group_memberships gm
        where gm.group_id = group_id and gm.user_id = auth.uid() and gm.role = 'admin'
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "group_challenge_progress_select_members" on public.group_challenge_progress
    for select using (
      exists (
        select 1
        from public.group_challenges gc
        join public.group_memberships gm on gm.group_id = gc.group_id
        where gc.id = challenge_id and gm.user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "group_challenge_progress_insert_member" on public.group_challenge_progress
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "group_challenge_progress_update_member" on public.group_challenge_progress
    for update using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Helper function to recompute progress from adaptive items (placeholder)
create or replace function public.refresh_group_challenge_progress(p_challenge_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  challenge record;
begin
  select * into challenge from public.group_challenges where id = p_challenge_id;
  if challenge is null then
    raise exception 'Challenge not found';
  end if;

  -- Placeholder logic: mark completed if current_count >= target
  update public.group_challenge_progress
  set completed = current_count >= challenge.target_count,
      last_updated = now()
  where challenge_id = p_challenge_id;
end;
$$;

grant execute on function public.refresh_group_challenge_progress to authenticated;

-- =========================================================================
-- END OF FILE
-- =========================================================================
