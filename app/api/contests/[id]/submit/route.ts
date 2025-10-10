import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contestId = id
  const body = await req.json().catch(() => ({}))

  const problem_id = (body?.problemId as string | undefined)?.trim()
  const status = body?.status as "solved" | "failed" | undefined
  const penalty_s = Number(body?.penalty ?? 0)

  if (!problem_id || !status) {
    return NextResponse.json({ error: "problemId and status required" }, { status: 400 })
  }

  // ✅ FIX: Await the client
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const { error } = await supabase.from("contest_submissions").insert({
    contest_id: contestId,
    user_id: user.id,
    problem_id,
    status,
    penalty_s: isFinite(penalty_s) ? penalty_s : 0,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
