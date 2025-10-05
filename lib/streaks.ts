import { createClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"

function toDateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

type StreakRow = {
  user_id: string
  current_streak: number
  longest_streak: number
  last_active_day: string | null
  updated_at: string
}

/**
 * RLS-safe read of the current user's streak row.
 * Expects a Supabase client with an authenticated session.
 */
export async function getStreak(supabase: SupabaseClient, userId: string): Promise<StreakRow | null> {
  const { data, error } = await supabase.from("streaks").select("*").eq("user_id", userId).maybeSingle()

  if (error) {
    return null
  }
  return (data as unknown as StreakRow) ?? null
}

/**
 * Apply a meaningful action for streak counting (solve or learn completion).
 * - If already counted today: no-op, just returns current row.
 * - If yesterday was last_active_day: increment current_streak.
 * - Else: reset to 1.
 * Updates longest_streak accordingly and persists via upsert.
 */
export async function applyMeaningfulAction(
  supabase: SupabaseClient,
  userId: string,
  now: Date = new Date(),
): Promise<StreakRow> {
  const today = toDateOnly(now)
  const todayISO = today.toISOString().slice(0, 10)

  // Read existing
  const { data: existing, error: selErr } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (selErr) {
    // Error selecting existing streak
  }

  let current_streak = 1
  let longest_streak = 1
  let last_active_day = todayISO

  if (existing) {
    const last = existing.last_active_day ? new Date(existing.last_active_day) : undefined
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const sameDay =
      last &&
      last.getFullYear() === today.getFullYear() &&
      last.getMonth() === today.getMonth() &&
      last.getDate() === today.getDate()

    const consecutive =
      last &&
      last.getFullYear() === yesterday.getFullYear() &&
      last.getMonth() === yesterday.getMonth() &&
      last.getDate() === yesterday.getDate()

    if (sameDay) {
      // Already counted today — keep values and last_active_day unchanged
      current_streak = existing.current_streak ?? 1
      longest_streak = Math.max(existing.longest_streak ?? 0, current_streak)
      last_active_day = existing.last_active_day ?? todayISO
    } else if (consecutive) {
      current_streak = (existing.current_streak ?? 0) + 1
      longest_streak = Math.max(existing.longest_streak ?? 0, current_streak)
      last_active_day = todayISO
    } else {
      // Gap — reset to 1
      current_streak = 1
      longest_streak = Math.max(existing.longest_streak ?? 0, current_streak)
      last_active_day = todayISO
    }
  }

  const upsertPayload = {
    user_id: userId,
    current_streak,
    longest_streak,
    last_active_day,
    updated_at: new Date().toISOString(),
  }

  const { error: upErr, data } = await supabase.from("streaks").upsert(upsertPayload).select().maybeSingle()
  if (upErr) {
    // Return our computed payload even if select failed; RLS may hide row until session settles
    return upsertPayload as unknown as StreakRow
  }

  return (data as unknown as StreakRow) ?? (upsertPayload as unknown as StreakRow)
}

// Keep backward-compatible helper; now wraps applyMeaningfulAction
export async function updateStreakForUser(userId: string) {
  const supabase = await createClient()
  const row = await applyMeaningfulAction(supabase as unknown as SupabaseClient, userId, new Date())
  return { streak: { ...row } }
}
