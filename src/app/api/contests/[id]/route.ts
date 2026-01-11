import { NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contestId = id
  const body = await req.json().catch(() => ({}))
  const problem_id = (body?.problemId as string | undefined)?.trim()
  const status = body?.status as "solved" | "failed" | undefined
  const penalty_s = Number(body?.penalty ?? 0)

  if (!problem_id || !status) return NextResponse.json({ error: "problemId and status required" }, { status: 400 })

  // ✅ FIX: Await the Supabase client creation
  const supabase = await createClient()

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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contestId = id

  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Always try service role client first for fetching contest (bypasses RLS issues)
  // This ensures contests are always accessible regardless of auth state
  const serviceClient = await createServiceRoleClient()
  
  let rawContest: any = null
  let error: any = null

  if (serviceClient) {
    const { data: serviceContest, error: serviceError } = await serviceClient
      .from("contests")
      .select("*")
      .eq("id", contestId)
      .single()

    if (!serviceError && serviceContest) {
      rawContest = serviceContest
    } else {
      error = serviceError
    }
  }

  // Fallback to regular client if service role not available
  if (!rawContest && !serviceClient) {
    const result = await supabase.from("contests").select("*").eq("id", contestId).single()
    rawContest = result.data
    error = result.error
  }

  if (error || !rawContest) {
    return NextResponse.json({ error: "Contest not found" }, { status: 404 })
  }

  // For unauthenticated users, only allow public contests
  if (!user && rawContest.visibility !== "public") {
    return NextResponse.json({ error: "Contest not found" }, { status: 404 })
  }

  // Use service role client for fetching problems if user is not authenticated
  const queryClient = user ? supabase : (await createServiceRoleClient()) || supabase

  const { data: problemRows } = await queryClient
    .from("contest_problems")
    .select("problem_id, title, contest_id_cf, index_cf, rating")
    .eq("contest_id", contestId)

  const now = Date.now()
  const startsAt = rawContest.starts_at ? new Date(rawContest.starts_at).getTime() : null
  const endsAt = rawContest.ends_at ? new Date(rawContest.ends_at).getTime() : null

  let status: "upcoming" | "live" | "ended" = "upcoming"
  if (startsAt && endsAt) {
    if (now >= endsAt) status = "ended"
    else if (now >= startsAt) status = "live"
  }

  const timeRemaining = status === "live" ? Math.max(0, (endsAt ?? now) - now) : Math.max(0, (startsAt ?? now) - now)

  const problems = (problemRows || []).map((p: any) => ({
    id: p.problem_id ?? "",
    contestId: p.contest_id_cf ?? 0,
    index: p.index_cf ?? "",
    name: p.title || p.problem_id || "Unnamed Problem",
    rating: p.rating ?? 0,
  }))

  // Only fetch submissions for authenticated users
  const mySubmissions: Record<string, "solved" | "failed"> = {}
  if (user) {
    const { data: myRows } = await supabase
      .from("contest_submissions")
      .select("problem_id, status, created_at")
      .eq("contest_id", contestId)
      .eq("user_id", user.id)

    const latestMap = new Map<string, { status: "solved" | "failed"; created_at: string }>()
    for (const r of myRows || []) {
      const prev = latestMap.get(r.problem_id)
      if (!prev || new Date(r.created_at).getTime() > new Date(prev.created_at).getTime()) {
        latestMap.set(r.problem_id, { status: r.status as "solved" | "failed", created_at: r.created_at })
      }
    }
    latestMap.forEach((v, k) => (mySubmissions[k] = v.status))
  }

  const response: any = {
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
      starts_at: rawContest.starts_at,
      ends_at: rawContest.ends_at,
      contest_mode: rawContest.contest_mode,
      rating_min: rawContest.rating_min,
      rating_max: rawContest.rating_max,
      visibility: rawContest.visibility,
      host_user_id: rawContest.host_user_id,
      allow_late_join: rawContest.allow_late_join ?? true,
    },
  }

  // Only include my_submissions for authenticated users
  if (user) {
    response.contest.my_submissions = mySubmissions
  }

  return NextResponse.json(response)
}
