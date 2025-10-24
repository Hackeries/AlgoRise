import { type NextRequest, NextResponse } from 'next/server';
import {
  cfGetUserStatus,
  cfGetUserRating,
  calculateUserProgress,
} from '@/lib/codeforces-api';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qsHandle = searchParams.get('handle');

    let resolvedHandle = qsHandle;
    if (!resolvedHandle) {
      try {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { cookies: await cookies() }
        );
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: row } = await supabase
            .from('cf_handles')
            .select('handle, verified')
            .eq('user_id', user.id)
            .single();
          if (row?.handle && row?.verified) {
            resolvedHandle = row.handle;
          }
        }
      } catch (e) {
        // ignore fallback errors; we’ll still validate below
      }
    }

    if (!resolvedHandle) {
      return NextResponse.json(
        {
          error: 'Handle is required',
          hint: 'Pass ?handle=<cf_handle> or link a Codeforces handle in your profile so we can infer it automatically.',
        },
        { status: 400 }
      );
    }

    const submissionsResponse = await cfGetUserStatus(
      resolvedHandle,
      undefined,
      1000
    );
    if (submissionsResponse.status !== 'OK') {
      return NextResponse.json(
        {
          error: 'Failed to fetch user submissions',
          details: submissionsResponse.comment,
        },
        { status: 500 }
      );
    }

    const ratingResponse = await cfGetUserRating(resolvedHandle);
    let ratingHistory: any[] = [];
    if (ratingResponse.status === 'OK' && 'result' in ratingResponse) {
      ratingHistory = ratingResponse.result;
    }

    const progress =
      'result' in submissionsResponse
        ? calculateUserProgress(submissionsResponse.result)
        : null;

    const streakData =
      'result' in submissionsResponse
        ? calculateStreak(submissionsResponse.result)
        : null;

    const trends =
      'result' in submissionsResponse
        ? calculateTrends(submissionsResponse.result)
        : null;

    return new NextResponse(
      JSON.stringify({
        handle: resolvedHandle,
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
      }),
      {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'private, max-age=60', // short-lived cache to reduce CF API pressure
        },
        status: 200,
      }
    );
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

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

  if (solvedDates.has(today)) {
    currentStreak = 1;
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
