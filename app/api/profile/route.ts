import { NextResponse } from 'next/server';

// Helper function to fetch CF user info
const fetchCFUserInfo = async (handle: string) => {
  const res = await fetch(
    `https://codeforces.com/api/user.info?handles=${handle}`
  );
  const json = await res.json();
  if (json.status !== 'OK') throw new Error('Failed to fetch user info');
  return json.result[0];
};

// Helper function to fetch CF user rating changes
const fetchCFRating = async (handle: string) => {
  const res = await fetch(
    `https://codeforces.com/api/user.rating?handle=${handle}`
  );
  const json = await res.json();
  if (json.status !== 'OK') return [];
  return json.result;
};

// Helper function to fetch upcoming CF contests
const fetchUpcomingContest = async () => {
  const res = await fetch(`https://codeforces.com/api/contest.list`);
  const json = await res.json();
  if (json.status !== 'OK') return null;
  const upcoming = json.result
    .filter((c: any) => c.phase === 'BEFORE')
    .sort((a: any, b: any) => a.startTimeSeconds - b.startTimeSeconds)[0];
  return upcoming;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get('handle');
  const compareHandle = searchParams.get('compareHandle');

  if (!handle) {
    return NextResponse.json(
      { error: 'No CF handle provided' },
      { status: 400 }
    );
  }

  try {
    const fetchDataForHandle = async (h: string) => {
      const userInfo = await fetchCFUserInfo(h);
      const ratingHistory = await fetchCFRating(h);
      const lastRatingChange = ratingHistory.length
        ? ratingHistory[ratingHistory.length - 1]
        : null;
      const nextContest = await fetchUpcomingContest();

      const ratingDelta = lastRatingChange
        ? lastRatingChange.newRating - lastRatingChange.oldRating
        : 0;

      const lastContestAt = lastRatingChange
        ? new Date(
            lastRatingChange.ratingUpdateTimeSeconds * 1000
          ).toISOString()
        : null;

      const nextContestAt = nextContest
        ? new Date(nextContest.startTimeSeconds * 1000).toISOString()
        : null;

      return {
        handle: userInfo.handle,
        rating: userInfo.rating ?? 0,
        maxRating: userInfo.maxRating ?? 0,
        rank: userInfo.rank ?? 'unrated',
        ratingDelta,
        lastContestAt,
        nextContestAt,
        nextContestName: nextContest?.name ?? null,
      };
    };

    const mainHandleData = await fetchDataForHandle(handle);
    let comparisonHandleData = null;

    if (compareHandle) {
      comparisonHandleData = await fetchDataForHandle(compareHandle);
    }

    return NextResponse.json({
      mainHandle: mainHandleData,
      comparisonHandle: comparisonHandleData,
    });
  } catch (err) {
    console.error('Error fetching CF profile:', err);
    return NextResponse.json(
      { error: 'Failed to fetch CF profile' },
      { status: 500 }
    );
  }
}
