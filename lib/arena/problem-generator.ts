export type ArenaProblem = {
  id: string;
  name: string;
  description: string; // HTML-safe string
  examples: Array<{ input: string; output: string }>;
  constraints: string;
  timeLimit: number; // seconds
  memoryLimit: number; // MB
  difficulty: 'easy' | 'medium' | 'hard';
  rating?: number;
  tags?: string[];
  source?: 'Internal';
};

type GenerateParams = {
  rating: number;
  count?: number; // default 3
  seed?: string;
  mode?: '1v1' | '3v3';
};

// Deterministic PRNG (Mulberry32) to keep problems fixed per battle
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function selectTopicsByRating(rating: number): string[] {
  if (rating < 1200) {
    return [
      'arrays',
      'strings',
      'math-basics',
      'sorting',
      'hashmap',
    ];
  }
  if (rating < 1600) {
    return ['greedy', 'hashing', 'dp-easy', 'graphs-basics', 'two-pointers'];
  }
  if (rating < 2000) {
    return ['dp', 'graphs', 'number-theory', 'advanced-greedy', 'prefix-sums'];
  }
  return ['hard-dp', 'advanced-graphs', 'combinatorics', 'bitmask', 'trees'];
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length) % arr.length];
}

// Problem blueprints for templated generation
const BLUEPRINTS: Record<
  string,
  Array<{
    name: string;
    build: (rand: () => number) => {
      description: string;
      examples: Array<{ input: string; output: string }>;
      constraints: string;
      tags?: string[];
    };
  }>
