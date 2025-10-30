-- Create comprehensive problems table for dynamic problem sourcing
-- This table stores coding problems from various platforms (Codeforces, AtCoder, LeetCode, etc.)

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS public.problem_hints CASCADE;
DROP TABLE IF EXISTS public.problem_history CASCADE;
DROP TABLE IF EXISTS public.problems CASCADE;

-- Main problems table
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Problem identification
  platform TEXT NOT NULL CHECK (platform IN ('codeforces', 'atcoder', 'leetcode', 'codechef', 'usaco', 'cses', 'custom')),
  external_id TEXT NOT NULL, -- e.g., "1234A" for CF, "abc123_a" for AtCoder
  title TEXT NOT NULL,
  
  -- Difficulty and categorization
  difficulty_rating INTEGER NOT NULL CHECK (difficulty_rating >= 800 AND difficulty_rating <= 3500),
  topic TEXT[], -- Array of topics: "dp", "graph", "math", "greedy", etc.
  tags TEXT[], -- Additional tags for filtering
  
  -- Problem constraints
  time_limit INTEGER NOT NULL DEFAULT 1000, -- in milliseconds
  memory_limit INTEGER NOT NULL DEFAULT 256, -- in MB
  
  -- Problem content
  problem_statement TEXT NOT NULL, -- Full description with HTML/Markdown
  input_format TEXT, -- Structured input format description
  output_format TEXT, -- Structured output format description
  constraints TEXT, -- Important edge case info
  editorial TEXT, -- Solution explanation (optional)
  
  -- Test cases (stored as JSONB for flexibility)
  test_cases JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {input: string, output: string, explanation?: string}
  hidden_test_cases JSONB DEFAULT '[]'::jsonb, -- Additional test cases not shown to users
  
  -- Judge0 compatibility
  judge0_language_id INTEGER DEFAULT 54, -- Default to C++ (GCC 9.2.0)
  reference_solution TEXT, -- Reference solution for Judge0 testing
  
  -- Statistics
  solved_count INTEGER DEFAULT 0,
  attempt_count INTEGER DEFAULT 0,
  successful_submission_rate FLOAT DEFAULT 0.0, -- 0-100
  average_solve_time INTEGER DEFAULT 0, -- in minutes
  
  -- Metadata
  source_url TEXT, -- Original problem URL
  author TEXT, -- Problem author/setter
  contest_name TEXT, -- Associated contest if any
  is_active BOOLEAN DEFAULT true, -- Whether problem should be shown in matchmaking
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint on platform + external_id
  UNIQUE(platform, external_id)
);

-- Problem history table to track which problems users have seen
CREATE TABLE IF NOT EXISTS public.problem_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  
  -- Interaction tracking
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_attempted_at TIMESTAMPTZ,
  solved_at TIMESTAMPTZ,
  
  -- Statistics
  view_count INTEGER DEFAULT 1,
  attempt_count INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  
  -- Battle context (if problem was seen in a battle)
  battle_id UUID, -- Can reference battles table
  battle_round_id UUID, -- Can reference battle_rounds table
  
  UNIQUE(user_id, problem_id)
);

-- Problem hints table for multi-level hint system
CREATE TABLE IF NOT EXISTS public.problem_hints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  
  -- Hint details
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 4),
  hint_type TEXT NOT NULL CHECK (hint_type IN ('restatement', 'algorithm', 'pseudocode', 'solution')),
  content TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(problem_id, level)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_problems_platform ON public.problems(platform);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON public.problems(difficulty_rating);
