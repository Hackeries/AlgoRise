-- ============================================================================
-- ALGORISE SEED DATA - Production Ready (50k+ Users)
-- ============================================================================
-- Description: Seed data for colleges, companies, learning paths, and sample problems
-- Run AFTER: 000_master_schema.sql, 001_rls_policies.sql, 002_functions.sql
-- 
-- OPTIMIZED FOR:
-- - Batch inserts for performance
-- - Idempotent operations (safe to re-run)
-- - No conflicts on re-runs
-- ============================================================================

BEGIN;

-- ======================== SEED COLLEGES ========================

WITH seeds(name, country) AS (
  VALUES
    -- IITs
    ('Indian Institute of Technology Bombay', 'India'),
    ('Indian Institute of Technology Delhi', 'India'),
    ('Indian Institute of Technology Madras', 'India'),
    ('Indian Institute of Technology Kanpur', 'India'),
    ('Indian Institute of Technology Kharagpur', 'India'),
    ('Indian Institute of Technology Roorkee', 'India'),
    ('Indian Institute of Technology Guwahati', 'India'),
    ('Indian Institute of Technology Hyderabad', 'India'),
    ('Indian Institute of Technology Indore', 'India'),
    ('Indian Institute of Technology Bhubaneswar', 'India'),
    ('Indian Institute of Technology Gandhinagar', 'India'),
    ('Indian Institute of Technology Patna', 'India'),
    ('Indian Institute of Technology Ropar', 'India'),
    ('Indian Institute of Technology Mandi', 'India'),
    ('Indian Institute of Technology Jodhpur', 'India'),
    ('Indian Institute of Technology (BHU) Varanasi', 'India'),
    ('Indian Institute of Technology Palakkad', 'India'),
    ('Indian Institute of Technology Tirupati', 'India'),
    ('Indian Institute of Technology Dhanbad', 'India'),
    ('Indian Institute of Technology Bhilai', 'India'),
    ('Indian Institute of Technology Goa', 'India'),
    ('Indian Institute of Technology Jammu', 'India'),
    ('Indian Institute of Technology Dharwad', 'India'),
    
    -- NITs
    ('National Institute of Technology Tiruchirappalli', 'India'),
    ('National Institute of Technology Karnataka Surathkal', 'India'),
    ('National Institute of Technology Rourkela', 'India'),
    ('National Institute of Technology Warangal', 'India'),
    ('National Institute of Technology Calicut', 'India'),
    ('National Institute of Technology Durgapur', 'India'),
    ('National Institute of Technology Jamshedpur', 'India'),
    ('National Institute of Technology Kurukshetra', 'India'),
    ('National Institute of Technology Silchar', 'India'),
    ('National Institute of Technology Hamirpur', 'India'),
    ('National Institute of Technology Jalandhar', 'India'),
    ('National Institute of Technology Raipur', 'India'),
    ('National Institute of Technology Agartala', 'India'),
    ('National Institute of Technology Patna', 'India'),
    ('National Institute of Technology Srinagar', 'India'),
    ('National Institute of Technology Meghalaya', 'India'),
    ('National Institute of Technology Nagaland', 'India'),
    ('National Institute of Technology Arunachal Pradesh', 'India'),
    ('National Institute of Technology Mizoram', 'India'),
    ('National Institute of Technology Sikkim', 'India'),
    ('National Institute of Technology Delhi', 'India'),
    ('National Institute of Technology Goa', 'India'),
    ('National Institute of Technology Puducherry', 'India'),
    ('National Institute of Technology Uttarakhand', 'India'),
    ('National Institute of Technology Andhra Pradesh', 'India'),
    ('National Institute of Technology Manipur', 'India'),
    ('Sardar Vallabhbhai National Institute of Technology Surat', 'India'),
    ('Maulana Azad National Institute of Technology Bhopal', 'India'),
    ('Visvesvaraya National Institute of Technology Nagpur', 'India'),
    ('Motilal Nehru National Institute of Technology Allahabad', 'India'),
    
    -- IIITs
    ('International Institute of Information Technology Hyderabad', 'India'),
    ('International Institute of Information Technology Bangalore', 'India'),
    ('Indian Institute of Information Technology Allahabad', 'India'),
    ('Indian Institute of Information Technology Gwalior', 'India'),
    ('Indian Institute of Information Technology Jabalpur', 'India'),
    ('Indian Institute of Information Technology Kota', 'India'),
    ('Indian Institute of Information Technology Vadodara', 'India'),
    ('Indian Institute of Information Technology Lucknow', 'India'),
    ('Indian Institute of Information Technology Kancheepuram', 'India'),
    ('Indian Institute of Information Technology Guwahati', 'India'),
    ('Indian Institute of Information Technology Kalyani', 'India'),
    ('Indian Institute of Information Technology Una', 'India'),
    ('Indian Institute of Information Technology Sonepat', 'India'),
    ('Indian Institute of Information Technology Nagpur', 'India'),
    ('Indian Institute of Information Technology Pune', 'India'),
    ('Indian Institute of Information Technology Ranchi', 'India'),
    ('Indian Institute of Information Technology Sri City', 'India'),
    ('Indian Institute of Information Technology Tiruchirappalli', 'India'),
    ('Indian Institute of Information Technology Dharwad', 'India'),
    ('Indian Institute of Information Technology Kottayam', 'India'),
    ('Indian Institute of Information Technology Manipur', 'India'),
    ('Indian Institute of Information Technology Bhagalpur', 'India'),
    ('Indian Institute of Information Technology Bhopal', 'India'),
    ('Indian Institute of Information Technology Surat', 'India'),
    
    -- IIMs
    ('Indian Institute of Management Ahmedabad', 'India'),
    ('Indian Institute of Management Bangalore', 'India'),
    ('Indian Institute of Management Calcutta', 'India'),
    ('Indian Institute of Management Lucknow', 'India'),
    ('Indian Institute of Management Indore', 'India'),
    ('Indian Institute of Management Kozhikode', 'India'),
    
    -- BITS
    ('Birla Institute of Technology and Science Pilani', 'India'),
    ('Birla Institute of Technology and Science Goa', 'India'),
    ('Birla Institute of Technology and Science Hyderabad', 'India'),
    
    -- Delhi institutions
    ('Delhi Technological University', 'India'),
    ('Netaji Subhas University of Technology', 'India'),
    ('Indraprastha Institute of Information Technology Delhi', 'India'),
    ('Jamia Millia Islamia', 'India'),
    ('Indian Statistical Institute Delhi', 'India'),
    
    -- Premier private institutions
    ('Vellore Institute of Technology', 'India'),
    ('Manipal Institute of Technology', 'India'),
    ('SRM Institute of Science and Technology', 'India'),
    ('Amity University', 'India'),
    ('Lovely Professional University', 'India'),
    ('Shiv Nadar University', 'India'),
    ('Ashoka University', 'India'),
    ('FLAME University', 'India'),
    ('OP Jindal Global University', 'India'),
    ('Symbiosis International University', 'India'),
    
    -- State universities and colleges
    ('Jadavpur University', 'India'),
    ('Anna University', 'India'),
    ('Pune Institute of Computer Technology', 'India'),
    ('College of Engineering Pune', 'India'),
    ('PSG College of Technology', 'India'),
    ('Thapar Institute of Engineering and Technology', 'India'),
    ('PES University', 'India'),
    ('BMS College of Engineering', 'India'),
    ('RV College of Engineering', 'India'),
    ('Ramaiah Institute of Technology', 'India'),
    ('Dayananda Sagar College of Engineering', 'India'),
    ('Aligarh Muslim University', 'India'),
    ('Banaras Hindu University', 'India'),
    ('University of Hyderabad', 'India'),
    ('Jawaharlal Nehru University', 'India'),
    ('Osmania University', 'India'),
    ('Andhra University', 'India'),
    ('Savitribai Phule Pune University', 'India'),
    ('Mumbai University', 'India'),
    ('Calcutta University', 'India'),
    ('Madras University', 'India'),
    ('Delhi University', 'India'),
    ('Bangalore University', 'India'),
    
    -- Other option
    ('Other (Please specify)', 'India')
)
INSERT INTO public.colleges (name, country)
SELECT trim(name), trim(country)
FROM seeds
ON CONFLICT (lower(name), lower(country)) DO NOTHING;

