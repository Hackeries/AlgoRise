import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cfGetUserRating } from "@/lib/codeforces-api"

type CFRatingEntry = {
  contestId: number
  contestName: string
  handle: string
  rank: number
  ratingUpdateTimeSeconds: number
  oldRating: number
  newRating: number
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()

  // Who is the current user?
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  // Find a linked handle (you might already store this elsewhere)
  // For now, try cf_snapshots first to get handle; otherwise return 204
  const { data: existing } = await supabase
    .from("cf_snapshots")
    .select("handle,last_rating,last_contest,rating_delta,fetched_at")
    .eq("user_id", user.id)
    .maybeSingle()

  const handle = existing?.handle
  if (!handle) {
    // No handle linked yet
    return Response.json({ ratingDelta: 0, lastContest: null, lastRating: null, handle: null })
  }

  // Always try to refresh once a day
  const lastFetched = existing?.fetched_at ? new Date(existing.fetched_at) : undefined
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const shouldRefresh = !lastFetched || lastFetched < oneDayAgo

  let ratingDelta = existing?.rating_delta ?? 0
  let lastContest = existing?.last_contest ?? null
  let lastRating = existing?.last_rating ?? null

  if (shouldRefresh) {
    try {
      const response = await cfGetUserRating(handle)
      
      if (response.status === "OK" && 'result' in response && response.result) {
        const rows: CFRatingEntry[] = response.result
        if (rows.length > 0) {
          const last = rows[rows.length - 1]
          ratingDelta = last.newRating - last.oldRating
          lastContest = last.contestName
          lastRating = last.newRating

          await supabase.from("cf_snapshots").upsert({
            user_id: user.id,
            handle,
            last_rating: lastRating,
            last_contest: lastContest,
            rating_delta: ratingDelta,
            fetched_at: new Date().toISOString(),
          })
        }
      }
    } catch (e) {
      // swallow but return existing
    }
  }

  return Response.json({
    ratingDelta,
    lastContest,
    lastRating,
    handle,
  })
}
