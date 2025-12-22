-- ============================================================================
-- BATTLE ARENA SYSTEM
-- ----------------------------------------------------------------------------
-- Implements competitive Battle Arena feature with:
-- 1. 1v1 Duels (Mind Clash) and 3v3 Team Battles (War Room)
-- 2. ELO rating system with tiers
-- 3. Real-time match events and state management
-- 4. Anti-cheat tracking
-- 5. Pro/Free tier access control
-- ============================================================================

-- ============================================================================
-- ARENA RATINGS TABLE
-- Track player ELO ratings and statistics
-- ============================================================================
CREATE TABLE IF NOT EXISTS arena_ratings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- ELO Ratings
    elo_1v1 INTEGER DEFAULT 1200,
    elo_3v3 INTEGER DEFAULT 1200,
    
    -- Tier progression (based on ELO)
    tier_1v1 VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold, platinum, diamond, master
    tier_3v3 VARCHAR(20) DEFAULT 'bronze',
    
    -- Statistics
    matches_played_1v1 INTEGER DEFAULT 0,
    matches_played_3v3 INTEGER DEFAULT 0,
    matches_won_1v1 INTEGER DEFAULT 0,
    matches_won_3v3 INTEGER DEFAULT 0,
    
    -- Streaks
    current_win_streak INTEGER DEFAULT 0,
    best_win_streak INTEGER DEFAULT 0,
    
    -- Titles earned
    titles JSONB DEFAULT '[]', -- Array of earned titles
    
    -- Metadata
    last_match_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_arena_ratings_elo_1v1 ON arena_ratings(elo_1v1);
CREATE INDEX idx_arena_ratings_elo_3v3 ON arena_ratings(elo_3v3);
CREATE INDEX idx_arena_ratings_tier_1v1 ON arena_ratings(tier_1v1);
CREATE INDEX idx_arena_ratings_tier_3v3 ON arena_ratings(tier_3v3);

-- ============================================================================
-- ARENA TEAMS TABLE
-- For 3v3 battles, track team composition
-- ============================================================================
CREATE TABLE IF NOT EXISTS arena_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID, -- FK to arena_matches, set after match is created
    
    -- Team members (3 players)
    player1_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    player2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    player3_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Team stats
    team_name VARCHAR(100),
    average_elo INTEGER,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_arena_teams_match_id ON arena_teams(match_id);
CREATE INDEX idx_arena_teams_players ON arena_teams(player1_id, player2_id, player3_id);

-- ============================================================================
-- ARENA MATCHES TABLE
-- Track individual matches (1v1 or 3v3)
-- ============================================================================
CREATE TABLE IF NOT EXISTS arena_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Match type and configuration
    match_type VARCHAR(10) NOT NULL, -- '1v1' or '3v3'
    mode VARCHAR(20) NOT NULL, -- 'ranked' or 'unranked'
    
    -- Participants
    -- For 1v1: use player1_id and player2_id
    -- For 3v3: use team1_id and team2_id
    player1_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    player2_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    team1_id UUID REFERENCES arena_teams(id) ON DELETE SET NULL,
    team2_id UUID REFERENCES arena_teams(id) ON DELETE SET NULL,
    
    -- Match state
    state VARCHAR(20) DEFAULT 'waiting', -- waiting, live, finished, cancelled
    
    -- Problems assigned to this match
    problem_ids JSONB DEFAULT '[]', -- Array of problem IDs
    
    -- Winner
    winner_id UUID, -- user_id for 1v1, team_id for 3v3
    
    -- Timing
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Match settings
    pressure_phase_start TIMESTAMPTZ, -- Last 5 minutes
    fog_of_progress BOOLEAN DEFAULT true,
    
    -- Results and scoring
    final_scores JSONB DEFAULT '{}', -- Map of player/team -> score
    elo_changes JSONB DEFAULT '{}', -- Map of player -> ELO change
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_arena_matches_state ON arena_matches(state);
CREATE INDEX idx_arena_matches_match_type ON arena_matches(match_type, mode);
CREATE INDEX idx_arena_matches_player1 ON arena_matches(player1_id);
CREATE INDEX idx_arena_matches_player2 ON arena_matches(player2_id);
CREATE INDEX idx_arena_matches_teams ON arena_matches(team1_id, team2_id);
CREATE INDEX idx_arena_matches_created_at ON arena_matches(created_at DESC);

