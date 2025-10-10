-- Add missing verification columns to cf_handles if they don't exist
-- This aligns the database schema with the verification API that reads/writes:
--   verification_started_at and expires_at

alter table public.cf_handles
  add column if not exists verification_started_at timestamptz,
  add column if not exists expires_at timestamptz;
