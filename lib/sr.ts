import type { SheetItem, Outcome } from "@/lib/types"

const DAY_MS = 24 * 60 * 60 * 1000

export function nowTs() {
  return Date.now()
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function computeNext(item: SheetItem, outcome: Outcome): SheetItem {
  const quality = outcome === "solved" ? 4 : outcome === "failed" ? 2 : 3
  const next = { ...item }
  // ease factor update (bounded)
  next.ease = clamp(item.ease + 0.1 - (5 - quality) * 0.08, 1.3, 2.8)

  if (outcome === "solved") {
    next.repetitions = item.repetitions + 1
    if (next.repetitions <= 1) {
      next.intervalDays = 1
    } else if (next.repetitions === 2) {
      next.intervalDays = 2
    } else {
      next.intervalDays = Math.round(item.intervalDays * next.ease)
    }
  } else if (outcome === "failed") {
    // reset with short review
    next.repetitions = 0
    next.intervalDays = 1
  } else {
    // skipped → tiny bump but keep it soon
    next.repetitions = item.repetitions
    next.intervalDays = Math.max(1, Math.floor(item.intervalDays * 0.5) || 1)
  }

  next.nextDueAt = new Date(nowTs() + next.intervalDays * DAY_MS).toISOString()
  next.lastOutcome = outcome
  return next
}

export function groupByUrgency(items: SheetItem[]) {
  const now = nowTs()
  const soonThreshold = now + 2 * DAY_MS
  const dueNow: SheetItem[] = []
  const dueSoon: SheetItem[] = []
  const later: SheetItem[] = []
  for (const it of items) {
    const due = new Date(it.nextDueAt).getTime()
    if (due <= now) dueNow.push(it)
    else if (due <= soonThreshold) dueSoon.push(it)
    else later.push(it)
  }
  return { dueNow, dueSoon, later }
}