-- ============================================================================
-- ARENA PLAYERS TABLE
-- Track player state within a specific match
-- ============================================================================
CREATE TABLE IF NOT EXISTS arena_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES arena_matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES arena_teams(id) ON DELETE SET NULL,
    
    -- Player state during match
    current_problem_id VARCHAR(100), -- Currently working on
    problems_solved JSONB DEFAULT '[]', -- Array of solved problem IDs
    problems_attempted JSONB DEFAULT '[]', -- Array of attempted problem IDs
    
    -- Fog of Progress status
    activity_status VARCHAR(20) DEFAULT 'idle', -- idle, attempting, close, solved
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Locks (for 3v3)
    locked_problem_id VARCHAR(100), -- Problem this player has locked
    locked_at TIMESTAMPTZ,
    
    -- Scoring
    score INTEGER DEFAULT 0,
    penalties INTEGER DEFAULT 0, -- Time penalties for wrong submissions
    solve_times JSONB DEFAULT '{}', -- Map of problem_id -> solve time in seconds
    
    -- Streak tracking (for momentum)
    current_solve_streak INTEGER DEFAULT 0,
    
    -- Anti-cheat flags
    suspicious_events JSONB DEFAULT '[]', -- Array of flagged events
    
    -- Metadata
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_arena_players_match_id ON arena_players(match_id);
CREATE INDEX idx_arena_players_user_id ON arena_players(user_id);
CREATE INDEX idx_arena_players_match_user ON arena_players(match_id, user_id);
CREATE INDEX idx_arena_players_team_id ON arena_players(team_id);

-- ============================================================================
-- ARENA EVENTS TABLE
-- Track all events during matches for real-time updates and replay
-- ============================================================================
CREATE TABLE IF NOT EXISTS arena_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES arena_matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Event type
    event_type VARCHAR(50) NOT NULL, -- lock, solve, attempt, streak, momentum, state_change, suspicious
    
    -- Event data
    event_data JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_arena_events_match_id ON arena_events(match_id, created_at);
CREATE INDEX idx_arena_events_type ON arena_events(event_type);
CREATE INDEX idx_arena_events_user_id ON arena_events(user_id);

-- ============================================================================
-- ARENA MATCH HISTORY TABLE
-- Archive of completed matches for analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS arena_match_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Match details
    match_type VARCHAR(10) NOT NULL,
    mode VARCHAR(20) NOT NULL,
    
    -- Performance
    placement INTEGER, -- 1st, 2nd place, etc.
    score INTEGER,
    problems_solved INTEGER,
    average_solve_time INTEGER, -- in seconds
    
    -- ELO change
    elo_before INTEGER,
    elo_after INTEGER,
    elo_change INTEGER,
    
    -- Streak
    streak_achieved INTEGER,
    
    -- Metadata
    match_finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_arena_match_history_user_id ON arena_match_history(user_id, created_at DESC);
CREATE INDEX idx_arena_match_history_match_id ON arena_match_history(match_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate tier based on ELO
CREATE OR REPLACE FUNCTION get_tier_from_elo(elo INTEGER)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF elo < 1000 THEN
        RETURN 'bronze';
    ELSIF elo < 1200 THEN
        RETURN 'silver';
    ELSIF elo < 1400 THEN
        RETURN 'gold';
    ELSIF elo < 1600 THEN
        RETURN 'platinum';
    ELSIF elo < 1800 THEN
        RETURN 'diamond';
    ELSE
        RETURN 'master';
    END IF;
END;
$$;

-- Function to update player tier after ELO change
CREATE OR REPLACE FUNCTION update_player_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.tier_1v1 := get_tier_from_elo(NEW.elo_1v1);
    NEW.tier_3v3 := get_tier_from_elo(NEW.elo_3v3);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_player_tier
    BEFORE UPDATE ON arena_ratings
    FOR EACH ROW
    WHEN (OLD.elo_1v1 IS DISTINCT FROM NEW.elo_1v1 OR OLD.elo_3v3 IS DISTINCT FROM NEW.elo_3v3)
    EXECUTE FUNCTION update_player_tier();

-- Function to update match updated_at timestamp
CREATE OR REPLACE FUNCTION update_match_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_match_timestamp
    BEFORE UPDATE ON arena_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_match_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Arena Ratings: Users can view all ratings but only update their own
ALTER TABLE arena_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arena_ratings_select_all"
    ON arena_ratings FOR SELECT
    USING (true); -- Public leaderboard

CREATE POLICY "arena_ratings_insert_own"
    ON arena_ratings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "arena_ratings_update_system"
    ON arena_ratings FOR UPDATE
    USING (true); -- System/Edge Functions update ratings

-- Arena Teams: Public read, system write
ALTER TABLE arena_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arena_teams_select_all"
    ON arena_teams FOR SELECT
    USING (true);

CREATE POLICY "arena_teams_insert_system"
    ON arena_teams FOR INSERT
    WITH CHECK (true); -- Edge Functions create teams

-- Arena Matches: Public read for match discovery, system write
ALTER TABLE arena_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arena_matches_select_all"
    ON arena_matches FOR SELECT
    USING (true);

CREATE POLICY "arena_matches_insert_system"
    ON arena_matches FOR INSERT
    WITH CHECK (true); -- Matchmaking system creates matches

CREATE POLICY "arena_matches_update_system"
    ON arena_matches FOR UPDATE
    USING (true); -- System updates match state

-- Arena Players: Can view players in matches they're part of
ALTER TABLE arena_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arena_players_select_own_match"
    ON arena_players FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM arena_players ap
            WHERE ap.match_id = arena_players.match_id
            AND ap.user_id = auth.uid()
        )
    );

