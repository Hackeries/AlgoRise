import { type NextRequest, NextResponse } from "next/server"
import {
  cfGetUserInfo,
  cfGetUserStatus,
  cfGetUserRating,
  type CodeforcesUser,
  type CodeforcesSubmission,
} from "@/lib/codeforces-api"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const handle = searchParams.get("handle")

    if (!handle) {
      return NextResponse.json({ error: "Handle is required" }, { status: 400 })
    }

    console.log(`Fetching user info for handle: ${handle}`)

    // Fetch user info
    const userResponse = await cfGetUserInfo(handle)
    if (userResponse.status !== "OK" || !("result" in userResponse) || !userResponse.result) {
      console.error(`Failed to fetch user info for ${handle}:`, userResponse.comment)
      return NextResponse.json(
        {
          error:
            userResponse.comment?.includes("not found") || userResponse.comment?.includes("400")
              ? `User '${handle}' not found on Codeforces. Please check the handle and try again.`
              : "Codeforces API error",
          details: userResponse.comment,
          handle: handle,
        },
        { status: 404 },
      )
    }

    const user: CodeforcesUser = userResponse.result[0]

    // Fetch user submissions (recent 1000 for comprehensive analysis)
    const submissionsResponse = await cfGetUserStatus(handle, undefined, 1000)
    let submissions: CodeforcesSubmission[] = []
    if (submissionsResponse.status === "OK" && "result" in submissionsResponse && submissionsResponse.result) {
      submissions = submissionsResponse.result
      console.log(`Fetched ${submissions.length} submissions for user ${handle}`)
    }

    // Fetch rating history
    const ratingResponse = await cfGetUserRating(handle)
    let ratingHistory: any[] = []
    if (ratingResponse.status === "OK" && "result" in ratingResponse && ratingResponse.result) {
      ratingHistory = ratingResponse.result
    }

    // Calculate comprehensive stats
    const solvedProblems = new Set<string>()
    const solvedProblemsList: Array<{
      contestId: number
      index: string
      name: string
      rating?: number
      tags: string[]
      solvedAt: number
    }> = []
    const tagCount: Record<string, number> = {}
    const difficultyCount: Record<string, number> = {}

    // Calculate recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const activityMap = new Map<string, number>()

    submissions.forEach((submission) => {
      if (submission.verdict === "OK") {
        const problemKey = `${submission.problem.contestId}${submission.problem.index}`
        if (!solvedProblems.has(problemKey)) {
          solvedProblems.add(problemKey)

          // Add to solved problems list
          solvedProblemsList.push({
            contestId: submission.problem.contestId,
            index: submission.problem.index,
            name: submission.problem.name,
            rating: submission.problem.rating,
            tags: submission.problem.tags,
            solvedAt: submission.creationTimeSeconds,
          })

          // Count tags
          submission.problem.tags.forEach((tag) => {
            tagCount[tag] = (tagCount[tag] || 0) + 1
          })

          // Count difficulty
          const rating = submission.problem.rating || 0
          const difficulty = getRatingCategory(rating)
          difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1
        }
      }

      // Track activity for recent submissions
      if (submission.creationTimeSeconds && submission.creationTimeSeconds * 1000 > thirtyDaysAgo) {
        const date = new Date(submission.creationTimeSeconds * 1000).toISOString().split("T")[0]
        activityMap.set(date, (activityMap.get(date) || 0) + 1)
      }
    })

    const recentActivity = Array.from(activityMap.entries())
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json(
      {
        user: {
          ...user,
          verified: true, // User exists if we can fetch data
          avatar: (user as any).titlePhoto || "/placeholder-user.jpg",
        },
        stats: {
          totalSolved: solvedProblems.size,
          currentRating: user.rating || 0,
          maxRating: user.maxRating || 0,
          tagDistribution: tagCount,
          difficultyDistribution: difficultyCount,
          ratingHistory,
          recentActivity,
          contestsParticipated: ratingHistory.length,
          bestRank: ratingHistory.length > 0 ? Math.min(...ratingHistory.map((r: any) => r.rank)) : 0,
        },
        solvedProblems: solvedProblemsList.sort((a, b) => b.solvedAt - a.solvedAt).slice(0, 50), // 50 most recent
        recentSubmissions: submissions.slice(0, 14), // 20 most recent submissions
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function getRatingCategory(rating: number): string {
  if (rating < 1000) return "Beginner"
  if (rating < 1200) return "Newbie"
  if (rating < 1400) return "Pupil"
  if (rating < 1600) return "Specialist"
  if (rating < 1900) return "Expert"
  if (rating < 2100) return "Candidate Master"
  if (rating < 2300) return "Master"
  if (rating < 2400) return "International Master"
  return "Grandmaster"
}
