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
  verdict: 'AC' | 'WA' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'pending';
  penalty: number;
  executionTime?: number;
  memory?: number;
  error?: string;
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
        verdict,
        penalty,
        executionTime: executionResult.executionTimeMs,
        memory: executionResult.memoryUsedKb
      };

      // Save the result to database based on context
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
      if (result.contestId) {
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

// Export singleton instance
export default new JudgeService();