CREATE POLICY "arena_players_insert_system"
    ON arena_players FOR INSERT
    WITH CHECK (true);

CREATE POLICY "arena_players_update_own"
    ON arena_players FOR UPDATE
    USING (user_id = auth.uid());

-- Arena Events: Can view events for matches they're in
ALTER TABLE arena_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arena_events_select_own_match"
    ON arena_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM arena_players ap
            WHERE ap.match_id = arena_events.match_id
            AND ap.user_id = auth.uid()
        )
    );

CREATE POLICY "arena_events_insert_system"
    ON arena_events FOR INSERT
    WITH CHECK (true);

-- Arena Match History: Users can only see their own history
ALTER TABLE arena_match_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arena_match_history_select_own"
    ON arena_match_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "arena_match_history_insert_system"
    ON arena_match_history FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- ARENA DAILY LIMITS TABLE
-- Track free user match limits
-- ============================================================================
CREATE TABLE IF NOT EXISTS arena_daily_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_date DATE NOT NULL DEFAULT CURRENT_DATE,
    matches_played INTEGER DEFAULT 0,
    matches_limit INTEGER DEFAULT 3, -- Free users: 3 matches/day
    
    UNIQUE(user_id, match_date)
);

CREATE INDEX idx_arena_daily_limits_user_date ON arena_daily_limits(user_id, match_date);

-- RLS for daily limits
ALTER TABLE arena_daily_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arena_daily_limits_select_own"
    ON arena_daily_limits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "arena_daily_limits_insert_own"
    ON arena_daily_limits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "arena_daily_limits_update_own"
    ON arena_daily_limits FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTION: Check if user can play ranked match
-- Free users: Limited matches, unranked only
-- Pro users: Unlimited ranked matches
-- ============================================================================
CREATE OR REPLACE FUNCTION can_play_ranked_match(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_has_pro BOOLEAN;
BEGIN
    -- Check if user has active Pro subscription
    v_has_pro := public.has_active_pro_subscription(p_user_id);
    
    RETURN v_has_pro;
END;
$$;

COMMENT ON FUNCTION can_play_ranked_match IS 
    'Returns true if user can play ranked matches (requires Pro subscription)';

-- ============================================================================
-- HELPER FUNCTION: Check daily match limit for free users
-- ============================================================================
CREATE OR REPLACE FUNCTION check_daily_match_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_has_pro BOOLEAN;
    v_matches_today INTEGER;
    v_limit INTEGER;
BEGIN
    -- Pro users have no limit
    v_has_pro := public.has_active_pro_subscription(p_user_id);
    IF v_has_pro THEN
        RETURN true;
    END IF;
    
    -- Check free user limit
    SELECT COALESCE(matches_played, 0), COALESCE(matches_limit, 3)
    INTO v_matches_today, v_limit
    FROM arena_daily_limits
    WHERE user_id = p_user_id
    AND match_date = CURRENT_DATE;
    
    -- If no record exists, user hasn't played today
    IF NOT FOUND THEN
        RETURN true;
    END IF;
    
    RETURN v_matches_today < v_limit;
END;
$$;

COMMENT ON FUNCTION check_daily_match_limit IS 
    'Returns true if user can play another match today (considers Pro status and daily limits)';

-- ============================================================================
-- SEED DATA: Initialize default arena ratings for existing users
-- ============================================================================
INSERT INTO arena_ratings (user_id)
SELECT id FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM arena_ratings WHERE user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;

