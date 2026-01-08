-- ============================================================================
-- ALGORISE PERFORMANCE INDEXES - Production Ready (50k+ Users)
-- ============================================================================
-- Description: Additional indexes optimized for 50k+ user scale
-- Run AFTER: 000_master_schema.sql, 005_sync_legacy_schema.sql
-- 
-- NOTE: Do NOT wrap in BEGIN/COMMIT - CREATE INDEX CONCURRENTLY cannot run
--       inside a transaction block. Run each statement individually.
--
-- OPTIMIZATION TARGETS:
-- - Dashboard queries (user stats, streaks, progress)
-- - Leaderboards and rankings
-- - Problem discovery and filtering
-- - Group and contest lookups
-- - Subscription and payment queries
-- ============================================================================

-- BEGIN; -- Removed: CONCURRENTLY indexes cannot run in transactions

-- ======================== PROFILES - HIGH TRAFFIC ========================

-- Fast user lookup by subscription status (for feature gating)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_active_subscription
  ON public.profiles(id)
  WHERE subscription_status = 'active' AND subscription_plan != 'free';

-- Expiring subscriptions (for cron jobs)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_expiring_soon
  ON public.profiles(subscription_end)
  WHERE subscription_status = 'active' AND subscription_end IS NOT NULL;

-- College-based user discovery
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_college_active
  ON public.profiles(college_id)
  WHERE college_id IS NOT NULL;

-- ======================== STREAKS - LEADERBOARDS ========================

-- Streak leaderboards (sorted by current streak)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_streaks_leaderboard
  ON public.streaks(current_streak DESC, longest_streak DESC);

-- Active users in last 7 days (for engagement metrics)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_streaks_recent_activity
  ON public.streaks(last_active_day DESC)
  WHERE last_active_day >= CURRENT_DATE - INTERVAL '7 days';

-- ======================== PROBLEMS - DISCOVERY ========================

