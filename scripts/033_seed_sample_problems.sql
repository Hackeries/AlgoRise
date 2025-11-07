-- =============================================================================
-- Seed Sample Problems & Hints (Idempotent, CTE scoping fixed)
-- -----------------------------------------------------------------------------
-- Fixes:
--   * Previous error: relation "hint_rows" does not exist (CTE scope ended after first INSERT).
--   * Re-declare CTEs for each INSERT needing them.
--   * Keeps UPSERT logic and UTC timestamps.
--   * Safe to re-run; updates existing rows, upserts hints.
-- =============================================================================

BEGIN;

-- ---- Safety: ensure base tables exist ----
DO $$
BEGIN
  IF to_regclass('public.problems') IS NULL THEN
    RAISE EXCEPTION 'Table public.problems does not exist. Run schema migration first.';
  END IF;
  IF to_regclass('public.problem_hints') IS NULL THEN
    RAISE EXCEPTION 'Table public.problem_hints does not exist. Run schema migration first.';
  END IF;
END$$;

-- ---- Upsert: Codeforces 1234A ----
INSERT INTO public.problems (
  platform,
  external_id,
  title,
  difficulty_rating,
  topic,
  tags,
  time_limit,
  memory_limit,
  problem_statement,
  input_format,
  output_format,
  constraints,
  test_cases,
  hidden_test_cases,
  source_url,
  author,
  contest_name,
  is_active,
  created_at,
  updated_at
)
VALUES (
  'codeforces',
  '1234A',
  'Two Arrays and Swaps',
  800,
  ARRAY['greedy','sorting']::text[],
  ARRAY['easy','beginner-friendly']::text[],
  1000,
  256,
  '<p>You are given two arrays <code>a</code> and <code>b</code>, each consisting of <code>n</code> positive integers, and an integer <code>k</code>.</p>
<p>You can perform at most <code>k</code> operations. In one operation you can choose two indices <code>i</code> and <code>j</code> and swap <code>a[i]</code> with <code>b[j]</code>.</p>
<p>Your task is to find the maximum possible sum of all elements in array <code>a</code> after performing at most <code>k</code> swaps.</p>',
  '<p>The first line contains a single integer <code>t</code> — the number of test cases.</p>
<p>Each test case consists of three lines:</p>
<ul>
<li>The first line contains two integers <code>n</code> and <code>k</code></li>
<li>The second line contains <code>n</code> integers <code>a[1], a[2], ..., a[n]</code></li>
<li>The third line contains <code>n</code> integers <code>b[1], b[2], ..., b[n]</code></li>
</ul>',
  '<p>For each test case, print a single integer — the maximum possible sum of all elements in array <code>a</code>.</p>',
  '<ul>
<li>1 ≤ t ≤ 1000</li>
<li>1 ≤ n ≤ 30</li>
<li>0 ≤ k ≤ n</li>
<li>1 ≤ a[i], b[i] ≤ 100</li>
</ul>',
  '[
    {
      "input": "3\\n3 2\\n1 2 3\\n4 5 6\\n5 3\\n5 4 3 2 1\\n1 2 3 4 5\\n2 0\\n10 20\\n30 40",
      "output": "15\\n17\\n30",
      "explanation": "Swap smallest elements of A with largest elements of B for maximum sum."
    }
  ]'::jsonb,
  '[]'::jsonb,
  'https://codeforces.com/problemset/problem/1234/A',
  'Codeforces',
  'Contest 1234',
  TRUE,
  timezone('utc', now()),
  timezone('utc', now())
)
ON CONFLICT (platform, external_id) DO UPDATE SET
  title                  = EXCLUDED.title,
  difficulty_rating      = EXCLUDED.difficulty_rating,
  topic                  = EXCLUDED.topic,
  tags                   = EXCLUDED.tags,
  problem_statement      = EXCLUDED.problem_statement,
  input_format           = EXCLUDED.input_format,
  output_format          = EXCLUDED.output_format,
  constraints            = EXCLUDED.constraints,
  test_cases             = EXCLUDED.test_cases,
  source_url             = EXCLUDED.source_url,
  is_active              = EXCLUDED.is_active,
  updated_at             = timezone('utc', now());

