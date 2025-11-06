-- Add verification columns to cf_handles table for ownership verification
-- This migration adds columns needed for token-based Codeforces handle verification

-- Add verification_token column for storing the verification token
ALTER TABLE public.cf_handles 
ADD COLUMN IF NOT EXISTS verification_token text,
ADD COLUMN IF NOT EXISTS verification_started_at timestamptz,
ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Create index on verification_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_cf_handles_verification_token 
ON public.cf_handles(verification_token) 
WHERE verification_token IS NOT NULL;

-- Add comment describing the verification flow
COMMENT ON COLUMN public.cf_handles.verification_token IS 
'Token embedded in code submission for Codeforces handle ownership verification';
COMMENT ON COLUMN public.cf_handles.verification_started_at IS 
'Timestamp when verification was initiated';
COMMENT ON COLUMN public.cf_handles.expires_at IS 
'Timestamp when the verification token expires (typically 2 minutes from start)';
