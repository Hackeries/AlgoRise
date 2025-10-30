import { NextRequest, NextResponse } from 'next/server';
import { cfGetContestList, CodeforcesContest } from '@/lib/codeforces-api';

// Disable caching for this route to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching contests from Codeforces API...');

    // Get all contests from Codeforces API
    const contestsResponse = await cfGetContestList();

    if (
      contestsResponse.status !== 'OK' ||
      !('result' in contestsResponse) ||
      !contestsResponse.result
    ) {
      console.error('Failed to fetch contests:', contestsResponse.comment);
      return NextResponse.json(
        {
          error: 'Failed to fetch contests',
          details: contestsResponse.comment,
          upcoming: [],
          recent: [],
          total: { upcoming: 0, recent: 0 },
        },
        { status: 200 }
      ); // Return 200 with empty data instead of 500
    }

    const allContests: CodeforcesContest[] = contestsResponse.result;
    console.log(`Fetched ${allContests.length} contests from Codeforces`);

    // Filter upcoming contests (more comprehensive)
    const now = Math.floor(Date.now() / 1000);
    const upcomingContests = allContests
      .filter(
        contest =>
          contest.phase === 'BEFORE' &&
          contest.startTimeSeconds &&
          contest.startTimeSeconds > now &&
          contest.type !== 'IOI' // Exclude IOI style contests for better user experience
      )
      .sort((a, b) => (a.startTimeSeconds || 0) - (b.startTimeSeconds || 0))
      .slice(0, 20); // Get next 20 upcoming contests

    // Get recent contests (last 15, excluding gym)
    const recentContests = allContests
      .filter(
        contest =>
          contest.phase === 'FINISHED' &&
          contest.startTimeSeconds &&
          contest.startTimeSeconds < now &&
          !contest.name.toLowerCase().includes('gym') &&
          contest.type !== 'IOI'
      )
      .sort((a, b) => (b.startTimeSeconds || 0) - (a.startTimeSeconds || 0))
      .slice(0, 15);

    console.log(`Codeforces API response status: ${contestsResponse.status}`);
    console.log(`Fetched ${allContests.length} contests from Codeforces`);
    console.log(
      `Found ${upcomingContests.length} upcoming contests, ${recentContests.length} recent contests`
    );

    return NextResponse.json({
      upcoming: upcomingContests
        .map(contest => ({
          ...contest,
          timeUntilStart: contest.startTimeSeconds
            ? contest.startTimeSeconds - now
            : 0,
          registrationOpen: contest.startTimeSeconds
            ? contest.startTimeSeconds - now > 0
            : false,
        }))
        .slice(0, 10), // Next 10 contests with enhanced data
      recent: recentContests,
      total: {
        upcoming: upcomingContests.length,
        recent: recentContests.length,
        all: allContests.length,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in contests API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch contests',
        details: error instanceof Error ? error.message : 'Unknown error',
        upcoming: [],
        recent: [],
        total: { upcoming: 0, recent: 0 },
      },
      { status: 200 }
    );
  }
}
