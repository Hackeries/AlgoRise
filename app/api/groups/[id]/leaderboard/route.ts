import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const url = new URL(req.url);
    const sort = (url.searchParams.get('sort') || 'rating') as
      | 'rating'
      | 'problems'
      | 'streak';
    const range = (url.searchParams.get('range') || 'all') as '7d' | '30d' | 'all';

    const { id: groupId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Ensure membership
    const { data: membership } = await supabase
      .from('group_memberships')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();
    if (!membership)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Profiles joined to cf_handles for rating (highest rated handle)
    const { data: rows, error } = await supabase
      .from('group_memberships')
      .select(
        `user_id,
         profiles(full_name, avatar_url, last_active_at,
           cf_handles:cf_handles(handle, rating)
         )`
      )
      .eq('group_id', groupId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const userIds = (rows || []).map((r: any) => r.user_id).filter(Boolean);
    const { data: skillData, error: skillError } = userIds.length
      ? await supabase
          .from('user_skill_profiles')
          .select(
            'user_id,total_problems_solved,current_streak,longest_streak,last_activity_at'
          )
          .in('user_id', userIds)
      : { data: null, error: null };

    if (skillError) {
      console.warn('Group leaderboard skill fetch error:', skillError);
    }

    const skillMap = new Map<string, {
      total_problems_solved: number;
      current_streak: number;
      longest_streak: number;
      last_activity_at: string | null;
    }>();

    (skillData || []).forEach((snapshot: any) => {
      if (snapshot?.user_id) {
        skillMap.set(snapshot.user_id, {
          total_problems_solved: snapshot.total_problems_solved ?? 0,
          current_streak: snapshot.current_streak ?? 0,
          longest_streak: snapshot.longest_streak ?? 0,
          last_activity_at: snapshot.last_activity_at ?? null,
        });
      }
    });

    const leaderboard = (rows || [])
      .map((r: any) => {
        const handles = r.profiles?.cf_handles || [];
        const best = handles.reduce(
          (acc: any, h: any) => (h?.rating > (acc?.rating || -1) ? h : acc),
          null as any
        );
        const name = r.profiles?.full_name || best?.handle || 'Member';
        const skill = skillMap.get(r.user_id) || null;
        return {
          id: r.user_id,
          name,
          handle: best?.handle || 'unknown',
          avatar: r.profiles?.avatar_url || null,
          rating: best?.rating || 0,
          problemsSolved: skill?.total_problems_solved ?? 0,
          streakCurrent: skill?.current_streak ?? 0,
          streakLongest: skill?.longest_streak ?? 0,
          lastActive:
            skill?.last_activity_at || r.profiles?.last_active_at || new Date().toISOString(),
        };
      })
      .sort((a, b) => {
        if (sort === 'rating') return b.rating - a.rating;
        if (sort === 'problems') return b.problemsSolved - a.problemsSolved;
        return b.streakCurrent - a.streakCurrent;
      })
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    // Stats block
    const { count: totalMembers } = await supabase
      .from('group_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    const avgRating =
      leaderboard.length > 0
        ? Math.round(
            leaderboard.reduce((acc, e) => acc + (e.rating || 0), 0) /
              leaderboard.length
          )
        : 0;

    // Placeholder stats until activity tables are wired
    const stats = {
      totalMembers: totalMembers || leaderboard.length,
      activeMembers: leaderboard.filter(e => e.lastActive).length,
      avgRating,
      totalProblems: leaderboard.reduce(
        (acc, entry) => acc + (entry.problemsSolved ?? 0),
        0
      ),
    };

    return NextResponse.json({ leaderboard, stats });
  } catch (error: any) {
    console.error('Group leaderboard error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