> = {
  arrays: [
    {
      name: 'Maximum Subarray Sum with One Deletion',
      build: rand => {
        const n = 6 + Math.floor(rand() * 5);
        const arr = Array.from({ length: n }, () =>
          Math.floor(rand() * 21) - 10
        );
        // Simple example uses Kadane with one skip; provide IO only
        const input = `${n}\n${arr.join(' ')}`;
        // Not computing exact output to keep generator simple; user solves in contest
        const output = '?';
        return {
          description:
            'Given an array of integers, compute the maximum possible subarray sum if you may delete at most one element from the array. Input: n and n integers. Output: the maximum sum.',
          examples: [{ input, output }],
          constraints:
            '1 ≤ n ≤ 2e5; -1e9 ≤ a[i] ≤ 1e9; Use O(n) or O(n log n).',
          tags: ['arrays', 'dp', 'kadane'],
        };
      },
    },
    {
      name: 'K-Rotations to Sort',
      build: rand => {
        const n = 7 + Math.floor(rand() * 4);
        const k = 1 + Math.floor(rand() * 3);
        const arr = Array.from({ length: n }, (_, i) => i + 1).sort(
          () => rand() - 0.5
        );
        return {
          description:
            'You are given an array of n distinct integers and an integer k. In one operation you may rotate any contiguous subarray of length k by one to the right. Determine if you can sort the array increasingly. Input: n, k and the array. Output: YES/NO.',
          examples: [
            { input: `${n} ${k}\n${arr.join(' ')}`, output: 'YES' },
          ],
          constraints: '1 ≤ n ≤ 2e5; 1 ≤ k ≤ n; O(n).',
          tags: ['arrays', 'math'],
        };
      },
    },
  ],
  strings: [
    {
      name: 'Balanced Substrings',
      build: rand => {
        const n = 8 + Math.floor(rand() * 8);
        const s = Array.from({ length: n }, () => (rand() > 0.5 ? 'a' : 'b')).join('');
        return {
          description:
            'Given a string s consisting of letters a and b, count the number of substrings where the number of a equals the number of b. Input: n and s. Output: the count.',
          examples: [{ input: `${n}\n${s}`, output: '?' }],
          constraints: '1 ≤ n ≤ 2e5; O(n) or O(n log n).',
          tags: ['strings', 'prefix-sum', 'hashmap'],
        };
      },
    },
  ],
  'math-basics': [
    {
      name: 'Trailing Zeros in Factorial Range',
      build: rand => {
        const q = 2 + Math.floor(rand() * 3);
        const nums = Array.from({ length: q }, () =>
          5 + Math.floor(rand() * 100)
        );
        return {
          description:
            'For each given n, compute the number of trailing zeros in n!. Input: q and q values n. Output: the count for each query.',
          examples: [
            { input: `${q}\n${nums.join('\n')}`, output: nums.map(() => '?').join('\n') },
          ],
          constraints: '1 ≤ q ≤ 1e5; 1 ≤ n ≤ 1e18; O(log n) per query.',
          tags: ['math'],
        };
      },
    },
  ],
  sorting: [
    {
      name: 'Sort by Parity Blocks',
      build: rand => {
        const n = 6 + Math.floor(rand() * 6);
        const arr = Array.from({ length: n }, () => Math.floor(rand() * 50));
        return {
          description:
            'You may swap any two adjacent elements of different parity (one even, one odd). Compute the minimum number of swaps needed to sort the array non-decreasingly or determine it is impossible.',
          examples: [{ input: `${n}\n${arr.join(' ')}`, output: '?' }],
          constraints: '1 ≤ n ≤ 2e5; 0 ≤ a[i] ≤ 1e9.',
          tags: ['sorting', 'greedy'],
        };
      },
    },
  ],
  hashmap: [
    {
      name: 'Distinct in Every Window',
      build: rand => {
        const n = 10 + Math.floor(rand() * 5);
        const k = 3 + Math.floor(rand() * 3);
        const arr = Array.from({ length: n }, () => Math.floor(rand() * 6));
        return {
          description:
            'Given an array of length n and a window size k, output the number of distinct elements in every contiguous window of size k.',
          examples: [
            { input: `${n} ${k}\n${arr.join(' ')}`, output: '? ? ?' },
          ],
          constraints: '1 ≤ k ≤ n ≤ 2e5; O(n).',
          tags: ['hashmap', 'sliding-window'],
        };
      },
    },
  ],
  greedy: [
    {
      name: 'Minimize Max Segment Sum',
      build: rand => {
        const n = 7 + Math.floor(rand() * 5);
        const k = 2 + Math.floor(rand() * 3);
        const arr = Array.from({ length: n }, () => 1 + Math.floor(rand() * 9));
        return {
          description:
            'Split the array into at most k non-empty contiguous segments to minimize the maximum segment sum. Output the minimal possible value.',
          examples: [{ input: `${n} ${k}\n${arr.join(' ')}`, output: '?' }],
          constraints: '1 ≤ n ≤ 2e5; 1 ≤ a[i] ≤ 1e9.',
          tags: ['greedy', 'binary-search'],
        };
      },
    },
  ],
  'dp-easy': [
    {
      name: 'Staircase Ways Mod',
      build: rand => {
        const n = 20 + Math.floor(rand() * 10);
        const mod = 1_000_000_007;
        return {
          description:
            'You can climb 1, 2, or 3 steps at a time. Given n, count the number of distinct ways to reach the top modulo 1e9+7.',
          examples: [{ input: `${n}`, output: '?' }],
          constraints: '1 ≤ n ≤ 1e7; O(n) or O(log n) with matrix exponentiation.',
          tags: ['dp'],
        };
      },
    },
  ],
  'graphs-basics': [
    {
      name: 'Shortest Path with One Teleport',
      build: rand => {
        const n = 6 + Math.floor(rand() * 5);
        const m = n + 2 + Math.floor(rand() * 5);
        return {
          description:
            'Given an undirected graph with n nodes and m edges, you may use exactly one teleport that can connect any two nodes instantly. Find the shortest path length from 1 to n with at most one teleport.',
          examples: [{ input: `${n} ${m}\n...edges...`, output: '?' }],
          constraints: '1 ≤ n ≤ 2e5; 0 ≤ m ≤ 2e5.',
          tags: ['graphs', 'bfs'],
        };
      },
    },
  ],
  dp: [
    {
      name: 'Subset Sum Ways (Large N)',
      build: rand => {
        const n = 50 + Math.floor(rand() * 50);
        const target = 1000 + Math.floor(rand() * 1000);
        return {
          description:
            'Given n numbers and a target, count the number of subsets with sum exactly equal to the target. Output the count modulo 1e9+7.',
          examples: [{ input: `${n} ${target}\n...array...`, output: '?' }],
          constraints: '1 ≤ n ≤ 200; 1 ≤ target ≤ 1e5.',
          tags: ['dp'],
        };
      },
    },
  ],
  graphs: [
    {
      name: 'K Shortest Paths (DAG)',
      build: rand => {
        const n = 10 + Math.floor(rand() * 10);
        return {
          description:
            'Given a DAG, compute the number of distinct paths from node 1 to node n, and also find the shortest distance. Output count and shortest distance.',
          examples: [{ input: `${n} m\n...edges...`, output: '? ?' }],
          constraints: 'DAG; 1 ≤ n ≤ 2e5; 0 ≤ m ≤ 2e5.',
          tags: ['graphs', 'toposort', 'dp'],
        };
      },
    },
  ],
  'number-theory': [
    {
      name: 'Coprime Pairs in Range',
      build: rand => {
        const n = 10 + Math.floor(rand() * 10);
        return {
          description:
            'Given an array of n integers, count the number of pairs (i, j), i < j such that gcd(a[i], a[j]) = 1.',
          examples: [{ input: `${n}\n...array...`, output: '?' }],
          constraints: '1 ≤ a[i] ≤ 1e6; O(n log maxA).',
          tags: ['number-theory', 'gcd'],
        };
      },
    },
  ],
  'advanced-greedy': [
    {
      name: 'Interval Removal to Avoid Overlaps',
      build: rand => ({
        description:
          'Given intervals, remove the minimum number so that no two intervals overlap. Output the minimum removals.',
        examples: [{ input: 'n\n[l r]...', output: '?' }],
        constraints: '1 ≤ n ≤ 2e5.',
        tags: ['greedy', 'sorting'],
      }),
    },
  ],
  'hard-dp': [
    {
      name: 'Digit DP – Beautiful Numbers',
      build: rand => ({
        description:
          'Count numbers in [L, R] whose sum of digits is divisible by k. Answer modulo 1e9+7.',
        examples: [{ input: 'L R k', output: '?' }],
        constraints: '0 ≤ L ≤ R ≤ 1e18; 1 ≤ k ≤ 2000.',
        tags: ['dp', 'digit-dp'],
      }),
    },
  ],
  'advanced-graphs': [
    {
      name: 'Minimum Edges to Strongly Connect',
      build: rand => ({
        description:
          'Given a directed graph, find the minimum number of edges to add to make it strongly connected.',
        examples: [{ input: 'n m\n...edges...', output: '?' }],
        constraints: '1 ≤ n ≤ 2e5; 0 ≤ m ≤ 2e5.',
        tags: ['graphs', 'scc'],
      }),
    },
  ],
  combinatorics: [
    {
      name: 'Paths with Forbidden Cells',
      build: rand => ({
        description:
          'On an n×m grid, count paths from (1,1) to (n,m) moving right or down avoiding k blocked cells. Output modulo 1e9+7.',
        examples: [{ input: 'n m k\n...blocked...', output: '?' }],
        constraints: '1 ≤ n,m ≤ 2e5; 0 ≤ k ≤ 2e5.',
        tags: ['combinatorics', 'binomial'],
      }),
    },
  ],
  bitmask: [
    {
      name: 'Minimum Cost Hamiltonian Path on Small Graph',
      build: rand => ({
        description:
          'Given a complete weighted graph with n ≤ 20, find the minimum cost Hamiltonian path from node 1 to n.',
        examples: [{ input: 'n\nmatrix...', output: '?' }],
        constraints: '1 ≤ n ≤ 20.',
        tags: ['bitmask', 'dp'],
      }),
    },
  ],
  trees: [
    {
      name: 'K-th Ancestor Queries',
      build: rand => ({
        description:
          'Given a rooted tree, process q queries of the form (v, k): find the k-th ancestor of v, or -1 if it does not exist.',
        examples: [{ input: 'n q\n...edges...', output: '?' }],
        constraints: '1 ≤ n, q ≤ 2e5.',
        tags: ['trees', 'binary-lifting'],
      }),
    },
  ],
};

