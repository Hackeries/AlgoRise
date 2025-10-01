import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies },
  )

  const { data, error } = await supabase
    .from("colleges")
    .select("id, name")
    .order("name")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ colleges: data })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const name = body?.name as string | undefined
  if (!name?.trim()) return NextResponse.json({ error: "College name required" }, { status: 400 })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies },
  )

  // Check if exists
  const { data: existing } = await supabase
    .from("colleges")
    .select("id")
    .eq("name", name.trim())
    .maybeSingle()

  if (existing) return NextResponse.json({ id: existing.id })

  // Create new
  const { data, error } = await supabase
    .from("colleges")
    .insert({ name: name.trim() })
    .select("id")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ id: data.id })
}
