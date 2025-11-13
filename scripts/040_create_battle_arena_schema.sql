-- Battle Arena Schema
-- This schema supports 1v1 duels and 3v3 team battles for real-time competitive programming

-- ==================== MATCHES TABLE ====================
-- Core table for all battle arena matches
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Match metadata
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('quick_1v1', 'ranked_1v1', '3v3_team', 'private_room', 'tournament')),
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'countdown', 'in_progress', 'finished', 'cancelled')),
  
  -- Timing
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 1800, -- 30 minutes default
  
  -- Problem assignment
  problem_ids JSONB NOT NULL, -- Array of problem IDs for the match
  
  -- Metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}', -- Store room settings, rules, etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for matches
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_mode ON public.matches(mode);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_started_at ON public.matches(started_at DESC);

-- ==================== MATCH PLAYERS TABLE ====================
-- Junction table for players in matches
CREATE TABLE IF NOT EXISTS public.match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Team assignment (null for 1v1, 'team_a' or 'team_b' for 3v3)
  team VARCHAR(10) CHECK (team IN ('team_a', 'team_b') OR team IS NULL),
  
  -- Score tracking
  score INTEGER DEFAULT 0,
  full_solves INTEGER DEFAULT 0,
  partial_solves INTEGER DEFAULT 0,
  
  -- Result
  result VARCHAR(20) CHECK (result IN ('win', 'loss', 'draw', 'abandoned') OR result IS NULL),
  
  -- Rating changes (for ranked matches)
  rating_before INTEGER,
  rating_after INTEGER,
  rating_change INTEGER,
  
  -- Metadata
  metadata JSONB DEFAULT '{}', -- Store individual stats, bonuses, etc.
  
  -- Timestamps
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(match_id, user_id)
);

-- Indexes for match_players
CREATE INDEX IF NOT EXISTS idx_match_players_match_id ON public.match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_user_id ON public.match_players(user_id);
CREATE INDEX IF NOT EXISTS idx_match_players_team ON public.match_players(team);
CREATE INDEX IF NOT EXISTS idx_match_players_result ON public.match_players(result);

-- ==================== SUBMISSIONS TABLE ====================
-- Code submissions during matches
CREATE TABLE IF NOT EXISTS public.battle_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id VARCHAR(50) NOT NULL,
  
  -- Code details
  language VARCHAR(20) NOT NULL,
  code TEXT NOT NULL,
  
  -- Execution results
  status VARCHAR(30) NOT NULL CHECK (status IN (
    'pending', 'executing', 'accepted', 'wrong_answer', 
    'compilation_error', 'runtime_error', 'time_limit_exceeded', 
    'memory_limit_exceeded', 'internal_error'
  )),
  
  -- Test results
  tests_passed INTEGER DEFAULT 0,
  tests_total INTEGER DEFAULT 0,
  
  -- Performance metrics
  runtime_ms INTEGER,
  memory_kb INTEGER,
  
  -- Scoring
  score INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}', -- Store test case results, compiler output, etc.
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMPTZ,
  
  -- Fingerprint for plagiarism detection
  code_fingerprint TEXT,
  ast_hash TEXT
);

-- Indexes for battle_submissions
CREATE INDEX IF NOT EXISTS idx_battle_submissions_match_id ON public.battle_submissions(match_id);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_user_id ON public.battle_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_problem_id ON public.battle_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_status ON public.battle_submissions(status);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_created_at ON public.battle_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_fingerprint ON public.battle_submissions(code_fingerprint);

-- ==================== PLAYER RATINGS TABLE ====================
-- ELO-based rating system
CREATE TABLE IF NOT EXISTS public.player_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Rating by mode
  rating_1v1 INTEGER DEFAULT 1200,
  rating_3v3 INTEGER DEFAULT 1200,
  
  -- Volatility (K-factor calculation)
  volatility DECIMAL(5,2) DEFAULT 32.0,
  
  -- Match statistics
  matches_played_1v1 INTEGER DEFAULT 0,
  matches_played_3v3 INTEGER DEFAULT 0,
  wins_1v1 INTEGER DEFAULT 0,
  wins_3v3 INTEGER DEFAULT 0,
  losses_1v1 INTEGER DEFAULT 0,
  losses_3v3 INTEGER DEFAULT 0,
  
  -- Peak rating
  peak_rating_1v1 INTEGER DEFAULT 1200,
  peak_rating_3v3 INTEGER DEFAULT 1200,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Indexes for player_ratings
