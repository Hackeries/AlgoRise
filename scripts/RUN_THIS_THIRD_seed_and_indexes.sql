-- ============================================================================
-- ALGORISE SEED DATA & PERFORMANCE INDEXES - RUN THIRD
-- ============================================================================
-- Run AFTER: RUN_THIS_SECOND_rls_and_functions.sql
-- ============================================================================

-- ======================== SEED LEARNING PATHS ========================

INSERT INTO public.learning_paths (name, description, difficulty_range_min, difficulty_range_max, level_number, topics, estimated_problems)
VALUES
  ('Level 1: Programming Basics', 'Master the fundamentals of programming and problem solving', 800, 1000, 1, ARRAY['implementation', 'math', 'brute-force', 'strings'], 20),
  ('Level 2: Basic Data Structures', 'Learn essential data structures like arrays, strings, and basic sorting', 1000, 1200, 2, ARRAY['data-structures', 'sorting', 'strings', 'implementation'], 20),
  ('Level 3: Intermediate Algorithms', 'Core algorithmic techniques including binary search and two pointers', 1200, 1400, 3, ARRAY['binary-search', 'two-pointers', 'greedy', 'prefix-sums'], 25),
  ('Level 4: Advanced Data Structures', 'Learn stacks, queues, linked lists, and trees', 1400, 1600, 4, ARRAY['stacks', 'queues', 'trees', 'recursion'], 25),
  ('Level 5: Dynamic Programming', 'Master dynamic programming patterns and techniques', 1500, 1800, 5, ARRAY['dp', 'memoization', 'tabulation'], 30),
  ('Level 6: Graph Algorithms', 'DFS, BFS, shortest paths, and graph traversals', 1600, 1900, 6, ARRAY['graphs', 'dfs-and-similar', 'bfs', 'shortest-paths'], 30),
  ('Level 7: Advanced Algorithms', 'Complex algorithmic patterns including segment trees and advanced DP', 1800, 2200, 7, ARRAY['segment-trees', 'advanced-dp', 'divide-and-conquer'], 25),
  ('Level 8: Competitive Programming Mastery', 'Expert level problems for competitive programming', 2000, 2400, 8, ARRAY['number-theory', 'geometry', 'string-algorithms', 'advanced-graphs'], 30),
  ('Level 9: Expert Challenges', 'World-class competitive programming problems', 2200, 2800, 9, ARRAY['combinatorics', 'flow-algorithms', 'advanced-data-structures'], 20),
  ('Level 10: Grandmaster Path', 'Problems for aspiring grandmasters', 2600, 3500, 10, ARRAY['research-problems', 'olympiad', 'advanced-theory'], 15)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  difficulty_range_min = EXCLUDED.difficulty_range_min,
  difficulty_range_max = EXCLUDED.difficulty_range_max,
  topics = EXCLUDED.topics,
  estimated_problems = EXCLUDED.estimated_problems;

-- ======================== SEED SAMPLE PROBLEMS ========================

INSERT INTO public.problems (
  platform, external_id, title, difficulty_rating, topic, tags,
  time_limit, memory_limit, problem_statement, input_format, output_format,
  constraints, test_cases, source_url, author, is_active
)
VALUES
  ('codeforces', '1A', 'Theatre Square', 800, 
   ARRAY['math', 'implementation']::text[], ARRAY['easy', 'beginner-friendly']::text[],
   1000, 256,
   'Theatre Square in the capital city of Berland has a rectangular shape with the size n × m meters. What is the least number of flagstones needed to pave the Square?',
   'The input contains three positive integer numbers: n, m and a (1 ≤ n, m, a ≤ 10^9).',
   'Write the needed number of flagstones.',
   '1 ≤ n, m, a ≤ 10^9',
   '[{"input": "6 6 4", "output": "4"}]'::jsonb,
   'https://codeforces.com/problemset/problem/1/A', 'Codeforces', true),
   
  ('codeforces', '4A', 'Watermelon', 800,
   ARRAY['math', 'brute-force']::text[], ARRAY['easy', 'beginner-friendly']::text[],
   1000, 256,
   'Pete and Billy want to divide a watermelon into two parts so that each part weighs an even number of kilos.',
   'The first input line contains the number w (1 ≤ w ≤ 100).',
   'Print YES if possible, otherwise print NO.',
   '1 ≤ w ≤ 100',
   '[{"input": "8", "output": "YES"}]'::jsonb,
   'https://codeforces.com/problemset/problem/4/A', 'Codeforces', true),
   
  ('leetcode', '1', 'Two Sum', 1000,
   ARRAY['hash-table', 'array']::text[], ARRAY['easy', 'arrays', 'hashing']::text[],
   1000, 256,
   'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.',
   'nums = array of integers, target = integer',
   'Return array of two indices',
   '2 ≤ nums.length ≤ 10^4',
   '[{"input": "[2,7,11,15], target=9", "output": "[0,1]"}]'::jsonb,
   'https://leetcode.com/problems/two-sum/', 'LeetCode', true),

  ('leetcode', '53', 'Maximum Subarray', 1200,
   ARRAY['dp', 'divide-and-conquer', 'array']::text[], ARRAY['medium', 'kadane']::text[],
   1000, 256,
   'Given an integer array nums, find the subarray with the largest sum.',
   'nums = array of integers',
   'Return the maximum sum',
   '1 ≤ nums.length ≤ 10^5',
   '[{"input": "[-2,1,-3,4,-1,2,1,-5,4]", "output": "6"}]'::jsonb,
   'https://leetcode.com/problems/maximum-subarray/', 'LeetCode', true)

