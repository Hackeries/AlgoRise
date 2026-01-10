// Problem Templates for Algorithmic Problem Generation

export interface ProblemTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  statement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: Example[];
  tags: string[];
  solutionHint?: string;
  complexity?: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface GeneratedProblem extends ProblemTemplate {
  problemId: string;
  variables: Record<string, any>;
  testCases: TestCase[];
}

export interface TestCase {
  input: string;
  output: string;
  type: 'sample' | 'edge' | 'random' | 'stress';
  constraints?: Record<string, any>;
}

// Predefined problem templates
export const PROBLEM_TEMPLATES: ProblemTemplate[] = [
  {
    id: 'array-sum',
    name: 'Array Sum',
    category: 'Arrays',
    difficulty: 'easy',
    description: 'Find the sum of elements in an array',
    statement: `
Given an array of integers, find the sum of all elements in the array.

For example, if the array is [1, 2, 3, 4, 5], the sum would be 15.
`,
    inputFormat: `
The first line contains an integer n (1 ≤ n ≤ 10^5) - the number of elements in the array.
The second line contains n integers a1, a2, ..., an (1 ≤ ai ≤ 10^9) - the elements of the array.
`,
    outputFormat: `
Print a single integer - the sum of all elements in the array.
`,
    constraints: [
      '1 ≤ n ≤ 10^5',
      '1 ≤ ai ≤ 10^9'
    ],
    examples: [
      {
        input: `5
1 2 3 4 5`,
        output: `15`,
        explanation: 'The sum of elements 1 + 2 + 3 + 4 + 5 = 15'
      },
      {
        input: `3
10 20 30`,
        output: `60`,
        explanation: 'The sum of elements 10 + 20 + 30 = 60'
      }
    ],
    tags: ['arrays', 'math', 'basics'],
    solutionHint: 'Iterate through the array and accumulate the sum.',
    complexity: 'Time: O(n), Space: O(1)'
  },
  {
    id: 'two-sum',
    name: 'Two Sum',
    category: 'Arrays',
    difficulty: 'easy',
    description: 'Find two numbers in an array that sum to a target value',
    statement: `
Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.
`,
    inputFormat: `
The first line contains an integer n (2 ≤ n ≤ 10^4) - the number of elements in the array.
The second line contains n integers a1, a2, ..., an (−10^9 ≤ ai ≤ 10^9) - the elements of the array.
The third line contains an integer target (−10^9 ≤ target ≤ 10^9) - the target sum.
`,
    outputFormat: `
Print two integers - the indices of the two elements that sum to the target.
`,
    constraints: [
      '2 ≤ n ≤ 10^4',
      '−10^9 ≤ ai ≤ 10^9',
      '−10^9 ≤ target ≤ 10^9',
      'Only one valid answer exists'
    ],
    examples: [
      {
        input: `4
2 7 11 15
9`,
        output: `0 1`,
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: `3
3 2 4
6`,
        output: `1 2`,
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      }
    ],
    tags: ['arrays', 'hash-table', 'two-pointers'],
    solutionHint: 'Use a hash map to store elements and their indices for O(1) lookup.',
    complexity: 'Time: O(n), Space: O(n)'
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    difficulty: 'easy',
    description: 'Find a target value in a sorted array using binary search',
    statement: `
Given a sorted (ascending) array of integers and a target value, write a function to search for the target in the array. If the target exists, return its index. Otherwise, return -1.
`,
    inputFormat: `
The first line contains an integer n (1 ≤ n ≤ 10^4) - the number of elements in the array.
The second line contains n integers a1, a2, ..., an (−10^9 ≤ ai ≤ 10^9) - the elements of the sorted array.
The third line contains an integer target (−10^9 ≤ target ≤ 10^9) - the value to search for.
`,
    outputFormat: `
Print a single integer - the index of the target value if found, otherwise -1.
`,
    constraints: [
      'All integers in nums are unique.',
      'nums is sorted in ascending order.'
    ],
    examples: [
      {
        input: `5
-1 0 3 5 9
9`,
        output: `4`,
        explanation: '9 exists in nums and its index is 4'
      },
      {
        input: `5
-1 0 3 5 9
2`,
        output: `-1`,
        explanation: '2 does not exist in nums so return -1'
      }
    ],
    tags: ['arrays', 'binary-search', 'divide-and-conquer'],
    solutionHint: 'Compare the middle element with the target and eliminate half of the search space in each iteration.',
    complexity: 'Time: O(log n), Space: O(1)'
  },
  {
    id: 'max-subarray',
    name: 'Maximum Subarray',
    category: 'Dynamic Programming',
    difficulty: 'medium',
    description: 'Find the contiguous subarray with the largest sum',
    statement: `
Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.
`,
    inputFormat: `
The first line contains an integer n (1 ≤ n ≤ 10^5) - the number of elements in the array.
The second line contains n integers a1, a2, ..., an (−10^4 ≤ ai ≤ 10^4) - the elements of the array.
`,
    outputFormat: `
Print a single integer - the maximum sum of any contiguous subarray.
`,
    constraints: [
      '1 ≤ n ≤ 10^5',
      '−10^4 ≤ ai ≤ 10^4'
    ],
    examples: [
      {
        input: `9
-2 1 -3 4 -1 2 1 -5 4`,
        output: `6`,
        explanation: 'The subarray [4,-1,2,1] has the largest sum = 6.'
      },
      {
        input: `1
1`,
        output: `1`,
        explanation: 'The subarray [1] has the largest sum = 1.'
      },
      {
        input: `5
5 4 -1 7 8`,
        output: `23`,
        explanation: 'The subarray [5,4,-1,7,8] has the largest sum = 23.'
      }
    ],
    tags: ['arrays', 'dynamic-programming', 'divide-and-conquer'],
    solutionHint: 'Use Kadane\'s algorithm to keep track of the maximum sum ending at each position.',
    complexity: 'Time: O(n), Space: O(1)'
  }
];

// Template categories for organization
export const TEMPLATE_CATEGORIES = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Greedy',
  'Backtracking',
  'Divide and Conquer',
  'Searching',
  'Sorting',
  'Math',
  'Bit Manipulation',
  'Hash Table'
];