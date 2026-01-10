import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contestId = id
  const body = await req.json().catch(() => ({}))

  const problem_id = (body?.problemId as string | undefined)?.trim()
  const code_text = (body?.codeText as string | undefined) ?? ""
  const language = (body?.language as string | undefined)?.trim() || "txt"
  const file_name = (body?.fileName as string | undefined)?.trim() || `submission.${language}`

  if (!problem_id || !code_text) {
    return NextResponse.json({ error: "problemId and codeText required" }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { error } = await supabase.from("contest_submission_files").insert({
    contest_id: contestId,
    user_id: user.id,
    problem_id,
    file_name,
    language,
    code_text,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
