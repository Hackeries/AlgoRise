import { NextRequest, NextResponse } from 'next/server';
import {
  cfGetUserInfo,
  cfGetUserStatus,
  cfGetUserRating,
  CodeforcesUser,
  CodeforcesSubmission,
} from '@/lib/codeforces-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle1 = searchParams.get('handle1');
    const handle2 = searchParams.get('handle2');

    if (!handle1) {
      return NextResponse.json(
        { error: 'Primary handle (handle1) is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching user info for handles: ${handle1}, ${handle2}`);

    // Fetch data for handle1
    const user1Data = await fetchUserData(handle1);
    if (user1Data.error) {
      return NextResponse.json(user1Data, { status: 404 });
    }

    let user2Data = null;
    if (handle2) {
      user2Data = await fetchUserData(handle2);
      if (user2Data.error) {
        return NextResponse.json(user2Data, { status: 404 });
      }
    }

    return NextResponse.json({
      user1: user1Data,
      user2: user2Data,
    });
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function fetchUserData(handle: string) {
  try {
    // Fetch user info
    const userResponse = await cfGetUserInfo(handle);
    if (
      userResponse.status !== 'OK' ||
      !('result' in userResponse) ||
      !userResponse.result
    ) {
      return {
        error:
          userResponse.comment?.includes('not found') ||
          userResponse.comment?.includes('400')
            ? `User '${handle}' not found on Codeforces. Please check the handle and try again.`
            : 'Codeforces API error',
        details: userResponse.comment,
        handle: handle,
      };
    }

    const user: CodeforcesUser = userResponse.result[0];

    // Fetch user submissions
    const submissionsResponse = await cfGetUserStatus(handle, undefined, 1000);
    let submissions: CodeforcesSubmission[] = [];
    if (
      submissionsResponse.status === 'OK' &&
      'result' in submissionsResponse &&
      submissionsResponse.result
    ) {
      submissions = submissionsResponse.result;
    }

    // Fetch rating history
    const ratingResponse = await cfGetUserRating(handle);
    let ratingHistory: any[] = [];
    if (
      ratingResponse.status === 'OK' &&
      'result' in ratingResponse &&
      ratingResponse.result
    ) {
      ratingHistory = ratingResponse.result;
    }

    // Calculate stats
    const solvedProblems = new Set<string>();
    const tagCount: Record<string, number> = {};
    const difficultyCount: Record<string, number> = {};

    submissions.forEach(submission => {
      if (submission.verdict === 'OK') {
        const problemKey = `${submission.problem.contestId}${submission.problem.index}`;
        if (!solvedProblems.has(problemKey)) {
          solvedProblems.add(problemKey);

          // Count tags
          submission.problem.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          });

          // Count difficulty
          const rating = submission.problem.rating || 0;
          const difficulty = getRatingCategory(rating);
          difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1;
        }
      }
    });

    return {
      user: {
        ...user,
        verified: true,
        avatar: (user as any).titlePhoto || '/placeholder-user.jpg',
      },
      stats: {
        totalSolved: solvedProblems.size,
        currentRating: user.rating || 0,
        maxRating: user.maxRating || 0,
        tagDistribution: tagCount,
        difficultyDistribution: difficultyCount,
        ratingHistory,
        contestsParticipated: ratingHistory.length,
        bestRank:
          ratingHistory.length > 0
            ? Math.min(...ratingHistory.map((r: any) => r.rank))
            : 0,
      },
    };
  } catch (error) {
    console.error(`Error fetching data for handle ${handle}:`, error);
    return {
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function getRatingCategory(rating: number): string {
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
