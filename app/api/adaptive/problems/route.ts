import { NextRequest, NextResponse } from 'next/server';
import {
  cfGetProblems,
  cfGetUserStatus,
  getAdaptiveProblems,
  getSolvedProblems,
  CodeforcesProblem,
} from '@/lib/codeforces-api';

// Define response type
interface AdaptiveProblemsResponse {
  problems: CodeforcesProblem[];
  ratingRange: { min: number; max: number };
  totalAvailable: number;
  solvedCount: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const handle = searchParams.get('handle');
    if (!handle) {
      return NextResponse.json({ error: 'Handle is required' }, { status: 400 });
    }

    const ratingParamStr = searchParams.get('rating');
    if (!ratingParamStr) {
      return NextResponse.json({ error: 'Rating parameter is required' }, { status: 400 });
    }

    const ratingParam = parseInt(ratingParamStr);
    if (isNaN(ratingParam)) {
      return NextResponse.json({ error: 'Invalid rating parameter' }, { status: 400 });
    }

    const countParamStr = searchParams.get('count');
    const count = countParamStr ? parseInt(countParamStr) : 70;
    if (isNaN(count) || count <= 0) {
      return NextResponse.json({ error: 'Invalid count parameter' }, { status: 400 });
    }

    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

    // Floor rating to nearest 100
    const floorRating = Math.floor(ratingParam / 100) * 100;
    const minRating = Math.max(800, floorRating - 200);
    const maxRating = floorRating + 200;

    // Fetch all problems from Codeforces
    const problemsResponse = await cfGetProblems(tags.length > 0 ? tags : undefined);
    if (problemsResponse.status !== 'OK' || !('result' in problemsResponse)) {
      return NextResponse.json(
        { error: 'Failed to fetch problems', details: problemsResponse.comment },
        { status: 500 }
      );
    }
    const allProblems: CodeforcesProblem[] = problemsResponse.result.problems;

    // Filter problems by rating range
    const filteredProblems = allProblems.filter(
      (p) => p.rating !== undefined && p.rating >= minRating && p.rating <= maxRating
    );

    // Get user's solved problems
    const submissionsResponse = await cfGetUserStatus(handle);
    const solvedProblems =
      submissionsResponse.status === 'OK' && 'result' in submissionsResponse
        ? getSolvedProblems(submissionsResponse.result)
        : new Set<string>();

    // Remove solved problems
    const unsolvedProblems = filteredProblems.filter(
      (p) => !solvedProblems.has(`${p.contestId}-${p.index}`)
    );

    // Select top N adaptive problems
    const adaptiveProblems = getAdaptiveProblems(
      unsolvedProblems,
      floorRating,
      solvedProblems,
      count
    );

    const response: AdaptiveProblemsResponse = {
      problems: adaptiveProblems,
      ratingRange: { min: minRating, max: maxRating },
      totalAvailable: adaptiveProblems.length,
      solvedCount: solvedProblems.size,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating adaptive sheet:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}
