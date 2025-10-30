-- Seed sample problems for testing the problem sourcing system
-- This demonstrates the structure but in production, problems should be imported from actual platforms

-- Insert sample Codeforces problems
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
  source_url,
  is_active
) VALUES
(
  'codeforces',
  '1234A',
  'Two Arrays and Swaps',
  800,
  ARRAY['greedy', 'sorting'],
  ARRAY['easy', 'beginner-friendly'],
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
  'https://codeforces.com/problemset/problem/1234/A',
  true
),
(
  'leetcode',
  '1',
  'Two Sum',
  1000,
  ARRAY['hash-table', 'array'],
  ARRAY['easy', 'arrays', 'hashing'],
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
  'https://leetcode.com/problems/two-sum/',
  true
);

-- Insert hints for "Two Arrays and Swaps"
INSERT INTO public.problem_hints (problem_id, level, hint_type, content)
SELECT 
  p.id, 1, 'restatement',
  '<p><strong>Simplified:</strong> Replace smallest elements in A with largest in B to maximize sum.</p>'
FROM public.problems p WHERE p.external_id = '1234A' AND p.platform = 'codeforces';

INSERT INTO public.problem_hints (problem_id, level, hint_type, content)
SELECT 
  p.id, 2, 'algorithm',
  '<p><strong>Use greedy + sorting:</strong> Sort A ascending, B descending. Swap k times if beneficial.</p>'
FROM public.problems p WHERE p.external_id = '1234A' AND p.platform = 'codeforces';
