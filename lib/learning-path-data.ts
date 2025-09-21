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
    totalProblems: 53,
    estimatedTime: "2 weeks",
    icon: "💻",
    subsections: [
      {
        id: "cpp-basics",
        title: "C++ Syntax & Basics",
        description: "Variables, operators, control structures",
        estimatedTime: "1 week",
        problems: [
          {
            id: "cpp1",
            title: "Hello World",
            url: "https://www.geeksforgeeks.org/c-hello-world-program/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["basics", "syntax"]
          },
          {
            id: "cpp2",
            title: "Display Your Name",
            url: "https://www.geeksforgeeks.org/program-display-name-cpp/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["basics", "io"]
          },
          {
            id: "cpp3",
            title: "User Input",
            url: "https://www.geeksforgeeks.org/basic-input-output-c/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["input", "io"]
          },
          {
            id: "cpp4",
            title: "Sum of Two Numbers",
            url: "https://www.geeksforgeeks.org/program-calculate-sum-numbers-cpp/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arithmetic", "basics"]
          },
          {
            id: "cpp5",
            title: "Swap two numbers",
            url: "https://www.geeksforgeeks.org/cpp-program-to-swap-two-numbers/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arithmetic", "variables"]
          },
          {
            id: "cpp6",
            title: "Size of int, float, double, char",
            url: "https://www.geeksforgeeks.org/c-program-to-find-size-of-int-float-double-and-char-in-your-system/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["variables", "basics"]
          },
          {
            id: "cpp7",
            title: "Float Multiplication",
            url: "https://www.geeksforgeeks.org/cpp-program-to-multiply-two-floating-point-numbers/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arithmetic", "basics"]
          },
          {
            id: "cpp8",
            title: "ASCII Value of a Character",
            url: "https://www.geeksforgeeks.org/cpp-program-to-find-ascii-value-of-a-character/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["characters", "basics"]
          },
          {
            id: "cpp9",
            title: "Convert Fahrenheit to Celsius",
            url: "https://www.geeksforgeeks.org/c-program-for-celsius-to-fahrenheit-conversion/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arithmetic", "basics"]
          },
          {
            id: "cpp10",
            title: "Calculate Simple Interest",
            url: "https://www.geeksforgeeks.org/program-to-calculate-simple-interest/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arithmetic", "basics"]
          },
          {
            id: "cpp11",
            title: "Calculate Compound Interest",
            url: "https://www.geeksforgeeks.org/c-program-to-calculate-compound-interest/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arithmetic", "basics"]
          },
          {
            id: "cpp12",
            title: "Area and Perimeter of Rectangle",
            url: "https://www.geeksforgeeks.org/c-program-to-calculate-area-and-perimeter-of-a-rectangle/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arithmetic", "basics"]
          },
          // C++ Control Flow Programs
          {
            id: "cpp13",
            title: "Check for Even Odd",
            url: "https://www.geeksforgeeks.org/cpp-program-to-check-if-a-number-is-even-or-odd/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["control-flow", "if-else"]
          },
          {
            id: "cpp14",
            title: "Largest Among 3",
            url: "https://www.geeksforgeeks.org/cpp-program-to-find-largest-among-three-numbers/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["control-flow", "if-else"]
          },
          {
            id: "cpp15",
            title: "Vowel/Consonant Check",
            url: "https://www.geeksforgeeks.org/cpp-program-to-check-character-is-vowel-or-consonant/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["control-flow", "if-else"]
          },
          {
            id: "cpp16",
            title: "Leap Year Check",
            url: "https://www.geeksforgeeks.org/c-cpp-program-to-check-leap-year/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["control-flow", "if-else"]
          },
          {
            id: "cpp17",
            title: "Multiplication Table",
            url: "https://www.geeksforgeeks.org/cpp-program-to-generate-multiplication-table/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["loops", "basics"]
          },
          {
            id: "cpp18",
            title: "Sum of n Natural Numbers",
            url: "https://www.geeksforgeeks.org/cpp-program-to-find-sum-of-natural-numbers/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["loops", "arithmetic"]
          },
          {
            id: "cpp19",
            title: "Factorial of a Number",
            url: "https://www.geeksforgeeks.org/c-program-for-factorial-of-a-number/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["loops", "arithmetic"]
          },
          {
            id: "cpp20",
            title: "Reverse a Number",
            url: "https://www.geeksforgeeks.org/reverse-digits-integer-overflow-handled/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["loops", "arithmetic"]
          },
          {
            id: "cpp21",
            title: "GCD of two numbers",
            url: "https://www.geeksforgeeks.org/c-program-find-gcd-hcf-two-numbers/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["loops", "arithmetic"]
          },
          {
            id: "cpp22",
            title: "LCM of two numbers",
            url: "https://www.geeksforgeeks.org/c-program-to-calculate-lcm-of-two-numbers/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["loops", "arithmetic"]
          },
          {
            id: "cpp23",
            title: "Palindrome Check",
            url: "https://www.geeksforgeeks.org/cpp-program-to-check-whether-a-number-is-palindrome-or-not/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["control-flow", "loops"]
          },
          {
            id: "cpp24",
            title: "Prime Check",
            url: "https://www.geeksforgeeks.org/cpp-program-to-check-whether-a-number-is-prime-or-not/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["loops", "math"]
          },
          {
            id: "cpp25",
            title: "Primes in Range",
            url: "https://www.geeksforgeeks.org/cpp/cpp-program-to-find-prime-numbers-between-given-interval/",
            platform: "GFG",
            difficulty: "Medium",
            tags: ["loops", "math"]
          },
          {
            id: "cpp26",
            title: "Armstrong Number",
            url: "https://www.geeksforgeeks.org/cpp/cpp-program-to-check-armstrong-numbers/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["loops", "math"]
          },
          {
            id: "cpp27",
            title: "Armstrong Numbers Between 1 to 1000",
            url: "https://www.geeksforgeeks.org/cpp/cpp-program-to-print-armstrong-numbers-between-1-to-1000/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["loops", "math"]
          },
          {
            id: "cpp28",
            title: "nth Fibonacci Number",
            url: "https://www.geeksforgeeks.org/cpp/cpp-program-for-fibonacci-numbers/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["loops", "math"]
          },
          {
            id: "cpp29",
            title: "Basic Calculator",
            url: "https://www.geeksforgeeks.org/cpp/c-c-program-to-make-a-simple-calculator/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["conditionals", "math"]
          },
          {
            id: "cpp30",
            title: "Right Half Pyramid",
            url: "https://www.geeksforgeeks.org/cpp-program-to-print-pyramid-patterns/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["patterns", "loops"]
          },
          {
            id: "cpp31",
            title: "Left Half Pyramid",
            url: "https://www.geeksforgeeks.org/cpp-program-to-print-pyramid-patterns/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["patterns", "loops"]
          },
          {
            id: "cpp32",
            title: "Full Pyramid",
            url: "https://www.geeksforgeeks.org/cpp-program-to-print-pyramid-patterns/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["patterns", "loops"]
          },
          {
            id: "cpp33",
            title: "Inverted Pyramid",
            url: "https://www.geeksforgeeks.org/cpp-program-to-print-pyramid-patterns/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["patterns", "loops"]
          },
          {
            id: "cpp34",
            title: "Triangle Pattern",
            url: "https://www.geeksforgeeks.org/cpp-program-to-print-pyramid-patterns/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["patterns", "loops"]
          }
          // ...add more as needed
        ]
      },
      {
        id: "cpp-functions",
        title: "Functions & Arrays",
        description: "Functions, arrays, and basic algorithms",
        estimatedTime: "1 week",
        problems: [
          {
            id: "cpp35",
            title: "C++ Functions",
            url: "https://www.geeksforgeeks.org/functions-in-c/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["functions"]
          },
          {
            id: "cpp36",
            title: "Primes in Range",
            url: "https://www.geeksforgeeks.org/c-program-to-print-all-prime-numbers-between-1-to-n/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["functions", "math"]
          },
          {
            id: "cpp37",
            title: "Sum of Two Primes Check",
            url: "https://www.geeksforgeeks.org/check-if-a-number-can-be-expressed-as-sum-of-two-primes/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["functions", "math"]
          },
          {
            id: "cpp38",
            title: "Recursive Sum of n",
            url: "https://www.geeksforgeeks.org/program-to-find-sum-of-first-n-natural-numbers-using-recursion/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["functions", "recursion"]
          },
          {
            id: "cpp39",
            title: "Factorial using Recursion",
            url: "https://www.geeksforgeeks.org/program-for-factorial-of-a-number/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["functions", "recursion"]
          },
          {
            id: "cpp40",
            title: "Recursive Sentence Reverse",
            url: "https://www.geeksforgeeks.org/program-reverse-sentence-word-wise/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["functions", "recursion", "strings"]
          },
          {
            id: "cpp41",
            title: "Power using Recursion",
            url: "https://www.geeksforgeeks.org/write-a-c-program-to-calculate-powxn/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["functions", "recursion"]
          },
          {
            id: "cpp42",
            title: "Variadic Templates",
            url: "https://www.geeksforgeeks.org/variadic-templates-in-c/",
            platform: "GFG",
            difficulty: "Medium",
            tags: ["functions", "templates"]
          },
          // C++ Array Programs
          {
            id: "cpp43",
            title: "Array Equality Check",
            url: "https://www.geeksforgeeks.org/check-if-two-arrays-are-equal-or-not/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arrays"]
          },
          {
            id: "cpp44",
            title: "Array Max & Min",
            url: "https://www.geeksforgeeks.org/maximum-and-minimum-in-an-array/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arrays"]
          },
          {
            id: "cpp45",
            title: "Array Average",
            url: "https://www.geeksforgeeks.org/c-program-to-calculate-average-using-arrays/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arrays", "math"]
          },
          {
            id: "cpp46",
            title: "Merge Arrays",
            url: "https://www.geeksforgeeks.org/merge-two-sorted-arrays/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arrays", "sorting"]
          },
          {
            id: "cpp47",
            title: "2D Array",
            url: "https://www.geeksforgeeks.org/multidimensional-arrays-in-c-cpp/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arrays", "2d"]
          },
          {
            id: "cpp48",
            title: "Common Array Elements",
            url: "https://www.geeksforgeeks.org/common-elements-in-all-rows-of-a-given-matrix/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arrays"]
          },
          {
            id: "cpp49",
            title: "Remove Duplicates",
            url: "https://www.geeksforgeeks.org/remove-duplicates-sorted-array/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arrays"]
          },
          {
            id: "cpp50",
            title: "Remove Element",
            url: "https://www.geeksforgeeks.org/remove-element-array/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arrays"]
          },
          {
            id: "cpp51",
            title: "Prefix Sum",
            url: "https://www.geeksforgeeks.org/prefix-sum-array-implementation-applications-competitive-programming/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arrays", "prefix-sum"]
          },
          {
            id: "cpp52",
            title: "Rotate Array",
            url: "https://www.geeksforgeeks.org/array-rotation/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arrays"]
          },
          {
            id: "cpp53",
            title: "Reverse Copy Array",
            url: "https://www.geeksforgeeks.org/write-a-program-to-reverse-an-array-or-string/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["arrays", "reverse"]
          }
        ]
      }
    ]
  },
  {
    id: "mathematics",
    title: "Mathematics",
    description: "Essential mathematical concepts for competitive programming",
    totalProblems: 28,
    estimatedTime: "2 weeks",
    icon: "🧮",
    subsections: [
      {
        id: "number-theory",
        title: "Number Theory",
        description: "GCD, LCM, Prime numbers, Modular arithmetic",
        estimatedTime: "2 weeks",
        problems: [
          // Easy
          { id: "mul7", title: "Efficient Way to Multiply with 7", url: "https://www.geeksforgeeks.org/efficient-way-to-multiply-with-7/", platform: "GFG", difficulty: "Easy", tags: ["math"] },
          { id: "div7", title: "Check Divisibility by 7", url: "https://www.geeksforgeeks.org/check-divisibility-by-7/", platform: "GFG", difficulty: "Easy", tags: ["math", "divisibility"] },
          { id: "fib-check", title: "Check if a Number is Fibonacci", url: "https://www.geeksforgeeks.org/check-number-fibonacci-number/", platform: "GFG", difficulty: "Easy", tags: ["math", "fibonacci"] },
          { id: "mul-noloop", title: "Multiply Without Operators", url: "https://www.geeksforgeeks.org/multiply-two-integers-without-using-multiplication-division-and-bitwise-operators-and-no-loops/", platform: "GFG", difficulty: "Easy", tags: ["math", "trick"] },
          { id: "power-custom", title: "Power Without * and /", url: "https://www.geeksforgeeks.org/write-your-own-power-without-using-multiplication-and-division-operators/", platform: "GFG", difficulty: "Easy", tags: ["math", "power"] },
          { id: "avg-stream", title: "Average of a Stream", url: "https://www.geeksforgeeks.org/average-of-a-stream-of-numbers/", platform: "GFG", difficulty: "Easy", tags: ["math", "stream"] },
          { id: "point-triangle", title: "Point Inside Triangle", url: "https://www.geeksforgeeks.org/check-whether-given-point-lies-inside-triangle-not/", platform: "GFG", difficulty: "Easy", tags: ["geometry"] },
          { id: "prime-factors", title: "Prime Factors", url: "https://www.geeksforgeeks.org/efficient-program-to-print-all-prime-factors-of-a-given-number/", platform: "GFG", difficulty: "Easy", tags: ["math", "prime"] },
          { id: "russian-mul", title: "Russian Peasant Multiplication", url: "https://www.geeksforgeeks.org/russian-peasant-multiply-two-numbers-using-bitwise-operators/", platform: "GFG", difficulty: "Easy", tags: ["math", "bitwise"] },

          // Medium
          { id: "sieve", title: "Sieve of Eratosthenes", url: "https://www.geeksforgeeks.org/sieve-of-eratosthenes/", platform: "GFG", difficulty: "Medium", tags: ["math", "prime"] },
          { id: "mul3", title: "Check Multiple of 3", url: "https://www.geeksforgeeks.org/write-an-efficient-method-to-check-if-a-number-is-multiple-of-3/", platform: "GFG", difficulty: "Medium", tags: ["math", "bit"] },
          { id: "perm-string", title: "All Permutations of String", url: "https://www.geeksforgeeks.org/write-a-program-to-print-all-permutations-of-a-given-string/", platform: "GFG", difficulty: "Medium", tags: ["backtracking"] },
          { id: "lucky", title: "Lucky Numbers", url: "https://www.geeksforgeeks.org/lucky-numbers/", platform: "GFG", difficulty: "Medium", tags: ["math"] },
          { id: "base14", title: "Add Numbers in Base 14", url: "https://www.geeksforgeeks.org/write-a-program-to-add-two-numbers-in-base-14/", platform: "GFG", difficulty: "Medium", tags: ["math", "base"] },
          { id: "babylonian-sqrt", title: "Babylonian Square Root", url: "https://www.geeksforgeeks.org/square-root-of-a-perfect-square/", platform: "GFG", difficulty: "Medium", tags: ["math", "sqrt"] },
          { id: "sum-combinations", title: "Combinations of Points", url: "https://www.geeksforgeeks.org/print-all-combinations-of-points-that-can-compose-a-given-number/", platform: "GFG", difficulty: "Medium", tags: ["math", "dp"] },
          { id: "fair-coin", title: "Fair Coin from Biased Coin", url: "https://www.geeksforgeeks.org/make-a-fair-coin-from-a-biased-coin/", platform: "GFG", difficulty: "Medium", tags: ["probability"] },
          { id: "shuffle", title: "Fisher–Yates Shuffle", url: "https://www.geeksforgeeks.org/shuffle-a-given-array-using-fisher-yates-shuffle-algorithm/", platform: "GFG", difficulty: "Medium", tags: ["random"] },

          // Hard
          { id: "count-3", title: "Count Numbers Without 3", url: "https://www.geeksforgeeks.org/count-numbers-that-dont-contain-3/", platform: "GFG", difficulty: "Hard", tags: ["math"] },
          { id: "magic-square", title: "Magic Square (Odd Order)", url: "https://www.geeksforgeeks.org/magic-square/", platform: "GFG", difficulty: "Hard", tags: ["math", "matrix"] },
          { id: "largest-mul3", title: "Largest Multiple of 3", url: "https://www.geeksforgeeks.org/find-the-largest-multiple-of-3/", platform: "GFG", difficulty: "Hard", tags: ["math", "queue"] },
          { id: "dfa-div", title: "DFA Based Division", url: "https://www.geeksforgeeks.org/dfa-based-division/", platform: "GFG", difficulty: "Hard", tags: ["automata"] },
          { id: "rand1-7", title: "Generate 1-7 with Equal Probability", url: "https://www.geeksforgeeks.org/generate-integer-from-1-to-7-with-equal-probability/", platform: "GFG", difficulty: "Hard", tags: ["probability"] },
          { id: "next-palindrome", title: "Next Smallest Palindrome", url: "https://www.geeksforgeeks.org/given-a-number-find-next-smallest-palindrome-larger-than-this-number/", platform: "GFG", difficulty: "Hard", tags: ["math", "palindrome"] },
          { id: "day-week", title: "Day of Week for Date", url: "https://www.geeksforgeeks.org/find-day-of-the-week-for-a-given-date/", platform: "GFG", difficulty: "Hard", tags: ["math", "date"] },
          { id: "lexi-perm", title: "Lexicographic Permutations", url: "https://www.geeksforgeeks.org/lexicographic-permutations-of-string/", platform: "GFG", difficulty: "Hard", tags: ["backtracking"] },
          { id: "reservoir-sampling", title: "Reservoir Sampling", url: "https://www.geeksforgeeks.org/reservoir-sampling/", platform: "GFG", difficulty: "Hard", tags: ["probability"] },
          { id: "lexi-rank", title: "Lexicographic Rank of String", url: "https://www.geeksforgeeks.org/lexicographic-rank-of-a-string/", platform: "GFG", difficulty: "Hard", tags: ["math", "string"] }
        ]

      },
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