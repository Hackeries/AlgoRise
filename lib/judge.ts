// Judge service for code execution and evaluation

import CodeExecutionService, { CodeExecutionRequest, CodeExecutionResult } from '@/lib/code-execution-service';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from './supabase/server';

export interface JudgeRequest {
  sourceCode: string;
  language: string;
  problemId: string;
  userId: string;
  contestId?: string;
  battleId?: string;
  timeLimit?: number;
  memoryLimit?: number;
  stdin?: string;
  expectedOutput?: string;
}

export interface JudgeResult extends CodeExecutionResult {
  sourceCode: string;
  language: string;
  problemId: string;
  userId: string;
  contestId?: string;
  battleId?: string;
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

export class JudgeService {
  private codeExecutor: CodeExecutionService;
  private supabase: any;

  constructor() {
    this.codeExecutor = CodeExecutionService.getInstance();
    this.supabase = createClient();
  }

  /**
   * Judge a submission
   * @param request Judge request
   * @returns Judge result
   */
  async judgeSubmission(request: JudgeRequest): Promise<JudgeResult> {
    try {
      // Execute the code
      const executionRequest: CodeExecutionRequest = {
        sourceCode: request.sourceCode,
        language: request.language,
        stdin: request.stdin,
        expectedOutput: request.expectedOutput,
        timeLimit: request.timeLimit,
        memoryLimit: request.memoryLimit
      };

      const executionResult = await this.codeExecutor.executeCode(executionRequest);

      // Map execution status to verdict
      const statusToVerdict: Record<string, JudgeResult['verdict']> = {
        'success': 'AC',
        'compilation_error': 'CE',
        'runtime_error': 'RE',
        'time_limit_exceeded': 'TLE',
        'memory_limit_exceeded': 'MLE',
        'wrong_answer': 'WA',
        'internal_error': 'RE'
      };

      const verdict = executionResult.status ? statusToVerdict[executionResult.status] : 'pending';
      const penalty = executionResult.status === 'success' ? 0 : 20; // Simple penalty logic

      const judgeResult: JudgeResult = {
        ...executionResult,
        sourceCode: request.sourceCode,
        language: request.language,
        problemId: request.problemId,
        userId: request.userId,
        contestId: request.contestId,
        battleId: request.battleId,
        verdict,
        penalty,
        executionTime: executionResult.executionTimeMs,
        memory: executionResult.memoryUsedKb
      };

      // Save the result to database based on context (contest or battle)
      await this.saveJudgeResult(judgeResult);

      return judgeResult;
    } catch (error) {
      console.error('Error judging submission:', error);
      return {
        success: false,
        status: 'internal_error',
        message: 'Internal error occurred during judging',
        sourceCode: request.sourceCode,
        language: request.language,
        problemId: request.problemId,
        userId: request.userId,
        contestId: request.contestId,
        battleId: request.battleId,
        verdict: 'RE',
        penalty: 20,
        error: error instanceof Error ? error.message : 'Internal error',
        stdout: undefined,
        stderr: undefined,
        compileOutput: undefined,
        executionTimeMs: undefined,
        memoryUsedKb: undefined
      };
    }
  }

  /**
   * Save judge result to appropriate database table based on context
   * @param result Judge result
   */
  private async saveJudgeResult(result: JudgeResult): Promise<void> {
    try {
      if (result.battleId) {
        // Save to battle submissions table
        await this.supabase.from('battle_submissions').insert({
          battle_id: result.battleId,
          // In a real implementation, we would link to specific round
          user_id: result.userId,
          problem_id: result.problemId,
          status: result.status,
          language: result.language || 'cpp',
          code_text: result.sourceCode || '',
          execution_time_ms: result.executionTimeMs,
          memory_kb: result.memoryUsedKb,
          stdout: result.stdout,
          stderr: result.stderr,
          compile_output: result.compileOutput,
          verdict: result.verdict,
          penalty: result.penalty
        });
      } else if (result.contestId) {
        // Save to contest submissions table
        await this.supabase.from('contest_submissions').insert({
          contest_id: result.contestId,
          user_id: result.userId,
          problem_id: result.problemId,
          status: result.status === 'success' ? 'solved' : 'failed',
          penalty_s: result.penalty
        });
      }
    } catch (error) {
      console.error('Error saving judge result:', error);
    }
  }

  /**
   * Validate if a language is supported
   * @param language Language identifier
   * @returns True if language is supported
   */
  isLanguageSupported(language: string): boolean {
    return this.codeExecutor.isLanguageSupported(language);
  }

  /**
   * Get language display name
   * @param language Language identifier
   * @returns Display name for the language
   */
  getLanguageDisplayName(language: string): string {
    return this.codeExecutor.getLanguageDisplayName(language);
  }
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
      success: true,
      status: 'success',
      verdict,
      penalty: 0,
      executionTime: Math.random() * 1000,
      memory: Math.random() * 256,
      sourceCode: payload.code,
      language: payload.language,
      problemId: payload.problemId,
      userId: payload.userId,
      battleId: payload.battleId,
      contestId: undefined,
      message: 'Code executed successfully',
      stdout: undefined,
      stderr: undefined,
      compileOutput: undefined,
      executionTimeMs: Math.random() * 1000,
      memoryUsedKb: Math.random() * 256
    };
  } catch (error) {
    return {
      success: false,
      status: 'compilation_error',
      verdict: 'CE',
      penalty: 0,
      error: error instanceof Error ? error.message : 'Compilation error',
      sourceCode: payload.code,
      language: payload.language,
      problemId: payload.problemId,
      userId: payload.userId,
      battleId: payload.battleId,
      contestId: undefined,
      message: 'Compilation error occurred during judging',
      stdout: undefined,
      stderr: undefined,
      compileOutput: undefined,
      executionTimeMs: undefined,
      memoryUsedKb: undefined
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
  verdict: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'pending',
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

// Export singleton instance
export default new JudgeService();