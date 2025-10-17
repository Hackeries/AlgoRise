// Code execution service for Code Battle Arena

export interface CodeExecutionRequest {
  sourceCode: string;
  language: string;
  stdin?: string;
  expectedOutput?: string;
  timeLimit?: number; // in seconds
  memoryLimit?: number; // in MB
}

export interface CodeExecutionResult {
  success: boolean;
  status: 'success' | 'compilation_error' | 'runtime_error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'wrong_answer' | 'internal_error';
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  executionTimeMs?: number;
  memoryUsedKb?: number;
  message?: string;
}

export class CodeExecutionService {
  private static instance: CodeExecutionService;
  private baseUrl: string;

  private constructor() {
    // In a real implementation, this would be configured with the judge system URL
    this.baseUrl = process.env.JUDGE_SYSTEM_URL || 'http://localhost:8080';
  }

  static getInstance(): CodeExecutionService {
    if (!CodeExecutionService.instance) {
      CodeExecutionService.instance = new CodeExecutionService();
    }
    return CodeExecutionService.instance;
  }

  /**
   * Execute code with the judge system
   * @param request Code execution request
   * @returns Code execution result
   */
  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    try {
      // In a real implementation, this would call an actual judge system API
      // For now, we'll simulate the execution with random results
      
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
        status: 'success',
        stdout: 'Correct answer!',
        executionTimeMs: executionTime,
        memoryUsedKb: memoryUsed,
        message: 'Code executed successfully'
      };
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
   * Validate if a language is supported
   * @param language Language identifier
   * @returns True if language is supported
   */
  isLanguageSupported(language: string): boolean {
    const supportedLanguages = ['cpp', 'c', 'java', 'python', 'javascript'];
    return supportedLanguages.includes(language.toLowerCase());
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
      'javascript': 'JavaScript'
    };
    return languageNames[language.toLowerCase()] || language;
  }
}

export default CodeExecutionService;