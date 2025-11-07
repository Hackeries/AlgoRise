-- =========================================
-- CF HANDLES (Codeforces Handle Verification)
-- Recommended Schema & Helpers (Idempotent)
-- =========================================

create extension if not exists pgcrypto; -- for gen_random_uuid()

-- ---------- TABLE ----------
create table if not exists public.cf_handles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  handle text not null,
  verified boolean not null default false,
  verification_token text,
  expires_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id),

  constraint cf_handles_handle_not_blank check (length(trim(handle)) > 0),
  -- Adjust pattern as needed; Codeforces handles generally alphanumeric + underscore
  constraint cf_handles_handle_pattern check (handle ~ '^[A-Za-z0-9_]+$' ),
  constraint cf_handles_expires_future check (expires_at is null or expires_at >= timezone('utc', now()))
);

comment on table public.cf_handles is 'Per-user Codeforces handle + verification state.';
comment on column public.cf_handles.handle is 'Declared Codeforces handle (case-insensitive stored as provided).';
comment on column public.cf_handles.verified is 'True once verification succeeds.';
comment on column public.cf_handles.verification_token is 'Ephemeral token to complete verification flow.';
comment on column public.cf_handles.expires_at is 'Token expiration timestamp (UTC).';

-- ---------- INDEXES ----------
-- Case-insensitive lookups by handle
create index if not exists idx_cf_handles_lower_handle on public.cf_handles (lower(handle));

-- Quickly list verified handles
create index if not exists idx_cf_handles_verified on public.cf_handles (verified) where verified;

-- Optional: ensure global uniqueness of verified handles only (uncomment if desired)
-- create unique index if not exists uq_cf_handles_verified_handle
--   on public.cf_handles (lower(handle))
--   where verified;

create index if not exists idx_cf_handles_user_id on public.cf_handles(user_id);

-- ---------- SHARED UPDATED_AT TRIGGER FUNCTION ----------
create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- ---------- PROTECT HANDLE AFTER VERIFICATION ----------
-- Prevent changing 'handle' once verified unless service role
create or replace function public.enforce_handle_immutability()
returns trigger
language plpgsql
as $$
begin
  if old.verified = true
     and new.handle is distinct from old.handle
     and auth.role() <> 'service_role'
  then
    raise exception 'handle immutable after verification';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_cf_handles_updated_at on public.cf_handles;
create trigger trg_cf_handles_updated_at
before update on public.cf_handles
for each row
execute function public.set_timestamp();

drop trigger if exists trg_cf_handles_handle_immutable on public.cf_handles;
create trigger trg_cf_handles_handle_immutable
before update of handle on public.cf_handles
for each row
execute function public.enforce_handle_immutability();

-- ---------- ROW LEVEL SECURITY ----------
alter table public.cf_handles enable row level security;

-- Reset policies
drop policy if exists "select own cf handle"       on public.cf_handles;
drop policy if exists "insert own cf handle"       on public.cf_handles;
drop policy if exists "update own cf handle"       on public.cf_handles;
drop policy if exists "admin manage cf handles"    on public.cf_handles;

-- Select own row
create policy "select own cf handle"
  on public.cf_handles
  for select
  using (auth.uid() = user_id);

-- Insert own row
create policy "insert own cf handle"
  on public.cf_handles
  for insert
  with check (auth.uid() = user_id);

-- Update own row
create policy "update own cf handle"
  on public.cf_handles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional admin/service role bypass
create policy "admin manage cf handles"
  on public.cf_handles
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ---------- OPTIONAL PUBLIC VIEW (COMMENTED OUT) ----------
-- Exposes only verified handles (no sensitive tokens).
-- Uncomment if you want public/other users to discover verified handles.
-- create or replace view public.cf_verified_handles as
-- select user_id, lower(handle) as handle, last_sync_at, verified
-- from public.cf_handles
-- where verified;
-- grant select on public.cf_verified_handles to authenticated;
-- (Optionally) grant select on public.cf_verified_handles to anon;

