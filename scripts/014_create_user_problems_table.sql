-- Create user_problems table for tracking problem completion
CREATE TABLE IF NOT EXISTS public.user_problems (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  solved BOOLEAN DEFAULT false,
  solved_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  difficulty TEXT,
  platform TEXT,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, problem_id)
);

-- Create user_levels table for gamification
CREATE TABLE IF NOT EXISTS public.user_levels (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  easy_solved INTEGER DEFAULT 0,
  medium_solved INTEGER DEFAULT 0,
  hard_solved INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_problems_user_id ON public.user_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_problems_solved ON public.user_problems(user_id, solved);
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON public.user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);

-- RLS Policies
ALTER TABLE public.user_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- user_problems policies
CREATE POLICY "Users can view own problems" ON public.user_problems
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own problems" ON public.user_problems
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own problems" ON public.user_problems
  FOR UPDATE USING (auth.uid() = user_id);

-- user_levels policies
CREATE POLICY "Users can view own level" ON public.user_levels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own level" ON public.user_levels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own level" ON public.user_levels
  FOR UPDATE USING (auth.uid() = user_id);

-- user_badges policies
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view all badges" ON public.user_badges
  FOR SELECT USING (true);

-- Function to calculate XP based on difficulty
CREATE OR REPLACE FUNCTION calculate_problem_xp(difficulty TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE difficulty
    WHEN 'Easy' THEN 10
    WHEN 'Medium' THEN 25
    WHEN 'Hard' THEN 50
    WHEN 'Div3' THEN 15
    WHEN 'Div2-A' THEN 20
    WHEN 'Div2-B' THEN 30
    WHEN 'Div2-C' THEN 40
    WHEN 'Div2-D' THEN 60
    ELSE 10
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(total_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: level = floor(sqrt(total_xp / 100)) + 1
  RETURN FLOOR(SQRT(total_xp::FLOAT / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user_levels when problem is solved
CREATE OR REPLACE FUNCTION update_user_level_on_solve()
RETURNS TRIGGER AS $$
DECLARE
  xp_amount INTEGER;
  new_level INTEGER;
BEGIN
  IF NEW.solved = true AND (OLD.solved IS NULL OR OLD.solved = false) THEN
    -- Calculate XP for this problem
    xp_amount := calculate_problem_xp(NEW.difficulty);
    
    -- Update user_levels
    INSERT INTO public.user_levels (user_id, total_xp, problems_solved, level)
    VALUES (NEW.user_id, xp_amount, 1, 1)
    ON CONFLICT (user_id) DO UPDATE SET
      total_xp = user_levels.total_xp + xp_amount,
      problems_solved = user_levels.problems_solved + 1,
      level = calculate_level(user_levels.total_xp + xp_amount),
      easy_solved = user_levels.easy_solved + CASE WHEN NEW.difficulty = 'Easy' THEN 1 ELSE 0 END,
      medium_solved = user_levels.medium_solved + CASE WHEN NEW.difficulty = 'Medium' THEN 1 ELSE 0 END,
      hard_solved = user_levels.hard_solved + CASE WHEN NEW.difficulty = 'Hard' THEN 1 ELSE 0 END,
      last_activity_date = CURRENT_DATE,
      updated_at = NOW();
    
    -- Store XP earned in the problem record
    NEW.xp_earned := xp_amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
BEFORE INSERT OR UPDATE ON public.user_problems
FOR EACH ROW
EXECUTE FUNCTION update_user_level_on_solve();
