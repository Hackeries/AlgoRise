-- Add verification_problem_id column to cf_handles table for CE verification method
-- Run this migration to support the new verification flow

ALTER TABLE public.cf_handles 
ADD COLUMN IF NOT EXISTS verification_problem_id text;

COMMENT ON COLUMN public.cf_handles.verification_problem_id IS 'Problem ID (e.g., 1234A) where user must submit CE for verification';
