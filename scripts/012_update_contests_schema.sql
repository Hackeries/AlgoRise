-- Update contests table to support new fields

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add contest_mode column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contests' AND column_name = 'contest_mode'
  ) THEN
    ALTER TABLE public.contests 
    ADD COLUMN contest_mode text NOT NULL DEFAULT 'practice' 
    CHECK (contest_mode IN ('practice', 'icpc'));
  END IF;

  -- Add duration_minutes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contests' AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE public.contests ADD COLUMN duration_minutes integer;
  END IF;

  -- Add problem_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contests' AND column_name = 'problem_count'
  ) THEN
    ALTER TABLE public.contests ADD COLUMN problem_count integer;
  END IF;

  -- Add rating_min column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contests' AND column_name = 'rating_min'
  ) THEN
    ALTER TABLE public.contests ADD COLUMN rating_min integer;
  END IF;

  -- Add rating_max column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contests' AND column_name = 'rating_max'
  ) THEN
    ALTER TABLE public.contests ADD COLUMN rating_max integer;
  END IF;

  -- Add tags column to contests table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contests' AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.contests ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
END $$;

-- Update contest_problems table to store CF problem details
DO $$
BEGIN
  -- Add contest_id_cf column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contest_problems' AND column_name = 'contest_id_cf'
  ) THEN
    ALTER TABLE public.contest_problems ADD COLUMN contest_id_cf integer;
  END IF;

  -- Add index_cf column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contest_problems' AND column_name = 'index_cf'
  ) THEN
    ALTER TABLE public.contest_problems ADD COLUMN index_cf text;
  END IF;

  -- Add rating column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contest_problems' AND column_name = 'rating'
  ) THEN
    ALTER TABLE public.contest_problems ADD COLUMN rating integer;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contests_starts_at ON public.contests(starts_at);
CREATE INDEX IF NOT EXISTS idx_contests_status ON public.contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_host_user_id ON public.contests(host_user_id);
