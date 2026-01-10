import { NextRequest, NextResponse } from 'next/server';
import { cfGetUserStatus, CodeforcesSubmission } from '@/lib/codeforces-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      );
    }

    // Fetch all user submissions (no limit to get complete data)
    const submissionsResponse = await cfGetUserStatus(handle);

    if (submissionsResponse.status !== 'OK') {
      return NextResponse.json(
        {
          error: 'Failed to fetch user submissions',
          details: submissionsResponse.comment,
        },
        { status: 500 }
      );
    }

    const submissions =
      'result' in submissionsResponse ? submissionsResponse.result || [] : [];

    // Extract unique solved problems
    const solvedProblems = new Set<string>();
    const solvedProblemDetails: Array<{
      contestId: number;
      index: string;
      name: string;
      rating?: number;
      tags: string[];
      solvedAt: number;
    }> = [];

    submissions.forEach((submission: CodeforcesSubmission) => {
      if (submission.verdict === 'OK') {
        const problemKey = `${submission.problem.contestId}${submission.problem.index}`;
        if (!solvedProblems.has(problemKey)) {
          solvedProblems.add(problemKey);
          solvedProblemDetails.push({
            contestId: submission.problem.contestId,
            index: submission.problem.index,
            name: submission.problem.name,
            rating: submission.problem.rating,
            tags: submission.problem.tags,
            solvedAt: submission.creationTimeSeconds,
          });
        }
      }
    });

    return NextResponse.json({
      handle,
      totalSolved: solvedProblems.size,
      solvedProblemIds: Array.from(solvedProblems),
      solvedProblems: solvedProblemDetails
        .sort((a, b) => b.solvedAt - a.solvedAt) // Most recent first
        .slice(0, 100), // Return last 100 for performance
    });
  } catch (error) {
    console.error('Error fetching solved problems:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
