alter table public.groups
  add column if not exists invite_code text;

-- Allow group admins to update invite_code
do $$ begin
  create policy "groups_update_invite_by_admin"
  on public.groups
  for update
  using (
    exists (
      select 1 from public.group_memberships gm
      where gm.group_id = id and gm.user_id = auth.uid() and gm.role in ('admin')
    )
  )
  with check (
    exists (
      select 1 from public.group_memberships gm
      where gm.group_id = id and gm.user_id = auth.uid() and gm.role in ('admin')
    )
  );
exception when duplicate_object then null; end $$;

-- allow creators to select their newly created group (so insert ... select('id') works)
do $$ begin
  create policy "groups_select_owner"
  on public.groups
  for select
  using (created_by = auth.uid());
exception when duplicate_object then null; end $$;
