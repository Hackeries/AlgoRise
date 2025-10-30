// Problem Judge Service for Generated Problems
// Client-side implementation for demo purposes

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
  /**
   * Judge a solution against a generated problem (client-side simulation)
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
    // Simulate test execution with a delay to mimic real processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const testResults: TestResult[] = [];
    let passedTests = 0;

    // Run each test case
    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];
      
      // Simulate code execution based on the problem type and source code
      const result = this.simulateCodeExecution(testCase, sourceCode, language);
      
      testResults.push(result);
      if (result.status === 'passed') {
        passedTests++;
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
      memoryUsedKb: Math.max(...testResults.map(r => r.executionTimeMs || 0)) * 10 // Simulated memory usage
    };
  }

  /**
   * Validate a solution against specific test cases (client-side simulation)
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
    // Simulate test execution with a delay to mimic real processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const testResults: TestResult[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      // Simulate code execution based on the problem type and source code
      const result = this.simulateCodeExecution(testCase, sourceCode, language);
      
      testResults.push(result);
    }

    return testResults;
  }

  /**
   * Simulate code execution for a test case
   * @param testCase The test case to execute
   * @param sourceCode The source code to execute
   * @param language The programming language
   * @returns Test result
   */
  private simulateCodeExecution(
    testCase: TestCase,
    sourceCode: string,
    language: string
  ): TestResult {
    // Generate a more realistic simulation based on the problem type
    let actualOutput = "";
    let status: 'passed' | 'failed' | 'error' = 'failed';
    let errorMessage: string | undefined = undefined;
    
    // Simple heuristic: if the code contains keywords related to the problem,
    // we'll consider it correct for demo purposes
    const inputLines = testCase.input.trim().split('\n');
    const firstLine = inputLines[0] || "";
    
    // Check for different problem types based on input patterns
    if (testCase.input.includes(' ')) {
      // Array-based problem
      if (sourceCode.toLowerCase().includes('sum') || 
          sourceCode.toLowerCase().includes('accumulate') ||
          sourceCode.toLowerCase().includes('reduce') ||
          sourceCode.toLowerCase().includes('loop') ||
          sourceCode.toLowerCase().includes('for') ||
          sourceCode.toLowerCase().includes('while')) {
        // For array sum problems, calculate the actual sum
        try {
          const numbers = inputLines[1]?.split(' ').map(Number) || [];
          const sum = numbers.reduce((a, b) => a + b, 0);
          actualOutput = sum.toString();
          status = testCase.output.trim() === actualOutput ? 'passed' : 'failed';
        } catch (e) {
          actualOutput = "Error in calculation";
          status = 'error';
          errorMessage = "Failed to calculate sum";
        }
      } else {
        // Default simulation
        actualOutput = testCase.output;
        status = 'passed';
      }
    } else {
      // Simple problem
      actualOutput = testCase.output;
      status = 'passed';
    }
    
    // Override for demo: if source code contains "correct", mark as passed
    if (sourceCode.toLowerCase().includes('correct')) {
      actualOutput = testCase.output;
      status = 'passed';
      errorMessage = undefined;
    }
    
    // Override for demo: if source code contains "wrong", mark as failed
    if (sourceCode.toLowerCase().includes('wrong')) {
      actualOutput = "Wrong answer";
      status = 'failed';
      errorMessage = "Incorrect solution";
    }
    
    // Override for demo: if source code contains "error", mark as error
    if (sourceCode.toLowerCase().includes('error')) {
      actualOutput = "";
      status = 'error';
      errorMessage = "Runtime error occurred";
    }

    return {
      testCaseId: testCase.type === 'sample' ? 0 : 1, // Simplified ID assignment
      input: testCase.input,
      expectedOutput: testCase.output,
      actualOutput: actualOutput,
      status: status,
      executionTimeMs: Math.floor(Math.random() * 100) + 50, // Random time between 50-150ms
      errorMessage: errorMessage
    };
  }
}

// Export singleton instance
export default new ProblemJudgeService();