-- ---- Upsert: LeetCode Two Sum (ID 1) ----
INSERT INTO public.problems (
  platform,
  external_id,
  title,
  difficulty_rating,
  topic,
  tags,
  time_limit,
  memory_limit,
  problem_statement,
  input_format,
  output_format,
  constraints,
  test_cases,
  hidden_test_cases,
  source_url,
  author,
  contest_name,
  is_active,
  created_at,
  updated_at
)
VALUES (
  'leetcode',
  '1',
  'Two Sum',
  1000,
  ARRAY['hash-table','array']::text[],
  ARRAY['easy','arrays','hashing']::text[],
  1000,
  256,
  '<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
<p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
<p>You can return the answer in any order.</p>',
  '<p>Two lines:</p>
<ul>
<li>First line: space-separated array of integers</li>
<li>Second line: the target integer</li>
</ul>',
  '<p>Two space-separated integers representing the indices (0-indexed).</p>',
  '<ul>
<li>2 ≤ nums.length ≤ 10^4</li>
<li>-10^9 ≤ nums[i] ≤ 10^9</li>
<li>-10^9 ≤ target ≤ 10^9</li>
<li>Only one valid answer exists</li>
</ul>',
  '[
    {
      "input": "2 7 11 15\\n9",
      "output": "0 1",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
  ]'::jsonb,
  '[]'::jsonb,
  'https://leetcode.com/problems/two-sum/',
  'LeetCode',
  NULL,
  TRUE,
  timezone('utc', now()),
  timezone('utc', now())
)
ON CONFLICT (platform, external_id) DO UPDATE SET
  title                  = EXCLUDED.title,
  difficulty_rating      = EXCLUDED.difficulty_rating,
  topic                  = EXCLUDED.topic,
  tags                   = EXCLUDED.tags,
  problem_statement      = EXCLUDED.problem_statement,
  input_format           = EXCLUDED.input_format,
  output_format          = EXCLUDED.output_format,
  constraints            = EXCLUDED.constraints,
  test_cases             = EXCLUDED.test_cases,
  source_url             = EXCLUDED.source_url,
  is_active              = EXCLUDED.is_active,
  updated_at             = timezone('utc', now());

-- ---- Hints for Codeforces 1234A (Two Arrays and Swaps) ----
WITH target_problem AS (
  SELECT id FROM public.problems
   WHERE platform = 'codeforces' AND external_id = '1234A'
),
hint_rows AS (
  SELECT id AS problem_id FROM target_problem
)
INSERT INTO public.problem_hints (problem_id, level, hint_type, content, created_at)
SELECT problem_id, 1, 'restatement',
       '<p><strong>Idea:</strong> Replace small elements in A with large ones from B up to k swaps.</p>',
       timezone('utc', now())
FROM hint_rows
ON CONFLICT (problem_id, level) DO UPDATE SET
  hint_type = EXCLUDED.hint_type,
  content   = EXCLUDED.content;

-- Second hint (needs its own CTE scope again)
WITH target_problem AS (
  SELECT id FROM public.problems
   WHERE platform = 'codeforces' AND external_id = '1234A'
),
hint_rows AS (
  SELECT id AS problem_id FROM target_problem
)
INSERT INTO public.problem_hints (problem_id, level, hint_type, content, created_at)
SELECT problem_id, 2, 'algorithm',
       '<p><strong>Greedy:</strong> Sort A ascending, B descending. For i = 0..k-1 swap if B[i] &gt; A[i].</p>',
       timezone('utc', now())
FROM hint_rows
ON CONFLICT (problem_id, level) DO UPDATE SET
  hint_type = EXCLUDED.hint_type,
  content   = EXCLUDED.content;

COMMIT;

-- =============================================================================
-- Notes:
-- * Safe to re-run. Uses ON CONFLICT for problems & hints.
-- * Extend with more seeds in separate migration files to keep diffs small.
-- =============================================================================