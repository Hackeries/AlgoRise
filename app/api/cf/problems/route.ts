import { NextRequest, NextResponse } from 'next/server';
import {
  cfGetProblems,
  cfGetUserStatus,
  getSolvedProblems,
  CodeforcesProblem,
} from '@/lib/codeforces-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');
    const rating = Number(searchParams.get('rating') || '1500');
    const tagsParam = searchParams.get('tags') || '';
    const count = Number(searchParams.get('count') || '20');

    const tags = tagsParam
      ? tagsParam
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
      : [];

    console.log(
      `Fetching problems for rating ${rating}, tags: [${tags.join(', ')}], count: ${count}`
    );

    // Get all problems from Codeforces
    const problemsResponse = await cfGetProblems(
      tags.length > 0 ? tags : undefined
    );

    if (problemsResponse.status !== 'OK') {
      return NextResponse.json(
        {
          error: 'Failed to fetch problems from Codeforces',
          details: problemsResponse.comment,
        },
        { status: 500 }
      );
    }

    if (!('result' in problemsResponse) || !problemsResponse.result) {
      return NextResponse.json(
        {
          error: 'No problems data received from Codeforces',
        },
        { status: 500 }
      );
    }

    let allProblems = problemsResponse.result.problems;
    console.log(`Fetched ${allProblems.length} total problems from Codeforces`);

    // Get user's solved problems if handle is provided
    let solvedProblems = new Set<string>();
    if (handle) {
      const submissionsResponse = await cfGetUserStatus(handle);
      if (
        submissionsResponse.status === 'OK' &&
        'result' in submissionsResponse &&
        submissionsResponse.result
      ) {
        solvedProblems = getSolvedProblems(submissionsResponse.result);
        console.log(
          `User ${handle} has solved ${solvedProblems.size} problems`
        );
      }
    }

    // Filter problems based on criteria
    const filteredProblems = allProblems
      .filter((problem: CodeforcesProblem) => {
        // Exclude solved problems
        const problemKey = `${problem.contestId}${problem.index}`;
        if (solvedProblems.has(problemKey)) return false;

        // Filter by rating (±200 range)
        if (problem.rating) {
          const diff = Math.abs(problem.rating - rating);
          if (diff > 200) return false;
        }

        // Filter by tags if specified
        if (tags.length > 0) {
          const hasRequiredTag = tags.some(tag => problem.tags.includes(tag));
          if (!hasRequiredTag) return false;
        }

        return true;
      })
      .sort(() => Math.random() - 0.5) // Randomize order
      .slice(0, count);

    console.log(`Filtered to ${filteredProblems.length} recommended problems`);

    // Group problems by difficulty
    const grouped = {
      easier: filteredProblems.filter(
        (p: CodeforcesProblem) => p.rating && p.rating < rating - 50
      ),
      target: filteredProblems.filter(
        (p: CodeforcesProblem) => p.rating && Math.abs(p.rating - rating) <= 50
      ),
      harder: filteredProblems.filter(
        (p: CodeforcesProblem) => p.rating && p.rating > rating + 50
      ),
      unrated: filteredProblems.filter((p: CodeforcesProblem) => !p.rating),
    };

    return NextResponse.json({
      problems: filteredProblems.map((problem: CodeforcesProblem) => ({
        id: `${problem.contestId}${problem.index}`,
        contestId: problem.contestId,
        index: problem.index,
        name: problem.name,
        type: problem.type,
        rating: problem.rating,
        tags: problem.tags,
        url: `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`,
        difficulty: getDifficultyLevel(problem.rating),
        recommendationScore: calculateScore(problem, rating, tags),
      })),
      grouped,
      stats: {
        total: filteredProblems.length,
        userSolved: solvedProblems.size,
        availableCount: allProblems.length - solvedProblems.size,
        filterCriteria: {
          rating: `${rating - 200} - ${rating + 200}`,
          tags: tags,
          excludingSolved: handle ? true : false,
        },
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching problem recommendations:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function getDifficultyLevel(rating?: number): string {
  if (!rating) return 'Unrated';
  if (rating < 1000) return 'Beginner';
  if (rating < 1200) return 'Newbie';
  if (rating < 1400) return 'Pupil';
  if (rating < 1600) return 'Specialist';
  if (rating < 1900) return 'Expert';
  if (rating < 2100) return 'Candidate Master';
  if (rating < 2300) return 'Master';
  if (rating < 2400) return 'International Master';
  return 'Grandmaster';
}

function calculateScore(
  problem: any,
  targetRating: number,
  preferredTags: string[]
): number {
  let score = 100;

  // Rating proximity bonus
  if (problem.rating) {
    const ratingDiff = Math.abs(problem.rating - targetRating);
    score += Math.max(0, 50 - ratingDiff / 4);
  }

  // Tag preference bonus
  const matchingTags = problem.tags.filter((tag: string) =>
    preferredTags.includes(tag)
  );
  score += matchingTags.length * 20;

  // Recency bonus (newer contests get slight preference)
  if (problem.contestId > 1700) {
    score += 10;
  }

  return Math.round(score);
}
