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
