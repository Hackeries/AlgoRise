import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const collegeId = body?.collegeId as string | undefined
  if (!collegeId) return NextResponse.json({ error: "collegeId required" }, { status: 400 })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies },
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  // Ensure a college group exists or create one
  const { data: existing, error: selErr } = await supabase
    .from("groups")
    .select("id")
    .eq("type", "college")
    .eq("college_id", collegeId)
    .maybeSingle()
  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 })

  let groupId = existing?.id as string | undefined
  if (!groupId) {
    // Create new college group, name from college name
    const { data: collegeRow, error: colErr } = await supabase
      .from("colleges")
      .select("name")
      .eq("id", collegeId)
      .single()
    if (colErr) return NextResponse.json({ error: colErr.message }, { status: 500 })

    const { data: created, error: insErr } = await supabase
      .from("groups")
      .insert({
        name: `${collegeRow.name} • AlgoRise`,
        type: "college",
        college_id: collegeId,
        created_by: user.id,
      })
      .select("id")
      .single()
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
    groupId = created.id
  }

  // Upsert membership
  const { error: memErr } = await supabase
    .from("group_memberships")
    .upsert({ group_id: groupId!, user_id: user.id, role: "member" }, { onConflict: "group_id,user_id" })
  if (memErr) return NextResponse.json({ error: memErr.message }, { status: 500 })

  return NextResponse.json({ ok: true, groupId })
}