CREATE INDEX IF NOT EXISTS idx_player_ratings_user_id ON public.player_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_player_ratings_1v1 ON public.player_ratings(rating_1v1 DESC);
CREATE INDEX IF NOT EXISTS idx_player_ratings_3v3 ON public.player_ratings(rating_3v3 DESC);

-- ==================== RATING HISTORY TABLE ====================
-- Track rating changes over time
CREATE TABLE IF NOT EXISTS public.rating_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('1v1', '3v3')),
  
  rating_before INTEGER NOT NULL,
  rating_after INTEGER NOT NULL,
  rating_change INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for rating_history
CREATE INDEX IF NOT EXISTS idx_rating_history_user_id ON public.rating_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rating_history_match_id ON public.rating_history(match_id);

-- ==================== MATCHMAKING QUEUE TABLE ====================
-- Temporary queue for matchmaking (could also use Redis)
CREATE TABLE IF NOT EXISTS public.matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('quick_1v1', 'ranked_1v1', '3v3_team')),
  
  rating INTEGER NOT NULL,
  
  -- Queue metadata
  metadata JSONB DEFAULT '{}', -- Preferences, team composition, etc.
  
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, mode)
);

-- Indexes for matchmaking_queue
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_mode ON public.matchmaking_queue(mode);
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_rating ON public.matchmaking_queue(rating);
CREATE INDEX IF NOT EXISTS idx_matchmaking_queue_joined_at ON public.matchmaking_queue(joined_at);

-- ==================== PLAGIARISM LOGS TABLE ====================
-- Anti-cheat and plagiarism detection
CREATE TABLE IF NOT EXISTS public.plagiarism_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  submission_id_1 UUID NOT NULL REFERENCES public.battle_submissions(id) ON DELETE CASCADE,
  submission_id_2 UUID NOT NULL REFERENCES public.battle_submissions(id) ON DELETE CASCADE,
  
  similarity_score DECIMAL(5,2) NOT NULL, -- 0-100%
  
  -- Detection method
  detection_method VARCHAR(50) NOT NULL CHECK (detection_method IN ('ast_diff', 'token_similarity', 'structure_match', 'behavioral')),
  
  -- Status
  status VARCHAR(20) DEFAULT 'flagged' CHECK (status IN ('flagged', 'reviewing', 'confirmed', 'dismissed')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}', -- Detailed diff, matching patterns, etc.
  
  -- Review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for plagiarism_logs
CREATE INDEX IF NOT EXISTS idx_plagiarism_logs_submission_1 ON public.plagiarism_logs(submission_id_1);
CREATE INDEX IF NOT EXISTS idx_plagiarism_logs_submission_2 ON public.plagiarism_logs(submission_id_2);
CREATE INDEX IF NOT EXISTS idx_plagiarism_logs_status ON public.plagiarism_logs(status);
CREATE INDEX IF NOT EXISTS idx_plagiarism_logs_created_at ON public.plagiarism_logs(created_at DESC);

-- ==================== BEHAVIORAL LOGS TABLE ====================
-- Track suspicious behavior
CREATE TABLE IF NOT EXISTS public.behavioral_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  
  -- Anomaly type
  anomaly_type VARCHAR(50) NOT NULL CHECK (anomaly_type IN (
    'unrealistic_solve_speed', 'rating_mismatch', 'identical_code_pattern', 
    'language_switching', 'performance_spike', 'copy_paste_detected'
  )),
  
  -- Severity
  severity VARCHAR(20) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Details
  details JSONB DEFAULT '{}',
  
  -- Status
  status VARCHAR(20) DEFAULT 'flagged' CHECK (status IN ('flagged', 'investigating', 'resolved', 'false_positive')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for behavioral_logs
CREATE INDEX IF NOT EXISTS idx_behavioral_logs_user_id ON public.behavioral_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_logs_match_id ON public.behavioral_logs(match_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_logs_status ON public.behavioral_logs(status);
CREATE INDEX IF NOT EXISTS idx_behavioral_logs_severity ON public.behavioral_logs(severity);

-- ==================== LEADERBOARDS TABLE ====================
-- Cached leaderboard for performance
CREATE TABLE IF NOT EXISTS public.battle_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('1v1', '3v3', 'overall')),
  timeframe VARCHAR(20) NOT NULL CHECK (timeframe IN ('daily', 'weekly', 'monthly', 'all_time')),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(mode, timeframe, user_id)
);

