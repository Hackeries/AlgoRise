-- =========================================
-- cf_handles: fix failing CHECK on expires_at and improve verification columns
-- =========================================
-- What this does (idempotent):
-- - Ensures verification_token, verification_started_at, expires_at, last_sync_at columns exist.
-- - Drops volatile CHECK constraints that referenced now() (on expires_at).
-- - Cleans up rows with expired tokens (nulls out token + expiry).
-- - Adds triggers:
--     - stamp_verification_started_at: stamps when a token is first set/changed.
--     - enforce_cf_handles_expiry_on_write: prevents past expires_at when token present; clears expires_at if token is null.
-- - Adds helpful partial/functional indexes (created only if referenced columns exist).
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
  add column if not exists verification_token       text,
  add column if not exists verification_started_at  timestamptz,
  add column if not exists expires_at               timestamptz,
  add column if not exists last_sync_at             timestamptz;

comment on column public.cf_handles.verification_started_at is 'UTC timestamp when verification flow started (token issued).';
comment on column public.cf_handles.expires_at is 'UTC timestamp when the verification token expires.';
comment on column public.cf_handles.last_sync_at is 'UTC timestamp when the handle was last synchronized with Codeforces.';

-- 2) Drop the volatile CHECK constraint(s) referencing now() on expires_at
--    (These are not stable and can fail during writes/migrations)
alter table public.cf_handles
  drop constraint if exists cf_handles_expires_future;

do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid='public.cf_handles'::regclass
      and contype='c'
      and pg_get_constraintdef(oid) ilike '%expires_at%'
      and pg_get_constraintdef(oid) ilike '%now()%'
  loop
    execute format('alter table public.cf_handles drop constraint %I', c.conname);
  end loop;
end$$;

-- 3) Clean up rows with expired tokens (token present but expires_at in the past)
update public.cf_handles
   set verification_token = null,
       expires_at = null
 where verification_token is not null
   and expires_at is not null
   and expires_at < timezone('utc', now());

-- 4) Trigger: auto-stamp verification_started_at when token is set/changed and no prior stamp
create or replace function public.stamp_verification_started_at()
returns trigger
language plpgsql
as $$
begin
  -- On INSERT: old is null; on UPDATE: compare token change
  if new.verification_token is not null
     and (tg_op = 'INSERT' or old.verification_token is distinct from new.verification_token)
     and new.verification_started_at is null then
    new.verification_started_at := timezone('utc', now());
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

-- 5) Trigger: enforce sane expiry values on write
create or replace function public.enforce_cf_handles_expiry_on_write()
returns trigger
language plpgsql
as $$
begin
  -- If no token is set, clear any stale expires_at
  if new.verification_token is null then
    if new.expires_at is not null then
      new.expires_at := null;
    end if;
    return new;
  end if;

  -- Token present: require a future expires_at
  if new.expires_at is null then
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

-- 6) Helpful indexes (created conditionally to avoid referencing non-existent columns)

-- 6a) Fast lookups by verification_token (partial)
create index if not exists idx_cf_handles_verification_token
  on public.cf_handles(verification_token)
  where verification_token is not null;

-- 6b) Pending verifications: quickly find expiring tokens
--     If 'verified' column exists, include it in the predicate; else fallback to token-only filter.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='cf_handles' and column_name='verified'
  ) then
    execute $sql$
      create index if not exists idx_cf_handles_verification_pending
        on public.cf_handles (expires_at)
        where verified = false and verification_token is not null
    $sql$;
  else
    execute $sql$
      create index if not exists idx_cf_handles_verification_pending
        on public.cf_handles (expires_at)
        where verification_token is not null
    $sql$;
  end if;
end$$;

-- 6c) Support common queries over verified flag (only if column exists)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='cf_handles' and column_name='verified'
  ) then
    execute $sql$
      create index if not exists idx_cf_handles_verified
        on public.cf_handles (verified) where verified
    $sql$;
  end if;
end$$;

-- 6d) Case-insensitive handle searches (only if handle column exists)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='cf_handles' and column_name='handle'
  ) then
    execute $sql$
      create index if not exists idx_cf_handles_lower_handle
        on public.cf_handles (lower(handle))
    $sql$;
  end if;
end$$;