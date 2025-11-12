/**
 * Submit Code API
 * POST /api/battle-arena/submit
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import SubmissionQueueService from '@/lib/battle-arena/submission-queue';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { matchId, problemId, code, language } = body;

    // Validate inputs
    if (!matchId || !problemId || !code || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is in this match
    const { data: matchPlayer } = await supabase
      .from('match_players')
      .select('*')
      .eq('match_id', matchId)
      .eq('user_id', user.id)
      .single();

    if (!matchPlayer) {
      return NextResponse.json(
        { error: 'Not authorized to submit to this match' },
        { status: 403 }
      );
    }

    // Verify match is in progress
    const { data: match } = await supabase
      .from('matches')
      .select('status, problem_ids')
      .eq('id', matchId)
      .single();

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    if (match.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Match is not in progress' },
        { status: 400 }
      );
    }

    // Verify problem is part of this match
    const problemIds = match.problem_ids as string[];
    if (!problemIds.includes(problemId)) {
      return NextResponse.json(
        { error: 'Problem is not part of this match' },
        { status: 400 }
      );
    }

    // Get problem test cases
    const { data: problem } = await supabase
      .from('problems')
      .select('test_cases')
      .eq('cf_id', problemId)
      .single();

    if (!problem || !problem.test_cases) {
      return NextResponse.json(
        { error: 'Problem test cases not found' },
        { status: 404 }
      );
    }

    // Create submission record
    const submissionId = uuidv4();
    const { error: insertError } = await supabase
      .from('battle_submissions')
      .insert({
        id: submissionId,
        match_id: matchId,
        user_id: user.id,
        problem_id: problemId,
        language,
        code,
        status: 'pending',
        tests_total: problem.test_cases.length
      });

    if (insertError) {
      throw insertError;
    }

    // Add to submission queue
    await SubmissionQueueService.addSubmission({
      submissionId,
      matchId,
      userId: user.id,
      problemId,
      code,
      language,
      testCases: problem.test_cases
    });

    return NextResponse.json({
      success: true,
      submissionId,
      message: 'Submission queued for execution'
    });
  } catch (error) {
    console.error('Error submitting code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
