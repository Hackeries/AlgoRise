-- =========================================
-- Groups: RLS hardening + invite_code improvements (idempotent)
-- =========================================
-- Improvements over original snippet:
-- 1. Ensures RLS enabled (idempotent).
-- 2. Replaces simplistic unique constraint with case-insensitive unique index (avoids duplicates like 'ABC123' vs 'abc123').
-- 3. Adds normalization trigger (trim + uppercase + collapse spaces).
-- 4. Adds dedicated policies:
--      - groups_update_admin: admins/moderators (or service_role) can update
--      - groups_select_owner: creator, admins/moderators, and service_role can select
--      - groups_admin_bypass: optional universal service_role bypass
-- 5. Provides safe invite code generator & rotation function.
-- 6. Avoids duplicate policy creation logic via drop + create (idempotent outcome).
-- 7. Adds length / format guardrail constraint for invite_code (NOT VALID if pre-existing data might violate).
-- =========================================

create extension if not exists pgcrypto;

-- ---------- Ensure table exists ----------
do $$
begin
  if to_regclass('public.groups') is null then
    raise exception 'Table public.groups does not exist';
  end if;
end$$;

-- ---------- Enable RLS ----------
alter table public.groups enable row level security;

-- ---------- Add invite_code column if missing ----------
alter table public.groups
  add column if not exists invite_code text;

comment on column public.groups.invite_code is 'Shareable group invite code (normalized uppercase, case-insensitive unique).';

-- ---------- Guardrail constraint (length). Added NOT VALID to avoid failures if legacy data violates. ----------
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.groups'::regclass
      and conname = 'groups_invite_code_len'
  ) then
    alter table public.groups
      add constraint groups_invite_code_len
      check (invite_code is null or length(invite_code) between 6 and 64) not valid;
  end if;
end$$;

-- ---------- Case-insensitive uniqueness (preferred over a plain UNIQUE column constraint) ----------
-- Drop legacy plain unique constraint if present (named implicitly or explicitly)
do $$
declare
  r record;
begin
  for r in
    select conname
    from pg_constraint
    where conrelid = 'public.groups'::regclass
      and contype = 'u'
      and conkey = array[
        (select attnum from pg_attribute where attrelid='public.groups'::regclass and attname='invite_code')
      ]
  loop
    execute format('alter table public.groups drop constraint %I', r.conname);
  end loop;
end$$;

create unique index if not exists uq_groups_invite_code_ci
  on public.groups (lower(invite_code))
  where invite_code is not null;

-- Helpful lookup index (redundant but explicit for planner)
create index if not exists idx_groups_invite_code_ci
  on public.groups (lower(invite_code))
  where invite_code is not null;

-- ---------- Normalization (trim, remove spaces, uppercase) ----------
create or replace function public.normalize_invite_code(p text)
returns text
language sql
immutable
as $$
  select nullif(upper(regexp_replace(btrim(coalesce(p,'')), '\s+', '', 'g')), '')
$$;

create or replace function public.normalize_or_generate_invite_code()
returns trigger
language plpgsql
as $$
declare
  v_code text;
  tries int := 0;
begin
  -- Normalize provided code
  if new.invite_code is not null then
    new.invite_code := public.normalize_invite_code(new.invite_code);
  end if;

  -- Auto-generate if INSERT without code
  if tg_op = 'INSERT' and new.invite_code is null then
    loop
      tries := tries + 1;
      v_code := upper(substring(encode(gen_random_bytes(10), 'hex') for 10));
      exit when not exists (
        select 1 from public.groups g
        where lower(g.invite_code) = lower(v_code)
      );
      if tries > 10 then
        raise exception 'Unable to generate unique invite code after % attempts', tries;
      end if;
    end loop;
    new.invite_code := v_code;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_groups_invite_code_norm on public.groups;
create trigger trg_groups_invite_code_norm
before insert or update of invite_code on public.groups
for each row
execute function public.normalize_or_generate_invite_code();

-- ---------- RLS POLICIES (drop & recreate for deterministic configuration) ----------
drop policy if exists "groups_update_admin"    on public.groups;
drop policy if exists "groups_select_owner"    on public.groups;
drop policy if exists "groups_admin_bypass"    on public.groups;

-- Update: admins OR moderators OR service_role
create policy "groups_update_admin"
  on public.groups
  for update
  using (
    auth.role() = 'service_role' OR exists (
      select 1 from public.group_memberships gm
      where gm.group_id = public.groups.id
        and gm.user_id  = auth.uid()
        and gm.role in ('admin','moderator')
    )
  )
  with check (
    auth.role() = 'service_role' OR exists (
      select 1 from public.group_memberships gm
      where gm.group_id = public.groups.id
        and gm.user_id  = auth.uid()
        and gm.role in ('admin','moderator')
    )
  );

-- Select: creator, admins, moderators, service_role
create policy "groups_select_owner"
  on public.groups
  for select
  using (
    auth.role() = 'service_role'
    OR created_by = auth.uid()
    OR exists (
      select 1 from public.group_memberships gm
      where gm.group_id = public.groups.id
        and gm.user_id  = auth.uid()
        and gm.role in ('admin','moderator')
    )
  );

-- Optional full bypass (covers insert/update/delete/select when needed)
create policy "groups_admin_bypass"
  on public.groups
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- (If you need an INSERT policy for normal users creating groups, add separately.)
-- Example:
-- create policy "groups_insert_user"
--   on public.groups
--   for insert
--   with check (auth.uid() is not null AND created_by = auth.uid());

-- ---------- Helper: rotate invite code ----------
create or replace function public.rotate_group_invite(p_group_id uuid)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.groups%rowtype;
  v_code text;
  tries int := 0;
begin
  -- Authorization: service_role or admin/moderator of group
  if auth.role() <> 'service_role' and not exists (
    select 1 from public.group_memberships gm
    where gm.group_id = p_group_id
      and gm.user_id = auth.uid()
      and gm.role in ('admin','moderator')
  ) then
    raise exception 'insufficient_privilege';
  end if;

  loop
    tries := tries + 1;
    v_code := upper(substring(encode(gen_random_bytes(12), 'hex') for 12));
    exit when not exists (
      select 1 from public.groups g where lower(g.invite_code) = lower(v_code)
    );
    if tries > 15 then
      raise exception 'Failed to generate unique invite code after % attempts', tries;
    end if;
  end loop;

  update public.groups
     set invite_code = v_code
   where id = p_group_id
   returning * into v_row;

  if not found then
    raise exception 'Group % not found', p_group_id;
  end if;

  return v_row;
end;
$$;

-- ---------- Grants (best-effort) ----------
do $$
begin
  begin
    grant execute on function public.rotate_group_invite(uuid) to authenticated;
    grant execute on function public.rotate_group_invite(uuid) to service_role;
  exception when undefined_object then null;
  end;
end$$;

-- =========================================
-- NOTES:
-- - To validate NOT VALID constraint later: ALTER TABLE public.groups VALIDATE CONSTRAINT groups_invite_code_len;
-- - For join-by-code logic, consider a function that looks up group by lower(invite_code).
-- - If existing data contains short codes (<6 chars), adjust constraint or backfill before validation.
-- =========================================