-- Indexes for battle_leaderboards
CREATE INDEX IF NOT EXISTS idx_battle_leaderboards_mode_timeframe_rank ON public.battle_leaderboards(mode, timeframe, rank);
CREATE INDEX IF NOT EXISTS idx_battle_leaderboards_user_id ON public.battle_leaderboards(user_id);

-- ==================== TRIGGERS ====================

-- Updated_at trigger for matches
DROP TRIGGER IF EXISTS trg_matches_updated_at ON public.matches;
CREATE TRIGGER trg_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Updated_at trigger for player_ratings
DROP TRIGGER IF EXISTS trg_player_ratings_updated_at ON public.player_ratings;
CREATE TRIGGER trg_player_ratings_updated_at
  BEFORE UPDATE ON public.player_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ==================== ROW LEVEL SECURITY ====================

-- Enable RLS on all tables
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matchmaking_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plagiarism_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_leaderboards ENABLE ROW LEVEL SECURITY;

-- Matches: Users can view matches they're participating in
DROP POLICY IF EXISTS "view_own_matches" ON public.matches;
CREATE POLICY "view_own_matches" ON public.matches
  FOR SELECT
  USING (
    id IN (
      SELECT match_id FROM public.match_players WHERE user_id = auth.uid()
    )
  );

-- Match players: Users can view their own entries
DROP POLICY IF EXISTS "view_own_match_players" ON public.match_players;
CREATE POLICY "view_own_match_players" ON public.match_players
  FOR SELECT
  USING (user_id = auth.uid());

-- Battle submissions: Users can view submissions in their matches
DROP POLICY IF EXISTS "view_match_submissions" ON public.battle_submissions;
CREATE POLICY "view_match_submissions" ON public.battle_submissions
  FOR SELECT
  USING (
    match_id IN (
      SELECT match_id FROM public.match_players WHERE user_id = auth.uid()
    )
  );

-- Player ratings: Users can view all ratings (public leaderboard)
DROP POLICY IF EXISTS "view_all_ratings" ON public.player_ratings;
CREATE POLICY "view_all_ratings" ON public.player_ratings
  FOR SELECT
  USING (true);

-- Rating history: Users can view their own history
DROP POLICY IF EXISTS "view_own_rating_history" ON public.rating_history;
CREATE POLICY "view_own_rating_history" ON public.rating_history
  FOR SELECT
  USING (user_id = auth.uid());

-- Matchmaking queue: Users can view their own queue entries
DROP POLICY IF EXISTS "view_own_queue" ON public.matchmaking_queue;
CREATE POLICY "view_own_queue" ON public.matchmaking_queue
  FOR SELECT
  USING (user_id = auth.uid());

-- Leaderboards: Public view
DROP POLICY IF EXISTS "view_leaderboards" ON public.battle_leaderboards;
CREATE POLICY "view_leaderboards" ON public.battle_leaderboards
  FOR SELECT
  USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE public.matches IS 'Core table for all battle arena matches (1v1 and 3v3)';
COMMENT ON TABLE public.match_players IS 'Junction table linking players to matches with scores and results';
COMMENT ON TABLE public.battle_submissions IS 'Code submissions during battle arena matches';
COMMENT ON TABLE public.player_ratings IS 'ELO-based rating system for competitive matchmaking';
COMMENT ON TABLE public.rating_history IS 'Historical record of rating changes';
COMMENT ON TABLE public.matchmaking_queue IS 'Temporary queue for finding match opponents';
COMMENT ON TABLE public.plagiarism_logs IS 'Anti-cheat system for detecting code plagiarism';
COMMENT ON TABLE public.behavioral_logs IS 'Behavioral anomaly detection for suspicious activity';
COMMENT ON TABLE public.battle_leaderboards IS 'Cached leaderboard data for performance';
