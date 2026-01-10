import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Get the logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error fetching Supabase user:', userError);
      return NextResponse.json(
        { handle: null, verified: false, error: 'Failed to get user' },
        { status: 200 }
      );
    }

    if (!user) {
      return NextResponse.json({ handle: null, verified: false });
    }

    // First try cf_handles table (primary verification source)
    const { data: cfHandle, error: handleError } = await supabase
      .from('cf_handles')
      .select('handle, verified')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!handleError && cfHandle?.verified && cfHandle?.handle) {
      // Get rating from CF snapshots
      const { data: snapshot } = await supabase
        .from('cf_snapshots')
        .select('handle, last_rating, fetched_at')
        .eq('user_id', user.id)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return NextResponse.json({
        handle: cfHandle.handle,
        verified: true,
        rating: snapshot?.last_rating || null,
        maxRating: null,
        rank: null,
        lastVerifiedAt: snapshot?.fetched_at || null,
      });
    }

    // Fallback: check cf_snapshots directly
    const { data: snapshot, error: snapshotError } = await supabase
      .from('cf_snapshots')
      .select('handle, last_rating, fetched_at')
      .eq('user_id', user.id)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (snapshotError) {
      console.error('Error fetching CF snapshot:', snapshotError);
      return NextResponse.json(
        { handle: null, verified: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      handle: snapshot?.handle || null,
      verified: !!snapshot?.handle,
      rating: snapshot?.last_rating || null,
      maxRating: null,
      rank: null,
      lastVerifiedAt: snapshot?.fetched_at || null,
    });
  } catch (err) {
    console.error('Unexpected error fetching CF handle:', err);
    return NextResponse.json(
      { handle: null, verified: false, error: 'Internal server error' },
      { status: 200 }
    );
  }
}
