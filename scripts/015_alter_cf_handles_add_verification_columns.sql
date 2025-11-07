-- Add missing verification columns to cf_handles if they don't exist
-- This aligns the database schema with the verification API that reads/writes:
--   verification_token, verification_started_at, expires_at, and last_sync_at

alter table public.cf_handles
  add column if not exists verification_token text,
  add column if not exists verification_started_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists last_sync_at timestamptz;

-- Create index on verification_token for faster lookups
create index if not exists idx_cf_handles_verification_token 
  on public.cf_handles(verification_token) 
  where verification_token is not null;
