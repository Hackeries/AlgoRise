/**
 * Submission Queue - Bull-based job queue for code execution
 */

import Queue from 'bull';
import redis from '../redis';
import { CodeExecutionService } from '../code-execution-service';
import { createClient } from '@supabase/supabase-js';
import AntiCheatSystem from './anti-cheat';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SubmissionJob {
  submissionId: string;
  matchId: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  testCases: Array<{ input: string; output: string }>;
}

export interface SubmissionResult {
  submissionId: string;
  status: string;
  testsPassed: number;
  testsTotal: number;
  executionTime?: number;
  memoryUsed?: number;
  score: number;
  details?: any;
}

class SubmissionQueueService {
  private static instance: SubmissionQueueService;
  private queue: Queue.Queue<SubmissionJob>;
  private codeExecutionService: CodeExecutionService;
  private antiCheatSystem: typeof AntiCheatSystem;
  
  private constructor() {
    // Initialize Bull queue with Redis connection
    this.queue = new Queue<SubmissionJob>('battle-submissions', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 200 // Keep last 200 failed jobs
      }
    });

    this.codeExecutionService = CodeExecutionService.getInstance();
    this.antiCheatSystem = AntiCheatSystem;

    // Setup queue processors
    this.setupProcessors();
    this.setupEventHandlers();
  }

  static getInstance(): SubmissionQueueService {
    if (!SubmissionQueueService.instance) {
      SubmissionQueueService.instance = new SubmissionQueueService();
    }
    return SubmissionQueueService.instance;
  }

  /**
   * Add submission to queue
   */
  async addSubmission(job: SubmissionJob): Promise<Queue.Job<SubmissionJob>> {
    console.log(`Adding submission ${job.submissionId} to queue`);
    
    // Update submission status to pending
    await supabase
      .from('battle_submissions')
      .update({ status: 'pending' })
      .eq('id', job.submissionId);

    return this.queue.add(job, {
      jobId: job.submissionId, // Use submission ID as job ID for idempotence
      priority: this.calculatePriority(job)
    });
  }

  /**
   * Calculate job priority (higher for ranked matches)
   */
  private calculatePriority(job: SubmissionJob): number {
    // Lower number = higher priority in Bull
    // Ranked matches get priority 1, others get priority 5
    return 5; // Default priority, can be enhanced based on match mode
  }

  /**
   * Setup queue processors
   */
  private setupProcessors(): void {
    // Main processor - executes code
    this.queue.process(10, async (job) => {
      return this.processSubmission(job.data);
    });

    console.log('Submission queue processors initialized');
  }

  /**
   * Process a submission
   */
  private async processSubmission(data: SubmissionJob): Promise<SubmissionResult> {
    const { submissionId, matchId, userId, problemId, code, language, testCases } = data;

    console.log(`Processing submission ${submissionId} for user ${userId}`);

    try {
      // Update status to executing
      await supabase
        .from('battle_submissions')
        .update({ status: 'executing', executed_at: new Date().toISOString() })
        .eq('id', submissionId);

      // Execute code
      const executionResult = await this.codeExecutionService.executeCode({
        sourceCode: code,
        language,
        testCases,
        timeLimit: 2,
        memoryLimit: 256
      });

      // Calculate test results
      const testsPassed = executionResult.testResults?.filter(t => t.passed).length || 0;
      const testsTotal = testCases.length;

      // Map execution status
      let status = 'internal_error';
      if (executionResult.status === 'solved' || executionResult.status === 'success') {
        status = testsPassed === testsTotal ? 'accepted' : 'wrong_answer';
      } else {
        status = executionResult.status;
      }

      // Generate code fingerprint for plagiarism detection
      const fingerprint = this.antiCheatSystem.generateCodeFingerprint(code);
      const astHash = this.antiCheatSystem.generateASTHash(code, language);

      // Update submission in database
      await supabase
        .from('battle_submissions')
        .update({
          status,
          tests_passed: testsPassed,
          tests_total: testsTotal,
          runtime_ms: executionResult.executionTimeMs,
          memory_kb: executionResult.memoryUsedKb,
          code_fingerprint: fingerprint,
          ast_hash: astHash,
          metadata: {
            testResults: executionResult.testResults,
            stdout: executionResult.stdout,
            stderr: executionResult.stderr,
            compileOutput: executionResult.compileOutput
          }
        })
        .eq('id', submissionId);

      // Run plagiarism check in background (don't block)
      this.runPlagiarismCheck(submissionId, code, language, matchId, problemId).catch(err => {
        console.error('Plagiarism check failed:', err);
      });

      const result: SubmissionResult = {
        submissionId,
        status,
        testsPassed,
        testsTotal,
        executionTime: executionResult.executionTimeMs,
        memoryUsed: executionResult.memoryUsedKb,
        score: 0, // Will be calculated by game server
        details: executionResult.testResults
      };

      console.log(`Submission ${submissionId} processed: ${status}`);

      return result;
    } catch (error) {
      console.error(`Error processing submission ${submissionId}:`, error);

      // Update submission with error
      await supabase
        .from('battle_submissions')
        .update({
          status: 'internal_error',
          metadata: { error: String(error) }
        })
        .eq('id', submissionId);

      throw error;
    }
  }

  /**
   * Run plagiarism check
   */
  private async runPlagiarismCheck(
    submissionId: string,
    code: string,
    language: string,
    matchId: string,
    problemId: string
  ): Promise<void> {
    try {
      const results = await this.antiCheatSystem.checkPlagiarism(
        submissionId,
        code,
        language,
        matchId,
        problemId
      );

      if (results.length > 0) {
        console.log(`Plagiarism detected for submission ${submissionId}:`, results);
      }
    } catch (error) {
      console.error('Plagiarism check error:', error);
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.queue.on('completed', (job, result) => {
      console.log(`Job ${job.id} completed`);
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });

    this.queue.on('stalled', (job) => {
      console.warn(`Job ${job.id} stalled`);
    });

    this.queue.on('error', (error) => {
      console.error('Queue error:', error);
    });
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount()
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<Queue.Job<SubmissionJob> | null> {
    return this.queue.getJob(jobId);
  }

  /**
   * Pause queue
   */
  async pause(): Promise<void> {
    await this.queue.pause();
  }

  /**
   * Resume queue
   */
  async resume(): Promise<void> {
    await this.queue.resume();
  }

  /**
   * Clean old jobs
   */
  async clean(grace: number = 86400000): Promise<void> {
    // Clean jobs older than grace period (default 24 hours)
    await this.queue.clean(grace, 'completed');
    await this.queue.clean(grace, 'failed');
  }

  /**
   * Close queue
   */
  async close(): Promise<void> {
    await this.queue.close();
  }
}

export default SubmissionQueueService.getInstance();
