// Code execution service with Judge0 integration

export interface CodeExecutionRequest {
  sourceCode: string;
  language: string;
  stdin?: string;
  expectedOutput?: string;
  timeLimit?: number; // in seconds
  memoryLimit?: number; // in MB
  testCases?: Array<{ input: string; output: string }>;
}

export interface CodeExecutionResult {
  success: boolean;
  status: 'success' | 'compilation_error' | 'runtime_error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'wrong_answer' | 'internal_error' | 'solved';
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  executionTimeMs?: number;
  memoryUsedKb?: number;
  message?: string;
  testResults?: Array<{ passed: boolean; input: string; expected: string; actual: string }>;
}

// Judge0 language IDs mapping
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  'cpp': 54,        // C++ (GCC 9.2.0)
  'c': 50,          // C (GCC 9.2.0)
  'java': 62,       // Java (OpenJDK 13.0.1)
  'python': 71,     // Python (3.8.1)
  'javascript': 63, // JavaScript (Node.js 12.14.0)
  'go': 60,         // Go (1.13.5)
  'rust': 73,       // Rust (1.40.0)
  'kotlin': 78,     // Kotlin (1.3.70)
  'swift': 83,      // Swift (5.2.3)
  'ruby': 72,       // Ruby (2.7.0)
  'csharp': 51,     // C# (Mono 6.6.0.161)
  'typescript': 74  // TypeScript (3.7.4)
};

export class CodeExecutionService {
  private static instance: CodeExecutionService;
  private judge0Url: string;
  private judge0ApiKey?: string;
  private useSimulation: boolean;

  private constructor() {
    // Judge0 configuration from environment variables
    this.judge0Url = process.env.JUDGE0_URL || process.env.NEXT_PUBLIC_JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
    this.judge0ApiKey = process.env.JUDGE0_API_KEY || process.env.NEXT_PUBLIC_JUDGE0_API_KEY;
    
    // Use simulation if Judge0 is not configured
    this.useSimulation = !this.judge0ApiKey;
    
    if (this.useSimulation) {
      console.warn('Judge0 API key not configured. Using simulation mode.');
    }
  }

  static getInstance(): CodeExecutionService {
    if (!CodeExecutionService.instance) {
      CodeExecutionService.instance = new CodeExecutionService();
    }
    return CodeExecutionService.instance;
  }

  /**
   * Execute code with Judge0 API
   * @param request Code execution request
   * @returns Code execution result
   */
  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    // Use simulation if Judge0 is not configured
    if (this.useSimulation) {
      return this.simulateExecution(request);
    }

