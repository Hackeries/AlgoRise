-- =========================================
-- cf_handles: fix failing CHECK on expires_at and improve verification columns
-- =========================================
-- What this does:
-- - Adds verification_started_at and expires_at if missing.
-- - DROPs the problematic CHECK constraint that referenced now() (volatile).
-- - Cleans up existing rows that violate the former constraint (nulls out expired tokens).
-- - Adds safe triggers:
--     - stamp_verification_started_at: stamps when a token is first set.
--     - enforce_cf_handles_expiry_on_write: prevents setting an already-expired expires_at
--       when a verification_token is present; clears expires_at if token is null.
-- - Adds helpful indexes (idempotent).
-- =========================================

-- 0) Ensure table exists
do $$
begin
  if to_regclass('public.cf_handles') is null then
    raise exception 'Table public.cf_handles does not exist';
  end if;
end$$;

-- 1) Add missing columns (no-op if present)
alter table public.cf_handles
  add column if not exists verification_started_at timestamptz,
  add column if not exists expires_at timestamptz;

comment on column public.cf_handles.verification_started_at is 'UTC timestamp when verification flow started (token issued).';
comment on column public.cf_handles.expires_at is 'UTC timestamp when the verification token expires.';

-- 2) Drop the volatile CHECK constraint if it exists (it referenced now() and caused failures)
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'cf_handles_expires_future'
      and conrelid = 'public.cf_handles'::regclass
  ) then
    alter table public.cf_handles
      drop constraint cf_handles_expires_future;
  end if;
end$$;

-- 3) Clean up existing rows that would violate "expires in the past"
--    If token is present but expired, clear both token and expiry (force a fresh verification).
update public.cf_handles
   set verification_token = null,
       expires_at = null
 where verification_token is not null
   and expires_at is not null
   and expires_at < timezone('utc', now());

-- 4) Trigger: auto-stamp verification_started_at when token is set for the first time
create or replace function public.stamp_verification_started_at()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT' or tg_op = 'UPDATE') then
    if new.verification_token is not null
       and (old is null or old.verification_token is distinct from new.verification_token)
       and new.verification_started_at is null then
      new.verification_started_at := timezone('utc', now());
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_cf_handles_stamp_verification_started_at on public.cf_handles;
create trigger trg_cf_handles_stamp_verification_started_at
before insert or update of verification_token, verification_started_at
on public.cf_handles
for each row
execute function public.stamp_verification_started_at();

-- 5) Trigger: enforce sane expiry values on write (no expired expires_at with an active token)
create or replace function public.enforce_cf_handles_expiry_on_write()
returns trigger
language plpgsql
as $$
begin
  -- If no token is set, expires_at should not carry stale values; normalize to null
  if new.verification_token is null then
    if new.expires_at is not null then
      new.expires_at := null;
    end if;
    return new;
  end if;

  -- Token is present: require a future expires_at
  if new.expires_at is null then
    -- allow your application flow (e.g., request_cf_handle_verification) to set it;
    -- if you prefer to auto-default, uncomment:
    -- new.expires_at := timezone('utc', now()) + interval '15 minutes';
    raise exception 'expires_at must be set when verification_token is present';
  end if;

  if new.expires_at <= timezone('utc', now()) then
    raise exception 'expires_at must be in the future when verification_token is present';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_cf_handles_enforce_expiry on public.cf_handles;
create trigger trg_cf_handles_enforce_expiry
before insert or update of verification_token, expires_at
on public.cf_handles
for each row
execute function public.enforce_cf_handles_expiry_on_write();

-- 6) Helpful indexes
-- Pending verifications: quickly find expiring tokens (no volatile expressions)
create index if not exists idx_cf_handles_verification_pending
  on public.cf_handles (expires_at)
  where verified = false and verification_token is not null;

-- Common supporting indexes (no-ops if already created earlier)
create index if not exists idx_cf_handles_verified on public.cf_handles (verified) where verified;
create index if not exists idx_cf_handles_lower_handle on public.cf_handles (lower(handle));