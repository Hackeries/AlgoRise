import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get("q") || "").trim()
  const supabase = await createClient()

  let query = supabase.from("companies").select("id, name").order("name").limit(100)

  if (q) {
    query = query.ilike("name", `%${q}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ companies: data ?? [] })
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
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }

    // Check if company already exists (case-insensitive)
    const { data: existing } = await supabase.from("companies").select("id, name").ilike("name", name.trim()).single()

    if (existing) {
      return NextResponse.json({
        company: existing,
        message: "Company already exists",
      })
    }

    // Insert new company
    const { data: newCompany, error: insertError } = await supabase
      .from("companies")
      .insert({ name: name.trim(), created_by: user.id })
      .select("id, name")
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      company: newCompany,
      message: "Company added successfully",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