    try {
      // Execute code with test cases if provided
      if (request.testCases && request.testCases.length > 0) {
        return await this.executeWithTestCases(request);
      }

      // Single execution without test cases
      return await this.executeSingleSubmission(request);
    } catch (error) {
      console.error('Error executing code:', error);
      return {
        success: false,
        status: 'internal_error',
        message: 'Internal error occurred during code execution'
      };
    }
  }

  /**
   * Execute code with multiple test cases
   */
  private async executeWithTestCases(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    const testResults: Array<{ passed: boolean; input: string; expected: string; actual: string }> = [];
    let allPassed = true;
    let totalTime = 0;
    let maxMemory = 0;

    for (const testCase of request.testCases!) {
      const result = await this.executeSingleSubmission({
        ...request,
        stdin: testCase.input,
        expectedOutput: testCase.output
      });

      const actualOutput = (result.stdout || '').trim();
      const expectedOutput = testCase.output.trim();
      const passed = actualOutput === expectedOutput;

      testResults.push({
        passed,
        input: testCase.input,
        expected: expectedOutput,
        actual: actualOutput
      });

      if (!passed) {
        allPassed = false;
      }

      totalTime += result.executionTimeMs || 0;
      maxMemory = Math.max(maxMemory, result.memoryUsedKb || 0);
    }

    return {
      success: allPassed,
      status: allPassed ? 'solved' : 'wrong_answer',
      executionTimeMs: totalTime / request.testCases!.length,
      memoryUsedKb: maxMemory,
      testResults,
      message: allPassed 
        ? `All ${testResults.length} test cases passed!` 
        : `${testResults.filter(t => t.passed).length}/${testResults.length} test cases passed`
    };
  }

  /**
   * Execute a single submission with Judge0
   */
  private async executeSingleSubmission(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const languageId = this.getJudge0LanguageId(request.language);
        
        if (!languageId) {
          return {
            success: false,
            status: 'internal_error',
            message: `Unsupported language: ${request.language}`
          };
        }

        // Create submission with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout

        try {
          const submissionResponse = await fetch(`${this.judge0Url}/submissions?base64_encoded=false&wait=true`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-RapidAPI-Key': this.judge0ApiKey!,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            body: JSON.stringify({
              source_code: request.sourceCode,
              language_id: languageId,
              stdin: request.stdin || '',
              cpu_time_limit: request.timeLimit || 5,
              memory_limit: (request.memoryLimit || 256) * 1024, // Convert MB to KB
            }),
            signal: controller.signal
          });

          clearTimeout(timeout);

          // Handle rate limiting (429)
          if (submissionResponse.status === 429) {
            if (attempt < maxRetries - 1) {
              console.warn(`Rate limited by Judge0, retrying in ${retryDelay}ms...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
              continue;
            }
            throw new Error('Judge0 rate limit exceeded. Please try again later.');
          }

          // Handle server errors (5xx)
          if (submissionResponse.status >= 500) {
            if (attempt < maxRetries - 1) {
              console.warn(`Judge0 server error ${submissionResponse.status}, retrying...`);
              await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
              continue;
            }
            throw new Error('Judge0 is currently unavailable. Please try again later.');
          }

          if (!submissionResponse.ok) {
            throw new Error(`Judge0 API error: ${submissionResponse.status}`);
          }

          const submission = await submissionResponse.json();

          // Map Judge0 status to our status
          const status = this.mapJudge0Status(submission.status.id, submission);

          return {
            success: status === 'success' || status === 'solved',
            status,
            stdout: submission.stdout || undefined,
            stderr: submission.stderr || undefined,
            compileOutput: submission.compile_output || undefined,
            executionTimeMs: submission.time ? parseFloat(submission.time) * 1000 : undefined,
            memoryUsedKb: submission.memory || undefined,
            message: submission.status.description
          };
        } catch (error: any) {
          clearTimeout(timeout);
          
          // Don't retry on timeout
          if (error.name === 'AbortError') {
            return {
              success: false,
              status: 'time_limit_exceeded',
              message: 'Execution timed out (60 seconds)'
            };
          }
          
          throw error;
        }
      } catch (error: any) {
        lastError = error;
        console.error(`Judge0 execution attempt ${attempt + 1} failed:`, error);
        
        // Don't retry on certain errors
        if (error.message?.includes('Unsupported language') ||
            error.message?.includes('rate limit')) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    console.error('All Judge0 execution attempts failed:', lastError);
    return {
      success: false,
      status: 'internal_error',
      message: 'Failed to execute code. Please try again.'
    };
  }

  /**
   * Map Judge0 status ID to our status
   */
  private mapJudge0Status(statusId: number, submission: any): CodeExecutionResult['status'] {
    // Judge0 status IDs:
    // 1-2: In Queue/Processing
    // 3: Accepted
    // 4: Wrong Answer
    // 5: Time Limit Exceeded
    // 6: Compilation Error
    // 7: Runtime Error (SIGSEGV)
    // 8: Runtime Error (SIGXFSZ)
    // 9: Runtime Error (SIGFPE)
    // 10: Runtime Error (SIGABRT)
    // 11: Runtime Error (NZEC)
    // 12: Runtime Error (Other)
    // 13: Internal Error
    // 14: Exec Format Error

    switch (statusId) {
      case 3:
        return 'success';
      case 4:
        return 'wrong_answer';
      case 5:
        return 'time_limit_exceeded';
      case 6:
        return 'compilation_error';
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        return 'runtime_error';
      case 13:
      case 14:
        return 'internal_error';
      default:
        return 'internal_error';
    }
  }

  /**
   * Get Judge0 language ID from language string
   */
  private getJudge0LanguageId(language: string): number | null {
    return JUDGE0_LANGUAGE_IDS[language.toLowerCase()] || null;
  }

  /**
   * Simulate code execution (fallback when Judge0 is not configured)
   */
  private async simulateExecution(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate different outcomes based on the code content
    const hasError = request.sourceCode.includes('// ERROR');
    const hasTLE = request.sourceCode.includes('// TLE');
    const hasMLE = request.sourceCode.includes('// MLE');
    const hasWA = request.sourceCode.includes('// WA');
    
    if (hasError) {
      return {
        success: false,
        status: 'compilation_error',
        stderr: 'Compilation error: Syntax error on line 5',
        compileOutput: 'Error: Expected semicolon at end of statement',
        message: 'Failed to compile code'
      };
    }
    
    if (hasTLE) {
      return {
        success: false,
        status: 'time_limit_exceeded',
        executionTimeMs: (request.timeLimit || 1) * 1000 + 100,
        message: 'Time limit exceeded'
      };
    }
    
    if (hasMLE) {
      return {
        success: false,
        status: 'memory_limit_exceeded',
        memoryUsedKb: (request.memoryLimit || 128) * 1024 + 1000,
        message: 'Memory limit exceeded'
      };
    }
    
    if (hasWA) {
      return {
        success: false,
        status: 'wrong_answer',
        stdout: 'Output: 42\nExpected: 43',
        message: 'Wrong answer'
      };
    }
    
    // Simulate successful execution
    const executionTime = Math.floor(50 + Math.random() * 200);
    const memoryUsed = Math.floor(1000 + Math.random() * 5000);
    
    return {
      success: true,
      status: 'solved',
      stdout: request.expectedOutput || 'Correct answer!',
      executionTimeMs: executionTime,
      memoryUsedKb: memoryUsed,
      message: 'Code executed successfully (simulated)'
    };
  }

  /**
   * Validate if a language is supported
   * @param language Language identifier
   * @returns True if language is supported
   */
  isLanguageSupported(language: string): boolean {
    return language.toLowerCase() in JUDGE0_LANGUAGE_IDS;
  }

  /**
   * Get language display name
   * @param language Language identifier
   * @returns Display name for the language
   */
  getLanguageDisplayName(language: string): string {
    const languageNames: Record<string, string> = {
      'cpp': 'C++',
      'c': 'C',
      'java': 'Java',
      'python': 'Python',
      'javascript': 'JavaScript',
      'go': 'Go',
      'rust': 'Rust',
      'kotlin': 'Kotlin',
      'swift': 'Swift',
      'ruby': 'Ruby',
      'csharp': 'C#',
      'typescript': 'TypeScript'
    };
    return languageNames[language.toLowerCase()] || language;
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): Array<{ id: string; name: string; judge0Id: number }> {
    return Object.entries(JUDGE0_LANGUAGE_IDS).map(([id, judge0Id]) => ({
      id,
      name: this.getLanguageDisplayName(id),
      judge0Id
    }));
  }
}

export default CodeExecutionService;