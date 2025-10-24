"use client"

import { useEffect, useRef, useState } from "react"
import { Trophy, Target, TrendingUp, Code2, Clock, ChevronRight, Star, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ActivityHeatmap } from "@/components/train/activity-heatmap"
import { cn } from "@/lib/utils"
import { TrainHero } from "@/components/train/hero"
import { FilterBar, type Filters } from "@/components/train/filter-bar"
import { SheetsGrid, type Sheet } from "@/components/train/sheets-grid"
import { CompanyGrid, type CompanySet } from "@/components/train/company-grid"
import { DailyChallenge } from "@/components/train/daily-challenge"
import { UpcomingContests } from "@/components/train/contests"
import { ProblemRecos } from "@/components/train/problem-recos"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader } from "@/components/ui/card"

// Mock data for progress tracking
const progressData = {
  dailyGoal: 3,
  completedToday: 2,
  streak: 12,
  weeklyProgress: 75,
  totalSolved: 247,
  rank: "Expert",
  skillLevels: [
    { skill: "Dynamic Programming", level: 75, problems: 45 },
    { skill: "Graph Theory", level: 60, problems: 32 },
    { skill: "Mathematics", level: 45, problems: 28 },
    { skill: "Data Structures", level: 80, problems: 58 },
    { skill: "Greedy Algorithms", level: 55, problems: 34 },
  ],
}

const recommendedProblems = [
  {
    id: 1,
    title: "Maximum Subarray Sum",
    difficulty: "medium",
    tags: ["Dynamic Programming", "Arrays"],
    acceptance: 68,
    solved: false,
  },
  {
    id: 2,
    title: "Graph Coloring Problem",
    difficulty: "hard",
    tags: ["Graph Theory", "Backtracking"],
    acceptance: 42,
    solved: false,
  },
  {
    id: 3,
    title: "Binary Search Tree Iterator",
    difficulty: "medium",
    tags: ["Trees", "Design"],
    acceptance: 71,
    solved: false,
  },
  {
    id: 4,
    title: "Longest Palindromic Substring",
    difficulty: "easy",
    tags: ["Strings", "Two Pointers"],
    acceptance: 85,
    solved: false,
  },
]

// Mock sheets data for the grid
const SHEETS: Sheet[] = [
  {
    id: "blind75",
    title: "Blind 75",
    platform: "LeetCode",
    difficulty: "Medium",
    topics: ["Arrays", "DP", "Graphs"],
    companies: ["Google", "Amazon"],
    completed: 18,
    total: 75,
  },
  {
    id: "neet250",
    title: "NeetCode 250",
    platform: "LeetCode",
    difficulty: "Hard",
    topics: ["Trees", "Graphs", "DP"],
    companies: ["Meta", "Microsoft"],
    completed: 42,
    total: 250,
  },
  {
    id: "cses",
    title: "CSES Problem Set",
    platform: "CSES",
    difficulty: "Medium",
    topics: ["Graphs", "Math", "DP"],
    companies: [],
    completed: 30,
    total: 200,
  },
  {
    id: "leetcode-classic",
    title: "LeetCode Classics",
    platform: "LeetCode",
    difficulty: "Easy",
    topics: ["Arrays", "Two Pointers", "Strings"],
    companies: ["Google", "Uber"],
    completed: 55,
    total: 180,
  },
]

const COMPANIES: CompanySet[] = [
  {
    id: "google",
    name: "Google",
    problemCount: 120,
    solved: 37,
    distribution: { easy: 35, medium: 60, hard: 25 },
  },
  {
    id: "amazon",
    name: "Amazon",
    problemCount: 90,
    solved: 22,
    distribution: { easy: 28, medium: 45, hard: 17 },
  },
  { id: "meta", name: "Meta", problemCount: 85, solved: 31, distribution: { easy: 25, medium: 40, hard: 20 } },
  { id: "microsoft", name: "Microsoft", problemCount: 78, solved: 18, distribution: { easy: 22, medium: 38, hard: 18 } },
]

const recentActivity = [
  { id: 1, type: "solved", problem: "Two Sum", time: "2 hours ago", difficulty: "easy" },
  { id: 2, type: "attempted", problem: "Merge K Sorted Lists", time: "5 hours ago", difficulty: "hard" },
  { id: 3, type: "solved", problem: "Valid Parentheses", time: "1 day ago", difficulty: "easy" },
  { id: 4, type: "milestone", text: "Reached 12-day streak!", time: "1 day ago" },
]

