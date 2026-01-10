import { type NextRequest, NextResponse } from 'next/server';

interface CuratedProblem {
  id: string;
  title: string;
  rating: number;
  tags: string[];
  difficulty: string;
  url: string;
  source: string;
  explanation?: string;
}

interface PlanProblems {
  planId: string;
  planName: string;
  totalProblems: number;
  problems: CuratedProblem[];
}

const CURATED_PROBLEMS_BY_TIER: Record<string, CuratedProblem[]> = {
  'intro-pack': [
    {
      id: '1',
      title: 'A. Watermelon',
      rating: 800,
      tags: ['math', 'implementation'],
      difficulty: 'Easy',
      url: 'https://codeforces.com/problemset/problem/4/A',
      source: 'Codeforces',
      explanation: 'Check if a number is even and greater than 2',
    },
    {
      id: '2',
      title: 'A. Theatre Square',
      rating: 1000,
      tags: ['math', 'implementation'],
      difficulty: 'Easy',
      url: 'https://codeforces.com/problemset/problem/1/A',
      source: 'Codeforces',
      explanation: 'Calculate area and handle large numbers',
    },
    {
      id: '3',
      title: 'A. Young Physicist',
      rating: 1000,
      tags: ['math', 'implementation'],
      difficulty: 'Easy',
      url: 'https://codeforces.com/problemset/problem/69/A',
      source: 'Codeforces',
      explanation: 'Sum vectors and check if result is zero',
    },
    {
      id: '4',
      title: 'A. Soldier and Bananas',
      rating: 1000,
      tags: ['math', 'implementation'],
      difficulty: 'Easy',
      url: 'https://codeforces.com/problemset/problem/546/A',
      source: 'Codeforces',
      explanation: 'Calculate arithmetic progression sum',
    },
    {
      id: '5',
      title: 'A. Helpful Maths',
      rating: 1000,
      tags: ['implementation', 'sorting'],
      difficulty: 'Easy',
      url: 'https://codeforces.com/problemset/problem/339/A',
      source: 'Codeforces',
      explanation: 'Parse and sort single-digit numbers',
    },
    {
      id: '6',
      title: 'A. Petya and Strings',
      rating: 1000,
      tags: ['implementation', 'strings'],
      difficulty: 'Easy',
      url: 'https://codeforces.com/problemset/problem/112/A',
      source: 'Codeforces',
      explanation: 'Case-insensitive string comparison',
    },
    {
      id: '7',
      title: 'A. Bit++',
      rating: 1000,
      tags: ['implementation'],
      difficulty: 'Easy',
      url: 'https://codeforces.com/problemset/problem/282/A',
      source: 'Codeforces',
      explanation: 'Parse and execute simple operations',
    },
    {
      id: '8',
      title: 'A. Presents',
      rating: 1000,
      tags: ['implementation'],
      difficulty: 'Easy',
      url: 'https://codeforces.com/problemset/problem/996/A',
      source: 'Codeforces',
      explanation: 'Rearrange array based on permutation',
    },
  ],
  'level-1': [
    {
      id: '1',
      title: 'B. Stones',
      rating: 1200,
      tags: ['greedy', 'implementation'],
      difficulty: 'Medium',
      url: 'https://codeforces.com/problemset/problem/1097/B',
      source: 'Codeforces',
      explanation: 'Greedy approach to minimize operations',
    },
    {
      id: '2',
      title: 'B. Taxi',
      rating: 1200,
      tags: ['greedy', 'implementation'],
      difficulty: 'Medium',
      url: 'https://codeforces.com/problemset/problem/158/B',
      source: 'Codeforces',
      explanation: 'Greedy grouping with constraints',
    },
    {
      id: '3',
      title: 'A. Sorting',
      rating: 1100,
      tags: ['sorting', 'implementation'],
      difficulty: 'Easy',
      url: 'https://codeforces.com/problemset/problem/546/B',
      source: 'Codeforces',
      explanation: 'Implement bubble sort or use built-in sort',
    },
    {
      id: '4',
      title: 'B. Binary Search',
      rating: 1300,
      tags: ['binary-search', 'algorithms'],
      difficulty: 'Medium',
      url: 'https://codeforces.com/problemset/problem/1200/B',
      source: 'Codeforces',
      explanation: 'Find element using binary search',
    },
    {
      id: '5',
      title: 'C. Hashing',
      rating: 1400,
      tags: ['hashing', 'data-structures'],
      difficulty: 'Medium',
      url: 'https://codeforces.com/problemset/problem/1300/C',
      source: 'Codeforces',
      explanation: 'Use hash map for efficient lookup',
    },
  ],
  'level-2': [
    {
      id: '1',
      title: 'A. Shortest Path with Obstacle',
      rating: 1400,
      tags: ['graphs', 'bfs'],
      difficulty: 'Medium',
      url: 'https://codeforces.com/problemset/problem/1547/A',
      source: 'Codeforces',
      explanation: 'BFS to find shortest path in grid',
    },
    {
      id: '2',
      title: 'B. Frog Jump',
      rating: 1500,
      tags: ['dp', 'implementation'],
      difficulty: 'Medium',
      url: 'https://codeforces.com/problemset/problem/1691/B',
      source: 'Codeforces',
      explanation: 'Dynamic programming for optimal jumps',
    },
    {
      id: '3',
      title: 'A. Maze',
      rating: 1400,
      tags: ['graphs', 'dfs'],
      difficulty: 'Medium',
      url: 'https://codeforces.com/problemset/problem/377/A',
      source: 'Codeforces',
      explanation: 'DFS to explore connected components',
    },
    {
      id: '4',
      title: 'B. Minimum Product',
      rating: 1500,
      tags: ['math', 'greedy'],
      difficulty: 'Medium',
      url: 'https://codeforces.com/problemset/problem/1613/B',
      source: 'Codeforces',
      explanation: 'Optimize using mathematical insights',
    },
    {
      id: '5',
      title: 'C. Longest Increasing Subsequence',
      rating: 1600,
      tags: ['dp'],
      difficulty: 'Hard',
      url: 'https://codeforces.com/problemset/problem/1025/C',
      source: 'Codeforces',
      explanation: 'Classic DP problem with O(n log n) solution',
    },
  ],
  'level-3': [
    {
      id: '1',
      title: 'D. Tree DP',
      rating: 1800,
      tags: ['dp', 'trees'],
      difficulty: 'Hard',
      url: 'https://codeforces.com/problemset/problem/1187/D',
      source: 'Codeforces',
      explanation: 'Advanced DP on tree structures',
    },
    {
      id: '2',
      title: 'C. Combinatorics Problem',
      rating: 1900,
      tags: ['combinatorics', 'math'],
      difficulty: 'Hard',
      url: 'https://codeforces.com/problemset/problem/1624/C',
      source: 'Codeforces',
      explanation: 'Count combinations with constraints',
    },
    {
      id: '3',
      title: 'D. Segment Tree Query',
      rating: 1900,
      tags: ['data-structures', 'segment-tree'],
      difficulty: 'Hard',
      url: 'https://codeforces.com/problemset/problem/1658/D',
      source: 'Codeforces',
      explanation: 'Range queries using segment tree',
    },
    {
      id: '4',
      title: 'E. Advanced DP',
      rating: 2000,
      tags: ['dp', 'advanced'],
      difficulty: 'Very Hard',
      url: 'https://codeforces.com/problemset/problem/1700/E',
      source: 'Codeforces',
      explanation: 'Complex DP with multiple states',
    },
    {
      id: '5',
      title: 'F. Complex Algorithm',
      rating: 2100,
      tags: ['advanced', 'algorithms'],
      difficulty: 'Very Hard',
      url: 'https://codeforces.com/problemset/problem/1800/F',
      source: 'Codeforces',
      explanation: 'Combine multiple advanced techniques',
    },
  ],
  'level-4': [
    {
      id: '1',
      title: 'F. Master Challenge 1',
      rating: 2200,
      tags: ['advanced', 'mixed'],
      difficulty: 'Master',
      url: 'https://codeforces.com/problemset/problem/1900/F',
      source: 'Codeforces',
      explanation: 'Master-level problem mixing multiple concepts',
    },
    {
      id: '2',
      title: 'G. Master Challenge 2',
      rating: 2300,
      tags: ['advanced', 'mixed'],
      difficulty: 'Master',
      url: 'https://codeforces.com/problemset/problem/2000/G',
      source: 'Codeforces',
      explanation: 'Extreme optimization and algorithm design',
    },
    {
      id: '3',
      title: 'H. Master Challenge 3',
      rating: 2400,
      tags: ['advanced', 'mixed'],
      difficulty: 'Master',
      url: 'https://codeforces.com/problemset/problem/2100/H',
      source: 'Codeforces',
      explanation: 'Cutting-edge competitive programming techniques',
    },
    {
      id: '4',
      title: 'I. Master Challenge 4',
      rating: 2500,
      tags: ['advanced', 'mixed'],
      difficulty: 'Master',
      url: 'https://codeforces.com/problemset/problem/2200/I',
      source: 'Codeforces',
      explanation: 'International contest-level problems',
    },
    {
      id: '5',
      title: 'J. Master Challenge 5',
      rating: 2600,
      tags: ['advanced', 'mixed'],
      difficulty: 'Master',
      url: 'https://codeforces.com/problemset/problem/2300/J',
      source: 'Codeforces',
      explanation: 'Ultimate competitive programming challenges',
    },
  ],
};

const PLAN_NAMES: Record<string, string> = {
  'intro-pack': 'Intro Pack',
  'level-1': 'Level 1 Sheet',
  'level-2': 'Level 2 Sheet',
  'level-3': 'Level 3 Sheet',
  'level-4': 'Level 4 Sheet',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get('planId');

    if (!planId) {
      return NextResponse.json(
        { error: 'planId parameter is required' },
        { status: 400 }
      );
    }

    const problems = CURATED_PROBLEMS_BY_TIER[planId];
    if (!problems) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const response: PlanProblems = {
      planId,
      planName: PLAN_NAMES[planId] || 'Unknown Plan',
      totalProblems: problems.length,
      problems,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching curated problems:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curated problems' },
      { status: 500 }
    );
  }
}