import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { count, ratingMin, ratingMax, tags, handle } = body

    // Fetch problems from Codeforces
    const response = await fetch("https://codeforces.com/api/problemset.problems")

    if (!response.ok) {
      throw new Error("Failed to fetch problems from Codeforces")
    }

    const data = await response.json()

    if (data.status !== "OK") {
      throw new Error("Codeforces API returned error")
    }

    // Get user's solved problems if handle provided
    const solvedSet = new Set<string>()
    if (handle) {
      try {
        const userResponse = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`)
        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.status === "OK") {
            userData.result.forEach((submission: any) => {
              if (submission.verdict === "OK") {
                solvedSet.add(`${submission.problem.contestId}${submission.problem.index}`)
              }
            })
          }
        }
      } catch (e) {
        console.error("Failed to fetch user submissions:", e)
      }
    }

    // Filter problems
    const filtered = data.result.problems.filter((p: any) => {
      // Must have rating
      if (!p.rating) return false

      // Must be in rating range
      if (p.rating < ratingMin || p.rating > ratingMax) return false

      // Must not be solved
      const problemId = `${p.contestId}${p.index}`
      if (solvedSet.has(problemId)) return false

      // If tags specified, must match at least one
      if (tags && tags.length > 0) {
        const hasTag = tags.some((tag: string) => p.tags.some((t: string) => t.toLowerCase() === tag.toLowerCase()))
        if (!hasTag) return false
      }

      return true
    })

    // Shuffle and take requested count
    filtered.sort(() => Math.random() - 0.5)
    const selected = filtered.slice(0, count)

    return NextResponse.json({
      problems: selected,
      total: filtered.length,
    })
  } catch (error) {
    console.error("Error generating practice problems:", error)
    return NextResponse.json({ error: "Failed to generate problems" }, { status: 500 })
  }
}
