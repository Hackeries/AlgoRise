-- 1) Ensure invite_code exists on groups (harmless if already present)
alter table public.groups
  add column if not exists invite_code text unique;

-- 2) Ensure RLS is enabled on groups (no-op if already enabled)
alter table public.groups enable row level security;

-- 3) Recreate update policy for group admins/moderators (safe + idempotent)
do $$
begin
  -- drop existing policy if present
  if exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    where p.polname = 'groups_update_admin' and c.relname = 'groups'
  ) then
    execute 'drop policy "groups_update_admin" on public.groups';
  end if;

  -- create policy (no IF NOT EXISTS; executed only once due to guard above)
  execute $policy$
    create policy "groups_update_admin"
    on public.groups
    for update
    using (
      exists (
        select 1
        from public.group_memberships gm
        where gm.group_id = id
          and gm.user_id = auth.uid()
          and gm.role in ('admin','moderator')
      )
    )
    with check (
      exists (
        select 1
        from public.group_memberships gm
        where gm.group_id = id
          and gm.user_id = auth.uid()
          and gm.role in ('admin','moderator')
      )
    )
  $policy$;
end $$;

-- 4) Helpful index for invite lookups
create index if not exists idx_groups_invite_code on public.groups(invite_code);
