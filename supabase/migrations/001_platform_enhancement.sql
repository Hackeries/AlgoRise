-- AlgoRise Platform Enhancement Migration
-- Version: 001
-- Description: Add AI usage logs, achievements, leaderboards, and analytics tables

-- ============================================================================
-- AI Usage Logs Table
-- Track AI feature usage for analytics and cost optimization
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'hint', 'tutor', 'analyze', 'debug'
    metadata JSONB DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    cached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_type ON ai_usage_logs(type);
CREATE INDEX idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);

-- RLS Policies for AI usage logs
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI usage logs"
    ON ai_usage_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage logs"
    ON ai_usage_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Achievements/Badges Table
-- Gamification system for user engagement
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- Icon identifier for the frontend
    category VARCHAR(50) NOT NULL, -- 'streak', 'problems', 'contests', 'learning'
    tier VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
    points INTEGER DEFAULT 10,
    requirement_type VARCHAR(50), -- 'count', 'streak', 'rating', 'custom'
    requirement_value INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial achievements
INSERT INTO achievements (id, name, description, icon, category, tier, points, requirement_type, requirement_value) VALUES
    ('streak_7', '7-Day Warrior', 'Maintain a 7-day streak', 'flame', 'streak', 'bronze', 10, 'streak', 7),
    ('streak_30', 'Month of Dedication', 'Maintain a 30-day streak', 'flame', 'streak', 'silver', 50, 'streak', 30),
    ('streak_100', 'Century Achiever', 'Maintain a 100-day streak', 'flame', 'streak', 'gold', 200, 'streak', 100),
    ('problems_10', 'Problem Solver', 'Solve 10 problems', 'code', 'problems', 'bronze', 10, 'count', 10),
    ('problems_50', 'Code Warrior', 'Solve 50 problems', 'code', 'problems', 'silver', 50, 'count', 50),
    ('problems_100', 'Algorithm Master', 'Solve 100 problems', 'code', 'problems', 'gold', 100, 'count', 100),
    ('problems_500', 'Coding Legend', 'Solve 500 problems', 'code', 'problems', 'platinum', 500, 'count', 500),
    ('first_contest', 'Contest Debut', 'Participate in your first contest', 'trophy', 'contests', 'bronze', 15, 'count', 1),
    ('top_100', 'Top 100', 'Finish in top 100 in a contest', 'medal', 'contests', 'gold', 100, 'custom', 100),
    ('topic_master', 'Topic Master', 'Complete a topic with 100% mastery', 'graduation-cap', 'learning', 'silver', 30, 'custom', 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- User Achievements Table
-- Track which achievements each user has earned
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_earned_at ON user_achievements(earned_at);

-- RLS Policies
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Leaderboard Table (Materialized for performance)
-- Updated periodically via cron or on user activity
-- ============================================================================
CREATE TABLE IF NOT EXISTS leaderboard (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100),
    avatar_url TEXT,
    total_score INTEGER DEFAULT 0,
    problems_solved INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    achievements_count INTEGER DEFAULT 0,
    rating INTEGER DEFAULT 0,
    rank INTEGER,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_total_score ON leaderboard(total_score DESC);
CREATE INDEX idx_leaderboard_problems_solved ON leaderboard(problems_solved DESC);
CREATE INDEX idx_leaderboard_current_streak ON leaderboard(current_streak DESC);
CREATE INDEX idx_leaderboard_rating ON leaderboard(rating DESC);

-- RLS Policies (Leaderboard is public)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard is publicly viewable"
    ON leaderboard FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own leaderboard entry"
    ON leaderboard FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leaderboard entry"
    ON leaderboard FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Topic Mastery Table
-- Track user progress on different topics
-- ============================================================================
CREATE TABLE IF NOT EXISTS topic_mastery (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_slug VARCHAR(100) NOT NULL,
    topic_name VARCHAR(200),
    problems_attempted INTEGER DEFAULT 0,
    problems_solved INTEGER DEFAULT 0,
    mastery_percentage DECIMAL(5,2) DEFAULT 0,
    last_practiced TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, topic_slug)
);

