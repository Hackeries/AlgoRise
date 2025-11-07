-- =========================================
-- group_invitations: robust ENUM migration for status + policies/indexes
-- Fixes operator mismatch by avoiding ALTER TYPE; uses add-copy-swap pattern.
-- Safe to re-run (idempotent).
-- =========================================

create extension if not exists pgcrypto;

-- 0) Ensure base tables exist
do $$
begin
  if to_regclass('public.groups') is null then
    raise exception 'Table public.groups does not exist';
  end if;

  if to_regclass('public.group_invitations') is null then
    create table public.group_invitations (
      id uuid primary key default gen_random_uuid(),
      group_id uuid not null references public.groups(id) on delete cascade,
      invited_by uuid not null references auth.users(id) on delete cascade,
      email text,
      user_id uuid references auth.users(id) on delete cascade,
      invite_code text not null,
      role text not null default 'member' check (role in ('member','moderator')),
      status text not null default 'pending',
      expires_at timestamptz not null default (timezone('utc', now()) + interval '7 days'),
      created_at timestamptz not null default timezone('utc', now()),
      updated_at timestamptz not null default timezone('utc', now())
    );
  end if;
end$$;

-- 1) Ensure housekeeping columns
alter table public.group_invitations
  add column if not exists created_at timestamptz not null default timezone('utc', now()),
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

-- 2) Drop partial/dependent indexes and CHECKs referencing status (text)
drop index if exists uq_group_invites_user_pending;
drop index if exists uq_group_invites_email_pending;
drop index if exists uq_group_invites_email_pending_ci;

do $$
declare
  i record;
begin
  for i in
    select indexname
    from pg_indexes
    where schemaname='public'
      and tablename='group_invitations'
      and indexdef ilike '% status = %'
  loop
    execute format('drop index if exists %I', i.indexname);
  end loop;
end$$;

do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid='public.group_invitations'::regclass
      and contype='c'
      and pg_get_constraintdef(oid) ilike '%status in (%'
  loop
    execute format('alter table public.group_invitations drop constraint %I', c.conname);
  end loop;
end$$;

-- 3) Drop existing RLS policies to avoid enum/text mismatches during swap
do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname='public'
      and tablename='group_invitations'
  loop
    execute format('drop policy if exists %I on public.group_invitations', p.policyname);
  end loop;
end$$;

-- 4) Ensure ENUM type
do $$
begin
  if not exists (select 1 from pg_type where typname='group_invitation_status') then
    create type group_invitation_status as enum ('pending','accepted','declined','expired','revoked');
  end if;
end$$;

-- 5) Add-copy-swap: convert status -> ENUM without ALTER TYPE
do $$
declare
  is_enum boolean;
begin
  select (data_type = 'USER-DEFINED' and udt_name = 'group_invitation_status')
    into is_enum
  from information_schema.columns
  where table_schema='public' and table_name='group_invitations' and column_name='status';

  if not is_enum then
    -- Add temp enum column if missing
    if not exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='group_invitations' and column_name='status_new'
    ) then
      alter table public.group_invitations
        add column status_new group_invitation_status;
    end if;

    -- Sanitize and copy from old status (works whether old is text or enum)
    update public.group_invitations
       set status_new = coalesce(
                          nullif(lower(status::text), ''),
                          'pending'
                        )::group_invitation_status
     where status_new is null;

    -- Enforce not null + default on new column
    alter table public.group_invitations
      alter column status_new set not null,
      alter column status_new set default 'pending'::group_invitation_status;

    -- Drop old column and rename new -> status
    alter table public.group_invitations
      drop column status;

    alter table public.group_invitations
      rename column status_new to status;
  end if;

  -- Ensure final column has proper default and not null
  alter table public.group_invitations
    alter column status set not null,
    alter column status set default 'pending'::group_invitation_status;
end$$;

-- 6) Normalization helpers & triggers
create or replace function public.normalize_email(p text)
returns text
language sql
immutable
as $$ select nullif(lower(btrim(coalesce(p,''))), '') $$;

create or replace function public.normalize_invite_code(p text)
returns text
language sql
immutable
as $$ select nullif(upper(regexp_replace(btrim(coalesce(p,'')), '\s+', '', 'g')), '') $$;

