import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get("q") || "").trim()
  const supabase = await createClient()

  let query = supabase.from("colleges").select("id, name, country").eq("country", "India").order("name").limit(100)

  if (q) {
    // ilike search for convenience
    query = query.ilike("name", `%${q}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ colleges: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, country = "India" } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "College name is required" }, { status: 400 })
    }

    // Check if college already exists (case-insensitive)
    const { data: existing } = await supabase.from("colleges").select("id, name").ilike("name", name.trim()).single()

    if (existing) {
      return NextResponse.json({
        college: existing,
        message: "College already exists",
      })
    }

    // Insert new college
    const { data: newCollege, error: insertError } = await supabase
      .from("colleges")
      .insert({ name: name.trim(), country })
      .select("id, name, country")
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      college: newCollege,
      message: "College added successfully",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
