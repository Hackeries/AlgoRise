// Problem Judge Service for Generated Problems
import { JudgeService } from '../judge';
import { GeneratedProblem, TestCase } from './problem-templates';

export interface ProblemJudgeResult {
  problemId: string;
  passedTests: number;
  totalTests: number;
  testResults: TestResult[];
  overallStatus: 'passed' | 'failed' | 'partial';
  executionTimeMs?: number;
  memoryUsedKb?: number;
}

export interface TestResult {
  testCaseId: number;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  status: 'passed' | 'failed' | 'error';
  executionTimeMs?: number;
  errorMessage?: string;
}

export class ProblemJudgeService {
  private judgeService: JudgeService;

  constructor() {
    this.judgeService = new JudgeService();
  }

  /**
   * Judge a solution against a generated problem
   * @param problem The generated problem
   * @param sourceCode The solution code
   * @param language The programming language
   * @returns Problem judge result
   */
  async judgeProblem(
    problem: GeneratedProblem,
    sourceCode: string,
    language: string
  ): Promise<ProblemJudgeResult> {
    const testResults: TestResult[] = [];
    let passedTests = 0;

    // Run each test case
    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];
      try {
        const result = await this.judgeService.judgeSubmission({
          sourceCode,
          language,
          problemId: problem.problemId,
          userId: 'generated_problem_user', // Placeholder user ID
          timeLimit: 2, // 2 seconds default
          memoryLimit: 256, // 256 MB default
          stdin: testCase.input,
          expectedOutput: testCase.output
        });

        const testResult: TestResult = {
          testCaseId: i,
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result.stdout,
          status: result.status === 'success' ? 'passed' : 'failed',
          executionTimeMs: result.executionTimeMs,
          errorMessage: result.message
        };

        testResults.push(testResult);
        if (testResult.status === 'passed') {
          passedTests++;
        }
      } catch (error) {
        const testResult: TestResult = {
          testCaseId: i,
          input: testCase.input,
          expectedOutput: testCase.output,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        };
        testResults.push(testResult);
      }
    }

    const overallStatus: 'passed' | 'failed' | 'partial' = 
      passedTests === problem.testCases.length 
        ? 'passed' 
        : passedTests > 0 
          ? 'partial' 
          : 'failed';

    return {
      problemId: problem.problemId,
      passedTests,
      totalTests: problem.testCases.length,
      testResults,
      overallStatus,
      executionTimeMs: testResults.reduce((sum, r) => sum + (r.executionTimeMs || 0), 0),
      memoryUsedKb: Math.max(...testResults.map(r => r.executionTimeMs || 0))
    };
  }

  /**
   * Validate a solution against specific test cases
   * @param testCases The test cases to validate against
   * @param sourceCode The solution code
   * @param language The programming language
   * @returns Array of test results
   */
  async validateTestCases(
    testCases: TestCase[],
    sourceCode: string,
    language: string
  ): Promise<TestResult[]> {
    const testResults: TestResult[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      try {
        const result = await this.judgeService.judgeSubmission({
          sourceCode,
          language,
          problemId: `custom_test_${i}`,
          userId: 'custom_test_user',
          timeLimit: 2,
          memoryLimit: 256,
          stdin: testCase.input,
          expectedOutput: testCase.output
        });

        const testResult: TestResult = {
          testCaseId: i,
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result.stdout,
          status: result.status === 'success' ? 'passed' : 'failed',
          executionTimeMs: result.executionTimeMs,
          errorMessage: result.message
        };

        testResults.push(testResult);
      } catch (error) {
        const testResult: TestResult = {
          testCaseId: i,
          input: testCase.input,
          expectedOutput: testCase.output,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        };
        testResults.push(testResult);
      }
    }

    return testResults;
  }
}

// Export singleton instance
export default new ProblemJudgeService();