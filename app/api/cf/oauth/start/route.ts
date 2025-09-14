import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const handle = searchParams.get("handle")

    if (!handle) {
      return NextResponse.json(
        { error: "Handle parameter is required" },
        { status: 400 }
      )
    }

    // Verify the handle exists on Codeforces
    const cfResponse = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`)
    const cfData = await cfResponse.json()

    if (cfData.status !== "OK" || !cfData.result?.[0]) {
      return NextResponse.json(
        { error: "Codeforces handle not found" },
        { status: 404 }
      )
    }

    const cfUser = cfData.result[0]
    
    const supabase = await createClient()
    
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Store/update the verified handle directly
    const { error: dbError } = await supabase.from("cf_handles").upsert(
      {
        user_id: user.id,
        handle: cfUser.handle,
        verified: true,
        last_sync_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        { error: "Failed to store verification" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      handle: cfUser.handle,
      rating: cfUser.rating || 0,
      maxRating: cfUser.maxRating || 0,
      rank: cfUser.rank || "unrated",
      message: "Codeforces handle verified successfully!"
    })

  } catch (error) {
    console.error("OAuth start error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}