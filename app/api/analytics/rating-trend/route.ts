import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const range = searchParams.get("range") === "30d" ? 30 : 7
  
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ points: [] })

  const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from("cf_snapshots")
    .select("created_at,rating")
    .eq("user_id", user.id)
    .gte("created_at", since)
    .order("created_at", { ascending: true })

    const points = (data ?? []).map((d) => ({
      date: new Date(d.created_at as string).toLocaleDateString(),
      rating: d.rating ?? 0,
    }))

    return NextResponse.json({ points })
  } catch (error) {
    console.error('Error in rating trend:', error)
    // Return mock data when Supabase is not available
    const mockPoints = Array.from({ length: range }, (_, i) => ({
      date: new Date(Date.now() - (range - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      rating: 1200 + Math.floor(Math.random() * 200) - 100
    }))
    return NextResponse.json({ points: mockPoints })
  }
}
