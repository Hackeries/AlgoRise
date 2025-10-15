import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getContestLeaderboard } from '@/lib/services/contests';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contestId = id;

  // ✅ FIX: Await the client creation
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const leaderboard = await getContestLeaderboard(contestId);
    return new NextResponse(JSON.stringify({ leaderboard }), {
      status: 200,
      headers: {
        'content-type': 'application/json',
        // Small CDN cache to reduce load during contests; feel free to tune.
        'cache-control': 'public, s-maxage=15, stale-while-revalidate=30',
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'failed' },
      { status: 500 }
    );
  }
}
