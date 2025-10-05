export type Resource = {
  label: string;
  href: string;
};

export type Visualizer = {
  slug: string;
  title: string;
  summary: string;
  tags: readonly string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  resources: readonly Resource[];
};

export const VISUALIZERS = [
  // 🟢 BEGINNER LEVEL
  {
    slug: 'sorting',
    title: 'Sorting Algorithms',
    summary:
      'Visualize bubble sort, selection sort, merge sort, and quick sort step by step. Understand stability and time complexity intuitively.',
    tags: ['sorting', 'bubble sort', 'merge sort', 'quick sort'] as const,
    difficulty: 'beginner',
    resources: [
      { label: 'CP-Algorithms: Sorting', href: 'https://cp-algorithms.com/sorting/' },
      { label: 'USACO Guide: Sorting', href: 'https://usaco.guide/silver/sorting' },
    ] as const,
  },
  {
    slug: 'binary-search',
    title: 'Binary Search',
    summary:
      'Visualize how binary search narrows down ranges, works with monotonic predicates, and supports lower_bound / upper_bound patterns.',
    tags: ['binary search', 'lower_bound', 'upper_bound'] as const,
    difficulty: 'beginner',
    resources: [
      { label: 'CP-Algorithms: Binary Search', href: 'https://cp-algorithms.com/num_methods/binary_search.html' },
      { label: 'USACO Guide: Binary Search', href: 'https://usaco.guide/silver/binary-search' },
    ] as const,
  },
  {
    slug: 'greedy',
    title: 'Greedy Algorithms',
    summary:
      'Understand the greedy choice property, visualize interval scheduling, and see why counterexamples fail.',
    tags: ['greedy', 'activity selection', 'interval scheduling'] as const,
    difficulty: 'beginner',
    resources: [
      { label: 'CP-Algorithms: Greedy', href: 'https://cp-algorithms.com/greedy/' },
      { label: 'USACO Guide: Greedy', href: 'https://usaco.guide/silver/greedy-sorting' },
    ] as const,
  },

  // 🟡 INTERMEDIATE LEVEL
  {
    slug: 'graphs',
    title: 'Graph Algorithms',
    summary:
      'Visualize BFS, DFS, Dijkstra, Bellman-Ford, Kruskal, and Prim in action. Build clear understanding of traversal and shortest paths.',
    tags: ['graphs', 'bfs', 'dfs', 'dijkstra', 'mst', 'kruskal'] as const,
    difficulty: 'intermediate',
    resources: [
      { label: 'CP-Algorithms: Graphs', href: 'https://cp-algorithms.com/graph/' },
      { label: 'USACO Guide: Graphs', href: 'https://usaco.guide/silver/graph-traversal' },
    ] as const,
  },
  {
    slug: 'trees',
    title: 'Trees',
    summary:
      'Visualize tree traversals, binary trees, Lowest Common Ancestor (LCA), Euler Tour, and rerooting techniques.',
    tags: ['trees', 'lca', 'dfs tree', 'rerooting'] as const,
    difficulty: 'intermediate',
    resources: [
      { label: 'CP-Algorithms: Trees', href: 'https://cp-algorithms.com/graph/lca.html' },
      { label: 'USACO Guide: Trees', href: 'https://usaco.guide/silver/tree-euler' },
    ] as const,
  },
  {
    slug: 'dp',
    title: 'Dynamic Programming',
    summary:
      'Watch how DP states evolve in real time — knapsack, LIS, and grid problems. Learn to reason about subproblems and transitions.',
    tags: ['dp', 'dynamic programming', 'knapsack', 'lis'] as const,
    difficulty: 'intermediate',
    resources: [
      { label: 'CP-Algorithms: DP', href: 'https://cp-algorithms.com/dynamic_programming/intro-to-dp.html' },
      { label: 'USACO Guide: DP', href: 'https://usaco.guide/gold/intro-dp' },
    ] as const,
  },
  {
    slug: 'dsu',
    title: 'Disjoint Set Union (Union-Find)',
    summary:
      'Visualize union and find operations, understand path compression and union by rank. Key for Kruskal’s MST and connected components.',
    tags: ['dsu', 'union find', 'kruskal'] as const,
    difficulty: 'intermediate',
    resources: [
      { label: 'CP-Algorithms: DSU', href: 'https://cp-algorithms.com/data_structures/disjoint_set_union.html' },
      { label: 'USACO Guide: DSU', href: 'https://usaco.guide/gold/dsu' },
    ] as const,
  },

  // 🔴 ADVANCED LEVEL
  {
    slug: 'bitmask-dp',
    title: 'Bitmask DP',
    summary:
      'Visualize subset DP, TSP, and other problems using bit operations to represent states efficiently.',
    tags: ['bitmask dp', 'subset dp', 'tsp'] as const,
    difficulty: 'advanced',
    resources: [
      { label: 'CP-Algorithms: Bitmask DP', href: 'https://cp-algorithms.com/dynamic_programming/bitmasks.html' },
      { label: 'USACO Guide: Bitmask DP', href: 'https://usaco.guide/gold/dp-bitmask' },
    ] as const,
  },
  {
    slug: 'segment-tree',
    title: 'Segment Tree',
    summary:
      'Explore how segment trees handle range queries and updates efficiently with or without lazy propagation.',
    tags: ['segment tree', 'range query', 'lazy propagation'] as const,
    difficulty: 'advanced',
    resources: [
      { label: 'CP-Algorithms: Segment Tree', href: 'https://cp-algorithms.com/data_structures/segment_tree.html' },
      { label: 'USACO Guide: Segment Tree', href: 'https://usaco.guide/gold/segment-trees' },
    ] as const,
  },
  {
    slug: 'number-theory',
    title: 'Number Theory',
    summary:
      'Interactive number theory visualizer: gcd/lcm, prime sieves, modular exponentiation, and modular inverses.',
    tags: ['number theory', 'sieve', 'gcd', 'modular arithmetic'] as const,
    difficulty: 'advanced',
    resources: [
      { label: 'CP-Algorithms: Number Theory', href: 'https://cp-algorithms.com/algebra/' },
      { label: 'USACO Guide: Number Theory', href: 'https://usaco.guide/gold/num-theory' },
    ] as const,
  },
  {
    slug: 'strings',
    title: 'String Algorithms',
    summary:
      'Visualize KMP, Z-function, prefix function, and rolling hash — core tools for pattern matching and string analysis.',
    tags: ['strings', 'kmp', 'z-function', 'hashing'] as const,
    difficulty: 'advanced',
    resources: [
      { label: 'CP-Algorithms: String Algorithms', href: 'https://cp-algorithms.com/string/' },
      { label: 'USACO Guide: Strings', href: 'https://usaco.guide/gold/strings' },
    ] as const,
  },
  {
    slug: 'geometry',
    title: 'Computational Geometry',
    summary:
      'Visualize convex hull, line intersection, polygon area, and orientation — key geometry operations in CP.',
    tags: ['geometry', 'convex hull', 'orientation', 'polygon area'] as const,
    difficulty: 'advanced',
    resources: [
      { label: 'CP-Algorithms: Geometry', href: 'https://cp-algorithms.com/geometry/' },
      { label: 'USACO Guide: Geometry', href: 'https://usaco.guide/gold/geometry' },
    ] as const,
  },
] as const;

// --- Precompute maps for O(1) lookups ---
const SLUG_MAP: Record<string, Visualizer> = {};
const TAG_MAP: Record<string, string> = {};

VISUALIZERS.forEach(v => {
  SLUG_MAP[v.slug] = v;
  v.tags.forEach(tag => {
    TAG_MAP[tag.toLowerCase()] = v.slug;
  });
});

export function tagToSlug(tag: string): string {
  return TAG_MAP[tag.toLowerCase()] ?? tag.toLowerCase().replace(/\s+/g, '-');
}

export function getVisualizer(slug: string): Visualizer | undefined {
  return SLUG_MAP[slug];
}