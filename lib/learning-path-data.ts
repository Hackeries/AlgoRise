export type Problem = {
  id: string
  title: string
  url: string
  platform: "CF" | "GFG" | "USACO" | "AtCoder" | "CSES" | "LeetCode" | "Codeforces"
  difficulty: "Easy" | "Medium" | "Hard" | "Div3" | "Div2-A" | "Div2-B" | "Div2-C" | "Div2-D"
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
    totalProblems: 12,
    estimatedTime: "1 weeks",
    icon: "📚",
    subsections: [
      {
        id: "stl-containers",
        title: "STL Containers",
        description: "Vector, set, map, queue, stack, priority_queue",
        estimatedTime: "1 day",
        problems: [
          {
            id: "vector-insertion",
            title: "Vector insertion",
            url: "https://www.geeksforgeeks.org/problems/vector-insertion/1",
            platform: "CF",
            difficulty: "Easy",
            tags: ["stl", "vector"]
          },
          {
            id: "sort-and-reverse-vector",
            title: "Sort and Reverse Vector",
            url: "https://www.geeksforgeeks.org/problems/sort-and-reverse-vector/1",
            platform: "CF",
            difficulty: "Easy",
            tags: ["stl", "vector"]
          },
          {
            id: "set-insertion-and-deletion",
            title: "Set Insertion and Deletion",
            url: "https://www.geeksforgeeks.org/cpp/cpp-stl-set-insertion-and-deletion/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["stl", "set"]
          },
          {
            id: "set-basic-operations",
            title: "Set Basic Operations",
            url: "https://www.geeksforgeeks.org/set-in-cpp-stl/",
            platform: "GFG",
            difficulty: "Easy",
            tags: ["stl", "set"]
          }
        ]
      },
      {
        id: "stl-algorithms",
        title: "STL Algorithms",
        description: "sort, binary_search, lower_bound, upper_bound",
        estimatedTime: "3-4 days",
        problems: [
          {
            id: "sort-colors",
            title: "Sort an Array of 0s, 1s, and 2s",
            url: "https://leetcode.com/problems/sort-colors/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["stl", "sort"]
          },
          {
            id: "sort-people",
            title: "Sort the People",
            "url": "https://leetcode.com/problems/sort-the-people/",
            "platform": "LeetCode",
            "difficulty": "Easy",
            "tags": ["stl", "sort"]
          },
          {
            id: "binary-search",
            title: "Binary Search",
            "url": "https://leetcode.com/problems/binary-search/",
            "platform": "LeetCode",
            "difficulty": "Easy",
            "tags": ["stl", "binary_search"]
          },
          {
            id: "guess-number",
            title: "Guess Number Higher or Lower",
            "url": "https://leetcode.com/problems/guess-number-higher-or-lower/",
            "platform": "LeetCode",
            "difficulty": "Easy",
            "tags": ["stl", "binary_search"]
          },
          {
            id: "search-insert",
            title: "Search Insert Position",
            "url": "https://leetcode.com/problems/search-insert-position/",
            "platform": "LeetCode",
            "difficulty": "Easy",
            "tags": ["stl", "lower_bound"]
          },
          {
            id: "first-last-position",
            title: "Find First and Last Position of Element in Sorted Array",
            "url": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
            "platform": "LeetCode",
            "difficulty": "Easy",
            "tags": ["stl", "lower_bound"]
          },
          {
            id: "smallest-letter",
            title: "Find Smallest Letter Greater Than Target",
            "url": "https://leetcode.com/problems/find-smallest-letter-greater-than-target/",
            "platform": "LeetCode",
            "difficulty": "Easy",
            "tags": ["stl", "upper_bound"]
          },
          {
            id: "kth-missing",
            title: "Kth Missing Positive Number",
            "url": "https://leetcode.com/problems/kth-missing-positive-number/",
            "platform": "LeetCode",
            "difficulty": "Easy",
            "tags": ["stl", "upper_bound"]
          }
        ]
      }
    ]
  },
  {
    id: "cses",
    title: "CSES Problem Set",
    description: "High-quality problems from CSES",
    totalProblems: 73,
    estimatedTime: "4-5 weeks",
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
            id: "cses-repetitions",
            title: "Repetitions",
            url: "https://cses.fi/problemset/task/1069",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["implementation"]
          },
          {
            id: "cses-increasing-array",
            title: "Increasing Array",
            url: "https://cses.fi/problemset/task/1094",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["implementation"]
          },
          {
            id: "cses-permutations",
            title: "Permutations",
            url: "https://cses.fi/problemset/task/1070",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["constructive"]
          },
          {
            id: "cses-number-spiral",
            title: "Number Spiral",
            url: "https://cses.fi/problemset/task/1071",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["math", "pattern"]
          },
          {
            id: "cses-two-knights",
            title: "Two Knights",
            url: "https://cses.fi/problemset/task/1072",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["math", "combinatorics"]
          },
          {
            id: "cses-two-sets",
            title: "Two Sets",
            url: "https://cses.fi/problemset/task/1092",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["constructive"]
          },
          {
            id: "cses-bit-strings",
            title: "Bit Strings",
            url: "https://cses.fi/problemset/task/1617",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["math", "modular-arithmetic"]
          },
          {
            id: "cses-trailing-zeros",
            title: "Trailing Zeros",
            url: "https://cses.fi/problemset/task/1618",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["math"]
          },
          {
            id: "cses-coin-piles",
            title: "Coin Piles",
            url: "https://cses.fi/problemset/task/1754",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["math"]
          },
          {
            id: "cses-palindrome-reorder",
            title: "Palindrome Reorder",
            url: "https://cses.fi/problemset/task/1755",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["string", "constructive"]
          },
          {
            id: "cses-gray-code",
            title: "Gray Code",
            url: "https://cses.fi/problemset/task/2205",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["recursion", "bit-manipulation"]
          },
          {
            id: "cses-tower-hanoi",
            title: "Tower of Hanoi",
            url: "https://cses.fi/problemset/task/2165",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["recursion"]
          },
          {
            id: "cses-creating-strings",
            title: "Creating Strings",
            url: "https://cses.fi/problemset/task/1622",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["recursion", "backtracking"]
          },
          {
            id: "cses-apple-division",
            title: "Apple Division",
            url: "https://cses.fi/problemset/task/1623",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["recursion", "backtracking"]
          },
          {
            id: "cses-chessboard-queens",
            title: "Chessboard and Queens",
            url: "https://cses.fi/problemset/task/1624",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["backtracking"]
          },
          {
            id: "cses-digit-queries",
            title: "Digit Queries",
            url: "https://cses.fi/problemset/task/2431",
            platform: "CSES",
            difficulty: "Hard",
            tags: ["math"]
          },
          {
            id: "cses-grid-paths",
            title: "Grid Paths",
            url: "https://cses.fi/problemset/task/1625",
            platform: "CSES",
            difficulty: "Hard",
            tags: ["backtracking", "optimization"]
          }
        ]
      },
      {
        id: "cses-sorting-searching",
        title: "Sorting and Searching",
        description: "Fundamental algorithms for sorting and searching",
        estimatedTime: "2 weeks",
        problems: [
          {
            id: "cses-distinct-numbers",
            title: "Distinct Numbers",
            url: "https://cses.fi/problemset/task/1621",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["sorting", "data-structures"]
          },
          {
            id: "cses-apartments",
            title: "Apartments",
            url: "https://cses.fi/problemset/task/1084",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["sorting", "two-pointers"]
          },
          {
            id: "cses-ferris-wheel",
            title: "Ferris Wheel",
            url: "https://cses.fi/problemset/task/1090",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["sorting", "two-pointers"]
          },
          {
            id: "cses-concert-tickets",
            title: "Concert Tickets",
            url: "https://cses.fi/problemset/task/1091",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["data-structures", "binary-search"]
          },
          {
            id: "cses-restaurant-customers",
            title: "Restaurant Customers",
            url: "https://cses.fi/problemset/task/1619",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["sorting", "sweep-line"]
          },
          {
            id: "cses-movie-festival",
            title: "Movie Festival",
            url: "https://cses.fi/problemset/task/1629",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["greedy", "sorting"]
          },
          {
            id: "cses-sum-two-values",
            title: "Sum of Two Values",
            url: "https://cses.fi/problemset/task/1640",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["two-pointers", "hashing"]
          },
          {
            id: "cses-maximum-subarray-sum",
            title: "Maximum Subarray Sum",
            url: "https://cses.fi/problemset/task/1643",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["dynamic-programming"]
          },
          {
            id: "cses-stick-lengths",
            title: "Stick Lengths",
            url: "https://cses.fi/problemset/task/1074",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["sorting", "median"]
          },
          {
            id: "cses-missing-coin-sum",
            title: "Missing Coin Sum",
            url: "https://cses.fi/problemset/task/2183",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["greedy", "sorting"]
          }
        ]
      },
      {
        id: "cses-dynamic-programming",
        title: "Dynamic Programming",
        description: "Classic DP problems and techniques",
        estimatedTime: "2-3 weeks",
        problems: [
          {
            id: "cses-dice-combinations",
            title: "Dice Combinations",
            url: "https://cses.fi/problemset/task/1633",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["dynamic-programming"]
          },
          {
            id: "cses-minimizing-coins",
            title: "Minimizing Coins",
            url: "https://cses.fi/problemset/task/1634",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["dynamic-programming"]
          },
          {
            id: "cses-coin-combinations-i",
            title: "Coin Combinations I",
            url: "https://cses.fi/problemset/task/1635",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["dynamic-programming"]
          },
          {
            id: "cses-coin-combinations-ii",
            title: "Coin Combinations II",
            url: "https://cses.fi/problemset/task/1636",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["dynamic-programming"]
          },
          {
            id: "cses-removing-digits",
            title: "Removing Digits",
            url: "https://cses.fi/problemset/task/1637",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["dynamic-programming"]
          },
          {
            id: "cses-grid-paths-dp",
            title: "Grid Paths",
            url: "https://cses.fi/problemset/task/1638",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["dynamic-programming", "grid"]
          },
          {
            id: "cses-book-shop",
            title: "Book Shop",
            url: "https://cses.fi/problemset/task/1158",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["dynamic-programming", "knapsack"]
          },
          {
            id: "cses-array-description",
            title: "Array Description",
            url: "https://cses.fi/problemset/task/1746",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "cses-counting-towers",
            title: "Counting Towers",
            url: "https://cses.fi/problemset/task/2413",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "cses-edit-distance",
            title: "Edit Distance",
            url: "https://cses.fi/problemset/task/1639",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["dynamic-programming", "string"]
          }
        ]
      },
      {
        id: "cses-graph-algorithms",
        title: "Graph Algorithms",
        description: "Essential graph algorithms and techniques",
        estimatedTime: "2-3 weeks",
        problems: [
          {
            id: "cses-counting-rooms",
            title: "Counting Rooms",
            url: "https://cses.fi/problemset/task/1192",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["graph", "dfs", "bfs"]
          },
          {
            id: "cses-labyrinth",
            title: "Labyrinth",
            url: "https://cses.fi/problemset/task/1193",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["graph", "bfs"]
          },
          {
            id: "cses-building-roads",
            title: "Building Roads",
            url: "https://cses.fi/problemset/task/1666",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["graph", "dfs"]
          },
          {
            id: "cses-message-route",
            title: "Message Route",
            url: "https://cses.fi/problemset/task/1667",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["graph", "bfs"]
          },
          {
            id: "cses-building-teams",
            title: "Building Teams",
            url: "https://cses.fi/problemset/task/1668",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["graph", "bipartite"]
          },
          {
            id: "cses-round-trip",
            title: "Round Trip",
            url: "https://cses.fi/problemset/task/1669",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["graph", "cycle-detection"]
          },
          {
            id: "cses-shortest-routes-i",
            title: "Shortest Routes I",
            url: "https://cses.fi/problemset/task/1671",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["graph", "dijkstra"]
          },
          {
            id: "cses-shortest-routes-ii",
            title: "Shortest Routes II",
            url: "https://cses.fi/problemset/task/1672",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["graph", "floyd-warshall"]
          },
          {
            id: "cses-high-score",
            title: "High Score",
            url: "https://cses.fi/problemset/task/1673",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["graph", "bellman-ford"]
          },
          {
            id: "cses-course-schedule",
            title: "Course Schedule",
            url: "https://cses.fi/problemset/task/1679",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["graph", "topological-sort"]
          }
        ]
      },
      {
        id: "cses-mathematics",
        title: "Mathematics",
        description: "Mathematical problems and number theory",
        estimatedTime: "2 weeks",
        problems: [
          {
            id: "cses-josephus-queries",
            title: "Josephus Queries",
            url: "https://cses.fi/problemset/task/2164",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["math", "recursion"]
          },
          {
            id: "cses-exponentiation",
            title: "Exponentiation",
            url: "https://cses.fi/problemset/task/1095",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["math", "modular-arithmetic"]
          },
          {
            id: "cses-exponentiation-ii",
            title: "Exponentiation II",
            url: "https://cses.fi/problemset/task/1712",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["math", "modular-arithmetic"]
          },
          {
            id: "cses-counting-divisors",
            title: "Counting Divisors",
            url: "https://cses.fi/problemset/task/1713",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["math", "number-theory"]
          },
          {
            id: "cses-common-divisors",
            title: "Common Divisors",
            url: "https://cses.fi/problemset/task/1081",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["math", "gcd"]
          },
          {
            id: "cses-sum-divisors",
            title: "Sum of Divisors",
            url: "https://cses.fi/problemset/task/1082",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["math", "number-theory"]
          },
          {
            id: "cses-divisor-analysis",
            title: "Divisor Analysis",
            url: "https://cses.fi/problemset/task/2182",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["math", "prime-factorization"]
          },
          {
            id: "cses-prime-multiples",
            title: "Prime Multiples",
            url: "https://cses.fi/problemset/task/2185",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["math", "inclusion-exclusion"]
          },
          {
            id: "cses-binomial-coefficients",
            title: "Binomial Coefficients",
            url: "https://cses.fi/problemset/task/1079",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["math", "combinatorics"]
          },
          {
            id: "cses-creating-strings-ii",
            title: "Creating Strings II",
            url: "https://cses.fi/problemset/task/1715",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["math", "combinatorics"]
          },
          {
            id: "cses-fibonacci-numbers",
            title: "Fibonacci Numbers",
            url: "https://cses.fi/problemset/task/1722",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["math", "matrix-exponentiation"]
          },
          {
            id: "cses-nim-game-i",
            title: "Nim Game I",
            url: "https://cses.fi/problemset/task/1730",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["game-theory"]
          }
        ]
      },
      {
        id: "cses-range-queries",
        title: "Range Queries",
        description: "Data structures for range operations",
        estimatedTime: "2 weeks",
        problems: [
          {
            id: "cses-static-range-sum",
            title: "Static Range Sum Queries",
            url: "https://cses.fi/problemset/task/1646",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["prefix-sum"]
          },
          {
            id: "cses-static-range-min",
            title: "Static Range Minimum Queries",
            url: "https://cses.fi/problemset/task/1647",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["sparse-table"]
          },
          {
            id: "cses-dynamic-range-sum",
            title: "Dynamic Range Sum Queries",
            url: "https://cses.fi/problemset/task/1648",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["segment-tree", "fenwick-tree"]
          },
          {
            id: "cses-dynamic-range-min",
            title: "Dynamic Range Minimum Queries",
            url: "https://cses.fi/problemset/task/1649",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["segment-tree"]
          },
          {
            id: "cses-range-update",
            title: "Range Update Queries",
            url: "https://cses.fi/problemset/task/1651",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["segment-tree", "lazy-propagation"]
          }
        ]
      },
      {
        id: "cses-tree-algorithms",
        title: "Tree Algorithms",
        description: "Algorithms on trees and tree structures",
        estimatedTime: "2 weeks",
        problems: [
          {
            id: "cses-subordinates",
            title: "Subordinates",
            url: "https://cses.fi/problemset/task/1674",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["tree", "dfs"]
          },
          {
            id: "cses-tree-diameter",
            title: "Tree Diameter",
            url: "https://cses.fi/problemset/task/1131",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["tree", "dfs"]
          },
          {
            id: "cses-tree-distances-i",
            title: "Tree Distances I",
            url: "https://cses.fi/problemset/task/1132",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["tree", "rerooting"]
          },
          {
            id: "cses-company-queries-i",
            title: "Company Queries I",
            url: "https://cses.fi/problemset/task/1687",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["tree", "binary-lifting"]
          }
        ]
      },
      {
        id: "cses-string-algorithms",
        title: "String Algorithms",
        description: "Advanced string processing techniques",
        estimatedTime: "1-2 weeks",
        problems: [
          {
            id: "cses-string-matching",
            title: "String Matching",
            url: "https://cses.fi/problemset/task/1753",
            platform: "CSES",
            difficulty: "Easy",
            tags: ["string", "kmp"]
          },
          {
            id: "cses-finding-borders",
            title: "Finding Borders",
            url: "https://cses.fi/problemset/task/1733",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["string", "z-algorithm"]
          },
          {
            id: "cses-longest-palindrome",
            title: "Longest Palindrome",
            url: "https://cses.fi/problemset/task/1111",
            platform: "CSES",
            difficulty: "Medium",
            tags: ["string", "manacher"]
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
    estimatedTime: "12-15 weeks",
    icon: "🏗️",
    subsections: [
      {
        id: "prefix-sums",
        title: "Prefix Sums",
        description: "Range queries and cumulative sums",
        estimatedTime: "1 week",
        problems: [
          {
            id: "leetcode-range-sum-query",
            title: "Range Sum Query - Immutable",
            url: "https://leetcode.com/problems/range-sum-query-immutable/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["prefix-sum"]
          },
          {
            id: "leetcode-range-sum-2d",
            title: "Range Sum Query 2D - Immutable",
            url: "https://leetcode.com/problems/range-sum-query-2d-immutable/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum", "matrix"]
          },
          {
            id: "leetcode-subarray-sum-equals-k",
            title: "Subarray Sum Equals K",
            url: "https://leetcode.com/problems/subarray-sum-equals-k/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum", "hashmap"]
          },
          {
            id: "leetcode-maximum-sum-circular-subarray",
            title: "Maximum Sum Circular Subarray",
            url: "https://leetcode.com/problems/maximum-sum-circular-subarray/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum", "kadane"]
          },
          {
            id: "leetcode-product-except-self",
            title: "Product of Array Except Self",
            url: "https://leetcode.com/problems/product-of-array-except-self/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum"]
          },
          {
            id: "leetcode-continuous-subarray-sum",
            title: "Continuous Subarray Sum",
            url: "https://leetcode.com/problems/continuous-subarray-sum/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum", "modular"]
          },
          {
            id: "leetcode-path-sum-iii",
            title: "Path Sum III",
            url: "https://leetcode.com/problems/path-sum-iii/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum", "tree"]
          },
          {
            id: "leetcode-maximum-size-subarray",
            title: "Maximum Size Subarray Sum Equals k",
            url: "https://leetcode.com/problems/maximum-size-subarray-sum-equals-k/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum", "hashmap"]
          },
          {
            id: "leetcode-find-pivot-index",
            title: "Find Pivot Index",
            url: "https://leetcode.com/problems/find-pivot-index/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["prefix-sum"]
          },
          {
            id: "leetcode-minimum-value-positive-step",
            title: "Minimum Value to Get Positive Step by Step Sum",
            url: "https://leetcode.com/problems/minimum-value-to-get-positive-step-by-step-sum/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["prefix-sum"]
          },
          {
            id: "leetcode-running-sum-1d",
            title: "Running Sum of 1d Array",
            url: "https://leetcode.com/problems/running-sum-of-1d-array/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["prefix-sum"]
          },
          {
            id: "leetcode-corporate-flight-bookings",
            title: "Corporate Flight Bookings",
            url: "https://leetcode.com/problems/corporate-flight-bookings/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum", "difference-array"]
          },
          {
            id: "leetcode-car-pooling",
            title: "Car Pooling",
            url: "https://leetcode.com/problems/car-pooling/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum", "difference-array"]
          },
          {
            id: "leetcode-contiguous-array",
            title: "Contiguous Array",
            url: "https://leetcode.com/problems/contiguous-array/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum", "hashmap"]
          },
          {
            id: "leetcode-sum-of-all-odd-length-subarrays",
            title: "Sum of All Odd Length Subarrays",
            url: "https://leetcode.com/problems/sum-of-all-odd-length-subarrays/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["prefix-sum", "math"]
          },
          {
            id: "leetcode-queries-on-number-of-points",
            title: "Queries on Number of Points Inside a Circle",
            url: "https://leetcode.com/problems/queries-on-number-of-points-inside-a-circle/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum", "geometry"]
          },
          {
            id: "leetcode-maximum-points-from-cards",
            title: "Maximum Points You Can Obtain from Cards",
            url: "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum", "sliding-window"]
          },
          {
            id: "leetcode-binary-subarrays-with-sum",
            title: "Binary Subarrays With Sum",
            url: "https://leetcode.com/problems/binary-subarrays-with-sum/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum", "sliding-window"]
          },
          {
            id: "leetcode-maximum-average-subarray",
            title: "Maximum Average Subarray I",
            url: "https://leetcode.com/problems/maximum-average-subarray-i/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["prefix-sum", "sliding-window"]
          },
          {
            id: "leetcode-make-sum-divisible-by-p",
            title: "Make Sum Divisible by P",
            url: "https://leetcode.com/problems/make-sum-divisible-by-p/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["prefix-sum", "hashmap"]
          }
        ]
      },
      {
        id: "binary-search",
        title: "Binary Search",
        description: "Search algorithms and their applications",
        estimatedTime: "1 week",
        problems: [
          {
            id: "leetcode-binary-search",
            title: "Binary Search",
            url: "https://leetcode.com/problems/binary-search/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["binary-search"]
          },
          {
            id: "leetcode-search-insert-position",
            title: "Search Insert Position",
            url: "https://leetcode.com/problems/search-insert-position/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["binary-search"]
          },
          {
            id: "leetcode-first-bad-version",
            title: "First Bad Version",
            url: "https://leetcode.com/problems/first-bad-version/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["binary-search"]
          },
          {
            id: "leetcode-sqrt-x",
            title: "Sqrt(x)",
            url: "https://leetcode.com/problems/sqrtx/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["binary-search", "math"]
          },
          {
            id: "leetcode-search-2d-matrix",
            title: "Search a 2D Matrix",
            url: "https://leetcode.com/problems/search-a-2d-matrix/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["binary-search", "matrix"]
          },
          {
            id: "leetcode-find-minimum-rotated",
            title: "Find Minimum in Rotated Sorted Array",
            url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["binary-search"]
          },
          {
            id: "leetcode-search-rotated-array",
            title: "Search in Rotated Sorted Array",
            url: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["binary-search"]
          },
          {
            id: "leetcode-find-peak-element",
            title: "Find Peak Element",
            url: "https://leetcode.com/problems/find-peak-element/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["binary-search"]
          },
          {
            id: "leetcode-koko-eating-bananas",
            title: "Koko Eating Bananas",
            url: "https://leetcode.com/problems/koko-eating-bananas/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["binary-search"]
          },
          {
            id: "leetcode-capacity-ship-packages",
            title: "Capacity To Ship Packages Within D Days",
            url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["binary-search"]
          },
          {
            id: "leetcode-find-first-last-position",
            title: "Find First and Last Position of Element in Sorted Array",
            url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["binary-search"]
          },
          {
            id: "leetcode-median-two-sorted-arrays",
            title: "Median of Two Sorted Arrays",
            url: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["binary-search"]
          },
          {
            id: "leetcode-split-array-largest-sum",
            title: "Split Array Largest Sum",
            url: "https://leetcode.com/problems/split-array-largest-sum/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["binary-search", "dynamic-programming"]
          },
          {
            id: "leetcode-magnetic-force-between-balls",
            title: "Magnetic Force Between Two Balls",
            url: "https://leetcode.com/problems/magnetic-force-between-two-balls/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["binary-search"]
          },
          {
            id: "leetcode-minimum-speed-arrive-time",
            title: "Minimum Speed to Arrive on Time",
            url: "https://leetcode.com/problems/minimum-speed-to-arrive-on-time/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["binary-search"]
          },
          {
            id: "leetcode-search-suggestions-system",
            title: "Search Suggestions System",
            url: "https://leetcode.com/problems/search-suggestions-system/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["binary-search", "trie"]
          },
          {
            id: "leetcode-valid-perfect-square",
            title: "Valid Perfect Square",
            url: "https://leetcode.com/problems/valid-perfect-square/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["binary-search", "math"]
          },
          {
            id: "leetcode-find-k-closest-elements",
            title: "Find K Closest Elements",
            url: "https://leetcode.com/problems/find-k-closest-elements/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["binary-search", "two-pointer"]
          },
          {
            id: "leetcode-search-rotated-array-ii",
            title: "Search in Rotated Sorted Array II",
            url: "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["binary-search"]
          },
          {
            id: "leetcode-time-based-key-value-store",
            title: "Time Based Key-Value Store",
            url: "https://leetcode.com/problems/time-based-key-value-store/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["binary-search", "design"]
          }
        ]
      },
      {
        id: "sliding-window",
        title: "Sliding Window",
        description: "Window-based optimization techniques",
        estimatedTime: "1 week",
        problems: [
          {
            id: "leetcode-maximum-average-subarray-i",
            title: "Maximum Average Subarray I",
            url: "https://leetcode.com/problems/maximum-average-subarray-i/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["sliding-window"]
          },
          {
            id: "leetcode-longest-substring-without-repeating",
            title: "Longest Substring Without Repeating Characters",
            url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["sliding-window", "hashmap"]
          },
          {
            id: "leetcode-best-time-buy-sell-stock",
            title: "Best Time to Buy and Sell Stock",
            url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["sliding-window", "dynamic-programming"]
          },
          {
            id: "leetcode-sliding-window-maximum",
            title: "Sliding Window Maximum",
            url: "https://leetcode.com/problems/sliding-window-maximum/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["sliding-window", "deque"]
          },
          {
            id: "leetcode-minimum-window-substring",
            title: "Minimum Window Substring",
            url: "https://leetcode.com/problems/minimum-window-substring/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["sliding-window", "hashmap"]
          },
          {
            id: "leetcode-longest-repeating-character-replacement",
            title: "Longest Repeating Character Replacement",
            url: "https://leetcode.com/problems/longest-repeating-character-replacement/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["sliding-window"]
          },
          {
            id: "leetcode-permutation-in-string",
            title: "Permutation in String",
            url: "https://leetcode.com/problems/permutation-in-string/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["sliding-window"]
          },
          {
            id: "leetcode-find-all-anagrams",
            title: "Find All Anagrams in a String",
            url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["sliding-window"]
          },
          {
            id: "leetcode-fruit-into-baskets",
            title: "Fruit Into Baskets",
            url: "https://leetcode.com/problems/fruit-into-baskets/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["sliding-window"]
          },
          {
            id: "leetcode-max-consecutive-ones-iii",
            title: "Max Consecutive Ones III",
            url: "https://leetcode.com/problems/max-consecutive-ones-iii/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["sliding-window"]
          },
          {
            id: "leetcode-get-equal-substrings-within-budget",
            title: "Get Equal Substrings Within Budget",
            url: "https://leetcode.com/problems/get-equal-substrings-within-budget/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["sliding-window"]
          },
          {
            id: "leetcode-maximum-sum-distinct-subarrays",
            title: "Maximum Sum of Distinct Subarrays With Length K",
            url: "https://leetcode.com/problems/maximum-sum-of-distinct-subarrays-with-length-k/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["sliding-window", "hashset"]
          },
          {
            id: "leetcode-maximize-confusion-exam",
            title: "Maximize the Confusion of an Exam",
            url: "https://leetcode.com/problems/maximize-the-confusion-of-an-exam/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["sliding-window"]
          },
          {
            id: "leetcode-length-longest-valid-substring",
            title: "Length of the Longest Valid Substring",
            url: "https://leetcode.com/problems/length-of-the-longest-valid-substring/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["sliding-window"]
          },
          {
            id: "leetcode-subarrays-k-different-integers",
            title: "Subarrays with K Different Integers",
            url: "https://leetcode.com/problems/subarrays-with-k-different-integers/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["sliding-window"]
          },
          {
            id: "leetcode-minimum-operations-reduce-x",
            title: "Minimum Operations to Reduce X to Zero",
            url: "https://leetcode.com/problems/minimum-operations-to-reduce-x-to-zero/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["sliding-window"]
          },
          {
            id: "leetcode-frequency-most-frequent-element",
            title: "Frequency of the Most Frequent Element",
            url: "https://leetcode.com/problems/frequency-of-the-most-frequent-element/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["sliding-window", "greedy"]
          },
          {
            id: "leetcode-number-subarrays-bounded-maximum",
            title: "Number of Subarrays with Bounded Maximum",
            url: "https://leetcode.com/problems/number-of-subarrays-with-bounded-maximum/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["sliding-window"]
          },
          {
            id: "leetcode-grumpy-bookstore-owner",
            title: "Grumpy Bookstore Owner",
            url: "https://leetcode.com/problems/grumpy-bookstore-owner/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["sliding-window"]
          },
          {
            id: "leetcode-contains-duplicate-iii",
            title: "Contains Duplicate III",
            url: "https://leetcode.com/problems/contains-duplicate-iii/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["sliding-window", "bucket-sort"]
          }
        ]
      },
      {
        id: "two-pointer",
        title: "Two Pointer",
        description: "Two pointer technique for arrays",
        estimatedTime: "1 week",
        problems: [
          {
            id: "leetcode-two-sum-ii",
            title: "Two Sum II - Input Array Is Sorted",
            url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["two-pointer"]
          },
          {
            id: "leetcode-3sum",
            title: "3Sum",
            url: "https://leetcode.com/problems/3sum/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["two-pointer", "sorting"]
          },
          {
            id: "leetcode-container-most-water",
            title: "Container With Most Water",
            url: "https://leetcode.com/problems/container-with-most-water/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["two-pointer"]
          },
          {
            id: "leetcode-remove-duplicates-sorted-array",
            title: "Remove Duplicates from Sorted Array",
            url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["two-pointer"]
          },
          {
            id: "leetcode-valid-palindrome",
            title: "Valid Palindrome",
            url: "https://leetcode.com/problems/valid-palindrome/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["two-pointer", "string"]
          },
          {
            id: "leetcode-trapping-rain-water",
            title: "Trapping Rain Water",
            url: "https://leetcode.com/problems/trapping-rain-water/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["two-pointer", "dynamic-programming"]
          },
          {
            id: "leetcode-4sum",
            title: "4Sum",
            url: "https://leetcode.com/problems/4sum/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["two-pointer", "sorting"]
          },
          {
            id: "leetcode-move-zeroes",
            title: "Move Zeroes",
            url: "https://leetcode.com/problems/move-zeroes/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["two-pointer"]
          },
          {
            id: "leetcode-squares-sorted-array",
            title: "Squares of a Sorted Array",
            url: "https://leetcode.com/problems/squares-of-a-sorted-array/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["two-pointer"]
          },
          {
            id: "leetcode-sort-colors",
            title: "Sort Colors",
            url: "https://leetcode.com/problems/sort-colors/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["two-pointer", "sorting"]
          },
          {
            id: "leetcode-reverse-string",
            title: "Reverse String",
            url: "https://leetcode.com/problems/reverse-string/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["two-pointer", "string"]
          },
          {
            id: "leetcode-3sum-closest",
            title: "3Sum Closest",
            url: "https://leetcode.com/problems/3sum-closest/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["two-pointer", "sorting"]
          },
          {
            id: "leetcode-remove-element",
            title: "Remove Element",
            url: "https://leetcode.com/problems/remove-element/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["two-pointer"]
          },
          {
            id: "leetcode-palindrome-linked-list",
            title: "Palindrome Linked List",
            url: "https://leetcode.com/problems/palindrome-linked-list/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["two-pointer", "linked-list"]
          },
          {
            id: "leetcode-linked-list-cycle",
            title: "Linked List Cycle",
            url: "https://leetcode.com/problems/linked-list-cycle/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["two-pointer", "linked-list"]
          },
          {
            id: "leetcode-happy-number",
            title: "Happy Number",
            url: "https://leetcode.com/problems/happy-number/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["two-pointer", "math"]
          },
          {
            id: "leetcode-middle-linked-list",
            title: "Middle of the Linked List",
            url: "https://leetcode.com/problems/middle-of-the-linked-list/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["two-pointer", "linked-list"]
          },
          {
            id: "leetcode-remove-nth-node",
            title: "Remove Nth Node From End of List",
            url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["two-pointer", "linked-list"]
          },
          {
            id: "leetcode-intersection-two-arrays-ii",
            title: "Intersection of Two Arrays II",
            url: "https://leetcode.com/problems/intersection-of-two-arrays-ii/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["two-pointer", "sorting"]
          },
          {
            id: "leetcode-merge-sorted-array",
            title: "Merge Sorted Array",
            url: "https://leetcode.com/problems/merge-sorted-array/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["two-pointer"]
          }
        ]
      },
      {
        id: "recursion",
        title: "Recursion",
        description: "Recursive problem solving",
        estimatedTime: "1 week",
        problems: [
          {
            id: "leetcode-climbing-stairs",
            title: "Climbing Stairs",
            url: "https://leetcode.com/problems/climbing-stairs/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["recursion", "dynamic-programming"]
          },
          {
            id: "leetcode-fibonacci-number",
            title: "Fibonacci Number",
            url: "https://leetcode.com/problems/fibonacci-number/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["recursion", "dynamic-programming"]
          },
          {
            id: "leetcode-reverse-linked-list",
            title: "Reverse Linked List",
            url: "https://leetcode.com/problems/reverse-linked-list/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["recursion", "linked-list"]
          },
          {
            id: "leetcode-merge-two-sorted-lists",
            title: "Merge Two Sorted Lists",
            url: "https://leetcode.com/problems/merge-two-sorted-lists/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["recursion", "linked-list"]
          },
          {
            id: "leetcode-pow-x-n",
            title: "Pow(x, n)",
            url: "https://leetcode.com/problems/powx-n/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["recursion", "math"]
          },
          {
            id: "leetcode-same-tree",
            title: "Same Tree",
            url: "https://leetcode.com/problems/same-tree/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["recursion", "tree"]
          },
          {
            id: "leetcode-maximum-depth-binary-tree",
            title: "Maximum Depth of Binary Tree",
            url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["recursion", "tree"]
          },
          {
            id: "leetcode-invert-binary-tree",
            title: "Invert Binary Tree",
            url: "https://leetcode.com/problems/invert-binary-tree/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["recursion", "tree"]
          },
          {
            id: "leetcode-symmetric-tree",
            title: "Symmetric Tree",
            url: "https://leetcode.com/problems/symmetric-tree/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["recursion", "tree"]
          },
          {
            id: "leetcode-diameter-binary-tree",
            title: "Diameter of Binary Tree",
            url: "https://leetcode.com/problems/diameter-of-binary-tree/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["recursion", "tree"]
          },
          {
            id: "leetcode-balanced-binary-tree",
            title: "Balanced Binary Tree",
            url: "https://leetcode.com/problems/balanced-binary-tree/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["recursion", "tree"]
          },
          {
            id: "leetcode-sum-root-leaf-numbers",
            title: "Sum Root to Leaf Numbers",
            url: "https://leetcode.com/problems/sum-root-to-leaf-numbers/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["recursion", "tree"]
          },
          {
            id: "leetcode-factorial-trailing-zeroes",
            title: "Factorial Trailing Zeroes",
            url: "https://leetcode.com/problems/factorial-trailing-zeroes/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["recursion", "math"]
          },
          {
            id: "leetcode-kth-grammar",
            title: "K-th Symbol in Grammar",
            url: "https://leetcode.com/problems/k-th-symbol-in-grammar/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["recursion", "bit-manipulation"]
          },
          {
            id: "leetcode-unique-paths",
            title: "Unique Paths",
            url: "https://leetcode.com/problems/unique-paths/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["recursion", "dynamic-programming"]
          },
          {
            id: "leetcode-generate-parentheses",
            title: "Generate Parentheses",
            url: "https://leetcode.com/problems/generate-parentheses/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["recursion", "backtracking"]
          },
          {
            id: "leetcode-sort-array-merge-sort",
            title: "Sort an Array (Merge Sort)",
            url: "https://leetcode.com/problems/sort-an-array/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["recursion", "divide-conquer"]
          },
          {
            id: "leetcode-different-ways-add-parentheses",
            title: "Different Ways to Add Parentheses",
            url: "https://leetcode.com/problems/different-ways-to-add-parentheses/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["recursion", "divide-conquer"]
          },
          {
            id: "leetcode-swap-nodes-pairs",
            title: "Swap Nodes in Pairs",
            url: "https://leetcode.com/problems/swap-nodes-in-pairs/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["recursion", "linked-list"]
          },
          {
            id: "leetcode-n-th-tribonacci-number",
            title: "N-th Tribonacci Number",
            url: "https://leetcode.com/problems/n-th-tribonacci-number/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["recursion", "dynamic-programming"]
          }
        ]
      },
      {
        id: "backtracking",
        title: "Backtracking",
        description: "Systematic solution space exploration",
        estimatedTime: "1 week",
        problems: [
          {
            id: "leetcode-permutations",
            title: "Permutations",
            url: "https://leetcode.com/problems/permutations/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["backtracking"]
          },
          {
            id: "leetcode-subsets",
            title: "Subsets",
            url: "https://leetcode.com/problems/subsets/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["backtracking"]
          },
          {
            id: "leetcode-combinations",
            title: "Combinations",
            url: "https://leetcode.com/problems/combinations/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["backtracking"]
          },
          {
            id: "leetcode-combination-sum",
            title: "Combination Sum",
            url: "https://leetcode.com/problems/combination-sum/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["backtracking"]
          },
          {
            id: "leetcode-letter-combinations-phone",
            title: "Letter Combinations of a Phone Number",
            url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["backtracking"]
          },
          {
            id: "leetcode-palindrome-partitioning",
            title: "Palindrome Partitioning",
            url: "https://leetcode.com/problems/palindrome-partitioning/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["backtracking", "string"]
          },
          {
            id: "leetcode-word-search",
            title: "Word Search",
            url: "https://leetcode.com/problems/word-search/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["backtracking", "matrix"]
          },
          {
            id: "leetcode-n-queens",
            title: "N-Queens",
            url: "https://leetcode.com/problems/n-queens/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["backtracking"]
          },
          {
            id: "leetcode-sudoku-solver",
            title: "Sudoku Solver",
            url: "https://leetcode.com/problems/sudoku-solver/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["backtracking"]
          },
          {
            id: "leetcode-permutations-ii",
            title: "Permutations II",
            url: "https://leetcode.com/problems/permutations-ii/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["backtracking"]
          },
          {
            id: "leetcode-subsets-ii",
            title: "Subsets II",
            url: "https://leetcode.com/problems/subsets-ii/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["backtracking"]
          },
          {
            id: "leetcode-combination-sum-ii",
            title: "Combination Sum II",
            url: "https://leetcode.com/problems/combination-sum-ii/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["backtracking"]
          },
          {
            id: "leetcode-restore-ip-addresses",
            title: "Restore IP Addresses",
            url: "https://leetcode.com/problems/restore-ip-addresses/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["backtracking", "string"]
          },
          {
            id: "leetcode-beautiful-arrangement",
            title: "Beautiful Arrangement",
            url: "https://leetcode.com/problems/beautiful-arrangement/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["backtracking"]
          },
          {
            id: "leetcode-partition-k-equal-sum",
            title: "Partition to K Equal Sum Subsets",
            url: "https://leetcode.com/problems/partition-to-k-equal-sum-subsets/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["backtracking"]
          }
        ]
      },
      {
        id: "graph",
        title: "Graph",
        description: "Graph algorithms and traversals",
        estimatedTime: "1.5 weeks",
        problems: [
          {
            id: "leetcode-number-of-islands",
            title: "Number of Islands",
            url: "https://leetcode.com/problems/number-of-islands/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "dfs", "bfs"]
          },
          {
            id: "leetcode-clone-graph",
            title: "Clone Graph",
            url: "https://leetcode.com/problems/clone-graph/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "dfs", "bfs"]
          },
          {
            id: "leetcode-course-schedule",
            title: "Course Schedule",
            url: "https://leetcode.com/problems/course-schedule/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "topological-sort"]
          },
          {
            id: "leetcode-course-schedule-ii",
            title: "Course Schedule II",
            url: "https://leetcode.com/problems/course-schedule-ii/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "topological-sort"]
          },
          {
            id: "leetcode-pacific-atlantic-water-flow",
            title: "Pacific Atlantic Water Flow",
            url: "https://leetcode.com/problems/pacific-atlantic-water-flow/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "dfs"]
          },
          {
            id: "leetcode-surrounded-regions",
            title: "Surrounded Regions",
            url: "https://leetcode.com/problems/surrounded-regions/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "dfs"]
          },
          {
            id: "leetcode-rotting-oranges",
            title: "Rotting Oranges",
            url: "https://leetcode.com/problems/rotting-oranges/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "bfs"]
          },
          {
            id: "leetcode-walls-and-gates",
            title: "Walls and Gates",
            url: "https://leetcode.com/problems/walls-and-gates/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "bfs"]
          },
          {
            id: "leetcode-word-ladder",
            title: "Word Ladder",
            url: "https://leetcode.com/problems/word-ladder/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["graph", "bfs"]
          },
          {
            id: "leetcode-alien-dictionary",
            title: "Alien Dictionary",
            url: "https://leetcode.com/problems/alien-dictionary/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["graph", "topological-sort"]
          },
          {
            id: "leetcode-graph-valid-tree",
            title: "Graph Valid Tree",
            url: "https://leetcode.com/problems/graph-valid-tree/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "union-find"]
          },
          {
            id: "leetcode-number-connected-components",
            title: "Number of Connected Components in an Undirected Graph",
            url: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "dfs", "union-find"]
          },
          {
            id: "leetcode-redundant-connection",
            title: "Redundant Connection",
            url: "https://leetcode.com/problems/redundant-connection/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "union-find"]
          },
          {
            id: "leetcode-accounts-merge",
            title: "Accounts Merge",
            url: "https://leetcode.com/problems/accounts-merge/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "union-find"]
          },
          {
            id: "leetcode-network-delay-time",
            title: "Network Delay Time",
            url: "https://leetcode.com/problems/network-delay-time/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "dijkstra"]
          },
          {
            id: "leetcode-shortest-path-binary-matrix",
            title: "Shortest Path in Binary Matrix",
            url: "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "bfs"]
          },
          {
            id: "leetcode-reconstruct-itinerary",
            title: "Reconstruct Itinerary",
            url: "https://leetcode.com/problems/reconstruct-itinerary/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["graph", "dfs"]
          },
          {
            id: "leetcode-minimum-genetic-mutation",
            title: "Minimum Genetic Mutation",
            url: "https://leetcode.com/problems/minimum-genetic-mutation/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "bfs"]
          },
          {
            id: "leetcode-snakes-and-ladders",
            title: "Snakes and Ladders",
            url: "https://leetcode.com/problems/snakes-and-ladders/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "bfs"]
          },
          {
            id: "leetcode-cheapest-flights-k-stops",
            title: "Cheapest Flights Within K Stops",
            url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["graph", "bellman-ford"]
          }
        ]
      },
      {
        id: "dp",
        title: "Dynamic Programming",
        description: "Optimization using memorization",
        estimatedTime: "1.5 weeks",
        problems: [
          {
            id: "leetcode-house-robber",
            title: "House Robber",
            url: "https://leetcode.com/problems/house-robber/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-coin-change",
            title: "Coin Change",
            url: "https://leetcode.com/problems/coin-change/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-longest-increasing-subsequence",
            title: "Longest Increasing Subsequence",
            url: "https://leetcode.com/problems/longest-increasing-subsequence/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-longest-common-subsequence",
            title: "Longest Common Subsequence",
            url: "https://leetcode.com/problems/longest-common-subsequence/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-word-break",
            title: "Word Break",
            url: "https://leetcode.com/problems/word-break/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-combination-sum-iv",
            title: "Combination Sum IV",
            url: "https://leetcode.com/problems/combination-sum-iv/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-house-robber-ii",
            title: "House Robber II",
            url: "https://leetcode.com/problems/house-robber-ii/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-decode-ways",
            title: "Decode Ways",
            url: "https://leetcode.com/problems/decode-ways/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-unique-paths-ii",
            title: "Unique Paths II",
            url: "https://leetcode.com/problems/unique-paths-ii/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-jump-game",
            title: "Jump Game",
            url: "https://leetcode.com/problems/jump-game/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming", "greedy"]
          },
          {
            id: "leetcode-jump-game-ii",
            title: "Jump Game II",
            url: "https://leetcode.com/problems/jump-game-ii/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming", "greedy"]
          },
          {
            id: "leetcode-min-cost-climbing-stairs",
            title: "Min Cost Climbing Stairs",
            url: "https://leetcode.com/problems/min-cost-climbing-stairs/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-maximum-product-subarray",
            title: "Maximum Product Subarray",
            url: "https://leetcode.com/problems/maximum-product-subarray/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-palindromic-substrings",
            title: "Palindromic Substrings",
            url: "https://leetcode.com/problems/palindromic-substrings/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-longest-palindromic-subsequence",
            title: "Longest Palindromic Subsequence",
            url: "https://leetcode.com/problems/longest-palindromic-subsequence/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-edit-distance",
            title: "Edit Distance",
            url: "https://leetcode.com/problems/edit-distance/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-target-sum",
            title: "Target Sum",
            url: "https://leetcode.com/problems/target-sum/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-interleaving-string",
            title: "Interleaving String",
            url: "https://leetcode.com/problems/interleaving-string/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-longest-valid-parentheses",
            title: "Longest Valid Parentheses",
            url: "https://leetcode.com/problems/longest-valid-parentheses/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["dynamic-programming"]
          },
          {
            id: "leetcode-distinct-subsequences",
            title: "Distinct Subsequences",
            url: "https://leetcode.com/problems/distinct-subsequences/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["dynamic-programming"]
          }
        ]
      },
      {
        id: "trees",
        title: "Trees",
        description: "Tree data structures and algorithms",
        estimatedTime: "1 week",
        problems: [
          {
            id: "leetcode-binary-tree-inorder-traversal",
            title: "Binary Tree Inorder Traversal",
            url: "https://leetcode.com/problems/binary-tree-inorder-traversal/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["tree", "dfs"]
          },
          {
            id: "leetcode-binary-tree-preorder-traversal",
            title: "Binary Tree Preorder Traversal",
            url: "https://leetcode.com/problems/binary-tree-preorder-traversal/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["tree", "dfs"]
          },
          {
            id: "leetcode-binary-tree-postorder-traversal",
            title: "Binary Tree Postorder Traversal",
            url: "https://leetcode.com/problems/binary-tree-postorder-traversal/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["tree", "dfs"]
          },
          {
            id: "leetcode-binary-tree-level-order-traversal",
            title: "Binary Tree Level Order Traversal",
            url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["tree", "bfs"]
          },
          {
            id: "leetcode-validate-binary-search-tree",
            title: "Validate Binary Search Tree",
            url: "https://leetcode.com/problems/validate-binary-search-tree/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["tree", "dfs"]
          },
          {
            id: "leetcode-lowest-common-ancestor-bst",
            title: "Lowest Common Ancestor of a Binary Search Tree",
            url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["tree"]
          },
          {
            id: "leetcode-binary-tree-right-side-view",
            title: "Binary Tree Right Side View",
            url: "https://leetcode.com/problems/binary-tree-right-side-view/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["tree", "bfs"]
          },
          {
            id: "leetcode-count-good-nodes-binary-tree",
            title: "Count Good Nodes in Binary Tree",
            url: "https://leetcode.com/problems/count-good-nodes-in-binary-tree/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["tree", "dfs"]
          },
          {
            id: "leetcode-kth-smallest-element-bst",
            title: "Kth Smallest Element in a BST",
            url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["tree", "dfs"]
          },
          {
            id: "leetcode-construct-binary-tree-preorder-inorder",
            title: "Construct Binary Tree from Preorder and Inorder Traversal",
            url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["tree", "divide-conquer"]
          },
          {
            id: "leetcode-binary-tree-maximum-path-sum",
            title: "Binary Tree Maximum Path Sum",
            url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["tree", "dfs"]
          },
          {
            id: "leetcode-serialize-deserialize-binary-tree",
            title: "Serialize and Deserialize Binary Tree",
            url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["tree", "design"]
          },
          {
            id: "leetcode-subtree-another-tree",
            title: "Subtree of Another Tree",
            url: "https://leetcode.com/problems/subtree-of-another-tree/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["tree", "dfs"]
          },
          {
            id: "leetcode-lowest-common-ancestor-binary-tree",
            title: "Lowest Common Ancestor of a Binary Tree",
            url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["tree", "dfs"]
          },
          {
            id: "leetcode-binary-tree-level-order-traversal-ii",
            title: "Binary Tree Level Order Traversal II",
            url: "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["tree", "bfs"]
          },
          {
            id: "leetcode-minimum-depth-binary-tree",
            title: "Minimum Depth of Binary Tree",
            url: "https://leetcode.com/problems/minimum-depth-of-binary-tree/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["tree", "bfs"]
          },
          {
            id: "leetcode-path-sum",
            title: "Path Sum",
            url: "https://leetcode.com/problems/path-sum/",
            platform: "LeetCode",
            difficulty: "Easy",
            tags: ["tree", "dfs"]
          },
          {
            id: "leetcode-path-sum-ii",
            title: "Path Sum II",
            url: "https://leetcode.com/problems/path-sum-ii/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["tree", "dfs", "backtracking"]
          },
          {
            id: "leetcode-flatten-binary-tree-linked-list",
            title: "Flatten Binary Tree to Linked List",
            url: "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["tree", "dfs"]
          },
          {
            id: "leetcode-populating-next-right-pointers",
            title: "Populating Next Right Pointers in Each Node",
            url: "https://leetcode.com/problems/populating-next-right-pointers-in-each-node/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["tree", "bfs"]
          }
        ]
      },
      {
        id: "segment-trees",
        title: "Segment Trees",
        description: "Advanced tree data structures",
        estimatedTime: "1 week",
        problems: [
          {
            id: "leetcode-range-sum-query-mutable",
            title: "Range Sum Query - Mutable",
            url: "https://leetcode.com/problems/range-sum-query-mutable/",
            platform: "LeetCode",
            difficulty: "Medium",
            tags: ["segment-tree"]
          },
          {
            id: "leetcode-count-smaller-numbers-after-self",
            title: "Count of Smaller Numbers After Self",
            url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["segment-tree"]
          },
          {
            id: "leetcode-range-sum-query-2d-mutable",
            title: "Range Sum Query 2D - Mutable",
            url: "https://leetcode.com/problems/range-sum-query-2d-mutable/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["segment-tree", "binary-indexed-tree"]
          },
          {
            id: "leetcode-count-of-range-sum",
            title: "Count of Range Sum",
            url: "https://leetcode.com/problems/count-of-range-sum/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["segment-tree", "divide-conquer"]
          },
          {
            id: "leetcode-reverse-pairs",
            title: "Reverse Pairs",
            url: "https://leetcode.com/problems/reverse-pairs/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["segment-tree", "merge-sort"]
          },
          {
            id: "leetcode-my-calendar-iii",
            title: "My Calendar III",
            url: "https://leetcode.com/problems/my-calendar-iii/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["segment-tree", "ordered-map"]
          },
          {
            id: "leetcode-range-module",
            title: "Range Module",
            url: "https://leetcode.com/problems/range-module/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["segment-tree"]
          },
          {
            id: "leetcode-the-skyline-problem",
            title: "The Skyline Problem",
            url: "https://leetcode.com/problems/the-skyline-problem/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["segment-tree", "sweep-line"]
          },
          {
            id: "leetcode-falling-squares",
            title: "Falling Squares",
            url: "https://leetcode.com/problems/falling-squares/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["segment-tree", "coordinate-compression"]
          },
          {
            id: "leetcode-rectangle-area-ii",
            title: "Rectangle Area II",
            url: "https://leetcode.com/problems/rectangle-area-ii/",
            platform: "LeetCode",
            difficulty: "Hard",
            tags: ["segment-tree", "coordinate-compression"]
          }
        ]
      }
    ]
  },
  {
    id: "cf-practice",
    title: "Codeforces Practice",
    description: "Structured practice with CF problems by division",
    totalProblems: 176,
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
            id: "codeforces-1054a",
            title: "Special Forces",
            "url": "https://codeforces.com/contest/1054/problem/A",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math", "implementation"]
          },
          {
            id: "codeforces-1054b",
            title: "Chips on the Board",
            "url": "https://codeforces.com/contest/1054/problem/B",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["greedy", "implementation"]
          },
          {
            id: "codeforces-1054c",
            title: "Orac and LCM",
            "url": "https://codeforces.com/contest/1054/problem/C",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["greedy", "sorting"]
          },
          {
            id: "codeforces-977a",
            title: "Wrong Subtraction",
            "url": "https://codeforces.com/contest/977/problem/A",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math", "implementation"]
          },
          {
            id: "codeforces-977b",
            title: "Two-gram",
            "url": "https://codeforces.com/contest/977/problem/B",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["strings", "implementation"]
          },
          {
            id: "codeforces-977c",
            title: "Less or Equal",
            "url": "https://codeforces.com/contest/977/problem/C",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["sorting", "binary search"]
          },
          {
            id: "codeforces-977d",
            title: "Divide by three, multiply by two",
            "url": "https://codeforces.com/contest/977/problem/D",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math", "greedy"]
          },
          {
            id: "codeforces-791a",
            title: "Bear and Big Brother",
            "url": "https://codeforces.com/contest/791/problem/A",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math", "implementation"]
          },
          {
            id: "codeforces-71a",
            title: "Way Too Long Words",
            "url": "https://codeforces.com/contest/71/problem/A",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["strings", "implementation"]
          },
          {
            id: "codeforces-263a",
            title: "Beautiful Matrix",
            "url": "https://codeforces.com/contest/263/problem/A",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["implementation", "math"]
          },
          {
            id: "codeforces-263b",
            title: "Sweets Eating",
            "url": "https://codeforces.com/contest/263/problem/B",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["greedy"]
          },
          {
            id: "codeforces-439a",
            title: "Devu, the Dumb Guy",
            "url": "https://codeforces.com/contest/439/problem/A",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["greedy"]
          },
          {
            id: "codeforces-571a",
            title: "Singers' Tour",
            "url": "https://codeforces.com/contest/571/problem/A",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math", "implementation"]
          },
          {
            id: "codeforces-977e",
            title: "Neko's Maze Game",
            "url": "https://codeforces.com/contest/977/problem/E",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["greedy", "math"]
          },
          {
            id: "codeforces-1005a",
            title: "Tanya and Stairways",
            "url": "https://codeforces.com/contest/1005/problem/A",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math", "implementation"]
          },
          {
            id: "codeforces-1005b",
            title: "Delete from the Left",
            "url": "https://codeforces.com/contest/1005/problem/B",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["greedy"]
          },
          {
            id: "codeforces-1005c",
            title: "Sum of Cubes",
            "url": "https://codeforces.com/contest/1005/problem/C",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math"]
          },
          {
            id: "codeforces-1005d",
            title: "Polycarp's Practice",
            "url": "https://codeforces.com/contest/1005/problem/D",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["greedy", "implementation"]
          },
          {
            id: "codeforces-1279a",
            title: "New Year Garland",
            "url": "https://codeforces.com/contest/1279/problem/A",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math", "implementation"]
          },
          {
            id: "codeforces-1279b",
            title: "Snow Walking Robot",
            "url": "https://codeforces.com/contest/1279/problem/B",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["implementation"]
          },
          {
            id: "codeforces-1279c",
            title: "Stack of Presents",
            "url": "https://codeforces.com/contest/1279/problem/C",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["greedy"]
          },
          {
            id: "codeforces-1279d",
            title: "Segmentation",
            "url": "https://codeforces.com/contest/1279/problem/D",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math", "implementation", "greedy"]
          },
          {
            id: "codeforces-1352a",
            title: "Sum of Round Numbers",
            "url": "https://codeforces.com/contest/1352/problem/A",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math"]
          },
          {
            id: "codeforces-1352b",
            title: "Same Parity Summands",
            "url": "https://codeforces.com/contest/1352/problem/B",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math", "greedy"]
          },
          {
            id: "codeforces-1352c",
            title: "K-th Not Divisible by n",
            "url": "https://codeforces.com/contest/1352/problem/C",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math", "binary search"]
          },
          {
            id: "codeforces-1352d",
            title: "Alice, Bob and Candies",
            "url": "https://codeforces.com/contest/1352/problem/D",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["greedy"]
          },
          {
            id: "codeforces-1360a",
            title: "Minimal Square",
            "url": "https://codeforces.com/contest/1360/problem/A",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math"]
          },
          {
            id: "codeforces-1360b",
            title: "Prime Subtraction",
            "url": "https://codeforces.com/contest/1360/problem/B",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math", "greedy"]
          },
          {
            id: "codeforces-1360c",
            title: "Similar Pairs",
            "url": "https://codeforces.com/contest/1360/problem/C",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["data structures", "greedy"]
          },
          {
            id: "codeforces-1360d",
            title: "Johnny and Contribution",
            "url": "https://codeforces.com/contest/1360/problem/D",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math", "implementation"]
          },
          {
            id: "codeforces-1360e",
            title: "Polygon",
            "url": "https://codeforces.com/contest/1360/problem/E",
            "platform": "Codeforces",
            "difficulty": "Div3",
            "tags": ["math", "greedy"]
          }
        ]
      }
      ,
      {
        id: "div2-a",
        title: "Div2 A",
        description: "Master Div2 A problems",
        estimatedTime: "2 weeks",
        problems: [
          {
            id: "codeforces-4a",
            title: "Watermelon",
            url: "https://codeforces.com/contest/4/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["math", "implementation"]
          },
          {
            id: "codeforces-71a",
            title: "Way Too Long Words",
            url: "https://codeforces.com/contest/71/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["math", "implementation", "strings"]
          },
          {
            id: "codeforces-231a",
            title: "Team",
            url: "https://codeforces.com/contest/231/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["math", "implementation"]
          },
          {
            id: "codeforces-158a",
            title: "Next Round",
            url: "https://codeforces.com/contest/158/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["implementation"]
          },
          {
            id: "codeforces-59a",
            title: "Word",
            url: "https://codeforces.com/contest/59/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["strings"]
          },
          {
            id: "codeforces-141a",
            title: "Amusing Joke",
            url: "https://codeforces.com/contest/141/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["strings"]
          },
          {
            id: "codeforces-112a",
            title: "Petya and Strings",
            url: "https://codeforces.com/contest/112/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["strings", "implementation"]
          },
          {
            id: "codeforces-339a",
            title: "Helpful Maths",
            url: "https://codeforces.com/contest/339/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["math", "implementation"]
          },
          {
            id: "codeforces-71b",
            title: "Counting Sort",
            url: "https://codeforces.com/contest/71/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["sorting", "implementation"]
          },
          {
            id: "codeforces-158b",
            title: "Taxi",
            url: "https://codeforces.com/contest/158/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["greedy", "implementation"]
          },
          {
            id: "codeforces-546a",
            title: "Soldier and Bananas",
            url: "https://codeforces.com/contest/546/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["math", "implementation"]
          },
          {
            id: "codeforces-232a",
            title: "LCD Sum",
            url: "https://codeforces.com/contest/232/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["math"]
          },
          {
            id: "codeforces-266a",
            title: "Stones on the Table",
            url: "https://codeforces.com/contest/266/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["implementation"]
          },
          {
            id: "codeforces-158c",
            title: "Next Test",
            url: "https://codeforces.com/contest/158/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["implementation"]
          },
          {
            id: "codeforces-282a",
            title: "Bit++",
            url: "https://codeforces.com/contest/282/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["implementation"]
          },
          {
            id: "codeforces-50a",
            title: "Domino piling",
            url: "https://codeforces.com/contest/50/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["math"]
          },
          {
            id: "codeforces-158d",
            title: "Next Station",
            url: "https://codeforces.com/contest/158/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["implementation"]
          },
          {
            id: "codeforces-339b",
            title: "Xenia and Ringroad",
            url: "https://codeforces.com/contest/339/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["math", "implementation"]
          },
          {
            id: "codeforces-69a",
            title: "Young Physicist",
            url: "https://codeforces.com/contest/69/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["implementation", "math"]
          },
          {
            id: "codeforces-112b",
            title: "Petya and Countryside",
            url: "https://codeforces.com/contest/112/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["implementation"]
          },
          {
            id: "codeforces-158e",
            title: "Next Stop",
            url: "https://codeforces.com/contest/158/problem/E",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["implementation"]
          },
          {
            id: "codeforces-158f",
            title: "Next Train",
            url: "https://codeforces.com/contest/158/problem/F",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["implementation"]
          },
          {
            id: "codeforces-200a",
            title: "Drinks",
            url: "https://codeforces.com/contest/200/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["math"]
          },
          {
            id: "codeforces-231b",
            title: "Teams Forming",
            url: "https://codeforces.com/contest/231/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["greedy", "implementation"]
          },
          {
            id: "codeforces-158g",
            title: "Next Contest",
            url: "https://codeforces.com/contest/158/problem/G",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["implementation"]
          },
          {
            id: "codeforces-276a",
            title: "Lunch Rush",
            url: "https://codeforces.com/contest/276/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["implementation"]
          },
          {
            id: "codeforces-486a",
            title: "Calculating Function",
            url: "https://codeforces.com/contest/486/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-A",
            tags: ["math"]
          }
        ]
      }
      ,
      {
        id: "div2-b",
        title: "Div2 B",
        description: "Practice Div2 B problems",
        estimatedTime: "2.5 weeks",
        problems: [
          {
            id: "codeforces-1b",
            title: "Spreadsheet",
            url: "https://codeforces.com/contest/1/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["greedy", "sorting"]
          },
          {
            id: "codeforces-47b",
            title: "Before an Exam",
            url: "https://codeforces.com/contest/47/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["greedy", "sorting"]
          },
          {
            id: "codeforces-32b",
            title: "Borze",
            url: "https://codeforces.com/contest/32/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["math", "implementation"]
          },
          {
            id: "codeforces-245b",
            title: "Little Elephant and Array",
            url: "https://codeforces.com/contest/245/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["greedy", "implementation"]
          },
          {
            id: "codeforces-546b",
            title: "Soldier and Cards",
            url: "https://codeforces.com/contest/546/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["implementation"]
          },
          {
            id: "codeforces-263b",
            title: "Sweets Eating",
            url: "https://codeforces.com/contest/263/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["greedy"]
          },
          {
            id: "codeforces-581b",
            title: "Luxurious Houses",
            url: "https://codeforces.com/contest/581/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["greedy", "implementation"]
          },
          {
            id: "codeforces-688b",
            title: "Optimal Partition",
            url: "https://codeforces.com/contest/688/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["math", "implementation"]
          },
          {
            id: "codeforces-617b",
            title: "Watering Flowers",
            url: "https://codeforces.com/contest/617/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["greedy"]
          },
          {
            id: "codeforces-281b",
            title: "Word Capitalization",
            url: "https://codeforces.com/contest/281/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["implementation", "strings"]
          },
          {
            id: "codeforces-474b",
            title: "Worms",
            url: "https://codeforces.com/contest/474/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["binary search", "implementation"]
          },
          {
            id: "codeforces-137b",
            title: "Permutations",
            url: "https://codeforces.com/contest/137/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["implementation"]
          },
          {
            id: "codeforces-405b",
            title: "Gravity Flip",
            url: "https://codeforces.com/contest/405/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["implementation", "greedy"]
          },
          {
            id: "codeforces-546c",
            title: "Soldier and Cards",
            url: "https://codeforces.com/contest/546/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["implementation"]
          },
          {
            id: "codeforces-606b",
            title: "Die Roll",
            url: "https://codeforces.com/contest/606/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["greedy"]
          },
          {
            id: "codeforces-263c",
            title: "Beautiful Numbers",
            url: "https://codeforces.com/contest/263/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["implementation"]
          },
          {
            id: "codeforces-609b",
            title: "The Best Gift",
            url: "https://codeforces.com/contest/609/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["implementation", "greedy"]
          },
          {
            id: "codeforces-580b",
            title: "Kefa and Company",
            url: "https://codeforces.com/contest/580/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["two pointers", "sorting"]
          },
          {
            id: "codeforces-555b",
            title: "Case of the Zeros and Ones",
            url: "https://codeforces.com/contest/555/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["implementation", "strings"]
          },
          {
            id: "codeforces-312b",
            title: "Tips",
            url: "https://codeforces.com/contest/312/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["greedy"]
          },
          {
            id: "codeforces-489b",
            title: "Berland National Library",
            url: "https://codeforces.com/contest/489/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["greedy", "implementation"]
          },
          {
            id: "codeforces-363b",
            title: "Fence",
            url: "https://codeforces.com/contest/363/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["implementation"]
          },
          {
            id: "codeforces-48b",
            title: "Cupboards",
            url: "https://codeforces.com/contest/48/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["implementation"]
          },
          {
            id: "codeforces-352b",
            title: "Jeff and Permutation",
            url: "https://codeforces.com/contest/352/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["constructive algorithms"]
          },
          {
            id: "codeforces-84b",
            title: "Yet Another Crosses Problem",
            url: "https://codeforces.com/contest/84/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["brute force", "implementation"]
          },
          {
            id: "codeforces-25b",
            title: "Phone Numbers",
            url: "https://codeforces.com/contest/25/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["implementation", "strings"]
          },
          {
            id: "codeforces-588b",
            title: "Duff in Love",
            url: "https://codeforces.com/contest/588/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["dp"]
          },
          {
            id: "codeforces-760b",
            title: "Frodo and pillows",
            url: "https://codeforces.com/contest/760/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["math"]
          },
          {
            id: "codeforces-467b",
            title: "Fedor and New Game",
            url: "https://codeforces.com/contest/467/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["bitmasks"]
          },
          {
            id: "codeforces-676b",
            title: "Pyramid of Glass",
            url: "https://codeforces.com/contest/676/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["implementation"]
          },
          {
            id: "codeforces-676a",
            title: "Nicholas and Permutation",
            url: "https://codeforces.com/contest/676/problem/A",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["implementation"]
          },
          {
            id: "codeforces-479b",
            title: "Towers",
            url: "https://codeforces.com/contest/479/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["greedy", "implementation"]
          },
          {
            id: "codeforces-455b",
            title: "A Lot of Games",
            url: "https://codeforces.com/contest/455/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["math"]
          },
          {
            id: "codeforces-69b",
            title: "Little Elephant and LCM",
            url: "https://codeforces.com/contest/69/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["math"]
          },
          {
            id: "codeforces-96b",
            title: "Lucky Substring",
            url: "https://codeforces.com/contest/96/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-B",
            tags: ["strings", "simulation"]
          }
        ]
      }
      ,
      {
        id: "div2-c",
        title: "Div2 C",
        description: "Challenge yourself with Div2 C",
        estimatedTime: "2.5 weeks",
        problems: [
          {
            id: "codeforces-4c",
            title: "Registration System",
            url: "https://codeforces.com/contest/4/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["math", "greedy", "dp"]
          },
          {
            id: "codeforces-20c",
            title: "Dijkstra?",
            url: "https://codeforces.com/contest/20/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["mathematics", "advanced-algorithms"]
          },
          {
            id: "codeforces-151c",
            title: "Win or Freeze",
            url: "https://codeforces.com/contest/151/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["math", "greedy", "dp"]
          },
          {
            id: "codeforces-279c",
            title: "Ladder",
            url: "https://codeforces.com/contest/279/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["greedy", "dp"]
          },
          {
            id: "codeforces-281c",
            title: "Word Break",
            url: "https://codeforces.com/contest/281/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["dp", "greedy"]
          },
          {
            id: "codeforces-156c",
            title: "Game With Cards",
            url: "https://codeforces.com/contest/156/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["math", "greedy"]
          },
          {
            id: "codeforces-156b",
            title: "Chess Tournament",
            url: "https://codeforces.com/contest/156/problem/B",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["greedy"]
          },
          {
            id: "codeforces-244c",
            title: "Two Closest Points",
            url: "https://codeforces.com/contest/244/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["geometry"]
          },
          {
            id: "codeforces-622c",
            title: "Not Equal on a Segment",
            url: "https://codeforces.com/contest/622/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["greedy", "implementation"]
          },
          {
            id: "codeforces-760c",
            title: "Petr and a Combination Lock",
            url: "https://codeforces.com/contest/760/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["strings", "implementation"]
          },
          {
            id: "codeforces-118c",
            title: "Socks",
            url: "https://codeforces.com/contest/118/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["dp"]
          },
          {
            id: "codeforces-339c",
            title: "Xenia and Bit Operations",
            url: "https://codeforces.com/contest/339/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["bitmasks", "dp"]
          },
          {
            id: "codeforces-217c",
            title: "Forming Teams",
            url: "https://codeforces.com/contest/217/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["greedy", "implementation"]
          },
          {
            id: "codeforces-618c",
            title: "Gorillas in the Mist",
            url: "https://codeforces.com/contest/618/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["geometry"]
          },
          {
            id: "codeforces-337c",
            title: "Quiz",
            url: "https://codeforces.com/contest/337/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["greedy", "implementation"]
          },
          {
            id: "codeforces-617c",
            title: "Watering Flowers",
            url: "https://codeforces.com/contest/617/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["greedy"]
          },
          {
            id: "codeforces-145c",
            title: "Lucky Tickets",
            url: "https://codeforces.com/contest/145/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["math", "implementation"]
          },
          {
            id: "codeforces-91c",
            title: "Two Edit",
            url: "https://codeforces.com/contest/91/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["strings", "implementation"]
          },
          {
            id: "codeforces-1027c",
            title: "Minimum Value Rectangle",
            url: "https://codeforces.com/contest/1027/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["greedy", "geometry"]
          },
          {
            id: "codeforces-581c",
            title: "Nearest Interesting Number",
            url: "https://codeforces.com/contest/581/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["math"]
          },
          {
            id: "codeforces-155c",
            title: "Little Pony and Expected Maximum",
            url: "https://codeforces.com/contest/155/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["math", "dp"]
          },
          {
            id: "codeforces-176c",
            title: "Long Jumps",
            url: "https://codeforces.com/contest/176/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["dp", "greedy"]
          },
          {
            id: "codeforces-24c",
            title: "Number Transformation",
            url: "https://codeforces.com/contest/24/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["math", "greedy"]
          },
          {
            id: "codeforces-636c",
            title: "Gaurav and Subarrays",
            url: "https://codeforces.com/contest/636/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["dp"]
          },
          {
            id: "codeforces-460c",
            title: "Present",
            url: "https://codeforces.com/contest/460/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["greedy"]
          },
          {
            id: "codeforces-987c",
            title: "Three Displays",
            url: "https://codeforces.com/contest/987/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["greedy"]
          },
          {
            id: "codeforces-1076c",
            title: "Minimum Ties",
            url: "https://codeforces.com/contest/1076/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["greedy", "implementation"]
          },
          {
            id: "codeforces-546c",
            title: "Soldier and Cards",
            url: "https://codeforces.com/contest/546/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["implementation"]
          },
          {
            id: "codeforces-621c",
            title: "Wet Shark and Cards",
            url: "https://codeforces.com/contest/621/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["math", "dp"]
          },
          {
            id: "codeforces-666c",
            title: "Kitchen",
            url: "https://codeforces.com/contest/666/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["greedy", "implementation"]
          },
          {
            id: "codeforces-822c",
            title: "Imbalanced Array",
            url: "https://codeforces.com/contest/822/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["sorting", "greedy"]
          },
          {
            id: "codeforces-954c",
            title: "Matrix Walk",
            url: "https://codeforces.com/contest/954/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["dp"]
          },
          {
            id: "codeforces-87c",
            title: "Good Ugly Numbers",
            url: "https://codeforces.com/contest/87/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["dp"]
          },
          {
            id: "codeforces-25c",
            title: "Roadmap",
            url: "https://codeforces.com/contest/25/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["graphs"]
          },
          {
            id: "codeforces-96c",
            title: "Lucky Number",
            url: "https://codeforces.com/contest/96/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["math"]
          },
          {
            id: "codeforces-174c",
            title: "Encryption",
            url: "https://codeforces.com/contest/174/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["strings", "implementation"]
          },
          {
            id: "codeforces-131c",
            title: "Remove Extra One",
            url: "https://codeforces.com/contest/131/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["greedy"]
          },
          {
            id: "codeforces-580c",
            title: "Kefa and City",
            url: "https://codeforces.com/contest/580/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["dfs", "trees"]
          },
          {
            id: "codeforces-277c",
            title: "Modern Art",
            url: "https://codeforces.com/contest/277/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["dp"]
          },
          {
            id: "codeforces-422c",
            title: "DNA Sequence",
            url: "https://codeforces.com/contest/422/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["strings"]
          },
          {
            id: "codeforces-151c",
            title: "Contest",
            url: "https://codeforces.com/contest/151/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-C",
            tags: ["greedy", "implementation"]
          }
        ]
      }
      ,
      {
        id: "div2-d",
        title: "Div2 D",
        description: "Advanced Div2 D problems",
        estimatedTime: "3 weeks",
        problems: [
          {
            id: "codeforces-2d",
            title: "The least round way",
            url: "https://codeforces.com/contest/2/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["mathematics", "advanced-algorithms"]
          },
          {
            id: "codeforces-6d",
            title: "Lizards and Basements 2",
            url: "https://codeforces.com/contest/6/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["mathematics", "advanced-algorithms"]
          },
          {
            id: "codeforces-12d",
            title: "Ball",
            url: "https://codeforces.com/contest/12/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["mathematics", "advanced-algorithms"]
          },
          {
            id: "codeforces-337d",
            title: "Book of Evil",
            url: "https://codeforces.com/contest/337/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["dp", "trees", "graphs"]
          },
          {
            id: "codeforces-337c",
            title: "Quiz",
            url: "https://codeforces.com/contest/337/problem/C",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["greedy", "implementation"]
          },
          {
            id: "codeforces-191d",
            title: "Point and Segment",
            url: "https://codeforces.com/contest/191/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["binary search", "sortings"]
          },
          {
            id: "codeforces-276d",
            title: "Little Girl and Maximum Sum",
            url: "https://codeforces.com/contest/276/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["greedy", "data structures"]
          },
          {
            id: "codeforces-339d",
            title: "Xenia and Bit Operations",
            url: "https://codeforces.com/contest/339/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["data structures", "segment trees"]
          },
          {
            id: "codeforces-405d",
            title: "Gravity Flip",
            url: "https://codeforces.com/contest/405/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["sorting", "greedy"]
          },
          {
            id: "codeforces-464d",
            title: "Dima and Salad",
            url: "https://codeforces.com/contest/464/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["geometry"]
          },
          {
            id: "codeforces-507d",
            title: "Guess Your Way Out!",
            url: "https://codeforces.com/contest/507/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["dfs", "graphs"]
          },
          {
            id: "codeforces-510d",
            title: "Fox And Greedy",
            url: "https://codeforces.com/contest/510/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["greedy", "data structures"]
          },
          {
            id: "codeforces-519d",
            title: "A and B and Interesting Substrings",
            url: "https://codeforces.com/contest/519/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["strings", "hashing"]
          },
          {
            id: "codeforces-570d",
            title: "Tree Requests",
            url: "https://codeforces.com/contest/570/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["trees", "dfs"]
          },
          {
            id: "codeforces-704d",
            title: "Meet and Party",
            url: "https://codeforces.com/contest/704/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["math"]
          },
          {
            id: "codeforces-710d",
            title: "Directed Roads",
            url: "https://codeforces.com/contest/710/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["graphs", "shortest paths"]
          },
          {
            id: "codeforces-792d",
            title: "Love-Hate",
            url: "https://codeforces.com/contest/792/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["dynamic programming", "hashing"]
          },
          {
            id: "codeforces-817d",
            title: "Impassable Maze",
            url: "https://codeforces.com/contest/817/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["dp", "graphs"]
          },
          {
            id: "codeforces-838d",
            title: "Chocolates",
            url: "https://codeforces.com/contest/838/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["dp", "greedy"]
          },
          {
            id: "codeforces-685d",
            title: "Segments",
            url: "https://codeforces.com/contest/685/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["sorting", "greedy"]
          },
          {
            id: "codeforces-746d",
            title: "Decoding Genome",
            url: "https://codeforces.com/contest/746/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["strings", "hashing"]
          },
          {
            id: "codeforces-1109d",
            title: "Broken Keyboard",
            url: "https://codeforces.com/contest/1109/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["implementation"]
          },
          {
            id: "codeforces-707d",
            title: "Mirko and Problem",
            url: "https://codeforces.com/contest/707/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["math", "greedy"]
          },
          {
            id: "codeforces-917d",
            title: "Proper Nutrition",
            url: "https://codeforces.com/contest/917/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["dp"]
          },
          {
            id: "codeforces-961d",
            title: "Pair of Numbers",
            url: "https://codeforces.com/contest/961/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["math", "bitmasks"]
          },
          {
            id: "codeforces-999d",
            title: "Round Dance",
            url: "https://codeforces.com/contest/999/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["greedy"]
          },
          {
            id: "codeforces-1065d",
            title: "Make The Fence Great Again",
            url: "https://codeforces.com/contest/1065/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["greedy", "data structures"]
          },
          {
            id: "codeforces-1082d",
            title: "Maximum Diameter Graph",
            url: "https://codeforces.com/contest/1082/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["graphs"]
          },
          {
            id: "codeforces-807d",
            title: "Guess Your Way Out!",
            url: "https://codeforces.com/contest/807/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["dfs", "graphs"]
          },
          {
            id: "codeforces-922d",
            title: "Diverse Garland",
            url: "https://codeforces.com/contest/922/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["greedy"]
          },
          {
            id: "codeforces-957d",
            title: "The Artful Expedient",
            url: "https://codeforces.com/contest/957/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["dp", "graphs"]
          },
          {
            id: "codeforces-1167d",
            title: "Barman and Black Cubes",
            url: "https://codeforces.com/contest/1167/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["math"]
          },
          {
            id: "codeforces-1178d",
            title: "Prime Graph",
            url: "https://codeforces.com/contest/1178/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["graphs", "math"]
          },
          {
            id: "codeforces-1208d",
            title: "Restore Permutation",
            url: "https://codeforces.com/contest/1208/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["greedy"]
          },
          {
            id: "codeforces-1244d",
            title: "Paint the Tree",
            url: "https://codeforces.com/contest/1244/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["trees", "dfs"]
          },
          {
            id: "codeforces-1288d",
            title: "Two Divisors",
            url: "https://codeforces.com/contest/1288/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["math"]
          },
          {
            id: "codeforces-1304d",
            title: "Shortest and Longest LIS",
            url: "https://codeforces.com/contest/1304/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["dp"]
          },
          {
            id: "codeforces-1313d",
            title: "Walk on Matrix",
            url: "https://codeforces.com/contest/1313/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["dp"]
          },
          {
            id: "codeforces-1327d",
            title: "Infinite Path",
            url: "https://codeforces.com/contest/1327/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["graphs"]
          },
          {
            id: "codeforces-1375d",
            title: "Replace by MEX",
            url: "https://codeforces.com/contest/1375/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["greedy"]
          },
          {
            id: "codeforces-1400d",
            title: "Binary String To Subsequences",
            url: "https://codeforces.com/contest/1400/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["greedy", "strings"]
          },
          {
            id: "codeforces-1466d",
            title: "13th Labour of Heracles",
            url: "https://codeforces.com/contest/1466/problem/D",
            platform: "Codeforces",
            difficulty: "Div2-D",
            tags: ["dp"]
          }
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