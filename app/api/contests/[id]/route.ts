import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const contestId = params.id
  const body = await req.json().catch(() => ({}))
  const problem_id = (body?.problemId as string | undefined)?.trim()
  const status = body?.status as "solved" | "failed" | undefined
  const penalty_s = Number(body?.penalty ?? 0)

  if (!problem_id || !status) return NextResponse.json({ error: "problemId and status required" }, { status: 400 })

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { error } = await supabase.from("contest_submissions").insert({
    contest_id: contestId,
    user_id: user.id,
    problem_id,
    status,
    penalty_s: isFinite(penalty_s) ? penalty_s : 0,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const contestId = params.id

  const supabase = createClient()

  const { data: rawContest, error } = await supabase.from("contests").select("*").eq("id", contestId).single()

  if (error || !rawContest) {
    return NextResponse.json({ error: "Contest not found" }, { status: 404 })
  }

  // Fetch contest problems to populate contest window
  const { data: problemRows } = await supabase
    .from("contest_problems")
    .select("problem_id, title, contest_id_cf, index_cf, rating")
    .eq("contest_id", contestId)

  // Compute status + timeRemaining
  const now = Date.now()
  const startsAt = rawContest.starts_at ? new Date(rawContest.starts_at).getTime() : null
  const endsAt = rawContest.ends_at ? new Date(rawContest.ends_at).getTime() : null

  let status: "upcoming" | "live" | "ended" = "upcoming"
  if (startsAt && endsAt) {
    if (now >= endsAt) status = "ended"
    else if (now >= startsAt) status = "live"
    else status = "upcoming"
  }

  // For the participation UI:
  // - start_time is expected in the client (mapped from starts_at)
  // - timeRemaining should be ms until end if live; otherwise until start
  const timeRemaining = status === "live" ? Math.max(0, (endsAt ?? now) - now) : Math.max(0, (startsAt ?? now) - now)

  const problems = (problemRows || []).map((p) => ({
    id: p.problem_id, // unique id per problem row
    contestId: p.contest_id_cf ?? 0,
    index: p.index_cf ?? "",
    name: p.title ?? p.problem_id,
    rating: p.rating ?? 0,
  }))

  // Return the shape the clients expect
  return NextResponse.json({
    contest: {
      id: rawContest.id,
      name: rawContest.name,
      description: rawContest.description ?? "",
      start_time: rawContest.starts_at ?? null,
      duration_minutes: rawContest.duration_minutes ?? 0,
      problems,
      status,
      timeRemaining,
      max_participants: rawContest.max_participants ?? null,
      // Keep raw fields for other pages if needed
      starts_at: rawContest.starts_at,
      ends_at: rawContest.ends_at,
      contest_mode: rawContest.contest_mode,
      rating_min: rawContest.rating_min,
      rating_max: rawContest.rating_max,
      visibility: rawContest.visibility,
      host_user_id: rawContest.host_user_id,
      allow_late_join: rawContest.allow_late_join ?? true,
    },
  })
}
