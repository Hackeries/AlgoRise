import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { verificationId } = await req.json()

    if (!verificationId) {
      return NextResponse.json({ error: "verificationId required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

    // Get stored verification data
    const { data: row, error: selErr } = await supabase
      .from("cf_handles")
      .select("handle, verification_token, last_sync_at, verified")
      .eq("user_id", user.id)
      .single()

    if (selErr || !row) return NextResponse.json({ error: "no verification attempt found" }, { status: 400 })

    if (row.verified) {
      return NextResponse.json({ verified: true, handle: row.handle })
    }

    // Check if verification has expired
    const expiresAt = new Date(row.last_sync_at)
    if (new Date() > expiresAt) {
      return NextResponse.json({ verified: false, message: "Verification expired" }, { status: 200 })
    }

    // Check if verification ID matches
    if (row.verification_token !== verificationId) {
      return NextResponse.json({ verified: false, message: "Invalid verification ID" }, { status: 400 })
    }

    // Check Codeforces submissions for compilation error
    // We'll check the user's recent submissions for problem 1869A
    const cfResponse = await fetch(`https://codeforces.com/api/user.status?handle=${row.handle}&from=1&count=10`)
    const cfData = await cfResponse.json()

    if (cfData.status !== "OK") {
      return NextResponse.json({ verified: false, message: "Failed to fetch submissions" }, { status: 500 })
    }

    // Look for a compilation error submission on problem 1869A
    const recentSubmission = cfData.result?.find(
      (sub: any) =>
        sub.problem?.contestId === 1869 && sub.problem?.index === "A" && sub.verdict === "COMPILATION_ERROR",
    )

    if (!recentSubmission) {
      return NextResponse.json(
        {
          verified: false,
          message: "No compilation error submission found for Problem 1869A",
        },
        { status: 200 },
      )
    }

    // Check if submission was made after verification started
    const submissionTime = new Date(recentSubmission.creationTimeSeconds * 1000)
    const verificationStartTime = new Date(expiresAt.getTime() - 2 * 60 * 1000)

    if (submissionTime < verificationStartTime) {
      return NextResponse.json(
        {
          verified: false,
          message: "Submission was made before verification started",
        },
        { status: 200 },
      )
    }

    // Verification successful! Get user info
    const userInfoResponse = await fetch(`https://codeforces.com/api/user.info?handles=${row.handle}`)
    const userInfoData = await userInfoResponse.json()

    if (userInfoData.status !== "OK" || !userInfoData.result?.[0]) {
      return NextResponse.json({ verified: false, message: "Failed to fetch user info" }, { status: 500 })
    }

    const cfUser = userInfoData.result[0]

    // Update verification status
    const { error: upErr } = await supabase
      .from("cf_handles")
      .update({
        verified: true,
        verification_token: null,
        last_sync_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

    // Insert snapshot
    const { error: snapErr } = await supabase.from("cf_snapshots").insert({
      user_id: user.id,
      handle: cfUser.handle,
      rating: cfUser.rating ?? null,
      max_rating: cfUser.maxRating ?? null,
      rank: cfUser.rank ?? "unrated",
      problems_solved: 0,
      snapshot_at: new Date().toISOString(),
    })

    if (snapErr) {
      console.error("Snapshot insert error:", snapErr)
    }

    return NextResponse.json({
      verified: true,
      handle: cfUser.handle,
      rating: cfUser.rating ?? null,
      maxRating: cfUser.maxRating ?? null,
      rank: cfUser.rank ?? "unrated",
    })
  } catch (e: any) {
    console.error("Verification check error:", e)
    return NextResponse.json({ error: e?.message || "unknown error" }, { status: 500 })
  }
}
