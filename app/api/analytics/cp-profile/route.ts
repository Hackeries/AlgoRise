import {
  cfGetUserInfo,
  cfGetUserStatus,
  cfGetUserRating,
  type CodeforcesUser,
  type CodeforcesSubmission,
} from '@/lib/codeforces-api';
import { type NextRequest, NextResponse } from 'next/server';

interface CPAnalytics {
  user: CodeforcesUser;
  stats: {
    totalSolved: number;
    totalSubmissions: number;
    acceptanceRate: number;
    currentRating: number;
    maxRating: number;
    ratingChange: number;
    rank: string;
    maxRank: string;
    contests: number;
  };
  topicStats: Record<
    string,
    { solved: number; attempted: number; accuracy: number }
  >;
  difficultyStats: {
    easy: number;
    medium: number;
    hard: number;
  };
  recentSubmissions: CodeforcesSubmission[];
  ratingHistory: Array<{
    contestId: number;
    contestName: string;
    rating: number;
    ratingChange: number;
    date: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle parameter is required' },
        { status: 400 }
      );
    }

    const userResponse = await cfGetUserInfo(handle);
    if (userResponse.status !== 'OK') {
      return NextResponse.json(
        { error: 'User not found on Codeforces' },
        { status: 404 }
      );
    }

    const userResult = (userResponse as any).result;
    if (!userResult || !Array.isArray(userResult)) {
      return NextResponse.json(
        { error: 'Invalid user data from Codeforces' },
        { status: 500 }
      );
    }

    const user = userResult[0] as CodeforcesUser;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch user submissions
    const submissionsResponse = await cfGetUserStatus(handle);
    const submissions: CodeforcesSubmission[] = [];
    if (submissionsResponse.status === 'OK') {
      const submissionsResult = (submissionsResponse as any).result;
      if (Array.isArray(submissionsResult)) {
        submissions.push(...(submissionsResult as CodeforcesSubmission[]));
      }
    }

    // Fetch rating history
    const ratingResponse = await cfGetUserRating(handle);
    const ratingHistory: Array<{
      contestId: number;
      contestName: string;
      rating: number;
      ratingChange: number;
      date: number;
    }> = [];
    if (ratingResponse.status === 'OK') {
      const ratingResult = (ratingResponse as any).result;
      if (Array.isArray(ratingResult)) {
        ratingHistory.push(
          ...(ratingResult as Array<{
            contestId: number;
            contestName: string;
            rating: number;
            ratingChange: number;
            date: number;
          }>)
        );
      }
    }

    // Calculate statistics
    const acceptedSubmissions = submissions.filter(
      (s: CodeforcesSubmission) => s.verdict === 'OK'
    );
    const solvedProblems = new Set(
      acceptedSubmissions.map(
        (s: CodeforcesSubmission) => `${s.problem.contestId}-${s.problem.index}`
      )
    );

    // Topic statistics
    const topicStats: Record<
      string,
      { solved: number; attempted: number; accuracy: number }
    > = {};
    const difficultyStats = { easy: 0, medium: 0, hard: 0 };

    submissions.forEach((submission: CodeforcesSubmission) => {
      const problem = submission.problem;
      const tags: string[] = problem.tags || [];
      const difficulty = problem.rating
        ? problem.rating < 1200
          ? 'easy'
          : problem.rating < 2000
          ? 'medium'
          : 'hard'
        : 'unknown';

      // Update difficulty stats
      if (difficulty !== 'unknown') {
        if (submission.verdict === 'OK') {
          difficultyStats[difficulty as keyof typeof difficultyStats]++;
        }
      }

      // Update topic stats
      tags.forEach((tag: string) => {
        if (!topicStats[tag]) {
          topicStats[tag] = { solved: 0, attempted: 0, accuracy: 0 };
        }
        topicStats[tag].attempted++;
        if (submission.verdict === 'OK') {
          topicStats[tag].solved++;
        }
      });
    });

    // Calculate accuracy for each topic
    Object.keys(topicStats).forEach((topic: string) => {
      topicStats[topic].accuracy =
        topicStats[topic].attempted > 0
          ? Math.round(
              (topicStats[topic].solved / topicStats[topic].attempted) * 100
            )
          : 0;
    });

    // Get recent submissions (last 20)
    const recentSubmissions = submissions.slice(0, 20);

    // Build response
    const analytics: CPAnalytics = {
      user,
      stats: {
        totalSolved: solvedProblems.size,
        totalSubmissions: submissions.length,
        acceptanceRate:
          submissions.length > 0
            ? Math.round(
                (acceptedSubmissions.length / submissions.length) * 100
              )
            : 0,
        currentRating: user.rating || 0,
        maxRating: user.maxRating || 0,
        ratingChange: (user.rating || 0) - (user.maxRating || 0),
        rank: user.rank || 'unrated',
        maxRank: user.maxRank || 'unrated',
        contests: ratingHistory.length,
      },
      topicStats,
      difficultyStats,
      recentSubmissions,
      ratingHistory,
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
