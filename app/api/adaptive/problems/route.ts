import { NextRequest, NextResponse } from 'next/server';
import {
  cfGetProblems,
  cfGetUserStatus,
  getSolvedProblems,
  CodeforcesProblem,
} from '@/lib/codeforces-api';
import {
  fetchAtcoderProblemsWithDifficulty,
  getAtcoderSolvedSet,
} from '@/lib/atcoder-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');
    const rating = parseInt(searchParams.get('rating') || '1200');
    const count = parseInt(searchParams.get('count') || '10');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const atcoder = searchParams.get('atcoder') === '1' || true; // default include AtCoder

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      );
    }

    // Get problems: Codeforces + AtCoder (difficulty mapped)
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

    const cfProblems: CodeforcesProblem[] =
      'result' in problemsResponse ? problemsResponse.result.problems : [];

    // Map to consistent shape and include source
    const cfProblemsWithSource = cfProblems.map(p => ({
      ...p,
      source: 'Codeforces' as const,
    }));

    // AtCoder problems with mapped rating
    let acProblems: Array<{
      id: string;
      contestId: number | string;
      index?: string;
      name: string;
      rating?: number;
      tags: string[];
      source: 'AtCoder';
    }> = [];
    if (atcoder) {
      try {
        const atc = await fetchAtcoderProblemsWithDifficulty();
        acProblems = atc.map(p => ({
          id: p.id,
          contestId: p.contestId,
          name: p.title,
          rating: p.rating,
          tags: [],
          source: 'AtCoder' as const,
        }));
      } catch (e) {
        // fail open on AtCoder
        acProblems = [];
      }
    }

    // Get user's solved problems on both platforms
    const submissionsResponse = await cfGetUserStatus(handle);
    let solvedCF = new Set<string>();

    if (
      submissionsResponse.status === 'OK' &&
      'result' in submissionsResponse
    ) {
      solvedCF = getSolvedProblems(submissionsResponse.result);
    }

    const solvedAC = await getAtcoderSolvedSet(handle).catch(() => new Set<string>());

    // Filter by rating window [rating-100, rating+200] across platforms and exclude solved
    const minRating = Math.max(800, rating - 100);
    const maxRating = rating + 200;

    const filterAndLimit = <T extends { rating?: number; source?: string }>(
      list: T[],
      isSolved: (item: any) => boolean
    ) =>
      list
        .filter(p => typeof p.rating === 'number' && p.rating! >= minRating && p.rating! <= maxRating)
        .filter(p => !isSolved(p))
        .slice(0, Math.max(0, Math.floor(count / 2)));

    const cfFiltered = filterAndLimit(cfProblemsWithSource as any, (p: any) =>
      solvedCF.has(`${p.contestId}${p.index}`)
    );

    const acFiltered = filterAndLimit(acProblems as any, (p: any) => solvedAC.has(p.id));

    // Merge and fill up to count, prioritizing CF then AC
    let merged: any[] = [...cfFiltered, ...acFiltered];
    if (merged.length < count) {
      const extraCF = (cfProblemsWithSource as any)
        .filter((p: any) => typeof p.rating === 'number' && p.rating! >= minRating && p.rating! <= maxRating)
        .filter((p: any) => !solvedCF.has(`${p.contestId}${p.index}`))
        .slice(0, count - merged.length);
      merged = [...merged, ...extraCF];
    }

    return NextResponse.json({
      problems: merged,
      ratingRange: { min: minRating, max: maxRating },
      totals: {
        cf: cfFiltered.length,
        atcoder: acFiltered.length,
      },
      solvedCounts: {
        cf: solvedCF.size,
        atcoder: solvedAC.size,
      },
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