create or replace function public.normalize_group_invitation()
returns trigger
language plpgsql
as $$
begin
  if new.email is not null then
    new.email := public.normalize_email(new.email);
  end if;
  if new.invite_code is not null then
    new.invite_code := public.normalize_invite_code(new.invite_code);
  end if;
  if new.expires_at <= timezone('utc', now()) then
    new.expires_at := timezone('utc', now()) + interval '7 days';
  end if;
  return new;
end;
$$;

create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_group_invitations_normalize on public.group_invitations;
create trigger trg_group_invitations_normalize
before insert or update of email, invite_code, expires_at on public.group_invitations
for each row execute function public.normalize_group_invitation();

drop trigger if exists trg_group_invitations_updated_at on public.group_invitations;
create trigger trg_group_invitations_updated_at
before update on public.group_invitations
for each row execute function public.set_timestamp();

-- 7) Dedupe pending invites (email & user)
update public.group_invitations gi
   set email = public.normalize_email(email)
 where email is not null
   and email <> public.normalize_email(email);

with pending_email as (
  select id, group_id, public.normalize_email(email) as norm_email,
         coalesce(updated_at, created_at) as ts
  from public.group_invitations
  where email is not null and status = 'pending'::group_invitation_status
),
dupes_email as (
  select group_id, norm_email, array_agg(id order by ts desc) as ids
  from pending_email
  group by group_id, norm_email
  having count(*) > 1
),
to_revoke_email as (
  select unnest(ids[2:]) as id from dupes_email
)
update public.group_invitations gi
   set status = 'revoked'::group_invitation_status,
       updated_at = timezone('utc', now())
  from to_revoke_email tr
 where gi.id = tr.id;

with pending_user as (
  select id, group_id, user_id, coalesce(updated_at, created_at) as ts
  from public.group_invitations
  where user_id is not null and status = 'pending'::group_invitation_status
),
dupes_user as (
  select group_id, user_id, array_agg(id order by ts desc) as ids
  from pending_user
  group by group_id, user_id
  having count(*) > 1
),
to_revoke_user as (
  select unnest(ids[2:]) as id from dupes_user
)
update public.group_invitations gi
   set status = 'revoked'::group_invitation_status,
       updated_at = timezone('utc', now())
  from to_revoke_user tr
 where gi.id = tr.id;

-- 8) Recreate indexes with ENUM-aware predicates
create unique index if not exists uq_group_invites_user_pending
  on public.group_invitations(group_id, user_id)
  where user_id is not null and status = 'pending'::group_invitation_status;

create unique index if not exists uq_group_invites_email_pending_ci
  on public.group_invitations(group_id, lower(email))
  where email is not null and status = 'pending'::group_invitation_status;

create index if not exists idx_group_invitations_group_id on public.group_invitations(group_id);
create index if not exists idx_group_invitations_user_id on public.group_invitations(user_id);
create index if not exists idx_group_invitations_invite_code_ci on public.group_invitations(lower(invite_code));
create index if not exists idx_group_invitations_status on public.group_invitations(status);
create index if not exists idx_group_invitations_expires_at on public.group_invitations(expires_at);

-- 9) RLS Policies (recreate)
alter table public.group_invitations enable row level security;

create policy "group_invitations_select" on public.group_invitations
  for select
  using (
    auth.role() = 'service_role'
    or user_id = auth.uid()
    or invited_by = auth.uid()
    or exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = public.group_invitations.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  );

create policy "group_invitations_insert_admin" on public.group_invitations
  for insert
  with check (
    auth.role() = 'service_role'
    or exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = public.group_invitations.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  );

create policy "group_invitations_update_admin_or_invited" on public.group_invitations
  for update
  using (
    auth.role() = 'service_role'
    or user_id = auth.uid()
    or exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = public.group_invitations.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  )
  with check (
    auth.role() = 'service_role'
    or user_id = auth.uid()
    or exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = public.group_invitations.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  );

create policy "group_invitations_delete_admin_or_invited" on public.group_invitations
  for delete
  using (
    auth.role() = 'service_role'
    or (user_id = auth.uid() and status = 'pending'::group_invitation_status)
    or exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = public.group_invitations.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','moderator')
    )
  );

create policy "group_invitations_admin_bypass" on public.group_invitations
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');