CREATE INDEX IF NOT EXISTS idx_problems_topic ON public.problems USING GIN(topic);
CREATE INDEX IF NOT EXISTS idx_problems_tags ON public.problems USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_problems_active ON public.problems(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_problems_rating_active ON public.problems(difficulty_rating, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_problem_history_user ON public.problem_history(user_id);
CREATE INDEX IF NOT EXISTS idx_problem_history_problem ON public.problem_history(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_history_user_seen ON public.problem_history(user_id, first_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_problem_history_user_problem ON public.problem_history(user_id, problem_id);

CREATE INDEX IF NOT EXISTS idx_problem_hints_problem ON public.problem_hints(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_hints_level ON public.problem_hints(problem_id, level);

-- Enable RLS
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_hints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for problems table
CREATE POLICY "Anyone can view active problems" ON public.problems
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage problems" ON public.problems
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for problem_history table
CREATE POLICY "Users can view own problem history" ON public.problem_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own problem history" ON public.problem_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own problem history" ON public.problem_history
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for problem_hints table
CREATE POLICY "Anyone can view hints for active problems" ON public.problem_hints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.problems 
      WHERE problems.id = problem_id 
      AND problems.is_active = true
    )
  );

-- Function to update problem statistics
CREATE OR REPLACE FUNCTION update_problem_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.solved_at IS NOT NULL AND (OLD.solved_at IS NULL OR OLD IS NULL) THEN
    -- Increment solved count
    UPDATE public.problems
    SET 
      solved_count = solved_count + 1,
      successful_submission_rate = (
        (solved_count + 1)::FLOAT / NULLIF(attempt_count, 0)::FLOAT * 100
      ),
      updated_at = NOW()
    WHERE id = NEW.problem_id;
  END IF;
  
  IF NEW.attempt_count > COALESCE(OLD.attempt_count, 0) THEN
    -- Increment attempt count
    UPDATE public.problems
    SET 
      attempt_count = attempt_count + (NEW.attempt_count - COALESCE(OLD.attempt_count, 0)),
      updated_at = NOW()
    WHERE id = NEW.problem_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_problem_stats
AFTER INSERT OR UPDATE ON public.problem_history
FOR EACH ROW
EXECUTE FUNCTION update_problem_statistics();

-- Function to get random problems for matchmaking
-- This ensures diversity and avoids recently seen problems
CREATE OR REPLACE FUNCTION get_matchmaking_problems(
  p_user_id UUID,
  p_target_rating INTEGER,
  p_rating_range INTEGER DEFAULT 200,
  p_count INTEGER DEFAULT 2,
  p_days_threshold INTEGER DEFAULT 7
)
RETURNS TABLE (
  problem_id UUID,
  platform TEXT,
  external_id TEXT,
  title TEXT,
  difficulty_rating INTEGER,
  topic TEXT[],
  time_limit INTEGER,
  memory_limit INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.platform,
    p.external_id,
    p.title,
    p.difficulty_rating,
    p.topic,
    p.time_limit,
    p.memory_limit
  FROM public.problems p
  WHERE 
    p.is_active = true
    AND p.difficulty_rating BETWEEN (p_target_rating - p_rating_range) AND (p_target_rating + p_rating_range)
    -- Exclude problems seen in the last p_days_threshold days
    AND p.id NOT IN (
      SELECT ph.problem_id
      FROM public.problem_history ph
      WHERE ph.user_id = p_user_id
        AND ph.first_seen_at > NOW() - INTERVAL '1 day' * p_days_threshold
    )
  ORDER BY RANDOM()
  LIMIT p_count;
END;
$$ LANGUAGE plpgsql;

-- Function to record problem view
CREATE OR REPLACE FUNCTION record_problem_view(
  p_user_id UUID,
  p_problem_id UUID,
  p_battle_id UUID DEFAULT NULL,
  p_battle_round_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.problem_history (
    user_id, 
    problem_id, 
    battle_id, 
    battle_round_id,
    first_seen_at,
    view_count
  )
  VALUES (
    p_user_id, 
    p_problem_id, 
    p_battle_id, 
    p_battle_round_id,
    NOW(),
    1
  )
  ON CONFLICT (user_id, problem_id) 
  DO UPDATE SET
    view_count = problem_history.view_count + 1,
    last_attempted_at = NOW();
END;
$$ LANGUAGE plpgsql;
