export type Problem = {
  id: string
  title: string
  url: string
  platform: "CF" | "GFG" | "USACO" | "AtCoder" | "CSES"
  difficulty: "Easy" | "Medium" | "Hard"
  tags: string[]
  solved?: boolean
}

export type SubSection = {
  id: string
  title: string
  description: string
  problems: Problem[]
  estimatedTime: string
}

export type Section = {
  id: string
  title: string
  description: string
  subsections: SubSection[]
  totalProblems: number
  estimatedTime: string
  icon: string
}

export const LEARNING_PATH_DATA: Section[] = [
  {
    id: "basic-cpp",
    title: "Basic C++",
    description: "Master C++ fundamentals with essential programming concepts",
    totalProblems: 65,
    estimatedTime: "3-4 weeks",
    icon: "💻",
    subsections: [
      {
        id: "cpp-basics",
        title: "C++ Syntax & Basics",
        description: "Variables, operators, control structures",
        estimatedTime: "1 week",
        problems: [
          {
            id: "gfg-hello-world",
            title: "Hello World in C++",
            url: "https://www.geeksforgeeks.org/c-hello-world-program/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["basics", "syntax"]
          },
          {
            id: "usaco-basic-io",
            title: "Basic Input/Output",
            url: "https://usaco.guide/bronze/io",
            platform: "USACO",
            difficulty: "Easy",
            tags: ["io", "basics"]
          },
          {
            id: "cf-watermelon",
            title: "Watermelon",
            url: "https://codeforces.com/problem/4/A",
            platform: "CF",
            difficulty: "Easy",
            tags: ["implementation", "math"]
          },
          // Add more problems here...
        ]
      },
      {
        id: "cpp-functions",
        title: "Functions & Arrays",
        description: "Functions, arrays, and basic algorithms",
        estimatedTime: "1 week",
        problems: [
          {
            id: "gfg-functions",
            title: "C++ Functions",
            url: "https://www.geeksforgeeks.org/functions-in-c/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["functions"]
          },
          // Add more problems...
        ]
      }
    ]
  },
  {
    id: "mathematics",
    title: "Mathematics",
    description: "Essential mathematical concepts for competitive programming",
    totalProblems: 90,
    estimatedTime: "4-5 weeks",
    icon: "🧮",
    subsections: [
      {
        id: "number-theory",
        title: "Number Theory",
        description: "GCD, LCM, Prime numbers, Modular arithmetic",
        estimatedTime: "2 weeks",
        problems: [
          {
            id: "cf-gcd-lcm",
            title: "GCD and LCM",
            url: "https://codeforces.com/problem/1/A",
            platform: "CF",
            difficulty: "Easy",
            tags: ["math", "gcd"]
          },
          // Add more problems...
        ]
      },
      {
        id: "combinatorics",
        title: "Combinatorics",
        description: "Permutations, combinations, probability",
        estimatedTime: "1.5 weeks",
        problems: [
          // Add problems...
        ]
      },
      {
        id: "probability",
        title: "Probability",
        description: "Basic probability concepts and problems",
        estimatedTime: "1 week",
        problems: [
          // Add problems...
        ]
      }
    ]
  },
  {
    id: "stl",
    title: "STL (Standard Template Library)",
    description: "Master C++ STL containers and algorithms",
    totalProblems: 38,
    estimatedTime: "2-3 weeks",
    icon: "📚",
    subsections: [
      {
        id: "stl-containers",
        title: "STL Containers",
        description: "Vector, set, map, queue, stack, priority_queue",
        estimatedTime: "1.5 weeks",
        problems: [
          {
            id: "cf-stl-vector",
            title: "Vector Operations",
            url: "https://codeforces.com/problem/100/A",
            platform: "CF",
            difficulty: "Easy",
            tags: ["stl", "vector"]
          },
          // Add more problems...
        ]
      },
      {
        id: "stl-algorithms",
        title: "STL Algorithms",
        description: "sort, binary_search, lower_bound, upper_bound",
        estimatedTime: "1 week",
        problems: [
          // Add problems...
        ]
      }
    ]
  },
  {
    id: "cses",
    title: "CSES Problem Set",
    description: "High-quality problems from CSES",
    totalProblems: 60,
    estimatedTime: "3-4 weeks",
    icon: "🎯",
    subsections: [
      {
        id: "cses-introductory",
        title: "Introductory Problems",
        description: "Basic algorithmic thinking",
        estimatedTime: "2 weeks",
        problems: [
          {
            id: "cses-weird-algorithm",
            title: "Weird Algorithm",
            url: "https://cses.fi/problemset/task/1068",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["implementation"]
          },
          {
            id: "cses-missing-number",
            title: "Missing Number",
            url: "https://cses.fi/problemset/task/1083",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["math"]
          },
          // Add more problems...
        ]
      },
      {
        id: "cses-mathematics",
        title: "Mathematics",
        description: "Mathematical problems from CSES",
        estimatedTime: "2 weeks",
        problems: [
          // Add problems...
        ]
      }
    ]
  },
  {
    id: "learn-dsa",
    title: "Learn DSA",
    description: "Master fundamental data structures and algorithms",
    totalProblems: 200,
    estimatedTime: "8-10 weeks",
    icon: "🏗️",
    subsections: [
      {
        id: "prefix-sums",
        title: "Prefix Sums",
        description: "Range queries and cumulative sums",
        estimatedTime: "1 week",
        problems: [
          {
            id: "cf-prefix-sum-basic",
            title: "Range Sum Queries",
            url: "https://codeforces.com/problem/100/A",
            platform: "CF",
            difficulty: "Easy",
            tags: ["prefix-sum"]
          },
          // Add more problems...
        ]
      },
      {
        id: "binary-search",
        title: "Binary Search",
        description: "Search algorithms and their applications",
        estimatedTime: "1 week",
        problems: [
          // Add problems...
        ]
      },
      {
        id: "sliding-window",
        title: "Sliding Window",
        description: "Window-based optimization techniques",
        estimatedTime: "1 week",
        problems: [
          // Add problems...
        ]
      },
      {
        id: "two-pointer",
        title: "Two Pointer",
        description: "Two pointer technique for arrays",
        estimatedTime: "1 week",
        problems: [
          // Add problems...
        ]
      },
      {
        id: "recursion",
        title: "Recursion",
        description: "Recursive problem solving",
        estimatedTime: "1 week",
        problems: [
          // Add problems...
        ]
      },
      {
        id: "backtracking",
        title: "Backtracking",
        description: "Systematic solution space exploration",
        estimatedTime: "1 week",
        problems: [
          // Add problems...
        ]
      },
      {
        id: "graph",
        title: "Graph",
        description: "Graph algorithms and traversals",
        estimatedTime: "1.5 weeks",
        problems: [
          // Add problems...
        ]
      },
      {
        id: "dp",
        title: "Dynamic Programming",
        description: "Optimization using memorization",
        estimatedTime: "1.5 weeks",
        problems: [
          // Add problems...
        ]
      },
      {
        id: "trees",
        title: "Trees",
        description: "Tree data structures and algorithms",
        estimatedTime: "1 week",
        problems: [
          // Add problems...
        ]
      },
      {
        id: "segment-trees",
        title: "Segment Trees",
        description: "Advanced tree data structures",
        estimatedTime: "1 week",
        problems: [
          // Add problems...
        ]
      }
    ]
  },
  {
    id: "cf-practice",
    title: "Codeforces Practice",
    description: "Structured practice with CF problems by division",
    totalProblems: 355,
    estimatedTime: "10-12 weeks",
    icon: "🏆",
    subsections: [
      {
        id: "div3-abcd",
        title: "Div3 (A, B, C, D)",
        description: "Practice Div3 contest problems",
        estimatedTime: "3 weeks",
        problems: [
          // Add 65 problems here
        ]
      },
      {
        id: "div2-a",
        title: "Div2 A",
        description: "Master Div2 A problems",
        estimatedTime: "2 weeks",
        problems: [
          // Add 52 problems here
        ]
      },
      {
        id: "div2-b",
        title: "Div2 B",
        description: "Practice Div2 B problems",
        estimatedTime: "2.5 weeks",
        problems: [
          // Add 70 problems here
        ]
      },
      {
        id: "div2-c",
        title: "Div2 C",
        description: "Challenge yourself with Div2 C",
        estimatedTime: "2.5 weeks",
        problems: [
          // Add 75 problems here
        ]
      },
      {
        id: "div2-d",
        title: "Div2 D",
        description: "Advanced Div2 D problems",
        estimatedTime: "3 weeks",
        problems: [
          // Add 100 problems here
        ]
      }
    ]
  }
]

export function getTotalProblems(): number {
  return LEARNING_PATH_DATA.reduce((total, section) => total + section.totalProblems, 0)
}

export function getSectionProgress(sectionId: string): number {
  // TODO: Calculate progress from user's solved problems
  return 0
}