ON CONFLICT (platform, external_id) DO UPDATE SET
  title = EXCLUDED.title,
  difficulty_rating = EXCLUDED.difficulty_rating,
  topic = EXCLUDED.topic,
  tags = EXCLUDED.tags,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc', now());

-- ======================== PERFORMANCE INDEXES ========================
-- Note: Using regular CREATE INDEX (not CONCURRENTLY) for Supabase compatibility

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_active_subscription
  ON public.profiles(id)
  WHERE subscription_status = 'active' AND subscription_plan != 'free';

CREATE INDEX IF NOT EXISTS idx_profiles_expiring_soon
  ON public.profiles(subscription_end)
  WHERE subscription_status = 'active' AND subscription_end IS NOT NULL;

-- Streaks indexes
CREATE INDEX IF NOT EXISTS idx_streaks_leaderboard
  ON public.streaks(current_streak DESC, longest_streak DESC);

-- Problems indexes
CREATE INDEX IF NOT EXISTS idx_problems_difficulty_active_platform
  ON public.problems(difficulty_rating, platform)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_problems_popular
  ON public.problems(solved_count DESC)
  WHERE is_active = true AND solved_count > 0;

-- User problems indexes
CREATE INDEX IF NOT EXISTS idx_user_problems_user_solved
  ON public.user_problems(user_id)
  WHERE status = 'solved';

CREATE INDEX IF NOT EXISTS idx_user_problems_revision_due
  ON public.user_problems(user_id, next_revision_at)
  WHERE next_revision_at IS NOT NULL;

-- Problem attempts indexes
CREATE INDEX IF NOT EXISTS idx_problem_attempts_user_recent
  ON public.problem_attempts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_problem_attempts_solved
  ON public.problem_attempts(user_id, rating)
  WHERE status = 'solved';

-- User topic mastery indexes
CREATE INDEX IF NOT EXISTS idx_user_topic_mastery_weak
  ON public.user_topic_mastery(user_id, success_rate)
  WHERE success_rate < 0.5 AND problems_attempted >= 5;

-- Contests indexes
CREATE INDEX IF NOT EXISTS idx_contests_upcoming_public
  ON public.contests(starts_at)
  WHERE visibility = 'public' AND status IN ('upcoming', 'draft');

CREATE INDEX IF NOT EXISTS idx_contests_running
  ON public.contests(ends_at)
  WHERE status = 'running';

-- Contest participants indexes
CREATE INDEX IF NOT EXISTS idx_contest_participants_contest
  ON public.contest_participants(contest_id, joined_at);

-- Contest results indexes
CREATE INDEX IF NOT EXISTS idx_contest_results_ranking
  ON public.contest_results(contest_id, rank);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_active
  ON public.subscriptions(user_id)
  WHERE status = 'active';

-- CF snapshots indexes
CREATE INDEX IF NOT EXISTS idx_cf_snapshots_user_history
  ON public.cf_snapshots(user_id, fetched_at DESC);

CREATE INDEX IF NOT EXISTS idx_cf_snapshots_rating_dist
  ON public.cf_snapshots(rating)
  WHERE rating IS NOT NULL;

-- Learning paths indexes
CREATE INDEX IF NOT EXISTS idx_learning_paths_level_active
  ON public.learning_paths(level_number)
  WHERE is_active = true;

-- User learning path progress indexes
CREATE INDEX IF NOT EXISTS idx_user_learning_path_progress_active
  ON public.user_learning_path_progress(user_id, completion_percentage)
  WHERE status = 'in_progress';

-- Problem recommendations indexes
CREATE INDEX IF NOT EXISTS idx_problem_recommendations_pending
  ON public.problem_recommendations(user_id, priority_score DESC)
  WHERE status = 'pending';

-- Spaced repetition indexes
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_due_today
  ON public.spaced_repetition_reviews(user_id, next_review_at)
  WHERE status = 'active';

-- ======================== SUCCESS MESSAGE ========================
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data and performance indexes created successfully!';
  RAISE NOTICE '🎉 Database setup complete! Your AlgoRise database is ready.';
END $$;