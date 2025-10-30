/**
 * PART 5: RACE CONDITION PREVENTION
 * 
 * Handles scenarios where:
 * 1. Both players submit same problem simultaneously
 * 2. Conflicting verdicts appear on different clients
 * 3. Server timestamp is always source of truth
 */

import { createClient } from '@/lib/supabase/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SubmissionRecord {
  id: string;
  battleId: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  verdict?: 'AC' | 'WA' | 'TLE' | 'RE' | 'CE' | 'MLE';
  executionTime?: number;
  memory?: number;
  
  // CRITICAL: Server timestamps are source of truth
  submittedAt: string;     // ISO timestamp from server (when submission received)
  judgedAt?: string;       // ISO timestamp from server (when Judge0 returned)
  
  // Client timestamp (for reference only, not used for ordering)
  clientSubmittedAt?: string;
}

export interface SubmissionOrderingResult {
  submissions: SubmissionRecord[];
  winner?: {
    userId: string;
    submissionId: string;
    submittedAt: string;
    marginMs: number; // How many milliseconds they won by
  };
}

// ============================================================================
// SERVER TIMESTAMP SUBMISSION
// ============================================================================

/**
 * Submit code to server and get authoritative server timestamp
 * 
 * This ensures the server records the EXACT time it received the submission,
 * preventing any client-side time manipulation.
 */
export async function submitWithServerTimestamp(
  battleId: string,
  userId: string,
  problemId: string,
  code: string,
  language: string
): Promise<SubmissionRecord> {
  const supabase = createClient();

  // Record client submission time (for logging/debugging only)
  const clientSubmittedAt = new Date().toISOString();

  // Insert into database - server will set submittedAt with current_timestamp
  const { data, error } = await supabase
    .from('battle_submissions')
    .insert({
      battle_id: battleId,
      user_id: userId,
      problem_id: problemId,
      code,
      language,
      client_submitted_at: clientSubmittedAt,
      // submittedAt will be set by database with NOW()
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit: ${error.message}`);
  }

  return data as SubmissionRecord;
}

// ============================================================================
// HANDLE SIMULTANEOUS SUBMISSIONS
// ============================================================================

/**
 * Determine order of submissions when multiple players submit same problem
 * 
 * Rules:
 * 1. Server timestamp (submittedAt) is source of truth
 * 2. If submissions are within same second, order by milliseconds
 * 3. First to reach server wins (even by 10ms)
 * 4. Display exact submission time to both players
 */
export async function resolveSubmissionOrder(
  battleId: string,
  problemId: string
): Promise<SubmissionOrderingResult> {
  const supabase = createClient();

  // Get all submissions for this problem in this battle, ordered by server timestamp
  const { data: submissions, error } = await supabase
    .from('battle_submissions')
    .select('*')
    .eq('battle_id', battleId)
    .eq('problem_id', problemId)
    .order('submitted_at', { ascending: true });

  if (error || !submissions || submissions.length === 0) {
    return { submissions: [] };
  }

  const typedSubmissions = submissions as SubmissionRecord[];

  // If only one submission, they're the winner
  if (typedSubmissions.length === 1) {
    return {
      submissions: typedSubmissions,
      winner: {
        userId: typedSubmissions[0].userId,
        submissionId: typedSubmissions[0].id,
        submittedAt: typedSubmissions[0].submittedAt,
        marginMs: 0,
      },
    };
  }

  // Multiple submissions - first one wins
  const firstSubmission = typedSubmissions[0];
  const secondSubmission = typedSubmissions[1];

  // Calculate time difference in milliseconds
  const firstTime = new Date(firstSubmission.submittedAt).getTime();
  const secondTime = new Date(secondSubmission.submittedAt).getTime();
  const marginMs = secondTime - firstTime;

  return {
    submissions: typedSubmissions,
    winner: {
      userId: firstSubmission.userId,
      submissionId: firstSubmission.id,
      submittedAt: firstSubmission.submittedAt,
      marginMs,
    },
  };
}

// ============================================================================
// VERDICT SYNCHRONIZATION
// ============================================================================

/**
 * Update submission with verdict from Judge0
 * 
 * This ensures all clients receive the same authoritative verdict
 * Server records judgedAt timestamp when verdict is received from Judge0
 */
export async function updateSubmissionVerdict(
  submissionId: string,
  verdict: SubmissionRecord['verdict'],
  executionTime: number,
  memory: number,
  testCasesPassed: number,
  totalTestCases: number
): Promise<SubmissionRecord> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('battle_submissions')
    .update({
      verdict,
      execution_time: executionTime,
      memory,
      test_cases_passed: testCasesPassed,
      total_test_cases: totalTestCases,
      // judgedAt will be set by database with NOW()
    })
    .eq('id', submissionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update verdict: ${error.message}`);
  }

  return data as SubmissionRecord;
}

