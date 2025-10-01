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
            {
              id: "cf-next",
              title: "Next Round",
              url: "https://codeforces.com/problemset/problem/158/A",
              platform: "CF",
              difficulty: "Easy",
              tags: ["implementation"]
            },
            {
              id: "gfg-data-types",
              title: "C++ Data Types",
              url: "https://www.geeksforgeeks.org/data-types-in-c/",
              platform: "GFG",
              difficulty: "Easy",
              tags: ["basics", "data types"]
            },
            {
              id: "cf-team",
              title: "Team Problem",
              url: "https://codeforces.com/problemset/problem/231/A",
              platform: "CF",
              difficulty: "Easy",
              tags: ["implementation"]
            },
              {
                id: "cf-petya",
                title: "Petya and Strings",
                url: "https://codeforces.com/problemset/problem/112/A",
                platform: "CF",
                difficulty: "Easy",
                tags: ["strings"]
              },
              {
                id: "gfg-conditional",
                title: "Conditional Statements in C++",
                url: "https://www.geeksforgeeks.org/conditional-statements-in-c-cpp/",
                platform: "GFG",
                difficulty: "Easy",
                tags: ["conditions"]
              },
              {
                id: "cf-string-task",
                title: "String Task",
                url: "https://codeforces.com/problemset/problem/118/A",
                platform: "CF",
                difficulty: "Easy",
                tags: ["strings"]
              },
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
            {
              id: "cf-array",
              title: "Array Rearrangement",
              url: "https://codeforces.com/problemset/problem/300/A",
              platform: "CF",
              difficulty: "Medium",
              tags: ["arrays"]
            },
            {
              id: "gfg-swap",
              title: "Swap Two Numbers",
              url: "https://www.geeksforgeeks.org/program-to-swap-two-numbers/",
              platform: "GFG",
              difficulty: "Easy",
              tags: ["functions", "basics"]
            },
            {
              id: "cf-even-array",
              title: "Even Array",
              url: "https://codeforces.com/problemset/problem/1367/B",
              platform: "CF",
              difficulty: "Easy",
              tags: ["arrays"]
            },
              {
                id: "gfg-max-min",
                title: "Find Max and Min in Array",
                url: "https://www.geeksforgeeks.org/maximum-and-minimum-in-an-array/",
                platform: "GFG",
                difficulty: "Easy",
                tags: ["arrays"]
              },
              {
                id: "cf-sum-array",
                title: "Sum of Array Elements",
                url: "https://codeforces.com/problemset/problem/200/B",
                platform: "CF",
                difficulty: "Easy",
                tags: ["arrays"]
              },
              {
                id: "gfg-reverse-array",
                title: "Reverse an Array",
                url: "https://www.geeksforgeeks.org/write-a-program-to-reverse-an-array-or-string/",
                platform: "GFG",
                difficulty: "Easy",
                tags: ["arrays", "strings"]
              },
        ]
      }
    ]
  },
    {
      id: "recursion-backtracking",
      title: "Recursion & Backtracking",
      description: "Master recursive thinking and backtracking techniques for problem solving.",
      totalProblems: 6,
      estimatedTime: "1-2 weeks",
      icon: "🌀",
      subsections: [
        {
          id: "recursion-basics",
          title: "Recursion Basics",
          description: "Introduction to recursion and its applications.",
          estimatedTime: "3 days",
          problems: [
            {
              id: "gfg-factorial-recursion",
              title: "Factorial Using Recursion",
              url: "https://www.geeksforgeeks.org/program-for-factorial-of-a-number/",
              platform: "GFG",
              difficulty: "Easy",
              tags: ["recursion"]
            },
            {
              id: "cf-recursive-sum",
              title: "Recursive Sum Problem",
              url: "https://codeforces.com/problemset/problem/102/B",
              platform: "CF",
              difficulty: "Easy",
              tags: ["recursion"]
            }
          ]
        },
        {
          id: "backtracking-basics",
          title: "Backtracking Basics",
          description: "Classic backtracking problems and techniques.",
          estimatedTime: "4 days",
          problems: [
            {
              id: "gfg-n-queens",
              title: "N-Queens Problem",
              url: "https://www.geeksforgeeks.org/n-queen-problem-backtracking-3/",
              platform: "GFG",
              difficulty: "Medium",
              tags: ["backtracking"]
            },
            {
              id: "cf-backtracking-paths",
              title: "Backtracking Paths",
              url: "https://codeforces.com/problemset/problem/510/A",
              platform: "CF",
              difficulty: "Medium",
              tags: ["backtracking"]
            }
          ]
        },
        {
          id: "advanced-recursion",
          title: "Advanced Recursion",
          description: "Challenging recursive and backtracking problems.",
          estimatedTime: "5 days",
          problems: [
            {
              id: "gfg-subset-sum",
              title: "Subset Sum Problem",
              url: "https://www.geeksforgeeks.org/subset-sum-problem-dp-25/",
              platform: "GFG",
              difficulty: "Medium",
              tags: ["recursion", "backtracking"]
            },
            {
              id: "cf-recursive-sequences",
              title: "Recursive Sequences",
              url: "https://codeforces.com/problemset/problem/1352/C",
              platform: "CF",
              difficulty: "Hard",
              tags: ["recursion"]
            }
          ]
        }
      ]
    },
    {
      id: "greedy-algorithms",
      title: "Greedy Algorithms",
      description: "Master the art of greedy strategies for problem solving.",
      totalProblems: 6,
      estimatedTime: "1-2 weeks",
      icon: "🦅",
      subsections: [
        {
          id: "greedy-basics",
          title: "Greedy Basics",
          description: "Introduction to greedy algorithms and their applications.",
          estimatedTime: "3 days",
          problems: [
            {
              id: "cf-coins",
              title: "Coins Problem",
              url: "https://codeforces.com/problemset/problem/996/A",
              platform: "CF",
              difficulty: "Easy",
              tags: ["greedy"]
            },
            {
              id: "gfg-activity-selection",
              title: "Activity Selection",
              url: "https://www.geeksforgeeks.org/activity-selection-problem-greedy-algo-1/",
              platform: "GFG",
              difficulty: "Medium",
              tags: ["greedy", "intervals"]
            }
          ]
        },
        {
          id: "greedy-intervals",
          title: "Greedy Intervals",
          description: "Problems involving intervals and optimal selection.",
          estimatedTime: "4 days",
          problems: [
            {
              id: "cf-meeting-rooms",
              title: "Meeting Rooms",
              url: "https://codeforces.com/problemset/problem/688/B",
              platform: "CF",
              difficulty: "Medium",
              tags: ["greedy", "intervals"]
            },
            {
              id: "gfg-job-sequencing",
              title: "Job Sequencing",
              url: "https://www.geeksforgeeks.org/job-sequencing-problem/",
              platform: "GFG",
              difficulty: "Medium",
              tags: ["greedy", "scheduling"]
            }
          ]
        },
        {
          id: "advanced-greedy",
          title: "Advanced Greedy",
          description: "Challenging greedy problems and optimizations.",
          estimatedTime: "5 days",
          problems: [
            {
              id: "cf-taxi",
              title: "Taxi Problem",
              url: "https://codeforces.com/problemset/problem/158/B",
              platform: "CF",
              difficulty: "Medium",
              tags: ["greedy"]
            },
            {
              id: "gfg-huffman",
              title: "Huffman Coding",
              url: "https://www.geeksforgeeks.org/huffman-coding-greedy-algo-3/",
              platform: "GFG",
              difficulty: "Hard",
              tags: ["greedy", "encoding"]
            }
          ]
        }
      ]
    },
    {
      id: "bit-manipulation",
      title: "Bit Manipulation",
      description: "Learn and practice bitwise operations and tricks for competitive programming.",
      totalProblems: 6,
      estimatedTime: "1-2 weeks",
      icon: "🔢",
      subsections: [
        {
          id: "bit-basics",
          title: "Bitwise Basics",
          description: "Fundamental bitwise operations and their applications.",
          estimatedTime: "3 days",
          problems: [
            {
              id: "gfg-bitwise-and",
              title: "Bitwise AND Operation",
              url: "https://www.geeksforgeeks.org/bitwise-operators-in-c-cpp/",
              platform: "GFG",
              difficulty: "Easy",
              tags: ["bitwise", "and"]
            },
            {
              id: "cf-xor-problem",
              title: "XOR Problem",
              url: "https://codeforces.com/problemset/problem/282/A",
              platform: "CF",
              difficulty: "Easy",
              tags: ["bitwise", "xor"]
            }
          ]
        },
        {
          id: "bit-tricks",
          title: "Bit Tricks",
          description: "Classic bit manipulation tricks and interview problems.",
          estimatedTime: "4 days",
          problems: [
            {
              id: "gfg-count-set-bits",
              title: "Count Set Bits",
              url: "https://www.geeksforgeeks.org/count-set-bits-in-an-integer/",
              platform: "GFG",
              difficulty: "Easy",
              tags: ["bitwise", "set-bits"]
            },
            {
              id: "cf-flipping-bits",
              title: "Flipping Bits",
              url: "https://codeforces.com/problemset/problem/327/A",
              platform: "CF",
              difficulty: "Medium",
              tags: ["bitwise", "flipping"]
            }
          ]
        },
        {
          id: "advanced-bitwise",
          title: "Advanced Bitwise",
          description: "Advanced bitwise algorithms and optimization.",
          estimatedTime: "5 days",
          problems: [
            {
              id: "cf-bitmask-dp",
              title: "Bitmask DP",
              url: "https://codeforces.com/problemset/problem/429/A",
              platform: "CF",
              difficulty: "Hard",
              tags: ["bitwise", "dp", "bitmask"]
            },
            {
              id: "gfg-subset-xor",
              title: "Subset XOR Problem",
              url: "https://www.geeksforgeeks.org/subset-xor-sum/",
              platform: "GFG",
              difficulty: "Medium",
              tags: ["bitwise", "xor", "subset"]
            }
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
            {
              id: "cf-prime",
              title: "Prime Numbers",
              url: "https://codeforces.com/problemset/problem/6/A",
              platform: "CF",
              difficulty: "Easy",
              tags: ["math", "prime"]
            },
            {
              id: "gfg-modulo",
              title: "Modulo Arithmetic",
              url: "https://www.geeksforgeeks.org/modulo-operator-in-c-cpp/",
              platform: "GFG",
              difficulty: "Easy",
              tags: ["math", "modulo"]
            },
            {
              id: "cf-divisors",
              title: "Divisors",
              url: "https://codeforces.com/problemset/problem/118/A",
              platform: "CF",
              difficulty: "Easy",
              tags: ["math", "divisors"]
            },
              {
                id: "gfg-gcd",
                title: "Find GCD of Two Numbers",
                url: "https://www.geeksforgeeks.org/program-to-find-gcd-or-hcf-of-two-numbers/",
                platform: "GFG",
                difficulty: "Easy",
                tags: ["math", "gcd"]
              },
              {
                id: "cf-modulo",
                title: "Modulo Equality",
                url: "https://codeforces.com/problemset/problem/1269/A",
                platform: "CF",
                difficulty: "Easy",
                tags: ["math", "modulo"]
              },
              {
                id: "gfg-prime-check",
                title: "Check Prime Number",
                url: "https://www.geeksforgeeks.org/c-program-to-check-prime-number/",
                platform: "GFG",
                difficulty: "Easy",
                tags: ["math", "prime"]
              },
        ]
      },
      {
        id: "combinatorics",
        title: "Combinatorics",
        description: "Permutations, combinations, probability",
        estimatedTime: "1.5 weeks",
        problems: [
          // Add problems...
            {
              id: "cf-combinations",
              title: "Combinations Problem",
              url: "https://codeforces.com/problemset/problem/478/A",
              platform: "CF",
              difficulty: "Easy",
              tags: ["combinatorics"]
            },
            {
              id: "gfg-permutations",
              title: "Permutations in C++",
              url: "https://www.geeksforgeeks.org/permutations-of-a-given-string-using-stl/",
              platform: "GFG",
              difficulty: "Medium",
              tags: ["combinatorics", "stl"]
            },
            {
              id: "cf-binomial",
              title: "Binomial Coefficient",
              url: "https://codeforces.com/problemset/problem/110/A",
              platform: "CF",
              difficulty: "Easy",
              tags: ["combinatorics"]
            },
        ]
      },
      {
        id: "probability",
        title: "Probability",
        description: "Basic probability concepts and problems",
        estimatedTime: "1 week",
        problems: [
            {
              id: "cf-probability",
              title: "Probability Calculation",
              url: "https://codeforces.com/problemset/problem/630/C",
              platform: "CF",
              difficulty: "Easy",
              tags: ["probability"]
            },
            {
              id: "gfg-birthday-paradox",
              title: "Birthday Paradox",
              url: "https://www.geeksforgeeks.org/birthday-paradox/",
              platform: "GFG",
              difficulty: "Medium",
              tags: ["probability"]
            },
            {
              id: "cf-random-events",
              title: "Random Events",
              url: "https://codeforces.com/problemset/problem/1033/A",
              platform: "CF",
              difficulty: "Medium",
              tags: ["probability"]
            },
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
            {
              id: "cf-stl-set",
              title: "Set Operations",
              url: "https://codeforces.com/problemset/problem/366/A",
              platform: "CF",
              difficulty: "Easy",
              tags: ["stl", "set"]
            },
            {
              id: "cf-stl-map",
              title: "Map Usage",
              url: "https://codeforces.com/problemset/problem/160/A",
              platform: "CF",
              difficulty: "Medium",
              tags: ["stl", "map"]
            },
            {
              id: "gfg-stack",
              title: "Stack Implementation",
              url: "https://www.geeksforgeeks.org/stack-data-structure/",
              platform: "GFG",
              difficulty: "Easy",
              tags: ["stl", "stack"]
            },
              {
                id: "gfg-queue",
                title: "Queue Implementation",
                url: "https://www.geeksforgeeks.org/queue-data-structure/",
                platform: "GFG",
                difficulty: "Easy",
                tags: ["stl", "queue"]
              },
              {
                id: "cf-priority-queue",
                title: "Priority Queue Usage",
                url: "https://codeforces.com/problemset/problem/1374/B",
                platform: "CF",
                difficulty: "Medium",
                tags: ["stl", "priority_queue"]
              },
              {
                id: "gfg-map",
                title: "Map in C++ STL",
                url: "https://www.geeksforgeeks.org/map-associative-containers-the-c-standard-template-library-stl/",
                platform: "GFG",
                difficulty: "Easy",
                tags: ["stl", "map"]
              },
        ]
      },
      {
        id: "stl-algorithms",
        title: "STL Algorithms",
        description: "sort, binary_search, lower_bound, upper_bound",
        estimatedTime: "1 week",
        problems: [
            {
              id: "cf-sort",
              title: "Sorting Array",
              url: "https://codeforces.com/problemset/problem/339/A",
              platform: "CF",
              difficulty: "Easy",
              tags: ["stl", "sort"]
            },
            {
              id: "gfg-binary-search",
              title: "Binary Search in STL",
              url: "https://www.geeksforgeeks.org/binary-search-in-c-stl/",
              platform: "GFG",
              difficulty: "Easy",
              tags: ["stl", "binary_search"]
            },
            {
              id: "cf-lower-bound",
              title: "Lower Bound Usage",
              url: "https://codeforces.com/problemset/problem/977/C",
              platform: "CF",
              difficulty: "Easy",
              tags: ["stl", "lower_bound"]
            },
            {
              id: "gfg-upper-bound",
              title: "Upper Bound in STL",
              url: "https://www.geeksforgeeks.org/upper_bound-in-cpp-stl/",
              platform: "GFG",
              difficulty: "Easy",
              tags: ["stl", "upper_bound"]
            },
            {
              id: "cf-unique",
              title: "Unique Elements",
              url: "https://codeforces.com/problemset/problem/443/A",
              platform: "CF",
              difficulty: "Easy",
              tags: ["stl", "unique"]
            }
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
            {
              id: "cses-increasing-array",
              title: "Increasing Array",
              url: "https://cses.fi/problemset/task/1094",
              platform: "CSES",
              difficulty: "Easy",
              tags: ["arrays"]
            },
            {
              id: "cses-permutations",
              title: "Permutations",
              url: "https://cses.fi/problemset/task/1072",
              platform: "CSES",
              difficulty: "Easy",
              tags: ["math", "permutations"]
            },
            {
              id: "cses-bit-queries",
              title: "Bit Queries",
              url: "https://cses.fi/problemset/task/1650",
              platform: "CSES",
              difficulty: "Medium",
              tags: ["bitwise"]
            },
              {
                id: "cses-repetitions",
                title: "Repetitions",
                url: "https://cses.fi/problemset/task/1069",
                platform: "CSES",
                difficulty: "Easy",
                tags: ["strings"]
              },
              {
                id: "cses-two-sets",
                title: "Two Sets",
                url: "https://cses.fi/problemset/task/1092",
                platform: "CSES",
                difficulty: "Medium",
                tags: ["math", "sets"]
              },
              {
                id: "cses-bit-counting",
                title: "Bit Counting",
                url: "https://cses.fi/problemset/task/1617",
                platform: "CSES",
                difficulty: "Easy",
                tags: ["bitwise"]
              },
                {
                  id: "cses-trailing-zeros",
                  title: "Trailing Zeros",
                  url: "https://cses.fi/problemset/task/1618",
                  platform: "CSES",
                  difficulty: "Easy",
                  tags: ["math", "factorial"]
                },
                {
                  id: "cses-dice-probabilities",
                  title: "Dice Probabilities",
                  url: "https://cses.fi/problemset/task/1725",
                  platform: "CSES",
                  difficulty: "Medium",
                  tags: ["math", "probability"]
                },
                {
                  id: "cses-sum-of-two-values",
                  title: "Sum of Two Values",
                  url: "https://cses.fi/problemset/task/1640",
                  platform: "CSES",
                  difficulty: "Medium",
                  tags: ["math", "two-pointers"]
                },
        ]
      },
      {
        id: "cses-mathematics",
        title: "Mathematics",
        description: "Mathematical problems from CSES",
        estimatedTime: "2 weeks",
        problems: [
            {
              id: "cses-prime-count",
              title: "Counting Primes",
              url: "https://cses.fi/problemset/task/2180",
              platform: "CSES",
              difficulty: "Medium",
              tags: ["math", "prime"]
            },
            {
              id: "cses-binomial-coefficient",
              title: "Binomial Coefficient",
              url: "https://cses.fi/problemset/task/1079",
              platform: "CSES",
              difficulty: "Medium",
              tags: ["math", "combinatorics"]
            },
            {
              id: "cses-modular-inverse",
              title: "Modular Inverse",
              url: "https://cses.fi/problemset/task/1712",
              platform: "CSES",
              difficulty: "Hard",
              tags: ["math", "modulo"]
            }
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
            {
              id: "gfg-prefix-sum-array",
              title: "Prefix Sum of Array",
              url: "https://www.geeksforgeeks.org/prefix-sum-array-implementation-applications-competitive-programming/",
              platform: "GFG",
              difficulty: "Easy",
              tags: ["prefix-sum", "arrays"]
            },
            {
              id: "cf-subarray-sum",
              title: "Subarray Sum Problem",
              url: "https://codeforces.com/problemset/problem/978/B",
              platform: "CF",
              difficulty: "Medium",
              tags: ["prefix-sum", "subarray"]
            },
        ]
      },
      {
        id: "binary-search",
        title: "Binary Search",
        description: "Search algorithms and their applications",
        estimatedTime: "1 week",
        problems: [
          {
            id: "gfg-binary-search-basic",
            title: "Binary Search Basic",
            url: "https://www.geeksforgeeks.org/binary-search/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["binary-search"]
          },
          {
            id: "cf-binary-search-apps",
            title: "Binary Search Applications",
            url: "https://codeforces.com/problemset/problem/812/B",
            platform: "CF",
            difficulty: "Medium",
            tags: ["binary-search", "applications"]
          },
        ]
      },
      {
        id: "sliding-window",
        title: "Sliding Window",
        description: "Window-based optimization techniques",
        estimatedTime: "1 week",
        problems: [
          {
            id: "gfg-sliding-window-max",
            title: "Sliding Window Maximum",
            url: "https://www.geeksforgeeks.org/sliding-window-maximum-maximum-of-all-subarrays-of-size-k/",
            platform: "GFG",
            difficulty: "Medium",
            tags: ["sliding-window", "arrays"]
          },
          {
            id: "cf-sliding-window-sum",
            title: "Sliding Window Sum",
            url: "https://codeforces.com/problemset/problem/1154/A",
            platform: "CF",
            difficulty: "Easy",
            tags: ["sliding-window", "sum"]
          },
        ]
      },
      {
        id: "two-pointer",
        title: "Two Pointer",
        description: "Two pointer technique for arrays",
        estimatedTime: "1 week",
        problems: [
          {
            id: "gfg-graph-bfs",
            title: "Breadth First Search (BFS)",
            url: "https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["graph", "bfs"]
          },
          {
            id: "cf-graph-shortest-path",
            title: "Shortest Path in Graph",
            url: "https://codeforces.com/problemset/problem/20/C",
            platform: "CF",
            difficulty: "Medium",
            tags: ["graph", "shortest-path"]
          },
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
          {
            id: "cf-div3-a-1",
            title: "Div3 A: Theatre Square",
            url: "https://codeforces.com/problemset/problem/1/A",
            platform: "CF",
            difficulty: "Easy",
            tags: ["div3", "A"]
          },
          {
            id: "cf-div3-b-1",
            title: "Div3 B: Beautiful Matrix",
            url: "https://codeforces.com/problemset/problem/263/A",
            platform: "CF",
            difficulty: "Easy",
            tags: ["div3", "B"]
          },
          {
            id: "cf-div3-c-1",
            title: "Div3 C: Helpful Maths",
            url: "https://codeforces.com/problemset/problem/339/A",
            platform: "CF",
            difficulty: "Easy",
            tags: ["div3", "C"]
          },
          {
            id: "cf-div3-d-1",
            title: "Div3 D: Gravity Flip",
            url: "https://codeforces.com/problemset/problem/405/A",
            platform: "CF",
            difficulty: "Easy",
            tags: ["div3", "D"]
          },
        ]
      },
      {
        id: "div2-a",
        title: "Div2 A",
        description: "Master Div2 A problems",
        estimatedTime: "2 weeks",
        problems: [
          {
            id: "cf-div2-a-1",
            title: "Div2 A: Watermelon",
            url: "https://codeforces.com/problemset/problem/4/A",
            platform: "CF",
            difficulty: "Easy",
            tags: ["div2", "A"]
          },
          {
            id: "cf-div2-a-2",
            title: "Div2 A: Bit++",
            url: "https://codeforces.com/problemset/problem/282/A",
            platform: "CF",
            difficulty: "Easy",
            tags: ["div2", "A"]
          },
          {
            id: "cf-div2-a-3",
            title: "Div2 A: Petya and Strings",
            url: "https://codeforces.com/problemset/problem/112/A",
            platform: "CF",
            difficulty: "Easy",
            tags: ["div2", "A"]
          }
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