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
