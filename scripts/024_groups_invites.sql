-- Enable RLS on groups (safe)
alter table if exists public.groups enable row level security;

-- Allow admins/moderators of a group to update that group's row (e.g., to set invite_code)
do $$
begin
  create policy "groups_update_admin"
  on public.groups
  for update
  using (
    exists (
      select 1 from public.group_memberships gm
      where gm.group_id = id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  )
  with check (
    exists (
      select 1 from public.group_memberships gm
      where gm.group_id = id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  );
exception
  when duplicate_object then
    -- policy already exists; do nothing
    null;
end $$;

-- Ensure invite_code column + index exist
alter table public.groups add column if not exists invite_code text unique;
create index if not exists idx_groups_invite_code on public.groups(invite_code);
