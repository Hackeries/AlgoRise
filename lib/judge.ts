// Judge service for code execution and evaluation

import CodeExecutionService, { CodeExecutionRequest, CodeExecutionResult } from '@/lib/code-execution-service';
import { createClient } from '@/lib/supabase/server';

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

      const judgeResult: JudgeResult = {
        ...executionResult,
        sourceCode: request.sourceCode,
        language: request.language,
        problemId: request.problemId,
        userId: request.userId,
        contestId: request.contestId,
        battleId: request.battleId
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
        battleId: request.battleId
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
          compile_output: result.compileOutput
        });
      } else if (result.contestId) {
        // Save to contest submissions table
        await this.supabase.from('contest_submissions').insert({
          contest_id: result.contestId,
          user_id: result.userId,
          problem_id: result.problemId,
          status: result.status === 'success' ? 'solved' : 'failed',
          // In a real implementation, we would calculate penalty
          penalty_s: 0
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

// Export singleton instance
export default new JudgeService();