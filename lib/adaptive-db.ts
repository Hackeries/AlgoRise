import type { SupabaseClient } from "@supabase/supabase-js"

export type DbItem = {
  problem_id: string
  rating: number
  tags: string[]
  repetitions: number
  ease: number
  interval_days: number
  next_due_at: string
  last_outcome: "solved" | "failed" | "skipped" | null
  problem_title: string | null
  problem_url: string | null
}

export type Limits = { now?: number; soon?: number; later?: number }
const DEFAULT_LIMITS: Required<Limits> = { now: 8, soon: 8, later: 8 }

function toSheetItem(r: DbItem) {
  return {
    id: r.problem_id,
    problem: {
      id: r.problem_id,
      title: r.problem_title ?? r.problem_id,
      url: r.problem_url ?? undefined,
      rating: r.rating,
      tags: r.tags ?? [],
    },
    repetitions: r.repetitions ?? 0,
    ease: Number(r.ease ?? 2.5),
    intervalDays: r.interval_days ?? 0,
    nextDueAt: r.next_due_at,
    lastOutcome: r.last_outcome ?? undefined,
  }
}

export async function fetchAdaptiveSheetDb(
  supabase: SupabaseClient,
  userId: string,
  baseRating: number,
  tags: string[],
  limits?: Limits,
) {
  const lim = { ...DEFAULT_LIMITS, ...(limits || {}) }
  const nowIso = new Date().toISOString()
  const soonIso = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
  const ratingMin = baseRating - 200
  const ratingMax = baseRating + 200

  const base = supabase
    .from("adaptive_items")
    .select("problem_id,rating,tags,repetitions,ease,interval_days,next_due_at,last_outcome,problem_title,problem_url")
    .eq("user_id", userId)
    .gte("rating", ratingMin)
    .lte("rating", ratingMax)

  // due now
  let qNow = base.clone().lte("next_due_at", nowIso).order("next_due_at", { ascending: true }).limit(lim.now)
  if (tags.length) qNow = qNow.overlaps("tags", tags)
  const nowRes = await qNow

  // due soon (within 2 days, but after now)
  let qSoon = base
    .clone()
    .gt("next_due_at", nowIso)
    .lte("next_due_at", soonIso)
    .order("next_due_at", { ascending: true })
    .limit(lim.soon)
  if (tags.length) qSoon = qSoon.overlaps("tags", tags)
  const soonRes = await qSoon

  // later (>2 days)
  let qLater = base.clone().gt("next_due_at", soonIso).order("next_due_at", { ascending: true }).limit(lim.later)
  if (tags.length) qLater = qLater.overlaps("tags", tags)
  const laterRes = await qLater

  if (nowRes.error || soonRes.error || laterRes.error) {
    throw nowRes.error || soonRes.error || laterRes.error
  }

  return {
    groups: {
      dueNow: (nowRes.data || []).map(toSheetItem),
      dueSoon: (soonRes.data || []).map(toSheetItem),
      later: (laterRes.data || []).map(toSheetItem),
    },
  }
}

export async function updateOutcomeDb(
  supabase: SupabaseClient,
  userId: string,
  problemId: string,
  updater: (row: DbItem) => DbItem,
) {
  const sel = await supabase
    .from("adaptive_items")
    .select("problem_id,rating,tags,repetitions,ease,interval_days,next_due_at,last_outcome,problem_title,problem_url")
    .eq("user_id", userId)
    .eq("problem_id", problemId)
    .single()

  if (sel.error) return { error: sel.error }

  const nextRow = updater(sel.data as DbItem)
  const { error } = await supabase
    .from("adaptive_items")
    .update({
      repetitions: nextRow.repetitions,
      ease: nextRow.ease,
      interval_days: nextRow.interval_days,
      next_due_at: nextRow.next_due_at,
      last_outcome: nextRow.last_outcome,
    })
    .eq("user_id", userId)
    .eq("problem_id", problemId)

  if (error) return { error }
  return { ok: true, nextDueAt: nextRow.next_due_at }
}

export async function snoozeDb(supabase: SupabaseClient, userId: string, problemId: string, minutes: number) {
  const sel = await supabase
    .from("adaptive_items")
    .select("next_due_at")
    .eq("user_id", userId)
    .eq("problem_id", problemId)
    .single()
  if (sel.error) return { error: sel.error }

  const current = new Date(sel.data.next_due_at).getTime()
  const next = new Date(Math.max(Date.now(), current) + minutes * 60 * 1000).toISOString()

  const { error } = await supabase
    .from("adaptive_items")
    .update({ next_due_at: next, last_outcome: "skipped" })
    .eq("user_id", userId)
    .eq("problem_id", problemId)

  if (error) return { error }
  return { ok: true, nextDueAt: next }
}
