// API route to get submission status
// Part 4: Code Execution & Judge0 Integration

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  const { id: battleId, submissionId } = await params;
  
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify user is a participant in this battle
    const { data: participant, error: participantError } = await supabase
      .from("battle_participants")
      .select("id")
      .eq("battle_id", battleId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (participantError) {
      console.error("Error checking participant:", participantError);
      return NextResponse.json({ error: "Failed to verify participant" }, { status: 500 });
    }

    if (!participant) {
      return NextResponse.json({ error: "Not a participant in this battle" }, { status: 403 });
    }

    // Get submission
    const { data: submission, error: submissionError } = await supabase
      .from("battle_submissions")
      .select("*")
      .eq("id", submissionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (submissionError) {
      console.error("Error fetching submission:", submissionError);
      return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 });
    }

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Return submission data with user-friendly structure
    return NextResponse.json({
      id: submission.id,
      status: submission.status,
      verdict: mapStatusToVerdict(submission.status),
      executionTimeMs: submission.execution_time_ms,
      memoryUsedKb: submission.memory_kb,
      stdout: submission.stdout,
      stderr: submission.stderr,
      compileOutput: submission.compile_output,
      failedTestCase: submission.failed_test_case,
      points: submission.points,
      submittedAt: submission.submitted_at,
      // For WA, provide expected vs actual output (if available)
      expectedOutput: submission.expected_output,
      actualOutput: submission.actual_output,
      // Progress tracking (for multi-test execution)
      currentTest: submission.current_test,
      totalTests: submission.total_tests
    });

  } catch (error) {
    console.error("Error in GET /api/battles/[id]/submissions/[submissionId]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Map internal status to user-friendly verdict
function mapStatusToVerdict(status: string): string {
  const verdictMap: Record<string, string> = {
    'pending': 'PENDING',
    'compiling': 'PENDING',
    'running': 'RUNNING',
    'solved': 'AC',
    'wrong_answer': 'WA',
    'time_limit_exceeded': 'TLE',
    'memory_limit_exceeded': 'MLE',
    'runtime_error': 'RE',
    'compilation_error': 'CE',
    'internal_error': 'ERROR'
  };

  return verdictMap[status] || 'UNKNOWN';
}
