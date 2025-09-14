export type Problem = {
  id: string
  platform: "codeforces"
  problemId: string
  rating: number
  tags: string[]
  title: string
  url: string
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