-- ======================== SEED COMPANIES ========================

WITH seeds(name) AS (
  VALUES
    -- FAANG and Big Tech
    ('Google'),
    ('Meta'),
    ('Amazon'),
    ('Apple'),
    ('Microsoft'),
    ('Netflix'),
    ('NVIDIA'),
    ('Tesla'),
    ('OpenAI'),
    ('Anthropic'),
    
    -- Other Major Tech Companies
    ('Adobe'),
    ('Salesforce'),
    ('Oracle'),
    ('IBM'),
    ('Intel'),
    ('Qualcomm'),
    ('Cisco'),
    ('VMware'),
    ('SAP'),
    ('ServiceNow'),
    ('Workday'),
    ('Atlassian'),
    ('Twilio'),
    ('Snowflake'),
    ('Databricks'),
    ('Stripe'),
    ('Square'),
    ('Block'),
    ('Palantir'),
    
    -- Indian IT Services
    ('Tata Consultancy Services'),
    ('Infosys'),
    ('Wipro'),
    ('HCL Technologies'),
    ('Tech Mahindra'),
    ('Cognizant'),
    ('Capgemini'),
    ('Accenture'),
    ('LTI Mindtree'),
    ('Persistent Systems'),
    ('Mphasis'),
    ('Cyient'),
    ('Hexaware'),
    ('Birlasoft'),
    ('Zensar'),
    
    -- Indian Product Companies
    ('Flipkart'),
    ('Paytm'),
    ('Zomato'),
    ('Swiggy'),
    ('Ola'),
    ('PhonePe'),
    ('CRED'),
    ('Razorpay'),
    ('Freshworks'),
    ('Zoho'),
    ('InMobi'),
    ('MakeMyTrip'),
    ('Nykaa'),
    ('Meesho'),
    ('ShareChat'),
    ('Dream11'),
    ('Udaan'),
    ('BharatPe'),
    ('Groww'),
    ('Zerodha'),
    ('PolicyBazaar'),
    ('Cars24'),
    ('Ola Electric'),
    ('Dunzo'),
    ('UpGrad'),
    ('Unacademy'),
    ('Byju''s'),
    ('PhysicsWallah'),
    ('Vedantu'),
    ('Lenskart'),
    ('Urban Company'),
    ('Rapido'),
    ('OYO'),
    ('Delhivery'),
    
    -- Fintech
    ('Goldman Sachs'),
    ('Morgan Stanley'),
    ('JP Morgan'),
    ('Visa'),
    ('Mastercard'),
    ('PayPal'),
    ('Robinhood'),
    ('Coinbase'),
    
    -- E-commerce
    ('Shopify'),
    ('eBay'),
    ('Walmart'),
    ('Instacart'),
    ('DoorDash'),
    
    -- Social Media & Communication
    ('Twitter'),
    ('LinkedIn'),
    ('Snap'),
    ('Pinterest'),
    ('Discord'),
    ('Slack'),
    ('Zoom'),
    
    -- Transportation
    ('Uber'),
    ('Lyft'),
    ('Airbnb'),
    
    -- Entertainment
    ('Spotify'),
    ('Disney'),
    ('Warner Bros'),
    
    -- Gaming
    ('Electronic Arts'),
    ('Activision Blizzard'),
    ('Unity Technologies'),
    ('Epic Games'),
    ('Riot Games'),
    ('Valve'),
    
    -- Consulting
    ('Deloitte'),
    ('PwC'),
    ('EY'),
    ('KPMG'),
    ('McKinsey & Company'),
    ('Boston Consulting Group'),
    ('Bain & Company'),
    
    -- Hardware
    ('AMD'),
    ('Samsung'),
    ('Sony'),
    ('Dell'),
    ('HP'),
    ('Lenovo'),
    
    -- Other option
    ('Other (Please specify)')
)
INSERT INTO public.companies (name)
SELECT s.name
FROM seeds s
LEFT JOIN public.companies c ON lower(c.name) = lower(s.name)
WHERE c.id IS NULL;

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
  -- Easy problems (800-1000)
  ('codeforces', '1A', 'Theatre Square', 800, 
   ARRAY['math', 'implementation']::text[], ARRAY['easy', 'beginner-friendly']::text[],
   1000, 256,
   '<p>Theatre Square in the capital city of Berland has a rectangular shape with the size n × m meters. On the occasion of the city''s anniversary, a decision was taken to pave the Square with square granite flagstones. Each flagstone is of the size a × a.</p>
   <p>What is the least number of flagstones needed to pave the Square? It''s allowed to cover the surface larger than the Theatre Square, but the Square has to be covered. It''s not allowed to break the flagstones. The sides of flagstones should be parallel to the sides of the Square.</p>',
   '<p>The input contains three positive integer numbers in the first line: n, m and a (1 ≤ n, m, a ≤ 10^9).</p>',
   '<p>Write the needed number of flagstones.</p>',
   '<ul><li>1 ≤ n, m, a ≤ 10^9</li></ul>',
   '[{"input": "6 6 4", "output": "4", "explanation": "2 rows × 2 columns = 4 flagstones"}]'::jsonb,
   'https://codeforces.com/problemset/problem/1/A', 'Codeforces', true),
   
  ('codeforces', '4A', 'Watermelon', 800,
   ARRAY['math', 'brute-force']::text[], ARRAY['easy', 'beginner-friendly']::text[],
   1000, 256,
   '<p>One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed w kilos. They want to divide it into two parts so that each part weighs an even number of kilos.</p>',
   '<p>The first (and the only) input line contains the number w (1 ≤ w ≤ 100).</p>',
   '<p>Print YES if it is possible to divide the watermelon into two parts, each of which weighs an even number of kilos; otherwise print NO.</p>',
   '<ul><li>1 ≤ w ≤ 100</li></ul>',
   '[{"input": "8", "output": "YES", "explanation": "8 can be split as 4 + 4"}]'::jsonb,
   'https://codeforces.com/problemset/problem/4/A', 'Codeforces', true),
   
  ('leetcode', '1', 'Two Sum', 1000,
   ARRAY['hash-table', 'array']::text[], ARRAY['easy', 'arrays', 'hashing']::text[],
   1000, 256,
   '<p>Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.</p>
   <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>',
   '<p>nums = array of integers, target = integer</p>',
   '<p>Return array of two indices</p>',
   '<ul><li>2 ≤ nums.length ≤ 10^4</li><li>-10^9 ≤ nums[i] ≤ 10^9</li></ul>',
   '[{"input": "[2,7,11,15], target=9", "output": "[0,1]", "explanation": "nums[0] + nums[1] = 9"}]'::jsonb,
   'https://leetcode.com/problems/two-sum/', 'LeetCode', true),

  -- Medium problems (1200-1600)
  ('codeforces', '1234A', 'Two Arrays and Swaps', 1200,
   ARRAY['greedy', 'sorting']::text[], ARRAY['medium', 'sorting']::text[],
   1000, 256,
   '<p>You are given two arrays a and b, each consisting of n positive integers. You can perform at most k operations.</p>
   <p>Your task is to find the maximum possible sum of all elements in array a after performing at most k swaps.</p>',
   '<p>The first line contains t — the number of test cases. Each test case consists of three lines.</p>',
   '<p>For each test case, print a single integer — the maximum possible sum.</p>',
   '<ul><li>1 ≤ t ≤ 1000</li><li>1 ≤ n ≤ 30</li><li>0 ≤ k ≤ n</li></ul>',
   '[{"input": "3 2\\n1 2 3\\n4 5 6", "output": "15", "explanation": "Swap smallest from a with largest from b"}]'::jsonb,
   'https://codeforces.com/problemset/problem/1234/A', 'Codeforces', true),

  ('leetcode', '53', 'Maximum Subarray', 1200,
   ARRAY['dp', 'divide-and-conquer', 'array']::text[], ARRAY['medium', 'kadane']::text[],
   1000, 256,
   '<p>Given an integer array nums, find the subarray with the largest sum, and return its sum.</p>',
   '<p>nums = array of integers</p>',
   '<p>Return the maximum sum</p>',
   '<ul><li>1 ≤ nums.length ≤ 10^5</li><li>-10^4 ≤ nums[i] ≤ 10^4</li></ul>',
   '[{"input": "[-2,1,-3,4,-1,2,1,-5,4]", "output": "6", "explanation": "Subarray [4,-1,2,1] has sum 6"}]'::jsonb,
   'https://leetcode.com/problems/maximum-subarray/', 'LeetCode', true),

  ('leetcode', '200', 'Number of Islands', 1400,
   ARRAY['graphs', 'dfs-and-similar', 'bfs']::text[], ARRAY['medium', 'graph-traversal']::text[],
   1000, 256,
   '<p>Given an m x n 2D binary grid which represents a map of ''1''s (land) and ''0''s (water), return the number of islands.</p>
   <p>An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.</p>',
   '<p>grid = 2D array of characters</p>',
   '<p>Return the number of islands</p>',
   '<ul><li>m == grid.length</li><li>n == grid[i].length</li><li>1 ≤ m, n ≤ 300</li></ul>',
   '[{"input": "[[\"1\",\"1\",\"0\"],[\"1\",\"0\",\"0\"],[\"0\",\"0\",\"1\"]]", "output": "2"}]'::jsonb,
   'https://leetcode.com/problems/number-of-islands/', 'LeetCode', true),

  -- Hard problems (1800+)
  ('codeforces', '1326D', 'Prefix-Suffix Palindrome', 1800,
   ARRAY['strings', 'greedy', 'hashing']::text[], ARRAY['hard', 'palindrome']::text[],
   3000, 256,
   '<p>You are given a string s. You can take a prefix and a suffix of the string. The prefix and suffix should not intersect. Find the longest palindrome that can be constructed.</p>',
   '<p>First line contains t — number of test cases. Each test case has a string s.</p>',
   '<p>For each test case, print the longest palindrome.</p>',
   '<ul><li>1 ≤ t ≤ 1000</li><li>1 ≤ |s| ≤ 10^6</li></ul>',
   '[{"input": "abcdfdcecba", "output": "abcdfdcba"}]'::jsonb,
   'https://codeforces.com/problemset/problem/1326/D', 'Codeforces', true),

  ('leetcode', '124', 'Binary Tree Maximum Path Sum', 1800,
   ARRAY['trees', 'dp', 'dfs-and-similar']::text[], ARRAY['hard', 'tree-dp']::text[],
   1000, 256,
   '<p>A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. The path sum is the sum of the node''s values in the path.</p>
   <p>Given the root of a binary tree, return the maximum path sum of any non-empty path.</p>',
   '<p>root = binary tree</p>',
   '<p>Return the maximum path sum</p>',
   '<ul><li>Number of nodes: [1, 3 × 10^4]</li><li>-1000 ≤ Node.val ≤ 1000</li></ul>',
   '[{"input": "[1,2,3]", "output": "6", "explanation": "Path 2 -> 1 -> 3"}]'::jsonb,
   'https://leetcode.com/problems/binary-tree-maximum-path-sum/', 'LeetCode', true),

  ('leetcode', '23', 'Merge k Sorted Lists', 1600,
   ARRAY['linked-list', 'heap', 'divide-and-conquer']::text[], ARRAY['hard', 'merge']::text[],
   1000, 256,
   '<p>You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.</p>
   <p>Merge all the linked-lists into one sorted linked-list and return it.</p>',
   '<p>lists = array of linked lists</p>',
   '<p>Return the merged sorted linked list</p>',
   '<ul><li>k == lists.length</li><li>0 ≤ k ≤ 10^4</li></ul>',
   '[{"input": "[[1,4,5],[1,3,4],[2,6]]", "output": "[1,1,2,3,4,4,5,6]"}]'::jsonb,
   'https://leetcode.com/problems/merge-k-sorted-lists/', 'LeetCode', true),

  ('codeforces', '1917D', 'Yet Another Inversions Problem', 2000,
   ARRAY['data-structures', 'sorting', 'combinatorics']::text[], ARRAY['hard', 'inversions']::text[],
   2000, 256,
   '<p>Given two arrays p and q, find the number of inversions in the concatenation of p repeated with elements multiplied by powers of 2.</p>',
   '<p>First line n and k. Second line array p. Third line array q.</p>',
   '<p>Print the number of inversions modulo 10^9 + 7.</p>',
   '<ul><li>1 ≤ n ≤ 10^5</li><li>1 ≤ k ≤ 20</li></ul>',
   '[{"input": "3 2\\n1 3 2\\n0 1", "output": "6"}]'::jsonb,
   'https://codeforces.com/problemset/problem/1917/D', 'Codeforces', true)