-- Problem discovery by difficulty (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_difficulty_active_platform
  ON public.problems(difficulty_rating, platform)
  WHERE is_active = true;

-- Topic-based problem search with rating
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_topic_rating
  ON public.problems USING gin(topic)
  WHERE is_active = true;

-- Popular problems (by solve count)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_popular
  ON public.problems(solved_count DESC)
  WHERE is_active = true AND solved_count > 0;

-- ======================== USER_PROBLEMS - PROGRESS TRACKING ========================

-- User's solved problems count (dashboard widget)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_problems_user_solved
  ON public.user_problems(user_id)
  WHERE status = 'solved';

-- Revision due (spaced repetition)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_problems_revision_due
  ON public.user_problems(user_id, next_revision_at)
  WHERE next_revision_at IS NOT NULL AND next_revision_at <= CURRENT_TIMESTAMP;

-- Platform-specific progress
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_problems_platform_status
  ON public.user_problems(user_id, platform, status);

-- ======================== PROBLEM_ATTEMPTS - ANALYTICS ========================

-- User's recent attempts (activity feed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problem_attempts_user_recent
  ON public.problem_attempts(user_id, created_at DESC);

-- Successful attempts for skill calculation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problem_attempts_solved
  ON public.problem_attempts(user_id, rating)
  WHERE status = 'solved';

-- Daily activity (for streak calculation)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problem_attempts_daily
  ON public.problem_attempts(user_id, (started_at::date));

-- ======================== USER_TOPIC_MASTERY - SKILL ANALYSIS ========================

-- Weak topics identification (for recommendations)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_topic_mastery_weak
  ON public.user_topic_mastery(user_id, success_rate)
  WHERE success_rate < 0.5 AND problems_attempted >= 5;

-- Strong topics (for difficulty progression)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_topic_mastery_strong
  ON public.user_topic_mastery(user_id, success_rate DESC)
  WHERE success_rate >= 0.7 AND problems_attempted >= 10;

-- ======================== USER_SKILL_PROFILES - MATCHMAKING ========================

-- Skill-based matchmaking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_skill_profiles_level
  ON public.user_skill_profiles(current_skill_level);

-- Active users for matchmaking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_skill_profiles_active
  ON public.user_skill_profiles(current_skill_level, last_activity_at DESC)
  WHERE last_activity_at >= CURRENT_TIMESTAMP - INTERVAL '7 days';

-- ======================== PROBLEM_RECOMMENDATIONS - FEED ========================

-- Pending recommendations for user (home feed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problem_recommendations_pending
  ON public.problem_recommendations(user_id, priority_score DESC)
  WHERE status = 'pending' AND expires_at > CURRENT_TIMESTAMP;

-- ======================== SPACED_REPETITION_REVIEWS - DUE ITEMS ========================

-- Due reviews for today (notification/reminder system)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_spaced_repetition_due_today
  ON public.spaced_repetition_reviews(user_id, next_review_at)
  WHERE status = 'active' AND next_review_at <= CURRENT_TIMESTAMP + INTERVAL '1 day';

-- ======================== GROUPS - DISCOVERY ========================

-- College groups discovery
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_groups_college_type
  ON public.groups(college_id, type)
  WHERE type = 'college';

-- User's groups (sidebar widget)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_user_groups
  ON public.group_memberships(user_id, created_at DESC);

-- Group admin lookup (for permissions)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_admins
  ON public.group_memberships(group_id)
  WHERE role = 'admin';

-- ======================== GROUP_CHALLENGES - ACTIVE CHALLENGES ========================

-- Active challenges for group
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_challenges_active
  ON public.group_challenges(group_id, end_date)
  WHERE status = 'active';

-- User's challenge progress
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_challenge_progress_user
  ON public.group_challenge_progress(user_id, completed);

-- ======================== CONTESTS - DISCOVERY ========================

-- Upcoming public contests
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contests_upcoming_public
  ON public.contests(starts_at)
  WHERE visibility = 'public' AND status IN ('upcoming', 'draft');

-- Running contests
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contests_running
  ON public.contests(ends_at)
  WHERE status = 'running';

-- User's hosted contests
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contests_host
  ON public.contests(host_user_id, created_at DESC);

-- ======================== CONTEST_PARTICIPANTS - LEADERBOARDS ========================

-- Contest participants count
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contest_participants_contest
  ON public.contest_participants(contest_id, joined_at);

-- User's participated contests
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contest_participants_user
  ON public.contest_participants(user_id, joined_at DESC);

-- ======================== CONTEST_RESULTS - RANKINGS ========================

-- Contest leaderboard
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contest_results_ranking
  ON public.contest_results(contest_id, rank);

-- User's contest history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contest_results_user
  ON public.contest_results(user_id, computed_at DESC);

-- ======================== SUBSCRIPTIONS - BILLING ========================

-- Active subscriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_active
  ON public.subscriptions(user_id)
  WHERE status = 'active';

-- Expiring subscriptions (for renewal reminders)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_expiring
  ON public.subscriptions(end_date)
  WHERE status = 'active' AND end_date IS NOT NULL;

-- Payment lookup by order
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_order_payment
  ON public.subscriptions(order_id, payment_id);

-- ======================== CF_HANDLES - VERIFICATION ========================

-- Verified handles lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cf_handles_verified_handle
  ON public.cf_handles(lower(handle))
  WHERE verified = true;

-- ======================== CF_SNAPSHOTS - HISTORY ========================

-- User's rating history
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cf_snapshots_user_history
  ON public.cf_snapshots(user_id, fetched_at DESC);

-- Rating distribution (for analytics)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cf_snapshots_rating_dist
  ON public.cf_snapshots(rating)
  WHERE rating IS NOT NULL;

-- ======================== USER_SHEETS - PROGRESS ========================

-- User's active sheets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sheets_user_progress
  ON public.user_sheets(user_id, sheet_id);

-- ======================== LEARNING PATHS - DISCOVERY ========================

-- Active paths by level
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_learning_paths_level_active
  ON public.learning_paths(level_number)
  WHERE is_active = true;

-- ======================== USER_LEARNING_PATH_PROGRESS - TRACKING ========================

-- User's active paths
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_learning_path_progress_active
  ON public.user_learning_path_progress(user_id, completion_percentage)
  WHERE status = 'in_progress';

-- COMMIT; -- Removed: CONCURRENTLY indexes cannot run in transactions

-- ============================================================================
-- ANALYZE TABLES (Run after index creation for query planner)
-- ============================================================================
-- ANALYZE public.profiles;
-- ANALYZE public.streaks;
-- ANALYZE public.problems;
-- ANALYZE public.user_problems;
-- ANALYZE public.problem_attempts;
-- ANALYZE public.user_topic_mastery;
-- ANALYZE public.user_skill_profiles;
-- ANALYZE public.groups;
-- ANALYZE public.group_memberships;
-- ANALYZE public.contests;
-- ANALYZE public.subscriptions;

-- ============================================================================
-- END OF PERFORMANCE INDEXES
-- ============================================================================
