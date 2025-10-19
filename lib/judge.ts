import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface JudgeResult {
  verdict: "AC" | "WA" | "TLE" | "MLE" | "RE" | "CE" | "pending"
  penalty: number
  executionTime?: number
  memory?: number
  error?: string
}

export interface SubmissionPayload {
  code: string
  language: string
  problemId: string
  battleId: string
  teamId?: string
  userId: string
}

/**
 * Judge a submission against test cases
 * For now, returns a mock verdict. In production, integrate with actual judge system.
 */
export async function judgeSubmission(payload: SubmissionPayload): Promise<JudgeResult> {
  try {
    // TODO: Integrate with actual judge system (e.g., CodeChef Judge API, custom judge)
    // For now, simulate judging with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock verdict logic - in production, run actual tests
    const verdict: JudgeResult["verdict"] = "AC" // Assume AC for demo

    return {
      verdict,
      penalty: 0,
      executionTime: Math.random() * 1000,
      memory: Math.random() * 256,
    }
  } catch (error) {
    return {
      verdict: "CE",
      penalty: 0,
      error: error instanceof Error ? error.message : "Compilation error",
    }
  }
}

/**
 * Store submission in database
 */
export async function storeSubmission(
  battleId: string,
  userId: string,
  problemId: string,
  code: string,
  language: string,
  verdict: JudgeResult["verdict"],
  penalty: number,
  teamId?: string,
) {
  try {
    const result = await sql(
      `INSERT INTO public.battle_submissions 
       (battle_id, team_id, user_id, problem_id, code, language, verdict, penalty)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [battleId, teamId || null, userId, problemId, code, language, verdict, penalty],
    )
    return result[0]
  } catch (error) {
    console.error("Error storing submission:", error)
    throw error
  }
}

/**
 * Get all submissions for a battle
 */
export async function getBattleSubmissions(battleId: string) {
  try {
    const results = await sql(
      `SELECT * FROM public.battle_submissions 
       WHERE battle_id = $1 
       ORDER BY submitted_at DESC`,
      [battleId],
    )
    return results
  } catch (error) {
    console.error("Error fetching submissions:", error)
    throw error
  }
}

/**
 * Calculate ICPC-style score for a team
 * Score = problems solved, Penalty = sum of times + 20 min per wrong submission
 */
export async function calculateICPCScore(battleId: string, teamId: string) {
  try {
    const results = await sql(
      `SELECT 
        COUNT(DISTINCT CASE WHEN verdict = 'AC' THEN problem_id END) as problems_solved,
        SUM(CASE WHEN verdict != 'AC' THEN 20 ELSE 0 END) as penalty_minutes,
        MAX(EXTRACT(EPOCH FROM (submitted_at - (SELECT start_at FROM public.battles WHERE id = $1))) / 60) as max_time
       FROM public.battle_submissions
       WHERE battle_id = $1 AND team_id = $2`,
      [battleId, teamId],
    )

    const row = results[0]
    return {
      problemsSolved: Number.parseInt(row.problems_solved) || 0,
      penaltyTime: (Number.parseInt(row.penalty_minutes) || 0) + (Number.parseInt(row.max_time) || 0),
    }
  } catch (error) {
    console.error("Error calculating ICPC score:", error)
    throw error
  }
}
