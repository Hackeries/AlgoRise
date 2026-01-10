import crypto from "crypto"

/**
 * Codeforces API utility with authentication
 * Uses API key and secret for authenticated requests
 */

interface CFApiResponse<T = any> {
  status: "OK" | "FAILED"
  comment?: string
  result?: T
}

/**
 * Generate authenticated Codeforces API URL
 * @param method - API method (e.g., 'user.info', 'user.rating')
 * @param params - Additional parameters
 * @returns Authenticated URL with signature
 */
function generateAuthenticatedUrl(method: string, params: Record<string, string> = {}): string {
  const apiKey = process.env.CODEFORCES_API_KEY
  const apiSecret = process.env.CODEFORCES_API_SECRET

  if (!apiKey || !apiSecret) {
    console.warn("Codeforces API credentials not configured, using public API")
    // Return public API URL without authentication
    const queryParams = new URLSearchParams(params)
    return `https://codeforces.com/api/${method}?${queryParams}`
  }

  // Generate timestamp
  const time = Math.floor(Date.now() / 1000)

  // Prepare parameters
  const allParams: Record<string, string> = {
    ...params,
    apiKey,
    time: time.toString(),
  }

  // Sort parameters by key
  const sortedParams = Object.keys(allParams)
    .sort()
    .map((key) => `${key}=${allParams[key]}`)
    .join("&")

  // Generate signature
  const rand = crypto.randomBytes(6).toString("hex")
  const toSign = `${rand}/${method}?${sortedParams}#${apiSecret}`
  const signature = crypto.createHash("sha512").update(toSign).digest("hex")

  // Build final URL
  const finalParams = new URLSearchParams({
    ...allParams,
    apiSig: `${rand}${signature}`,
  })

  return `https://codeforces.com/api/${method}?${finalParams}`
}

/**
 * Make authenticated request to Codeforces API
 * @param method - API method
 * @param params - Parameters
 * @returns API response
 */