CREATE INDEX idx_topic_mastery_user_id ON topic_mastery(user_id);
CREATE INDEX idx_topic_mastery_topic_slug ON topic_mastery(topic_slug);

-- RLS Policies
ALTER TABLE topic_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own topic mastery"
    ON topic_mastery FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own topic mastery"
    ON topic_mastery FOR ALL
    USING (auth.uid() = user_id);

-- ============================================================================
-- Daily Challenges Table
-- Store daily challenge problems
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    challenge_date DATE NOT NULL UNIQUE,
    problem_id VARCHAR(100) NOT NULL,
    problem_title VARCHAR(200),
    problem_url TEXT,
    difficulty VARCHAR(20), -- 'easy', 'medium', 'hard'
    topic VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_challenges_date ON daily_challenges(challenge_date);

-- ============================================================================
-- Daily Challenge Completions
-- Track who completed daily challenges
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_challenge_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    time_taken_seconds INTEGER,
    UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_daily_completions_user ON daily_challenge_completions(user_id);
CREATE INDEX idx_daily_completions_challenge ON daily_challenge_completions(challenge_id);

-- RLS Policies
ALTER TABLE daily_challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own completions"
    ON daily_challenge_completions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
    ON daily_challenge_completions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Analytics Events Table
-- Track user events for analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50), -- 'engagement', 'learning', 'feature', 'conversion'
    properties JSONB DEFAULT '{}',
    session_id VARCHAR(100),
    page_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_category ON analytics_events(event_category);

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analytics events"
    ON analytics_events FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================================
-- Function to update leaderboard ranks
-- ============================================================================
CREATE OR REPLACE FUNCTION update_leaderboard_ranks()
RETURNS void AS $$
BEGIN
    WITH ranked AS (
        SELECT 
            user_id,
            ROW_NUMBER() OVER (ORDER BY total_score DESC, problems_solved DESC, current_streak DESC) as new_rank
        FROM leaderboard
    )
    UPDATE leaderboard l
    SET rank = r.new_rank, updated_at = NOW()
    FROM ranked r
    WHERE l.user_id = r.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Function to check and award achievements
-- Note: This function depends on the 'streaks' table which should already exist
-- ============================================================================
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS TABLE(achievement_id VARCHAR, achievement_name VARCHAR) AS $$
DECLARE
    user_streak INTEGER := 0;
    user_problems INTEGER := 0;
    achievement RECORD;
BEGIN
    -- Get user streak stats (if streaks table exists)
    BEGIN
        SELECT COALESCE(current_streak, 0)
        INTO user_streak
        FROM streaks WHERE user_id = p_user_id;
    EXCEPTION WHEN undefined_table THEN
        user_streak := 0;
    END;

    -- Get user problems solved from leaderboard
    SELECT COALESCE(problems_solved, 0)
    INTO user_problems
    FROM leaderboard WHERE user_id = p_user_id;

    -- Check streak achievements
    FOR achievement IN 
        SELECT a.id, a.name, a.requirement_value
        FROM achievements a
        WHERE a.requirement_type = 'streak'
        AND NOT EXISTS (
            SELECT 1 FROM user_achievements ua 
            WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
        )
    LOOP
        IF user_streak >= achievement.requirement_value THEN
            INSERT INTO user_achievements (user_id, achievement_id)
            VALUES (p_user_id, achievement.id)
            ON CONFLICT DO NOTHING;
            
            achievement_id := achievement.id;
            achievement_name := achievement.name;
            RETURN NEXT;
        END IF;
    END LOOP;

    -- Check problem count achievements
    FOR achievement IN 
        SELECT a.id, a.name, a.requirement_value
        FROM achievements a
        WHERE a.requirement_type = 'count' AND a.category = 'problems'
        AND NOT EXISTS (
            SELECT 1 FROM user_achievements ua 
            WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
        )
    LOOP
        IF user_problems >= achievement.requirement_value THEN
            INSERT INTO user_achievements (user_id, achievement_id)
            VALUES (p_user_id, achievement.id)
            ON CONFLICT DO NOTHING;
            
            achievement_id := achievement.id;
            achievement_name := achievement.name;
            RETURN NEXT;
        END IF;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
