import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { handle } = await req.json()
    if (!handle || typeof handle !== "string") {
      return NextResponse.json({ error: "handle required" }, { status: 400 })
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()
    if (userErr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    // Verify handle exists on Codeforces
    const cfResponse = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`)
    const cfData = await cfResponse.json()

    if (cfData.status !== "OK" || !cfData.result?.[0]) {
      return NextResponse.json({ error: "Codeforces handle not found" }, { status: 404 })
    }

    // Generate verification ID and code snippet
    const verificationId = `RG-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`
    const timestamp = new Date().toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    })

    const codeSnippet = `// Code submitted by ${handle} at ${timestamp}
// This will generate a compilation error
#include <iostream>
using namespace std;

int main() {
    // Verification ID: ${verificationId}
    cout << "AlgoRise Verification" << endl
    return 0; // Missing semicolon - compilation error
}`

    // Store verification attempt
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000) // 2 minutes from now

    const { error: upErr } = await supabase.from("cf_handles").upsert(
      {
        user_id: user.id,
        handle,
        verified: false,
        verification_token: verificationId,
        last_sync_at: expiresAt.toISOString(),
      },
      { onConflict: "user_id" },
    )

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

    return NextResponse.json({
      handle,
      verificationId,
      codeSnippet,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "unknown error" }, { status: 500 })
  }
}
