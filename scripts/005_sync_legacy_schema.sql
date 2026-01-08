-- ============================================================================
-- ALGORISE LEGACY SCHEMA SYNC - One-time migration
-- ============================================================================
-- Description: Adds columns that may be missing from tables created by older
--              versions of the schema (since CREATE TABLE IF NOT EXISTS won't
--              add new columns to existing tables)
--
-- Run AFTER: 000_master_schema.sql
-- Run BEFORE: 004_performance_indexes.sql
-- ============================================================================

-- NOTE: Do NOT wrap in BEGIN/COMMIT as some operations need to run outside transactions

-- ======================== PROBLEM_ATTEMPTS TABLE ========================
-- Add rating column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'problem_attempts' 
    AND column_name = 'rating'
  ) THEN
    ALTER TABLE public.problem_attempts ADD COLUMN rating int;
  END IF;
END $$;

-- ======================== USER_PROBLEMS TABLE ========================
-- Ensure difficulty_rating column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_problems' 
    AND column_name = 'difficulty_rating'
  ) THEN
    ALTER TABLE public.user_problems ADD COLUMN difficulty_rating integer;
  END IF;
END $$;

-- ======================== CF_SNAPSHOTS TABLE ========================
-- Ensure fetched_at column exists (some code uses captured_at)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'cf_snapshots' 
    AND column_name = 'fetched_at'
  ) THEN
    -- If captured_at exists but fetched_at doesn't, rename it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'cf_snapshots' 
      AND column_name = 'captured_at'
    ) THEN
      ALTER TABLE public.cf_snapshots RENAME COLUMN captured_at TO fetched_at;
    ELSE
      ALTER TABLE public.cf_snapshots ADD COLUMN fetched_at timestamptz DEFAULT timezone('utc', now());
    END IF;
  END IF;
END $$;

-- ======================== VERIFY ESSENTIAL COLUMNS ========================
-- Run a validation query to confirm all required columns exist
DO $$
DECLARE
  missing_cols TEXT := '';
BEGIN
  -- Check problem_attempts.rating
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'problem_attempts' 
    AND column_name = 'rating'
  ) THEN
    missing_cols := missing_cols || 'problem_attempts.rating, ';
  END IF;
  
  -- Check cf_snapshots.fetched_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'cf_snapshots' 
    AND column_name = 'fetched_at'
  ) THEN
    missing_cols := missing_cols || 'cf_snapshots.fetched_at, ';
  END IF;
  
  IF missing_cols != '' THEN
    RAISE EXCEPTION 'Missing columns after migration: %', missing_cols;
  END IF;
  
  RAISE NOTICE 'Schema sync complete - all required columns verified.';
END $$;

-- ============================================================================
-- END OF LEGACY SCHEMA SYNC
-- ============================================================================
