export type Resource = {
  label: string;
  href: string;
};

export type Visualizer = {
  slug: string;
  title: string;
  summary: string;
  tags: readonly string[];
  resources: readonly Resource[];
};

// Use const assertion to keep literal types
export const VISUALIZERS = [
  {
    slug: "sorting",
    title: "Sorting Algorithms",
    summary:
      "Interactive visualization of bubble sort, selection sort, quick sort, and more. Watch how different algorithms work step by step.",
    tags: [
      "sorting",
      "algorithms",
      "bubble sort",
      "selection sort",
      "quick sort",
    ] as const,
    resources: [
      {
        label: "Sorting Algorithms Guide",
        href: "https://www.geeksforgeeks.org/sorting-algorithms/",
      },
      { label: "Big-O Cheat Sheet", href: "https://www.bigocheatsheet.com/" },
      {
        label: "Sorting Algorithm Animations",
        href: "https://www.toptal.com/developers/sorting-algorithms",
      },
    ] as const,
  },
  {
    slug: "graphs",
    title: "Graph Algorithms",
    summary:
      "Shortest paths, BFS/DFS, MST, and more. Build intuition with interactive traces.",
    tags: ["graphs", "shortest paths", "mst", "bfs", "dfs"] as const,
    resources: [
      {
        label: "CP-Algorithms: Graphs",
        href: "https://cp-algorithms.com/graph/breadth-first-search.html",
      },
      {
        label: "USACO Guide: Graphs",
        href: "https://usaco.guide/silver/graph-traversal",
      },
    ] as const,
  },
  {
    slug: "dp",
    title: "Dynamic Programming",
    summary:
      "State design, transitions, and optimization tricks (knapsack, LIS, digit DP).",
    tags: ["dp", "dynamic programming", "knapsack", "lis"] as const,
    resources: [
      {
        label: "CP-Algorithms: DP",
        href: "https://cp-algorithms.com/dynamic_programming/divide-and-conquer-dp.html",
      },
      { label: "USACO Guide: DP", href: "https://usaco.guide/gold/intro-dp" },
    ] as const,
  },
  {
    slug: "greedy",
    title: "Greedy",
    summary: "Exchange argument, sorting by key, and classic counterexamples.",
    tags: ["greedy"] as const,
    resources: [
      {
        label: "CP-Algorithms: Greedy",
        href: "https://cp-algorithms.com/sequences/longest_increasing_subsequence.html",
      },
      {
        label: "USACO Guide: Greedy",
        href: "https://usaco.guide/silver/greedy-sorting",
      },
    ] as const,
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    summary:
      "Predicate design, monotonicity, lower_bound/upper_bound patterns.",
    tags: ["binary search", "binary_search"] as const,
    resources: [
      {
        label: "CP-Algorithms: Binary Search",
        href: "https://cp-algorithms.com/num_methods/ternary_search.html",
      },
      {
        label: "USACO Guide: Binary Search",
        href: "https://usaco.guide/silver/binary-search",
      },
    ] as const,
  },
  {
    slug: "trees",
    title: "Trees",
    summary: "Tree traversals, LCA, subtree tricks, rerooting.",
    tags: ["trees", "lca", "rerooting"] as const,
    resources: [
      {
        label: "CP-Algorithms: Trees",
        href: "https://cp-algorithms.com/graph/lca.html",
      },
      {
        label: "USACO Guide: Trees",
        href: "https://usaco.guide/silver/tree-euler",
      },
    ] as const,
  },
] as const;

// Precompute maps for O(1) lookups
const SLUG_MAP: Record<string, Visualizer> = {};
const TAG_MAP: Record<string, string> = {};

VISUALIZERS.forEach((v) => {
  SLUG_MAP[v.slug] = v;
  v.tags.forEach((tag) => {
    TAG_MAP[tag.toLowerCase()] = v.slug;
  });
});

export function tagToSlug(tag: string): string {
  return TAG_MAP[tag.toLowerCase()] ?? tag.toLowerCase().replace(/\s+/g, "-");
}

export function getVisualizer(slug: string): Visualizer | undefined {
  return SLUG_MAP[slug];
}