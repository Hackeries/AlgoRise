import { createServiceRoleClient } from './supabase/server';

export interface JudgeResult {
  verdict: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'pending';
  penalty: number;
  executionTime?: number;
  memory?: number;
  error?: string;
}

export interface SubmissionPayload {
  code: string;
  language: string;
  problemId: string;
  battleId: string;
  teamId?: string;
  userId: string;
}

/**
 * Judge a submission against test cases
 * For now, returns a mock verdict. In production, integrate with actual judge system.
 */
export async function judgeSubmission(
  payload: SubmissionPayload
): Promise<JudgeResult> {
  try {
    // TODO: Integrate with actual judge system (e.g., CodeChef Judge API, custom judge)
    // For now, simulate judging with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock verdict logic - in production, run actual tests
    const verdict: JudgeResult['verdict'] = 'AC'; // Assume AC for demo

    return {
      verdict,
      penalty: 0,
      executionTime: Math.random() * 1000,
      memory: Math.random() * 256,
    };
  } catch (error) {
    return {
      verdict: 'CE',
      penalty: 0,
      error: error instanceof Error ? error.message : 'Compilation error',
    };
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
  verdict: JudgeResult['verdict'],
  penalty: number,
  teamId?: string
) {
  try {
    const supabase = await createServiceRoleClient();
    if (!supabase)
      throw new Error('Supabase service role client not available');

    const { data, error } = await supabase
      .from('battle_submissions')
      .insert({
        battle_id: battleId,
        team_id: teamId || null,
        user_id: userId,
        problem_id: problemId,
        code,
        language,
        verdict,
        penalty,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error storing submission:', error);
    throw error;
  }
}

/**
 * Get all submissions for a battle
 */
export async function getBattleSubmissions(battleId: string) {
  try {
    const supabase = await createServiceRoleClient();
    if (!supabase)
      throw new Error('Supabase service role client not available');

    const { data, error } = await supabase
      .from('battle_submissions')
      .select('*')
      .eq('battle_id', battleId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
}

/**
 * Calculate ICPC-style score for a team
 * Score = problems solved, Penalty = sum of times + 20 min per wrong submission
 */
export async function calculateICPCScore(battleId: string, teamId: string) {
  try {
    const supabase = await createServiceRoleClient();
    if (!supabase)
      throw new Error('Supabase service role client not available');

    // Get all submissions for the team in this battle
    const { data: submissions, error } = await supabase
      .from('battle_submissions')
      .select('*')
      .eq('battle_id', battleId)
      .eq('team_id', teamId);

    if (error) throw error;

    // Get battle start time
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .select('start_at')
      .eq('id', battleId)
      .single();

    if (battleError) throw battleError;

    // Calculate ICPC score
    const problemsSolved = new Set(
      submissions
        .filter((s: any) => s.verdict === 'AC')
        .map((s: any) => s.problem_id)
    ).size;

    const penaltyTime = submissions.reduce((acc: number, s: any) => {
      if (s.verdict !== 'AC') return acc + 20; // 20 min penalty for wrong submission
      const submittedAt = new Date(s.submitted_at).getTime();
      const startAt = new Date(battle.start_at).getTime();
      return acc + Math.floor((submittedAt - startAt) / 60000); // Convert to minutes
    }, 0);

    return {
      problemsSolved,
      penaltyTime,
    };
  } catch (error) {
    console.error('Error calculating ICPC score:', error);
    throw error;
  }
}