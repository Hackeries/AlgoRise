-- ============================================================================
-- ALGORISE SEED DATA (OPTIONAL)
-- ============================================================================
-- Script 4 of 4: Adds initial learning paths and sample problems
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
    source_url, author, is_active
)
VALUES
    ('codeforces', '1A', 'Theatre Square', 800, 
     ARRAY['math', 'implementation']::text[], ARRAY['easy', 'beginner-friendly']::text[],
     1000, 256,
     'Theatre Square in the capital city of Berland has a rectangular shape with the size n × m meters. What is the least number of flagstones needed to pave the Square?',
     'The input contains three positive integer numbers: n, m and a (1 ≤ n, m, a ≤ 10^9).',
     'Write the needed number of flagstones.',
     'https://codeforces.com/problemset/problem/1/A', 'Codeforces', true),
     
    ('codeforces', '4A', 'Watermelon', 800,
     ARRAY['math', 'brute-force']::text[], ARRAY['easy', 'beginner-friendly']::text[],
     1000, 256,
     'Pete and Billy want to divide a watermelon into two parts so that each part weighs an even number of kilos.',
     'The first input line contains the number w (1 ≤ w ≤ 100).',
     'Print YES if possible, otherwise print NO.',
     'https://codeforces.com/problemset/problem/4/A', 'Codeforces', true),
     
    ('leetcode', '1', 'Two Sum', 1000,
     ARRAY['hash-table', 'array']::text[], ARRAY['easy', 'arrays', 'hashing']::text[],
     1000, 256,
     'Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.',
     'nums = array of integers, target = integer',
     'Return array of two indices',
     'https://leetcode.com/problems/two-sum/', 'LeetCode', true),

    ('leetcode', '53', 'Maximum Subarray', 1200,
     ARRAY['dp', 'divide-and-conquer', 'array']::text[], ARRAY['medium', 'kadane']::text[],
     1000, 256,
     'Given an integer array nums, find the subarray with the largest sum.',
     'nums = array of integers',
     'Return the maximum sum',
     'https://leetcode.com/problems/maximum-subarray/', 'LeetCode', true)
ON CONFLICT (platform, external_id) DO UPDATE SET
    title = EXCLUDED.title,
    difficulty_rating = EXCLUDED.difficulty_rating,
    topic = EXCLUDED.topic,
    tags = EXCLUDED.tags,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc', now());

-- ======================== SUCCESS ========================
DO $$ BEGIN
    RAISE NOTICE '✅ Seed data inserted successfully!';
    RAISE NOTICE '🎉 Database setup complete!';
END $$;