const upcomingContests = [
  { id: 1, name: "Weekly Contest 382", date: "2025-01-28", time: "08:00 AM", registered: true },
  { id: 2, name: "Biweekly Contest 124", date: "2025-02-01", time: "02:30 PM", registered: false },
]

  // Interview Grind data: merged and de-duplicated by link
  const INTERVIEW_GRIND_BY_COMPANY: Record<string, { difficulty: string; title: string; link: string; topics?: string }[]> =
    buildInterviewGrind();

export default function TrainingHub() {
  const [bookmarkedProblems, setBookmarkedProblems] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState<Filters>({ query: "" })
  const sheetsRef = useRef<HTMLDivElement | null>(null)

  const difficultyColors = {
    easy: "text-muted-foreground bg-muted/40 border-border/80",
    medium: "text-muted-foreground bg-muted/40 border-border/80",
    hard: "text-muted-foreground bg-muted/40 border-border/80",
  }

  const progressPercentage = (progressData.completedToday / progressData.dailyGoal) * 100

  const toggleBookmark = (problemId: number) => {
    setBookmarkedProblems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(problemId)) {
        newSet.delete(problemId)
      } else {
        newSet.add(problemId)
      }
      return newSet
    })
  }

  useEffect(() => {
    // reserved for future side effects
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-neutral-950 to-gray-950 text-white">
      {/* Hero Section */}
      <div className="border-b border-gray-900/60 bg-gradient-to-r from-gray-950/95 via-neutral-950/95 to-gray-950/95 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <TrainHero
            onQuickNav={(key) => {
              if (key === "blind75") setFilters((f) => ({ ...f, query: "Blind 75" }))
              if (key === "neet250") setFilters((f) => ({ ...f, query: "NeetCode 250" }))
              if (key === "cses") setFilters((f) => ({ ...f, platform: "CSES" }))
              if (key === "leetcode") setFilters((f) => ({ ...f, platform: "LeetCode" }))
              sheetsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }}
            onSearch={(q) => setFilters((f) => ({ ...f, query: q }))}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-8 space-y-6">
            <FilterBar value={filters} onChange={setFilters} />

            {/* Problem Sheets Grid */}
            <div ref={sheetsRef} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Problem Sheets</h2>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <SheetsGrid sheets={SHEETS} filters={filters} />
            </div>

            {/* AI-powered recommendations */}
            <ProblemRecos />

          {/* Interview Grind (company questions) */}
          <Card className="p-0 bg-gray-900/50 border-gray-800 shadow-xl backdrop-blur-sm">
            <CardHeader className="px-6 pt-6 pb-2">
              <h2 className="text-lg font-semibold mb-1 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span className="text-white">Interview GRIND</span>
              </h2>
              <p className="text-xs text-muted-foreground">Curated lists merged without duplicates across companies</p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(INTERVIEW_GRIND_BY_COMPANY).map(([company, list]) => (
                  <div key={company} className="rounded-md border border-gray-800/80 p-3 bg-background/40">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="font-semibold">{company}</div>
                      <Badge variant="outline" className="text-xs">
                        {list.length} questions
                      </Badge>
                    </div>
                    <div className="grid gap-1.5 max-h-56 overflow-auto">
                      {list.slice(0, 12).map((q) => (
                        <a
                          key={q.link}
                          href={q.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-300 hover:underline truncate"
                          title={`${q.difficulty} • ${q.title}`}
                        >
                          {q.title}
                        </a>
                      ))}
                      {list.length > 12 && (
                        <div className="text-xs text-muted-foreground">+{list.length - 12} more…</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

            {/* Recent Activity */}
            <Card className="p-6 bg-gray-900/50 border-gray-800 shadow-xl backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                <span className="text-white">Recent Activity</span>
              </h2>

              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 bg-muted/40 text-muted-foreground border border-border/80">
                      {activity.type === "solved" && <Trophy className="h-4 w-4" />}
                      {activity.type === "attempted" && <Code2 className="h-4 w-4" />}
                      {activity.type === "milestone" && <Star className="h-4 w-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {activity.type !== "milestone" ? (
                          <>
                            <span className="text-sm text-muted-foreground">
                              {activity.type === "solved" ? "Solved" : "Attempted"}
                            </span>
                            <span className="text-sm font-medium text-foreground">{activity.problem}</span>
                            {activity.difficulty && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  difficultyColors[activity.difficulty as keyof typeof difficultyColors],
                                )}
                              >
                                {activity.difficulty}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                            {activity.text}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Context Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Daily challenge */}
            <DailyChallenge />

            {/* Progress Tracker */}
            <Card className="p-6 bg-gray-900/50 border-gray-800 shadow-xl backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                <span className="text-white">Daily Progress</span>
              </h2>

              <div className="flex flex-col items-center mb-6">
                <div className="relative w-36 h-36 mb-4">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="none"
                      className="text-muted/50"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      stroke="currentColor"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 64}`}
                      strokeDashoffset={2 * Math.PI * 64 * (1 - progressPercentage / 100)}
                      className="text-primary transition-all duration-500 drop-shadow-sm"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold text-white">{progressData.completedToday}</div>
                    <div className="text-xs text-gray-400 font-medium">of {progressData.dailyGoal}</div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium text-white mb-1">
                    {progressData.completedToday >= progressData.dailyGoal
                      ? "Goal completed!"
                      : `${progressData.dailyGoal - progressData.completedToday} more to go`}
                  </div>
                  <div className="text-xs text-gray-400">Keep up the momentum!</div>
                </div>
              </div>

              <Separator className="my-4 bg-border/60" />

              {/* Weekly Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300 font-medium">Weekly Progress</span>
                  <span className="text-sm font-semibold text-white">{progressData.weeklyProgress}%</span>
                </div>
                <Progress value={progressData.weeklyProgress} className="h-2.5" />
              </div>

              <Separator className="my-4 bg-border/60" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">Activity</span>
                  <span className="text-xs text-gray-400">Last 12 weeks</span>
                </div>
                <ActivityHeatmap />
              </div>
            </Card>

            {/* Learning Insights */}
            <Card className="p-6 bg-gray-900/50 border-gray-800 shadow-xl backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-white">Skill Levels</span>
              </h2>

              <div className="space-y-4">
                {progressData.skillLevels.map((skill) => (
                  <div key={skill.skill}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white font-medium">{skill.skill}</span>
                      <span className="text-xs text-gray-400 font-medium">{skill.problems} solved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted/70 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-white w-10 text-right">{skill.level}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upcoming Contests */}
            <UpcomingContests />

            {/* Company-focused sets */}
            <Card className="p-6 bg-gray-900/50 border-gray-800 shadow-xl backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4">Company-Focused Sets</h2>
              <CompanyGrid companies={COMPANIES} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function buildInterviewGrind() {
  // Helper to add unique by link
  const add = (
    map: Map<string, { difficulty: string; title: string; link: string; topics?: string }[]>,
    company: string,
    item: { difficulty: string; title: string; link: string; topics?: string }
  ) => {
    const arr = map.get(company) ?? []
    if (!arr.some((x) => x.link === item.link)) arr.push(item)
    map.set(company, arr)
  }

  const data = new Map<string, { difficulty: string; title: string; link: string; topics?: string }[]>()

  // TRILOGY
  add(data, 'TRILOGY', { difficulty: 'MEDIUM', title: 'Substring XOR Queries', link: 'https://leetcode.com/problems/substring-xor-queries', topics: 'Array, Hash Table, String, Bit Manipulation' })
  add(data, 'TRILOGY', { difficulty: 'HARD', title: 'Handling Sum Queries After Update', link: 'https://leetcode.com/problems/handling-sum-queries-after-update', topics: 'Array, Segment Tree' })
  add(data, 'TRILOGY', { difficulty: 'MEDIUM', title: 'Bitwise XOR of All Pairings', link: 'https://leetcode.com/problems/bitwise-xor-of-all-pairings', topics: 'Array, Bit Manipulation, Brainteaser' })
  add(data, 'TRILOGY', { difficulty: 'HARD', title: 'Minimum Time to Kill All Monsters', link: 'https://leetcode.com/problems/minimum-time-to-kill-all-monsters', topics: 'Array, Dynamic Programming, Bit Manipulation, Bitmask' })
  add(data, 'TRILOGY', { difficulty: 'HARD', title: 'Distinct Subsequences', link: 'https://leetcode.com/problems/distinct-subsequences', topics: 'String, Dynamic Programming' })

  // TowerResearch Capital
  add(data, 'TowerResearch Capital', { difficulty: 'MEDIUM', title: 'Unique Binary Search Trees', link: 'https://leetcode.com/problems/unique-binary-search-trees', topics: 'Math, Dynamic Programming, Tree, Binary Search Tree, Binary Tree' })
  add(data, 'TowerResearch Capital', { difficulty: 'HARD', title: 'Bricks Falling When Hit', link: 'https://leetcode.com/problems/bricks-falling-when-hit', topics: 'Array, Union Find, Matrix' })

  // DIRECTI
  add(data, 'DIRECTI', { difficulty: 'MEDIUM', title: 'Minimum Cost to Buy Apples', link: 'https://leetcode.com/problems/minimum-cost-to-buy-apples', topics: 'Array, Graph, Heap (Priority Queue), Shortest Path' })
  add(data, 'DIRECTI', { difficulty: 'HARD', title: 'Maximum XOR of Two Non-Overlapping Subtrees', link: 'https://leetcode.com/problems/maximum-xor-of-two-non-overlapping-subtrees', topics: 'Tree, Depth-First Search, Graph, Trie' })
  add(data, 'DIRECTI', { difficulty: 'HARD', title: 'Difference Between Maximum and Minimum Price Sum', link: 'https://leetcode.com/problems/difference-between-maximum-and-minimum-price-sum', topics: 'Array, Dynamic Programming, Tree, Depth-First Search' })
  add(data, 'DIRECTI', { difficulty: 'MEDIUM', title: 'Number of Sub-arrays With Odd Sum', link: 'https://leetcode.com/problems/number-of-sub-arrays-with-odd-sum', topics: 'Array, Math, Dynamic Programming, Prefix Sum' })
  add(data, 'DIRECTI', { difficulty: 'MEDIUM', title: 'Find the Winner of an Array Game', link: 'https://leetcode.com/problems/find-the-winner-of-an-array-game', topics: 'Array, Simulation' })
  add(data, 'DIRECTI', { difficulty: 'HARD', title: 'Find Longest Awesome Substring', link: 'https://leetcode.com/problems/find-longest-awesome-substring', topics: 'Hash Table, String, Bit Manipulation' })
  add(data, 'DIRECTI', { difficulty: 'MEDIUM', title: 'Min Cost to Connect All Points', link: 'https://leetcode.com/problems/min-cost-to-connect-all-points', topics: 'Array, Union Find, Graph, Minimum Spanning Tree' })
  add(data, 'DIRECTI', { difficulty: 'MEDIUM', title: 'Largest Submatrix With Rearrangements', link: 'https://leetcode.com/problems/largest-submatrix-with-rearrangements', topics: 'Array, Greedy, Sorting, Matrix' })
  add(data, 'DIRECTI', { difficulty: 'HARD', title: 'Binary Tree Maximum Path Sum', link: 'https://leetcode.com/problems/binary-tree-maximum-path-sum', topics: 'Dynamic Programming, Tree, Depth-First Search, Binary Tree' })

  // JANE STREET (subset for brevity)
  add(data, 'JANE STREET', { difficulty: 'EASY', title: 'Count Common Words With One Occurrence', link: 'https://leetcode.com/problems/count-common-words-with-one-occurrence', topics: 'Array, Hash Table, String, Counting' })
  add(data, 'JANE STREET', { difficulty: 'MEDIUM', title: 'Walking Robot Simulation', link: 'https://leetcode.com/problems/walking-robot-simulation', topics: 'Array, Hash Table, Simulation' })
  add(data, 'JANE STREET', { difficulty: 'HARD', title: 'Minimum Time to Make Array Sum At Most x', link: 'https://leetcode.com/problems/minimum-time-to-make-array-sum-at-most-x', topics: 'Array, Dynamic Programming, Sorting' })
  add(data, 'JANE STREET', { difficulty: 'HARD', title: 'Trapping Rain Water', link: 'https://leetcode.com/problems/trapping-rain-water', topics: 'Array, Two Pointers, Dynamic Programming, Stack, Monotonic Stack' })

  // GRAVITON (subset)
  add(data, 'GRAVITON', { difficulty: 'MEDIUM', title: 'Keys and Rooms', link: 'https://leetcode.com/problems/keys-and-rooms', topics: 'Depth-First Search, Breadth-First Search, Graph' })
  add(data, 'GRAVITON', { difficulty: 'MEDIUM', title: 'Course Schedule', link: 'https://leetcode.com/problems/course-schedule', topics: 'Depth-First Search, Breadth-First Search, Graph, Topological Sort' })

  // RUBRIK (subset)
  add(data, 'RUBRIK', { difficulty: 'MEDIUM', title: 'LRU Cache', link: 'https://leetcode.com/problems/lru-cache', topics: 'Hash Table, Linked List, Design, Doubly-Linked List' })
  add(data, 'RUBRIK', { difficulty: 'HARD', title: 'Scramble String', link: 'https://leetcode.com/problems/scramble-string', topics: 'String, Dynamic Programming' })

  // JP MORGAN (subset)
  add(data, 'JP MORGAN', { difficulty: 'EASY', title: 'Two Sum', link: 'https://leetcode.com/problems/two-sum', topics: 'Array, Hash Table' })
  add(data, 'JP MORGAN', { difficulty: 'MEDIUM', title: 'Group Anagrams', link: 'https://leetcode.com/problems/group-anagrams', topics: 'Array, Hash Table, String, Sorting' })
  add(data, 'JP MORGAN', { difficulty: 'MEDIUM', title: 'LRU Cache', link: 'https://leetcode.com/problems/lru-cache', topics: 'Hash Table, Linked List, Design, Doubly-Linked List' })

  // Stripe (subset)
  add(data, 'Stripe', { difficulty: 'MEDIUM', title: 'Minimum Penalty for a Shop', link: 'https://leetcode.com/problems/minimum-penalty-for-a-shop', topics: 'String, Prefix Sum' })
  add(data, 'Stripe', { difficulty: 'MEDIUM', title: 'Evaluate Division', link: 'https://leetcode.com/problems/evaluate-division', topics: 'Array, String, DFS, BFS, Union Find, Graph, Shortest Path' })

  // SPRINKLER (subset)
  add(data, 'SPRINKLER', { difficulty: 'HARD', title: 'Minimum Edge Weight Equilibrium Queries in a Tree', link: 'https://leetcode.com/problems/minimum-edge-weight-equilibrium-queries-in-a-tree', topics: 'Array, Tree, Graph, SCC' })
  add(data, 'SPRINKLER', { difficulty: 'MEDIUM', title: 'Asteroid Collision', link: 'https://leetcode.com/problems/asteroid-collision', topics: 'Array, Stack, Simulation' })

  // MEDIA.NET (subset)
  add(data, 'MEDIA.NET', { difficulty: 'HARD', title: 'Minimum Operations to Form Subsequence With Target Sum', link: 'https://leetcode.com/problems/minimum-operations-to-form-subsequence-with-target-sum', topics: 'Array, Greedy, Bit Manipulation' })
  add(data, 'MEDIA.NET', { difficulty: 'MEDIUM', title: 'Furthest Building You Can Reach', link: 'https://leetcode.com/problems/furthest-building-you-can-reach', topics: 'Array, Greedy, Heap' })

  // META (subset)
  add(data, 'META', { difficulty: 'EASY', title: 'Merge Sorted Array', link: 'https://leetcode.com/problems/merge-sorted-array', topics: 'Array, Two Pointers, Sorting' })
  add(data, 'META', { difficulty: 'HARD', title: 'Minimum Window Substring', link: 'https://leetcode.com/problems/minimum-window-substring', topics: 'Hash Table, String, Sliding Window' })

  // GOOGLE (subset)
  add(data, 'GOOGLE', { difficulty: 'EASY', title: 'Two Sum', link: 'https://leetcode.com/problems/two-sum', topics: 'Array, Hash Table' })
  add(data, 'GOOGLE', { difficulty: 'HARD', title: 'Maximal Rectangle', link: 'https://leetcode.com/problems/maximal-rectangle', topics: 'Array, DP, Stack, Matrix, Monotonic Stack' })

  // GOLDMAN SACHS (subset)
  add(data, 'GOLDMAN SACHS', { difficulty: 'HARD', title: 'Trapping Rain Water', link: 'https://leetcode.com/problems/trapping-rain-water', topics: 'Array, Two Pointers, DP, Stack' })
  add(data, 'GOLDMAN SACHS', { difficulty: 'MEDIUM', title: 'Product of Array Except Self', link: 'https://leetcode.com/problems/product-of-array-except-self', topics: 'Array, Prefix Sum' })

  // wells fargo (subset)
  add(data, 'wells fargo', { difficulty: 'MEDIUM', title: 'Shortest and Lexicographically Smallest Beautiful String', link: 'https://leetcode.com/problems/shortest-and-lexicographically-smallest-beautiful-string', topics: 'String, Sliding Window' })
  add(data, 'wells fargo', { difficulty: 'MEDIUM', title: 'Spiral Matrix', link: 'https://leetcode.com/problems/spiral-matrix', topics: 'Array, Matrix, Simulation' })

  // VISA (subset)
  add(data, 'VISA', { difficulty: 'HARD', title: 'Length of Longest V-Shaped Diagonal Segment', link: 'https://leetcode.com/problems/length-of-longest-v-shaped-diagonal-segment', topics: 'Array, DP, Memoization, Matrix' })
  add(data, 'VISA', { difficulty: 'MEDIUM', title: 'LRU Cache', link: 'https://leetcode.com/problems/lru-cache', topics: 'Hash Table, Linked List, Design, Doubly-Linked List' })

  // Convert to plain object
  return Object.fromEntries(Array.from(data.entries()))
}
