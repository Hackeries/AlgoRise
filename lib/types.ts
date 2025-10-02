// Visualizer types
export type Visualizer = {
  slug: string
  title: string
  summary: string
  tags: string[]
  resources: { label: string; href: string }[]
}

// Learning Path types
export type LearningPathSection = {
  id: string
  title: string
  description: string
  subsections: LearningPathSubSection[]
  totalProblems: number
  estimatedTime: string
  icon: string
}

export type LearningPathSubSection = {
  id: string
  title: string
  description: string
  problems: Problem[]
  estimatedTime: string
}

// User Profile types
export type UserProfile = {
  id: string
  username: string
  avatarUrl?: string
  bio?: string
  solvedProblems: string[]
  streak: number
  joinedAt: string // ISO date
}

// Contest Metadata types
export type Contest = {
  id: string
  name: string
  platform: string
  startTime: string // ISO date
  durationMinutes: number
  problems: Problem[]
  participants: number
}
export type Problem = {
  id: string
  platform: "codeforces" | "cses" | "atcoder" | "gfg" | "usaco"
  problemId: string
  rating: number
  tags: string[]
  title: string
  url: string
  description?: string // Short summary for UI
  color?: string // Hex or theme color for UI
  icon?: string // Emoji or icon name for UI
}

export type Outcome = "solved" | "failed" | "skipped"

export type SheetItem = {
  id: string
  problem: Problem
  repetitions: number
  ease: number
  intervalDays: number
  nextDueAt: string // ISO date
  lastOutcome?: Outcome
}

export type WeakTagStats = Record<string, { attempts: number; fails: number }>

export type AdaptiveSheetResponse = {
  baseRating: number
  groups: {
    dueNow: SheetItem[]
    dueSoon: SheetItem[]
    later: SheetItem[]
  }
  stats: {
    solvedRate: number
    streak: number
    lastInteractionAt?: string
    weakTags: WeakTagStats
  }
}
