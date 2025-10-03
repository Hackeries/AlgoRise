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
  if (!handle)
    return NextResponse.json(
      { error: 'No CF handle provided' },
      { status: 400 }
    );

  try {
    const userInfo = await fetchCFUserInfo(handle);
    const ratingHistory = await fetchCFRating(handle);
    const lastRatingChange = ratingHistory.length
      ? ratingHistory[ratingHistory.length - 1]
      : null;
    const nextContest = await fetchUpcomingContest();

    // Compute rating delta from last contest
    const ratingDelta = lastRatingChange
      ? lastRatingChange.newRating - lastRatingChange.oldRating
      : 0;

    // Compute last contest date
    const lastContestAt = lastRatingChange
      ? new Date(lastRatingChange.ratingUpdateTimeSeconds * 1000).toISOString()
      : null;

    // Compute next contest date
    const nextContestAt = nextContest
      ? new Date(nextContest.startTimeSeconds * 1000).toISOString()
      : null;

    const data = {
      handle: userInfo.handle,
      rating: userInfo.rating ?? 0,
      maxRating: userInfo.maxRating ?? 0,
      rank: userInfo.rank ?? 'unrated',
      ratingDelta,
      lastContestAt,
      nextContestAt,
      nextContestName: nextContest?.name ?? null,
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching CF profile:', err);
    return NextResponse.json(
      { error: 'Failed to fetch CF profile' },
      { status: 500 }
    );
  }
}