-- ---------- HELPER FUNCTIONS ----------

-- Request verification: sets a new token & expiry (default 15 minutes) and resets verified flag.
create or replace function public.request_cf_handle_verification(
  p_user_id uuid,
  p_handle text,
  p_ttl_minutes int default 15
)
returns public.cf_handles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.cf_handles%rowtype;
  v_token text;
begin
  if auth.role() <> 'service_role' and auth.uid() <> p_user_id then
    raise exception 'insufficient_privilege';
  end if;

  if p_ttl_minutes < 1 or p_ttl_minutes > 120 then
    raise exception 'ttl out of bounds (1..120)';
  end if;

  v_token := replace(gen_random_uuid()::text, '-', '');

  -- Upsert-style: if row exists, update; else insert.
  insert into public.cf_handles (user_id, handle, verified, verification_token, expires_at)
  values (p_user_id, p_handle, false, v_token, timezone('utc', now()) + (p_ttl_minutes || ' minutes')::interval)
  on conflict (user_id) do update
    set handle = excluded.handle,
        verified = false,
        verification_token = excluded.verification_token,
        expires_at = excluded.expires_at;

  select * into v_row from public.cf_handles where user_id = p_user_id;
  return v_row;
end;
$$;

-- Verify handle: checks token and expiry; sets verified true, clears token & expiry.
create or replace function public.verify_cf_handle(
  p_user_id uuid,
  p_token text
)
returns public.cf_handles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.cf_handles%rowtype;
begin
  if auth.role() <> 'service_role' and auth.uid() <> p_user_id then
    raise exception 'insufficient_privilege';
  end if;

  select * into v_row
  from public.cf_handles
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'handle row not found';
  end if;

  if v_row.verified then
    return v_row; -- already verified, no-op
  end if;

  if v_row.verification_token is null or v_row.verification_token <> p_token then
    raise exception 'invalid token';
  end if;

  if v_row.expires_at is not null and v_row.expires_at < timezone('utc', now()) then
    raise exception 'token expired';
  end if;

  update public.cf_handles
     set verified = true,
         verification_token = null,
         expires_at = null
   where user_id = p_user_id
   returning * into v_row;

  return v_row;
end;
$$;

-- Optional: mark sync timestamp (after fetching remote profile)
create or replace function public.touch_cf_handle_sync(
  p_user_id uuid
)
returns public.cf_handles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.cf_handles%rowtype;
begin
  if auth.role() <> 'service_role' and auth.uid() <> p_user_id then
    raise exception 'insufficient_privilege';
  end if;

  update public.cf_handles
     set last_sync_at = timezone('utc', now())
   where user_id = p_user_id
   returning * into v_row;

  if not found then
    raise exception 'handle row not found';
  end if;

  return v_row;
end;
$$;

-- ---------- GRANTS ----------
do $$
begin
  begin
    grant execute on function public.request_cf_handle_verification(uuid, text, int) to authenticated;
    grant execute on function public.verify_cf_handle(uuid, text) to authenticated;
    grant execute on function public.touch_cf_handle_sync(uuid) to authenticated;
    grant execute on function public.request_cf_handle_verification(uuid, text, int) to service_role;
    grant execute on function public.verify_cf_handle(uuid, text) to service_role;
    grant execute on function public.touch_cf_handle_sync(uuid) to service_role;
  exception when undefined_object then
    null;
  end;
end$$;

-- =========================================
-- USAGE NOTES
-- 1. Call request_cf_handle_verification(auth.uid(), 'SomeHandle') to generate token & expiry.
-- 2. Display verification_token to user (e.g., ask them to put it in CF profile / perform chosen method).
-- 3. Call verify_cf_handle(auth.uid(), 'tokenstring') to complete verification.
-- 4. After verified, handle becomes immutable for normal users; service_role can still adjust.
-- 5. Consider periodic cleanup of expired tokens (e.g., scheduled job).
-- =========================================