ON CONFLICT (platform, external_id) DO UPDATE SET
  title = EXCLUDED.title,
  difficulty_rating = EXCLUDED.difficulty_rating,
  topic = EXCLUDED.topic,
  tags = EXCLUDED.tags,
  problem_statement = EXCLUDED.problem_statement,
  input_format = EXCLUDED.input_format,
  output_format = EXCLUDED.output_format,
  constraints = EXCLUDED.constraints,
  test_cases = EXCLUDED.test_cases,
  source_url = EXCLUDED.source_url,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc', now());

-- ======================== SEED PROBLEM HINTS ========================

WITH target_problems AS (
  SELECT id, external_id, platform FROM public.problems
)
INSERT INTO public.problem_hints (problem_id, level, hint_type, content)
SELECT 
  tp.id,
  h.level,
  h.hint_type,
  h.content
FROM target_problems tp
CROSS JOIN LATERAL (
  VALUES
    (1, 'restatement', '<p><strong>Rethink:</strong> How can you simplify the problem to basic math operations?</p>'),
    (2, 'algorithm', '<p><strong>Approach:</strong> Consider the mathematical formula. Think about ceiling division.</p>')
) AS h(level, hint_type, content)
WHERE tp.platform = 'codeforces' AND tp.external_id = '1A'
ON CONFLICT (problem_id, level) DO UPDATE SET
  hint_type = EXCLUDED.hint_type,
  content = EXCLUDED.content;

COMMIT;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
