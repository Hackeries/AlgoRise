import type { AdaptiveSheetResponse, Outcome, Problem, SheetItem, WeakTagStats } from "@/lib/types"
import { computeNext, groupByUrgency, nowTs } from "./sr"

// Sample problems
const PROBLEMS: Problem[] = [
  {
    id: "p1",
    platform: "codeforces",
    problemId: "A-1234",
    rating: 1400,
    tags: ["greedy"],
    title: "Choosing Teams",
    url: "https://codeforces.com/problemset/problem/1234/A",
  },
  {
    id: "p2",
    platform: "codeforces",
    problemId: "B-1772",
    rating: 1500,
    tags: ["math"],
    title: "Prime Harmony",
    url: "https://codeforces.com/problemset/problem/1772/B",
  },
  {
    id: "p3",
    platform: "codeforces",
    problemId: "C-1700",
    rating: 1600,
    tags: ["dp"],
    title: "Array DP Basics",
    url: "https://codeforces.com/problemset/problem/1700/C",
  },
  {
    id: "p4",
    platform: "codeforces",
    problemId: "D-1695",
    rating: 1700,
    tags: ["graphs", "dfs"],
    title: "Graph Explorers",
    url: "https://codeforces.com/problemset/problem/1695/D",
  },
  {
    id: "p5",
    platform: "codeforces",
    problemId: "E-1710",
    rating: 1800,
    tags: ["trees", "dfs"],
    title: "Tree Queries",
    url: "https://codeforces.com/problemset/problem/1710/E",
  },
  {
    id: "p6",
    platform: "codeforces",
    problemId: "F-1730",
    rating: 1900,
    tags: ["dp", "bitmask"],
    title: "Bitmask Training",
    url: "https://codeforces.com/problemset/problem/1730/F",
  },
  {
    id: "p7",
    platform: "codeforces",
    problemId: "G-1650",
    rating: 2000,
    tags: ["graphs", "shortest-paths"],
    title: "Roads and Races",
    url: "https://codeforces.com/problemset/problem/1650/G",
  },
  {
    id: "p8",
    platform: "codeforces",
    problemId: "H-1600",
    rating: 1550,
    tags: ["two-pointers"],
    title: "Segments Merge",
    url: "https://codeforces.com/problemset/problem/1600/H",
  },
  {
    id: "p9",
    platform: "codeforces",
    problemId: "I-1500",
    rating: 1650,
    tags: ["binary-search"],
    title: "Find the Threshold",
    url: "https://codeforces.com/problemset/problem/1500/I",
  },
  {
    id: "p10",
    platform: "codeforces",
    problemId: "J-1800",
    rating: 1750,
    tags: ["greedy", "sorting"],
    title: "Minimal Swaps",
    url: "https://codeforces.com/problemset/problem/1800/J",
  },
]

// in-memory state per user
type UserState = {
  items: Map<string, SheetItem> // key: problemId
  attempts: Record<string, number>
  fails: Record<string, number>
  solved: number
  total: number
  streak: number
  lastInteractionAt?: string
}

const USERS = new Map<string, UserState>()

function getOrInitUser(userId: string): UserState {
  let s = USERS.get(userId)
  if (!s) {
    s = {
      items: new Map<string, SheetItem>(),
      attempts: {},
      fails: {},
      solved: 0,
      total: 0,
      streak: 0,
      lastInteractionAt: undefined,
    }
    USERS.set(userId, s)
  }
  return s
}

function ensureItem(state: UserState, p: Problem): SheetItem {
  const have = state.items.get(p.id)
  if (have) return have
  const base: SheetItem = {
    id: p.id,
    problem: p,
    repetitions: 0,
    ease: 2.5,
    intervalDays: 0,
    nextDueAt: new Date(nowTs()).toISOString(),
  }
  state.items.set(p.id, base)
  state.total = state.items.size
  return base
}

export function getAdaptiveSheet(userId: string, baseRating = 1700, tags: string[] = []): AdaptiveSheetResponse {
  const state = getOrInitUser(userId)
  // build candidate set within rating ±200 and tag filter (if any)
  const minR = baseRating - 200
  const maxR = baseRating + 200
  const candidates = PROBLEMS.filter(
    (p) => p.rating >= minR && p.rating <= maxR && (tags.length === 0 || tags.some((t) => p.tags.includes(t))),
  )
  const items = candidates.map((p) => ensureItem(state, p))

  // compute stats
  const weakTags: WeakTagStats = {}
  for (const p of candidates) {
    const attempts = state.attempts[p.id] || 0
    const fails = state.fails[p.id] || 0
    for (const t of p.tags) {
      weakTags[t] = weakTags[t] || { attempts: 0, fails: 0 }
      weakTags[t].attempts += attempts
      weakTags[t].fails += fails
    }
  }
  const solvedRate = state.total ? state.solved / state.total : 0

  const groups = groupByUrgency(items)

  return {
    baseRating,
    groups,
    stats: {
      solvedRate,
      streak: state.streak,
      lastInteractionAt: state.lastInteractionAt,
      weakTags,
    },
  }
}

export function updateOutcome(userId: string, problemId: string, outcome: Outcome): AdaptiveSheetResponse {
  const state = getOrInitUser(userId)
  const item = state.items.get(problemId)
  if (!item) {
    // ensure item exists by searching problem list
    const p = PROBLEMS.find((pp) => pp.id === problemId)
    if (!p) return getAdaptiveSheet(userId)
    state.items.set(problemId, {
      id: p.id,
      problem: p,
      repetitions: 0,
      ease: 2.5,
      intervalDays: 0,
      nextDueAt: new Date(nowTs()).toISOString(),
    })
  }
  const current = state.items.get(problemId)!
  const next = computeNext(current, outcome)
  state.items.set(problemId, next)

  // stats
  state.attempts[problemId] = (state.attempts[problemId] || 0) + 1
  if (outcome === "failed" || outcome === "skipped") {
    state.fails[problemId] = (state.fails[problemId] || 0) + 1
    state.streak = 0 // break streak on fail/skip
  } else {
    state.solved += 1
    state.streak += 1
  }
  state.lastInteractionAt = new Date(nowTs()).toISOString()

  return getAdaptiveSheet(userId)
}

export function snooze(userId: string, problemId: string, minutes: number): AdaptiveSheetResponse {
  const state = getOrInitUser(userId)
  const item = state.items.get(problemId)
  if (!item) return getAdaptiveSheet(userId)
  const nextDue = new Date(Math.max(nowTs(), new Date(item.nextDueAt).getTime()) + minutes * 60 * 1000)
  state.items.set(problemId, { ...item, nextDueAt: nextDue.toISOString(), lastOutcome: "skipped" })
  state.lastInteractionAt = new Date(nowTs()).toISOString()
  // treat snooze as neutral for streak
  return getAdaptiveSheet(userId)
}