export async function cfApiRequest<T = any>(
  method: string,
  params: Record<string, string> = {},
): Promise<CFApiResponse<T>> {
  const url = generateAuthenticatedUrl(method, params)

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "AlgoRise/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data as CFApiResponse<T>
  } catch (error) {
    console.error(`Codeforces API error for ${method}:`, error)
    return {
      status: "FAILED",
      comment: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get user info from Codeforces
 * @param handles - Comma-separated list of handles
 */
export async function cfGetUserInfo(handles: string) {
  // Use public API for user info (more reliable)
  const url = `https://codeforces.com/api/user.info?handles=${handles}`

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "AlgoRise/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data as CFApiResponse
  } catch (error) {
    console.error(`Codeforces user.info API error for ${handles}:`, error)
    return {
      status: "FAILED",
      comment: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get user rating history from Codeforces
 * @param handle - User handle
 */
export async function cfGetUserRating(handle: string) {
  // Use public API for better reliability
  const url = `https://codeforces.com/api/user.rating?handle=${handle}`

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "AlgoRise/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data as CFApiResponse
  } catch (error) {
    console.error(`Codeforces user.rating API error for ${handle}:`, error)
    return {
      status: "FAILED",
      comment: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get ratings for multiple users in parallel
 * @param handles - Array of user handles
 * @returns Map of handle to rating data
 */
export async function getUserRatings(handles: string[]): Promise<Record<string, { rating: number }>> {
  if (handles.length === 0) return {}

  // Fetch user info for all handles in parallel
  const chunks = []
  const chunkSize = 500 // CF API limit per request

  for (let i = 0; i < handles.length; i += chunkSize) {
    chunks.push(handles.slice(i, i + chunkSize))
  }

  const results = await Promise.all(chunks.map((chunk) => cfGetUserInfo(chunk.join(";"))))

  const ratingMap: Record<string, { rating: number }> = {}

  results.forEach(response => {
    if (response.status === 'OK' && 'result' in response && response.result) {
      const users = Array.isArray(response.result)
        ? response.result
        : [response.result];
      users.forEach((user: CodeforcesUser) => {
        ratingMap[user.handle] = { rating: user.rating || 0 };
      });
    }
  });

  return ratingMap
}

/**
 * Get user status (submissions) from Codeforces
 * @param handle - User handle
 * @param from - Start index (optional)
 * @param count - Number of submissions (optional, max 100000)
 */
export async function cfGetUserStatus(handle: string, from?: number, count?: number) {
  // Use public API for better reliability
  const params = new URLSearchParams({ handle })
  if (from !== undefined) params.set("from", from.toString())
  if (count !== undefined) params.set("count", count.toString())

  const url = `https://codeforces.com/api/user.status?${params.toString()}`

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "AlgoRise/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data as CFApiResponse
  } catch (error) {
    console.error(`Codeforces user.status API error for ${handle}:`, error)
    return {
      status: "FAILED",
      comment: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get contest list from Codeforces
 * @param gym - Include gym contests (optional)
 */
export async function cfGetContestList(gym = false) {
  // Use public API directly for contest list
  const url = `https://codeforces.com/api/contest.list${gym ? "?gym=true" : ""}`

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "AlgoRise/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data as CFApiResponse
  } catch (error) {
    console.error("Codeforces contest.list API error:", error)
    return {
      status: "FAILED",
      comment: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Get problems from contests
 * @param tags - Problem tags (optional)
 * @param problemsetName - Problemset name (optional)
 */
export async function cfGetProblems(tags?: string[], problemsetName?: string) {
  // Build URL for public API
  const params = new URLSearchParams()
  if (tags && tags.length > 0) params.set("tags", tags.join(";"))
  if (problemsetName) params.set("problemsetName", problemsetName)

  const url = `https://codeforces.com/api/problemset.problems${params.toString() ? "?" + params.toString() : ""}`

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent": "AlgoRise/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data as CFApiResponse
  } catch (error) {
    console.error("Codeforces problemset.problems API error:", error)
    return {
      status: "FAILED",
      comment: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Verify if API credentials are working
 */
export async function cfTestConnection(): Promise<boolean> {
  try {
    const response = await cfGetUserInfo("tourist") // Test with a known user
    return response.status === "OK"
  } catch {
    return false
  }
}

// Type definitions for better type safety
export interface CodeforcesUser {
  handle: string
  rating?: number
  maxRating?: number
  rank?: string
  maxRank?: string
  registrationTimeSeconds: number
  avatar?: string
  firstName?: string
  lastName?: string
  country?: string
  city?: string
  organization?: string
}

export interface CodeforcesProblem {
  contestId: number
  index: string
  name: string
  type: string
  points?: number
  rating?: number
  tags: string[]
}

export interface CodeforcesSubmission {
  id: number
  contestId: number
  creationTimeSeconds: number
  relativeTimeSeconds: number
  problem: CodeforcesProblem
  author: {
    contestId?: number
    members: Array<{ handle: string }>
    participantType: string
    ghost: boolean
    room?: number
    startTimeSeconds?: number
  }
  programmingLanguage: string
  verdict?: string
  testset: string
  passedTestCount: number
  timeConsumedMillis: number
  memoryConsumedBytes: number
}

export interface CodeforcesContest {
  id: number
  name: string
  type: string
  phase: string
  frozen: boolean
  durationSeconds: number
  startTimeSeconds?: number
  relativeTimeSeconds?: number
}

// Helper functions for adaptive practice
export function getUpcomingContests(contests: CodeforcesContest[]): CodeforcesContest[] {
  const now = Math.floor(Date.now() / 1000)
  return contests
    .filter((contest) => contest.phase === "BEFORE" && contest.startTimeSeconds && contest.startTimeSeconds > now)
    .sort((a, b) => (a.startTimeSeconds || 0) - (b.startTimeSeconds || 0))
}

export function getSolvedProblems(submissions: CodeforcesSubmission[]): Set<string> {
  const solved = new Set<string>()
  submissions.forEach((submission) => {
    if (submission.verdict === "OK") {
      solved.add(`${submission.problem.contestId}${submission.problem.index}`)
    }
  })
  return solved
}

export function getAdaptiveProblems(
  problems: CodeforcesProblem[],
  userRating: number,
  solvedProblems: Set<string>,
  count = 10,
): CodeforcesProblem[] {
  // Adaptive range: user rating - 100 to user rating + 200
  const minRating = Math.max(800, userRating - 100) // Minimum 800
  const maxRating = userRating + 200

  const suitable = problems.filter(
    (problem) =>
      problem.rating &&
      problem.rating >= minRating &&
      problem.rating <= maxRating &&
      !solvedProblems.has(`${problem.contestId}${problem.index}`),
  )

  // Shuffle and return requested count
  const shuffled = suitable.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function calculateUserProgress(submissions: CodeforcesSubmission[]): {
  totalSolved: number
  byDifficulty: Record<string, number>
  byTags: Record<string, number>
  recentActivity: Array<{ date: string; count: number }>
} {
  const solved = getSolvedProblems(submissions)
  const solvedSubmissions = submissions.filter(
    (sub) => sub.verdict === "OK" && solved.has(`${sub.problem.contestId}${sub.problem.index}`),
  )

  const byDifficulty: Record<string, number> = {}
  const byTags: Record<string, number> = {}
  const dailyActivity: Record<string, number> = {}

  solvedSubmissions.forEach((submission) => {
    // Count by difficulty
    const rating = submission.problem.rating || 0
    const difficulty = getRatingCategory(rating)
    byDifficulty[difficulty] = (byDifficulty[difficulty] || 0) + 1

    // Count by tags
    submission.problem.tags.forEach((tag) => {
      byTags[tag] = (byTags[tag] || 0) + 1
    })

    // Daily activity
    const date = new Date(submission.creationTimeSeconds * 1000).toDateString()
    dailyActivity[date] = (dailyActivity[date] || 0) + 1
  })

  // Convert daily activity to array format
  const recentActivity = Object.entries(dailyActivity)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30) // Last 30 days

  return {
    totalSolved: solved.size,
    byDifficulty,
    byTags,
    recentActivity,
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
