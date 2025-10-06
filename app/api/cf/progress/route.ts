import { NextRequest, NextResponse } from 'next/server';
import {
  cfGetUserStatus,
  cfGetUserRating,
  calculateUserProgress,
} from '@/lib/codeforces-api';

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

    // Get user submissions (last 1000 for comprehensive analysis)
    const submissionsResponse = await cfGetUserStatus(handle, undefined, 1000);
    if (submissionsResponse.status !== 'OK') {
      return NextResponse.json(
        {
          error: 'Failed to fetch user submissions',
          details: submissionsResponse.comment,
        },
        { status: 500 }
      );
    }

    // Get rating history
    const ratingResponse = await cfGetUserRating(handle);
    let ratingHistory: any[] = [];
    if (ratingResponse.status === 'OK' && 'result' in ratingResponse) {
      ratingHistory = ratingResponse.result;
    }

    // Calculate comprehensive progress
    const progress =
      'result' in submissionsResponse
        ? calculateUserProgress(submissionsResponse.result)
        : null;

    // Calculate streak data
    const today = new Date();
    const streakData =
      'result' in submissionsResponse
        ? calculateStreak(submissionsResponse.result)
        : null;

    // Calculate weekly/monthly trends
    const trends =
      'result' in submissionsResponse
        ? calculateTrends(submissionsResponse.result)
        : null;

    return NextResponse.json({
      progress: {
        ...progress,
        streakData,
        trends,
        ratingHistory: ratingHistory.map(r => ({
          contestId: r.contestId,
          contestName: r.contestName,
          date: new Date(r.ratingUpdateTimeSeconds * 1000).toISOString(),
          oldRating: r.oldRating,
          newRating: r.newRating,
          change: r.newRating - r.oldRating,
        })),
      },
    });
  } catch (error) {
    console.error('Error calculating user progress:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function calculateStreak(submissions: any[]): {
  current: number;
  longest: number;
  lastSolvedDate: string | null;
} {
  const solvedDates = new Set<string>();

  submissions.forEach(sub => {
    if (sub.verdict === 'OK') {
      const date = new Date(sub.creationTimeSeconds * 1000);
      solvedDates.add(date.toDateString());
    }
  });

  const sortedDates = Array.from(solvedDates).sort();
  if (sortedDates.length === 0) {
    return { current: 0, longest: 0, lastSolvedDate: null };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Check if solved today or yesterday for current streak
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

  if (solvedDates.has(today)) {
    currentStreak = 1;
    // Count backwards
    for (let i = 1; i < 365; i++) {
      const checkDate = new Date(
        Date.now() - i * 24 * 60 * 60 * 1000
      ).toDateString();
      if (solvedDates.has(checkDate)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else if (solvedDates.has(yesterday)) {
    currentStreak = 1;
    // Count backwards from yesterday
    for (let i = 2; i < 365; i++) {
      const checkDate = new Date(
        Date.now() - i * 24 * 60 * 60 * 1000
      ).toDateString();
      if (solvedDates.has(checkDate)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays =
      (currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000);

    if (diffDays <= 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    current: currentStreak,
    longest: longestStreak,
    lastSolvedDate: sortedDates[sortedDates.length - 1] || null,
  };
}

function calculateTrends(submissions: any[]): {
  weeklyAverage: number;
  monthlyAverage: number;
  weeklyTrend: 'up' | 'down' | 'stable';
  monthlyTrend: 'up' | 'down' | 'stable';
} {
  const now = Date.now() / 1000;
  const oneWeek = 7 * 24 * 60 * 60;
  const oneMonth = 30 * 24 * 60 * 60;

  const thisWeekSolved = submissions.filter(
    sub => sub.verdict === 'OK' && sub.creationTimeSeconds > now - oneWeek
  ).length;

  const lastWeekSolved = submissions.filter(
    sub =>
      sub.verdict === 'OK' &&
      sub.creationTimeSeconds > now - 2 * oneWeek &&
      sub.creationTimeSeconds <= now - oneWeek
  ).length;

  const thisMonthSolved = submissions.filter(
    sub => sub.verdict === 'OK' && sub.creationTimeSeconds > now - oneMonth
  ).length;

  const lastMonthSolved = submissions.filter(
    sub =>
      sub.verdict === 'OK' &&
      sub.creationTimeSeconds > now - 2 * oneMonth &&
      sub.creationTimeSeconds <= now - oneMonth
  ).length;

  return {
    weeklyAverage: thisWeekSolved,
    monthlyAverage: thisMonthSolved,
    weeklyTrend:
      thisWeekSolved > lastWeekSolved
        ? 'up'
        : thisWeekSolved < lastWeekSolved
          ? 'down'
          : 'stable',
    monthlyTrend:
      thisMonthSolved > lastMonthSolved
        ? 'up'
        : thisMonthSolved < lastMonthSolved
          ? 'down'
          : 'stable',
  };
}
