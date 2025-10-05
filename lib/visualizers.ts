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
]

export function tagToSlug(tag: string): string {
  const normalized = tag.toLowerCase().replace(/\s+/g, "-")
  const hit = VISUALIZERS.find((v) => v.slug === normalized || v.tags.includes(tag.toLowerCase()))
  return hit?.slug ?? normalized
}

export function getVisualizer(slug: string): Visualizer | undefined {
  return VISUALIZERS.find((v) => v.slug === slug)
}
