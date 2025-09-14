import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const contestId = params.id
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  // snapshot handle if verified
  const { data: cf } = await supabase.from("cf_handles").select("handle, verified").eq("user_id", user.id).maybeSingle()
  const handle_snapshot = cf?.verified ? cf.handle : null

  const { error } = await supabase
    .from("contest_participants")
    .upsert({ contest_id: contestId, user_id: user.id, handle_snapshot }, { onConflict: "contest_id,user_id" })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
