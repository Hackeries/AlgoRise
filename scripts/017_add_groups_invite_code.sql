-- =========================================
-- Groups: invite_code support (idempotent)
-- =========================================
-- Adds invite_code column (with normalization), unique index,
-- admin-friendly RLS for updating/reading, and helpers to generate/rotate codes.

create extension if not exists pgcrypto;

-- 1) Column
alter table public.groups
  add column if not exists invite_code text;

comment on column public.groups.invite_code is 'Human-shareable invite code to join a group (case-insensitive, normalized).';

-- 2) Constraint (guardrails)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.groups'::regclass
      and conname = 'groups_invite_code_format'
  ) then
    alter table public.groups
      add constraint groups_invite_code_format
      check (invite_code is null or length(btrim(invite_code)) between 6 and 64);
  end if;
end$$;

-- 3) Unique index (case-insensitive, only when present)
create unique index if not exists uq_groups_invite_code_ci
  on public.groups (lower(invite_code))
  where invite_code is not null;

-- 4) Normalization: UPCASE, trim, collapse spaces, strip non-alnum if desired
create or replace function public.normalize_invite_code(p text)
returns text
language sql
immutable
as $$
  select nullif(upper(regexp_replace(btrim(coalesce(p,'')), '\s+', '', 'g')), '')
$$;

-- Trigger to normalize on write and optionally auto-generate
create or replace function public.normalize_or_generate_invite_code()
returns trigger
language plpgsql
as $$
declare
  v_len int := 10;
  v_code text;
  tries int := 0;
begin
  -- Normalize provided code
  if new.invite_code is not null then
    new.invite_code := public.normalize_invite_code(new.invite_code);
  end if;

  -- Auto-generate on INSERT when invite_code is null (optional but convenient)
  if tg_op = 'INSERT' and new.invite_code is null then
    loop
      tries := tries + 1;
      -- Generate an uppercase hex code (10 chars). Adjust length with v_len.
      v_code := upper(substring(encode(gen_random_bytes(8), 'hex') for v_len));
      -- Ensure uniqueness (case-insensitive)
      exit when not exists (
        select 1 from public.groups g
        where lower(g.invite_code) = lower(v_code)
      );
      exit when tries > 5; -- avoid infinite loop (extremely unlikely to exceed)
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

-- 5) RLS: ensure enabled
alter table public.groups enable row level security;

-- Drop and recreate targeted policies to avoid duplicates
drop policy if exists "groups_update_invite_by_admin" on public.groups;
drop policy if exists "groups_select_owner" on public.groups;

-- Allow group admins (or service_role) to update invite_code (and other fields, consistent with admin control)
create policy "groups_update_invite_by_admin"
  on public.groups
  for update
  using (
    auth.role() = 'service_role' or exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = id and gm.user_id = auth.uid() and gm.role = 'admin'
    )
  )
  with check (
    auth.role() = 'service_role' or exists (
      select 1
      from public.group_memberships gm
      where gm.group_id = id and gm.user_id = auth.uid() and gm.role = 'admin'
    )
  );

-- Allow creators to select their newly created group
create policy "groups_select_owner"
  on public.groups
  for select
  using (created_by = auth.uid() or auth.role() = 'service_role');

-- 6) Helper: rotate invite code (admin-only)
create or replace function public.rotate_group_invite(
  p_actor uuid,
  p_group_id uuid,
  p_len int default 10
)
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
  -- Permission: actor must be admin of the group or service_role
  if auth.role() <> 'service_role' and not exists (
    select 1 from public.group_memberships gm
    where gm.group_id = p_group_id and gm.user_id = p_actor and gm.role = 'admin'
  ) then
    raise exception 'insufficient_privilege';
  end if;

  -- Generate a unique code
  loop
    tries := tries + 1;
    v_code := upper(substring(encode(gen_random_bytes(16), 'hex') for greatest(6, least(64, coalesce(p_len,10)))));
    exit when not exists (
      select 1 from public.groups g where lower(g.invite_code) = lower(v_code)
    );
    if tries > 10 then
      raise exception 'failed to generate unique invite code';
    end if;
  end loop;

  update public.groups
     set invite_code = v_code
   where id = p_group_id
   returning * into v_row;

  if not found then
    raise exception 'group % not found', p_group_id;
  end if;

  return v_row;
end;
$$;

-- 7) Helpful indexes
create index if not exists idx_groups_invite_code_lookup on public.groups (lower(invite_code));