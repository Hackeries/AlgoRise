-- ============================================================================
-- PART 5: REAL-TIME SYNCHRONIZATION DATABASE SCHEMA
-- ============================================================================
-- 
-- This schema supports:
-- 1. Server-side timestamps for race condition prevention
-- 2. Battle submissions with authoritative time tracking
-- 3. Problem status tracking
-- 4. Battle lifecycle management
-- 5. Real-time event triggers
-- ============================================================================

-- ============================================================================
-- TABLE: battle_submissions
-- Records all submissions with SERVER TIMESTAMPS as source of truth
-- ============================================================================

CREATE TABLE IF NOT EXISTS battle_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  
  -- Code and language
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  
  -- Verdict from Judge0
  verdict TEXT CHECK (verdict IN ('AC', 'WA', 'TLE', 'RE', 'CE', 'MLE')),
  execution_time INTEGER, -- milliseconds
  memory INTEGER, -- KB
  test_cases_passed INTEGER,
  total_test_cases INTEGER,
  
  -- CRITICAL: Server timestamps (source of truth for ordering)
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  judged_at TIMESTAMPTZ,
  
  -- Client timestamp (for reference/debugging only, NOT used for ordering)
  client_submitted_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_battle_submissions_battle_id ON battle_submissions(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_user_id ON battle_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_problem_id ON battle_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_submitted_at ON battle_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_battle_problem ON battle_submissions(battle_id, problem_id);

-- Index for finding simultaneous submissions (race conditions)
CREATE INDEX IF NOT EXISTS idx_battle_submissions_battle_problem_time 
  ON battle_submissions(battle_id, problem_id, submitted_at);

-- ============================================================================
-- TABLE: battle_problems
-- Tracks problem status in each battle
-- ============================================================================

CREATE TABLE IF NOT EXISTS battle_problems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  
  -- Problem metadata
  problem_name TEXT NOT NULL,
  problem_rating INTEGER,
  
  -- Status per user
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('unsolved', 'solving', 'accepted', 'wrong-answer')) DEFAULT 'unsolved',
  
  -- Timestamps
  first_viewed_at TIMESTAMPTZ,
  first_submitted_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  
  -- Stats
  submission_count INTEGER DEFAULT 0,
  wrong_attempts INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(battle_id, problem_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_battle_problems_battle_id ON battle_problems(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_problems_user_id ON battle_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_problems_status ON battle_problems(status);

-- ============================================================================
-- TABLE: battles
-- Add columns for real-time state tracking
-- ============================================================================

-- Check if battles table exists, if not create it
CREATE TABLE IF NOT EXISTS battles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('1v1', '3v3')),
  status TEXT NOT NULL CHECK (status IN ('waiting', 'in_progress', 'completed', 'cancelled')) DEFAULT 'waiting',
  
  -- Timing
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER, -- Battle duration in seconds
  
  -- Winner
  winner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  winner_team_id UUID,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add new columns for real-time tracking (if they don't exist)
DO $$ 
BEGIN
  -- Connection tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='battles' AND column_name='connection_status') THEN
    ALTER TABLE battles ADD COLUMN connection_status JSONB DEFAULT '{}';
  END IF;
  
  -- Last activity timestamp
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='battles' AND column_name='last_activity_at') THEN
    ALTER TABLE battles ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- Pause state (for disconnections)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='battles' AND column_name='is_paused') THEN
    ALTER TABLE battles ADD COLUMN is_paused BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='battles' AND column_name='paused_at') THEN
    ALTER TABLE battles ADD COLUMN paused_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============================================================================
-- TABLE: battle_events
-- Log all real-time events for replay and debugging
-- ============================================================================

CREATE TABLE IF NOT EXISTS battle_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL, -- submission_started, submission_verdict, typing_indicator, etc.
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Event data (flexible JSON)
  event_data JSONB NOT NULL DEFAULT '{}',
  
  -- Server timestamp (source of truth)
  occurred_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Client timestamp (reference only)
  client_timestamp TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_battle_events_battle_id ON battle_events(battle_id);
