import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { randomUUID } from "crypto"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const groupId = params.id

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: await cookies() }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check if user is member of group
  const { data: membership } = await supabase
    .from("group_memberships")
    .select("role")
    .eq("group_id", groupId)
    .eq("user_id", user.id)
    .single()

  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 })

  // Generate invite code
  const inviteCode = randomUUID()

  // Store in DB (assume invite_codes table or add to groups)
  // For simplicity, add to groups table
  const { error } = await supabase
    .from("groups")
    .update({ invite_code: inviteCode })
    .eq("id", groupId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/groups/join/${inviteCode}`

  return NextResponse.json({ link: inviteLink, code: inviteCode })
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const groupId = params.id
  const body = await req.json().catch(() => ({}))
  const inviteCode = body?.code as string | undefined
  if (!inviteCode) return NextResponse.json({ error: "Invite code required" }, { status: 400 })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: await cookies() },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Verify code
  const { data: group } = await supabase
    .from("groups")
    .select("college_id, invite_code")
    .eq("id", groupId)
    .eq("invite_code", inviteCode)
    .single()

  if (!group) return NextResponse.json({ error: "Invalid invite code" }, { status: 400 })

  // Check user's college
  const { data: profile } = await supabase
    .from("profiles")
    .select("college_id")
    .eq("id", user.id)
    .single()

  if (!profile?.college_id || profile.college_id !== group.college_id) {
    return NextResponse.json({ error: "College mismatch" }, { status: 400 })
  }

  // Check member count
  const { count } = await supabase
    .from("group_memberships")
    .select("*", { count: "exact", head: true })
    .eq("group_id", groupId)

  if (count && count >= 3) return NextResponse.json({ error: "Group is full" }, { status: 400 })

  // Add member
  const { error } = await supabase
    .from("group_memberships")
    .upsert({
      group_id: groupId,
      user_id: user.id,
      role: "member"
    }, { onConflict: "group_id,user_id" })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
