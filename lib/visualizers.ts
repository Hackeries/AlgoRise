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
      { label: "CP-Algorithms: Graphs", href: "https://cp-algorithms.com/graph/" },
      { label: "USACO Guide: Graphs", href: "https://usaco.guide/graph" },
    ],
  },
  {
    slug: "dp",
    title: "Dynamic Programming",
    summary: "State design, transitions, and optimization tricks (knapsack, LIS, digit DP).",
    tags: ["dp", "dynamic programming", "knapsack", "lis"],
    resources: [
      { label: "CP-Algorithms: DP", href: "https://cp-algorithms.com/dp/" },
      { label: "USACO Guide: DP", href: "https://usaco.guide/adv/dp?lang=cpp" },
    ],
  },
  {
    slug: "greedy",
    title: "Greedy",
    summary: "Exchange argument, sorting by key, and classic counterexamples.",
    tags: ["greedy"],
    resources: [{ label: "CP-Algorithms: Greedy", href: "https://cp-algorithms.com/other/greedy.html" }],
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    summary: "Predicate design, monotonicity, lower_bound/upper_bound patterns.",
    tags: ["binary search", "binary_search"],
    resources: [
      { label: "CP-Algorithms: Binary Search", href: "https://cp-algorithms.com/num_methods/binary_search.html" },
    ],
  },
  {
    slug: "trees",
    title: "Trees",
    summary: "Tree traversals, LCA, subtree tricks, rerooting.",
    tags: ["trees", "lca", "rerooting"],
    resources: [{ label: "CP-Algorithms: Trees", href: "https://cp-algorithms.com/graph/lca.html" }],
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