CREATE INDEX IF NOT EXISTS idx_battle_events_occurred_at ON battle_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_battle_events_type ON battle_events(event_type);

-- ============================================================================
-- FUNCTION: Update battle last activity on any submission
-- ============================================================================

CREATE OR REPLACE FUNCTION update_battle_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE battles 
  SET 
    last_activity_at = NOW(),
    updated_at = NOW()
  WHERE id = NEW.battle_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on battle_submissions
DROP TRIGGER IF EXISTS trg_update_battle_activity_on_submission ON battle_submissions;
CREATE TRIGGER trg_update_battle_activity_on_submission
  AFTER INSERT ON battle_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_battle_last_activity();

-- ============================================================================
-- FUNCTION: Update problem status on submission
-- ============================================================================

CREATE OR REPLACE FUNCTION update_problem_status_on_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Update battle_problems status when submission comes in
  UPDATE battle_problems
  SET 
    status = CASE 
      WHEN NEW.verdict = 'AC' THEN 'accepted'
      WHEN NEW.verdict IN ('WA', 'TLE', 'RE', 'CE', 'MLE') THEN 'wrong-answer'
      ELSE 'solving'
    END,
    submission_count = submission_count + 1,
    wrong_attempts = CASE 
      WHEN NEW.verdict IN ('WA', 'TLE', 'RE', 'CE', 'MLE') THEN wrong_attempts + 1
      ELSE wrong_attempts
    END,
    accepted_at = CASE WHEN NEW.verdict = 'AC' THEN NOW() ELSE accepted_at END,
    first_submitted_at = COALESCE(first_submitted_at, NEW.submitted_at),
    updated_at = NOW()
  WHERE 
    battle_id = NEW.battle_id 
    AND user_id = NEW.user_id 
    AND problem_id = NEW.problem_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on verdict update
DROP TRIGGER IF EXISTS trg_update_problem_status ON battle_submissions;
CREATE TRIGGER trg_update_problem_status
  AFTER UPDATE OF verdict ON battle_submissions
  FOR EACH ROW
  WHEN (NEW.verdict IS NOT NULL)
  EXECUTE FUNCTION update_problem_status_on_submission();

-- ============================================================================
-- FUNCTION: Log real-time events
-- ============================================================================

