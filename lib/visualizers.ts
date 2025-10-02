// Visualizers registry and helpers for tag → slug mapping.

export type Visualizer = {
  slug: string
  title: string
  summary: string
  tags: string[]
  resources: { label: string; href: string }[]
}

export const VISUALIZERS: Visualizer[] = [
  {
    slug: "sorting",
    title: "Sorting Algorithms",
    summary: "Interactive visualization of bubble sort, selection sort, quick sort, and more. Watch how different algorithms work step by step.",
    tags: ["sorting", "algorithms", "bubble sort", "selection sort", "quick sort"],
    resources: [
      { label: "Sorting Algorithms Guide", href: "https://www.geeksforgeeks.org/sorting-algorithms/" },
      { label: "Big-O Cheat Sheet", href: "https://www.bigocheatsheet.com/" },
      { label: "Sorting Algorithm Animations", href: "https://www.toptal.com/developers/sorting-algorithms" },
    ],
  },
  {
    slug: "graphs",
    title: "Graph Algorithms",
    summary: "Shortest paths, BFS/DFS, MST, and more. Build intuition with interactive traces.",
    tags: ["graphs", "shortest paths", "mst", "bfs", "dfs"],
    resources: [
      { label: "CP-Algorithms: Graphs", href: "https://cp-algorithms.com/graph/breadth-first-search.html" },
      { label: "USACO Guide: Graphs", href: "https://usaco.guide/silver/graph-traversal" },
    ],
  },
  {
    slug: "dp",
    title: "Dynamic Programming",
    summary: "State design, transitions, and optimization tricks (knapsack, LIS, digit DP).",
    tags: ["dp", "dynamic programming", "knapsack", "lis"],
    resources: [
      { label: "CP-Algorithms: DP", href: "https://cp-algorithms.com/dynamic_programming/divide-and-conquer-dp.html" },
      { label: "USACO Guide: DP", href: "https://usaco.guide/gold/intro-dp" },
    ],
  },
    {
      slug: "recursion",
      title: "Recursion",
      summary: "Visualize recursive calls, stack frames, and classic problems like factorial and Fibonacci.",
      tags: ["recursion", "factorial", "fibonacci"],
      resources: [
        { label: "Recursion Explained", href: "https://www.geeksforgeeks.org/recursion/" },
        { label: "Visualgo: Recursion", href: "https://visualgo.net/en/recursion" }
      ]
    },
    {
      slug: "bit-manipulation",
      title: "Bit Manipulation",
      summary: "See how bitwise operations work, including AND, OR, XOR, and bit tricks.",
      tags: ["bit manipulation", "bitwise", "xor", "and", "or"],
      resources: [
        { label: "Bit Manipulation Guide", href: "https://www.geeksforgeeks.org/bitwise-operators-in-c-cpp/" },
        { label: "Bit Tricks", href: "https://leetcode.com/tag/bit-manipulation/" }
      ]
    },
    {
      slug: "backtracking",
      title: "Backtracking",
      summary: "Explore solution trees, pruning, and classic problems like N-Queens and Subset Sum.",
      tags: ["backtracking", "n-queens", "subset sum"],
      resources: [
        { label: "Backtracking Explained", href: "https://www.geeksforgeeks.org/backtracking-algorithms/" },
        { label: "N-Queens Visualization", href: "https://visualgo.net/en/recursion" }
      ]
    },
  {
    slug: "greedy",
    title: "Greedy",
    summary: "Exchange argument, sorting by key, and classic counterexamples.",
    tags: ["greedy"],
    resources: [
      { label: "CP-Algorithms: Greedy", href: "https://cp-algorithms.com/sequences/longest_increasing_subsequence.html" },
      { label: "USACO Guide: Greedy", href: "https://usaco.guide/silver/greedy-sorting" }
    ],
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    summary: "Predicate design, monotonicity, lower_bound/upper_bound patterns.",
    tags: ["binary search", "binary_search"],
    resources: [
      { label: "CP-Algorithms: Binary Search", href: "https://cp-algorithms.com/num_methods/ternary_search.html" },
      { label: "USACO Guide: Binary Search", href: "https://usaco.guide/silver/binary-search" },
    ],
  },
  {
    slug: "trees",
    title: "Trees",
    summary: "Tree traversals, LCA, subtree tricks, rerooting.",
    tags: ["trees", "lca", "rerooting"],
    resources: [
      { label: "CP-Algorithms: Trees", href: "https://cp-algorithms.com/graph/lca.html" },
      { label: "USACO Guide: Trees", href: "https://usaco.guide/silver/tree-euler" }
    ],
  },
    {
      slug: "heaps",
      title: "Heaps & Priority Queues",
      summary: "Visualize heap operations, heapify, and priority queue usage.",
      tags: ["heap", "priority queue", "heapify"],
      resources: [
        { label: "Heap Data Structure", href: "https://www.geeksforgeeks.org/heap-data-structure/" },
        { label: "Heap Animation", href: "https://visualgo.net/en/heap" }
      ]
    },
    {
      slug: "segment-tree",
      title: "Segment Tree",
      summary: "Explore range queries, updates, and lazy propagation visually.",
      tags: ["segment tree", "range query", "lazy propagation"],
      resources: [
        { label: "Segment Tree Guide", href: "https://cp-algorithms.com/data_structures/segment_tree.html" },
        { label: "Visualgo: Segment Tree", href: "https://visualgo.net/en/segmenttree" }
      ]
    },
    {
      slug: "fenwick-tree",
      title: "Fenwick Tree (BIT)",
      summary: "Learn prefix sums and updates with Binary Indexed Trees.",
      tags: ["fenwick tree", "bit", "prefix sum"],
      resources: [
        { label: "Fenwick Tree Guide", href: "https://cp-algorithms.com/data_structures/fenwick.html" },
        { label: "Visualgo: Fenwick Tree", href: "https://visualgo.net/en/fenwicktree" }
      ]
    },
    {
      slug: "tries",
      title: "Tries",
      summary: "Visualize prefix trees, insert/search, and autocomplete.",
      tags: ["trie", "prefix tree", "autocomplete"],
      resources: [
        { label: "Trie Data Structure", href: "https://www.geeksforgeeks.org/trie-data-structure/" },
        { label: "Visualgo: Trie", href: "https://visualgo.net/en/trie" }
      ]
    },
    {
      slug: "union-find",
      title: "Union Find (DSU)",
      summary: "See how disjoint set union works for connectivity and Kruskal's MST.",
      tags: ["union find", "dsu", "disjoint set"],
      resources: [
        { label: "DSU Guide", href: "https://cp-algorithms.com/data_structures/disjoint_set_union.html" },
        { label: "Visualgo: DSU", href: "https://visualgo.net/en/dsu" }
      ]
    },
    {
      slug: "string-matching",
      title: "String Matching",
      summary: "Explore KMP, Rabin-Karp, and Z-algorithm visualizations.",
      tags: ["string matching", "kmp", "rabin-karp", "z algorithm"],
      resources: [
        { label: "String Matching Algorithms", href: "https://cp-algorithms.com/string/prefix-function.html" },
        { label: "KMP Animation", href: "https://visualgo.net/en/string" }
      ]
    },
    {
      slug: "hashing",
      title: "Hashing",
      summary: "Visualize hash tables, collisions, and rolling hash techniques.",
      tags: ["hashing", "hash table", "rolling hash"],
      resources: [
        { label: "Hash Table Guide", href: "https://www.geeksforgeeks.org/hashing-data-structure/" },
        { label: "Visualgo: Hashing", href: "https://visualgo.net/en/hash" }
      ]
    },
    {
      slug: "geometry",
      title: "Geometry Algorithms",
      summary: "See convex hull, line intersection, and area calculation visually.",
      tags: ["geometry", "convex hull", "intersection"],
      resources: [
        { label: "Geometry Algorithms", href: "https://cp-algorithms.com/geometry/basic.html" },
        { label: "Convex Hull Animation", href: "https://visualgo.net/en/geometry" }
      ]
    },
    {
      slug: "number-theory",
      title: "Number Theory",
      summary: "Visualize GCD, modular arithmetic, and prime sieves.",
      tags: ["number theory", "gcd", "modular", "sieve"],
      resources: [
        { label: "Number Theory Guide", href: "https://cp-algorithms.com/math/gcd.html" },
        { label: "Prime Sieve Animation", href: "https://visualgo.net/en/numbertheory" }
      ]
    },
    {
      slug: "flow",
      title: "Network Flow",
      summary: "Explore max-flow, min-cut, and flow algorithms visually.",
      tags: ["network flow", "max flow", "min cut"],
      resources: [
        { label: "Network Flow Guide", href: "https://cp-algorithms.com/graph/edmonds_karp.html" },
        { label: "Flow Animation", href: "https://visualgo.net/en/flow" }
      ]
    },
]

export function tagToSlug(tag: string): string {
  const normalized = tag.toLowerCase().replace(/\s+/g, "-")
  const hit = VISUALIZERS.find((v) => v.slug === normalized || v.tags.includes(tag.toLowerCase()))
  return hit?.slug ?? normalized
}

export function getVisualizer(slug: string): Visualizer | undefined {
  return VISUALIZERS.find((v) => v.slug === slug)
}