function difficultyForIndex(idx: number): 'easy' | 'medium' | 'hard' {
  if (idx === 0) return 'easy';
  if (idx === 1) return 'medium';
  return 'hard';
}

function nominalRating(base: number, difficulty: 'easy' | 'medium' | 'hard'): number {
  if (difficulty === 'easy') return Math.max(800, base);
  if (difficulty === 'medium') return base + 100;
  return base + 200;
}

export function generateBattleProblems(params: GenerateParams): ArenaProblem[] {
  const { rating, seed = `${rating}-${Date.now()}`, count = 3 } = params;
  const r = mulberry32(hashStringToSeed(seed));
  const topicsPool = selectTopicsByRating(rating);

  const problems: ArenaProblem[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    // Ensure variety by sampling a topic for each problem
    const topic = topicsPool[(i + Math.floor(r() * topicsPool.length)) % topicsPool.length];
    const blueprints = BLUEPRINTS[topic] || BLUEPRINTS.arrays;
    const bp = pick(r, blueprints);
    const built = bp.build(r);

    let name = bp.name;
    // Avoid duplicates by slight rename
    if (usedNames.has(name)) name = `${name} ${String.fromCharCode(65 + i)}`;
    usedNames.add(name);

    const diff = difficultyForIndex(i);
    problems.push({
      id: `arena-${hashStringToSeed(seed)}-${i}`,
      name,
      description: `
<p>${built.description}</p>
<h4>Input</h4>
<p>See problem description for exact format.</p>
<h4>Output</h4>
<p>See problem description.</p>
      `.trim(),
      examples: built.examples,
      constraints: built.constraints,
      timeLimit: 2,
      memoryLimit: 256,
      difficulty: diff,
      rating: nominalRating(rating, diff),
      tags: [topic, ...(built.tags || [])],
      source: 'Internal',
    });
  }

  return problems;
}