CREATE OR REPLACE FUNCTION log_battle_event(
  p_battle_id UUID,
  p_event_type TEXT,
  p_user_id UUID,
  p_event_data JSONB,
  p_client_timestamp TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO battle_events (
    battle_id,
    event_type,
    user_id,
    event_data,
    client_timestamp
  ) VALUES (
    p_battle_id,
    p_event_type,
    p_user_id,
    p_event_data,
    p_client_timestamp
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Get submission order (for race condition resolution)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_submission_order(
  p_battle_id UUID,
  p_problem_id TEXT
)
RETURNS TABLE(
  submission_id UUID,
  user_id UUID,
  submitted_at TIMESTAMPTZ,
  rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bs.id,
    bs.user_id,
    bs.submitted_at,
    ROW_NUMBER() OVER (ORDER BY bs.submitted_at ASC)::INTEGER as rank
  FROM battle_submissions bs
  WHERE 
    bs.battle_id = p_battle_id
    AND bs.problem_id = p_problem_id
  ORDER BY bs.submitted_at ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Pause/Resume battle (for disconnections)
-- ============================================================================

CREATE OR REPLACE FUNCTION pause_battle(p_battle_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE battles
  SET 
    is_paused = TRUE,
    paused_at = NOW(),
    updated_at = NOW()
  WHERE id = p_battle_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION resume_battle(p_battle_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE battles
  SET 
    is_paused = FALSE,
    paused_at = NULL,
    updated_at = NOW()
  WHERE id = p_battle_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE battle_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_events ENABLE ROW LEVEL SECURITY;

-- Policies for battle_submissions
DROP POLICY IF EXISTS "Users can view submissions in their battles" ON battle_submissions;
CREATE POLICY "Users can view submissions in their battles" 
  ON battle_submissions FOR SELECT
  USING (
    battle_id IN (
      SELECT id FROM battles WHERE 
        id IN (
          SELECT battle_id FROM battle_participants WHERE user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "Users can insert their own submissions" ON battle_submissions;
CREATE POLICY "Users can insert their own submissions" 
  ON battle_submissions FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own submissions" ON battle_submissions;
CREATE POLICY "Users can update their own submissions" 
  ON battle_submissions FOR UPDATE
  USING (user_id = auth.uid());

-- Policies for battle_problems
DROP POLICY IF EXISTS "Users can view problems in their battles" ON battle_problems;
CREATE POLICY "Users can view problems in their battles" 
  ON battle_problems FOR SELECT
  USING (
    battle_id IN (
      SELECT battle_id FROM battle_participants WHERE user_id = auth.uid()
    )
  );

-- Policies for battle_events
DROP POLICY IF EXISTS "Users can view events in their battles" ON battle_events;
CREATE POLICY "Users can view events in their battles" 
  ON battle_events FOR SELECT
  USING (
    battle_id IN (
      SELECT battle_id FROM battle_participants WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- REALTIME PUBLICATION
-- Enable Realtime for these tables so Supabase broadcasts changes
-- ============================================================================

-- Note: Run these commands in your Supabase SQL editor or via CLI
-- ALTER PUBLICATION supabase_realtime ADD TABLE battle_submissions;
-- ALTER PUBLICATION supabase_realtime ADD TABLE battle_problems;
-- ALTER PUBLICATION supabase_realtime ADD TABLE battles;

-- ============================================================================
-- HELPER VIEW: Battle Leaderboard (with server timestamps)
-- ============================================================================

CREATE OR REPLACE VIEW battle_leaderboard AS
SELECT 
  b.id as battle_id,
  bp.user_id,
  p.codeforces_handle as handle,
  COUNT(CASE WHEN bp.status = 'accepted' THEN 1 END) as problems_solved,
  SUM(bp.wrong_attempts) as penalty,
  MAX(bp.accepted_at) as last_solve_time,
  -- Time from battle start to last solve (for tiebreaker)
  EXTRACT(EPOCH FROM (MAX(bp.accepted_at) - b.started_at))::INTEGER as total_time_seconds
FROM battles b
JOIN battle_problems bp ON b.id = bp.battle_id
JOIN profiles p ON bp.user_id = p.id
WHERE bp.status IS NOT NULL
GROUP BY b.id, bp.user_id, p.codeforces_handle, b.started_at
ORDER BY problems_solved DESC, penalty ASC, total_time_seconds ASC;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status);
CREATE INDEX IF NOT EXISTS idx_battles_started_at ON battles(started_at);
CREATE INDEX IF NOT EXISTS idx_battles_last_activity ON battles(last_activity_at);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE battle_submissions IS 'All battle submissions with server timestamps as source of truth for race condition prevention';
COMMENT ON COLUMN battle_submissions.submitted_at IS 'SERVER timestamp when submission was received (source of truth)';
COMMENT ON COLUMN battle_submissions.judged_at IS 'SERVER timestamp when Judge0 verdict was received';
COMMENT ON COLUMN battle_submissions.client_submitted_at IS 'Client timestamp (reference only, NOT used for ordering)';

COMMENT ON TABLE battle_events IS 'Log of all real-time events for replay and debugging';
COMMENT ON COLUMN battle_events.occurred_at IS 'SERVER timestamp when event occurred (source of truth)';

COMMENT ON FUNCTION get_submission_order IS 'Returns submissions in order by server timestamp (for race condition resolution)';

-- ============================================================================
-- DONE!
-- ============================================================================
