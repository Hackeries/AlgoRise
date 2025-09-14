import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    // Return empty contests if user is not authenticated
    if (!user) {
      return NextResponse.json({ contests: [] })
    }

    // List contests where user is host or participant
    const { data, error } = await supabase
      .from("contests")
      .select("id, name, status, starts_at, ends_at, host_user_id, created_at")
      .order("created_at", { ascending: false })
    
    if (error) {
      console.error('Database error in contests API:', error)
      return NextResponse.json({ contests: [] }) // Return empty array instead of error
    }
    
    return NextResponse.json({ contests: data ?? [] })
  } catch (error) {
    console.error('Error in contests API:', error)
    return NextResponse.json({ contests: [] }) // Return empty array on any error
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const name = (body?.name as string | undefined)?.trim()
  const starts_at = body?.startsAt as string | undefined
  const ends_at = body?.endsAt as string | undefined
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("contests")
    .insert({ name, host_user_id: user.id, starts_at: starts_at ?? null, ends_at: ends_at ?? null, status: "draft" })
    .select("id")
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, id: data.id })
}
