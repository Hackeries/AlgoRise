import { NextRequest, NextResponse } from 'next/server';
import {
  cfGetProblems,
  cfGetUserStatus,
  getAdaptiveProblems,
  getSolvedProblems,
  CodeforcesProblem,
} from '@/lib/codeforces-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');
    const rating = parseInt(searchParams.get('rating') || '1200');
    const count = parseInt(searchParams.get('count') || '10');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      );
    }

    // Get all problems from Codeforces
    const problemsResponse = await cfGetProblems(
      tags.length > 0 ? tags : undefined
    );
    if (problemsResponse.status !== 'OK') {
      return NextResponse.json(
        {
          error: 'Failed to fetch problems',
          details: problemsResponse.comment,
        },
        { status: 500 }
      );
    }

    const problems: CodeforcesProblem[] =
      'result' in problemsResponse ? problemsResponse.result.problems : [];

    // Get user's solved problems
    const submissionsResponse = await cfGetUserStatus(handle);
    let solvedProblems = new Set<string>();

    if (
      submissionsResponse.status === 'OK' &&
      'result' in submissionsResponse
    ) {
      solvedProblems = getSolvedProblems(submissionsResponse.result);
    }

    // Get adaptive problems based on user rating
    const adaptiveProblems = getAdaptiveProblems(
      problems,
      rating,
      solvedProblems,
      count
    );

    return NextResponse.json({
      problems: adaptiveProblems,
      ratingRange: {
        min: Math.max(800, rating - 100),
        max: rating + 200,
      },
      totalAvailable: adaptiveProblems.length,
      solvedCount: solvedProblems.size,
    });
  } catch (error) {
    console.error('Error generating adaptive sheet:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