// ============================================================================
// BROADCAST AUTHORITATIVE VERDICT
// ============================================================================

/**
 * Broadcast verdict to all clients in the battle
 * 
 * This ensures that if client A sees "AC" and client B sees "WA",
 * the server will broadcast the TRUTH to both within 2 seconds
 */
export async function broadcastAuthoritativeVerdict(
  battleId: string,
  submission: SubmissionRecord
) {
  const supabase = createClient();

  const channel = supabase.channel(`battle:${battleId}`);

  await channel.send({
    type: 'broadcast',
    event: 'submission_verdict',
    payload: {
      type: 'submission_verdict',
      userId: submission.userId,
      timestamp: submission.judgedAt || new Date().toISOString(),
      data: {
        submissionId: submission.id,
        problemId: submission.problemId,
        verdict: submission.verdict,
        executionTime: submission.executionTime,
        memory: submission.memory,
        submittedAt: submission.submittedAt,
        judgedAt: submission.judgedAt,
      },
    },
  });
}

// ============================================================================
// SUBMISSION DISPLAY FORMATTING
// ============================================================================

/**
 * Format submission time for display to users
 * Shows exact time down to the second (HH:MM:SS)
 */
export function formatSubmissionTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format time difference for display
 * e.g., "You submitted 340ms faster"
 */
export function formatTimeDifference(marginMs: number): string {
  if (marginMs < 1000) {
    return `${marginMs}ms`;
  } else {
    const seconds = (marginMs / 1000).toFixed(2);
    return `${seconds}s`;
  }
}

// ============================================================================
// CLIENT SYNCHRONIZATION CHECK
// ============================================================================

/**
 * Check if client's view of submission matches server reality
 * If not, force refresh to get authoritative state
 */
export async function verifySubmissionSync(
  submissionId: string,
  expectedVerdict?: string
): Promise<{
  inSync: boolean;
  actualSubmission: SubmissionRecord | null;
  needsRefresh: boolean;
}> {
  const supabase = createClient();

  const { data: submission, error } = await supabase
    .from('battle_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (error || !submission) {
    return {
      inSync: false,
      actualSubmission: null,
      needsRefresh: true,
    };
  }

  const typedSubmission = submission as SubmissionRecord;

  // If we expected a verdict but it doesn't match, we're out of sync
  if (expectedVerdict && typedSubmission.verdict !== expectedVerdict) {
    return {
      inSync: false,
      actualSubmission: typedSubmission,
      needsRefresh: true,
    };
  }

  return {
    inSync: true,
    actualSubmission: typedSubmission,
    needsRefresh: false,
  };
}

// ============================================================================
// HANDLE CONFLICTING VERDICTS
// ============================================================================

/**
 * If clients show different verdicts, refresh to get server truth
 */
export async function resolveConflictingVerdicts(
  battleId: string,
  problemId: string
): Promise<SubmissionRecord[]> {
  const supabase = createClient();

  // Get all submissions for this problem, ordered by server timestamp
  const { data: submissions, error } = await supabase
    .from('battle_submissions')
    .select('*')
    .eq('battle_id', battleId)
    .eq('problem_id', problemId)
    .order('submitted_at', { ascending: true });

  if (error || !submissions) {
    throw new Error('Failed to resolve conflicting verdicts');
  }

  return submissions as SubmissionRecord[];
}
