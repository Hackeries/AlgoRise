"use client"

import { useEffect, useState } from "react"
import {
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Zap,
  BookOpen,
  Code2,
  Award,
  Clock,
  ChevronRight,
  Star,
  Calendar,
  Activity,
  Bookmark,
  Sparkles,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ActivityHeatmap } from "@/components/train/activity-heatmap"
import { cn } from "@/lib/utils"
import { CFDashboard } from "@/components/dashboard/cf-dashboard"
import { WelcomeBanner } from "@/components/train/welcome-banner"
import { QuickActions } from "@/components/train/quick-actions"
import { RecentActivity } from "@/components/train/recent-activity"
import { UpcomingContests } from "@/components/train/upcoming-contests"
import { ProblemRecommendations } from "@/components/train/problem-recommendations"
import { motion } from "framer-motion"
import { useCFVerification } from "@/lib/context/cf-verification"
import { useAuth } from "@/lib/auth/context"

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
  const { user } = useAuth()
  const { isVerified, verificationData } = useCFVerification()
  const [showWelcome, setShowWelcome] = useState(false)
  const [bookmarkedProblems, setBookmarkedProblems] = useState<Set<number>>(new Set())

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
    // Check if this is a first-time visit after profile completion
    const isNewUser = sessionStorage.getItem("profile_just_completed")
    if (isNewUser) {
      setShowWelcome(true)
      sessionStorage.removeItem("profile_just_completed")
      // Auto-hide welcome banner after 10 seconds
      setTimeout(() => setShowWelcome(false), 10000)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-neutral-900 to-gray-950 text-white">
      {/* Hero Section */}
      <div className="border-b border-gray-800 bg-gradient-to-r from-gray-900/95 via-neutral-900/95 to-gray-900/95 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{"Welcome back to your Training Hub\n"}</h1>
              <p className="text-sm text-muted-foreground mt-1">{"Build rating, keep your streak, and climb the CP ladder."}</p>
            </div>

            {/* Key Metrics */}
            <div className="flex gap-3 flex-wrap items-center">
              <div className="bg-muted/40 border border-border/80 rounded-lg px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                <Flame className="h-5 w-5 text-muted-foreground drop-shadow-sm" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Streak</div>
                  <div className="font-bold text-foreground text-lg">{progressData.streak} days</div>
                </div>
              </div>

              <div className="bg-muted/40 border border-border/80 rounded-lg px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                <Target className="h-5 w-5 text-muted-foreground drop-shadow-sm" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Daily Goal</div>
                  <div className="font-bold text-foreground text-lg">
                    {progressData.completedToday}/{progressData.dailyGoal}
                  </div>
                </div>
              </div>

              <div className="bg-muted/40 border border-border/80 rounded-lg px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                <Trophy className="h-5 w-5 text-muted-foreground drop-shadow-sm" />
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Solved</div>
                  <div className="font-bold text-foreground text-lg">{progressData.totalSolved}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Primary Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 bg-gray-900/50 border-gray-800 shadow-xl backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="text-white">Quick Actions</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-gray-800/30 border-gray-700 hover:bg-gray-800/60 hover:border-blue-500/50 transition-all"
                >
                  <Code2 className="h-6 w-6 text-blue-400" />
                  <div className="text-center">
                    <div className="font-semibold text-sm text-white">Random Problem</div>
                    <div className="text-xs text-gray-400">Challenge yourself</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-gray-800/30 border-gray-700 hover:bg-gray-800/60 hover:border-blue-500/50 transition-all"
                >
                  <BookOpen className="h-6 w-6 text-purple-400" />
                  <div className="text-center">
                    <div className="font-semibold text-sm text-white">Study Plan</div>
                    <div className="text-xs text-gray-400">Structured learning</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 bg-gray-800/30 border-gray-700 hover:bg-gray-800/60 hover:border-blue-500/50 transition-all"
                >
                  <Award className="h-6 w-6 text-pink-400" />
                  <div className="text-center">
                    <div className="font-semibold text-sm text-white">Contests</div>
                    <div className="text-xs text-gray-400">Compete live</div>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Problem Recommendations */}
            <Card className="p-6 bg-gray-900/50 border-gray-800 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <span className="text-white">Recommended for You</span>
                </h2>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="space-y-3">
                {recommendedProblems.map((problem) => (
                  <Card
                    key={problem.id}
                    className="p-4 bg-gray-800/50 border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/70 transition-all shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-white truncate">{problem.title}</h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-medium",
                              difficultyColors[problem.difficulty as keyof typeof difficultyColors],
                            )}
                          >
                            {problem.difficulty}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-2">
                          {problem.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs bg-secondary/80">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3 text-gray-400" />
                            {problem.acceptance}% acceptance
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleBookmark(problem.id)}
                          className="p-2 rounded-lg hover:bg-accent/60 transition-colors"
                        >
                          <Bookmark
                            className={cn(
                              "h-5 w-5 transition-colors",
                              bookmarkedProblems.has(problem.id)
                                ? "text-primary fill-primary"
                                : "text-muted-foreground",
                            )}
                          />
                        </button>

                        <Button size="sm" variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                          Solve
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
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
            <Card className="p-6 bg-gray-900/50 border-gray-800 shadow-xl backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-pink-400" />
                <span className="text-white">Upcoming Contests</span>
              </h2>

              <div className="space-y-3">
                {upcomingContests.map((contest) => (
                  <Card key={contest.id} className="p-4 bg-gray-800/50 border-gray-700 shadow-lg">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-sm text-white">{contest.name}</h3>
                      {contest.registered && (
                        <Badge variant="secondary" className="text-xs bg-secondary/80">
                          Registered
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mb-3 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {contest.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {contest.time}
                      </div>
                    </div>
                    <Button size="sm" variant={contest.registered ? "outline" : "default"} className="w-full">
                      {contest.registered ? "View Details" : "Register Now"}
                    </Button>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
