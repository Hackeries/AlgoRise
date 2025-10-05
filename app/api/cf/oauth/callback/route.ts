import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const handle = url.searchParams.get("handle")

    if (!handle) {
      return NextResponse.redirect(new URL("/auth/login?error=missing_handle", url.origin))
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    
    if (userErr || !user) {
      return NextResponse.redirect(new URL("/auth/login", url.origin))
    }

    // Verify the handle exists on Codeforces
    const cfResponse = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`)
    const cfData = await cfResponse.json()

    if (cfData.status !== "OK" || !cfData.result?.[0]) {
      return NextResponse.redirect(new URL("/onboarding?error=cf_handle_not_found", url.origin))
    }

    const cfUser = cfData.result[0]

    // Store verified handle
    const { error: dbErr } = await supabase.from("cf_handles").upsert(
      {
        user_id: user.id,
        handle: cfUser.handle,
        verified: true,
        last_sync_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

    if (dbErr) {
      console.error("Database error:", dbErr)
      return NextResponse.redirect(new URL("/onboarding?error=db_failed", url.origin))
    }

    return NextResponse.redirect(new URL("/onboarding?cf_verified=true", url.origin))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/onboarding?error=unknown", new URL(req.url).origin))
  }
}
