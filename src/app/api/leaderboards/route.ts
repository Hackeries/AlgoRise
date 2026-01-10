import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getUserRatings } from '@/lib/codeforces-api';

interface CFHandle {
  handle: string;
  rating: number;
}

interface ProfileData {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  last_active_at: string | null;
  cf_handles: CFHandle[];
  college_id: string | null;
  colleges: { name: string } | { name: string }[] | null;
}

interface SkillSnapshot {
  user_id: string;
  total_problems_solved: number;
  current_streak: number;
  longest_streak: number;
  last_activity_at: string | null;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  name: string;
  avatar: string | null;
  handle: string;
  rating: number;
  college: string;
  problemsSolved: number;
  streak: number;
  lastActive: string | null;
  rank: number;
}

interface ViewerSummary {
  userId: string;
  name: string;
  avatar: string | null;
  handle: string;
  rating: number;
  rank: number | null;
  college: string | null;
  totalPeers: number | null;
  problemsSolved: number;
  streak: number;
  lastActive: string | null;
  scope: 'global' | 'cohort';
}

const profileSelect = `
  id,
  user_id,
  full_name,
  avatar_url,
  last_active_at,
  cf_handles!inner(handle,rating),
  college_id,
  colleges(name)
`;

const sanitizeCollegeName = (colleges: ProfileData['colleges'] | null): string => {
  if (!colleges) return 'Unknown';
  if (Array.isArray(colleges)) {
    return colleges[0]?.name || 'Unknown';
  }
  return colleges.name || 'Unknown';
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') as 'same' | 'all'; // same | all
    const ratingMin = parseInt(url.searchParams.get('ratingMin') || '0');
    const ratingMax = parseInt(url.searchParams.get('ratingMax') || '4000');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!['same', 'all'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: await cookies() }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const viewerSelect = profileSelect;
    const { data: viewerProfile, error: viewerError } = await supabase
      .from('profiles')
      .select(viewerSelect)
      .eq('user_id', user.id)
      .maybeSingle();

    if (viewerError) {
      console.error('Leaderboard viewer profile error:', viewerError);
    }

    let viewerCollegeId = viewerProfile?.college_id ?? null;
    if (type === 'same' && !viewerCollegeId) {
      return NextResponse.json({ error: 'No college set' }, { status: 400 });
    }

    let query = supabase
      .from('profiles')
      .select(profileSelect)
      .not('cf_handles.handle', 'is', null)
      .gte('cf_handles.rating', ratingMin)
      .lte('cf_handles.rating', ratingMax)
      .order('cf_handles.rating', { ascending: false })
      .order('last_active_at', { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (type === 'same' && viewerCollegeId) {
      query = query.eq('college_id', viewerCollegeId);
    }

    const { data: profiles, error } = (await query) as {
      data: ProfileData[] | null;
      error: any;
    };

    if (error || !profiles) {
      console.error('Leaderboard profiles error:', error);
      return NextResponse.json(
        { error: error?.message || 'Failed to fetch profiles' },
        { status: 500 }
      );
    }

    const userIds = profiles.map(p => p.user_id).filter(Boolean);
    const uniqueHandles = Array.from(
      new Set(
        profiles
          .map(p => p.cf_handles.map(h => h.handle))
          .flat()
          .filter(Boolean)
      )
    );

    const [ratings, skillData] = await Promise.all([
      getUserRatings(uniqueHandles),
      userIds.length
        ? supabase
            .from('user_skill_profiles')
            .select(
              'user_id,total_problems_solved,current_streak,longest_streak,last_activity_at'
            )
            .in('user_id', userIds)
        : Promise.resolve({ data: null, error: null }),
    ]);

    const skillMap = new Map<string, SkillSnapshot>();
    if ((skillData as any)?.data) {
      ((skillData as any).data as SkillSnapshot[]).forEach(snapshot => {
        if (snapshot?.user_id) {
          skillMap.set(snapshot.user_id, snapshot);
        }
      });
    }

    const leaderboard: LeaderboardEntry[] = profiles.map(
      (p: ProfileData, index: number) => {
        const mainHandle = p.cf_handles.reduce(
          (best, h) => (h.rating > best.rating ? h : best),
          p.cf_handles[0]
        );

        const handle = mainHandle?.handle || 'Unknown';
        const liveRating = ratings[handle]?.rating ?? mainHandle?.rating ?? 0;
        const skill = skillMap.get(p.user_id);

        const lastActiveSource =
          skill?.last_activity_at || p.last_active_at || null;

        return {
          id: p.id,
          userId: p.user_id,
          name: p.full_name || handle,
          avatar: p.avatar_url || null,
          handle,
          rating: liveRating,
          college: sanitizeCollegeName(p.colleges),
          problemsSolved: skill?.total_problems_solved ?? 0,
          streak: skill?.current_streak ?? 0,
          lastActive: lastActiveSource,
          rank: offset + index + 1,
        };
      }
    );

    // Determine total count for pagination
    let totalPeers: number | null = null;
    try {
      let countQuery = supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .not('cf_handles.handle', 'is', null)
        .gte('cf_handles.rating', ratingMin)
        .lte('cf_handles.rating', ratingMax);

      if (type === 'same' && viewerCollegeId) {
        countQuery = countQuery.eq('college_id', viewerCollegeId);
      }

      const { count } = await countQuery;
      if (typeof count === 'number') {
        totalPeers = count;
      }
    } catch (countError) {
      console.warn('Leaderboard count error:', countError);
    }

    const scope: 'global' | 'cohort' = type === 'same' ? 'cohort' : 'global';

    const findViewerInPage = () =>
      user ? leaderboard.find(entry => entry.userId === user.id) : undefined;

    let viewerEntry = findViewerInPage();
    let viewerRating = viewerEntry?.rating ?? null;
    let viewerProblems = viewerEntry?.problemsSolved ?? 0;
    let viewerStreak = viewerEntry?.streak ?? 0;
    let viewerLastActive = viewerEntry?.lastActive ?? null;
    let viewerHandle = viewerEntry?.handle ?? viewerProfile?.cf_handles?.[0]?.handle ?? 'Unknown';
    let viewerName = viewerEntry?.name ?? viewerProfile?.full_name ?? viewerHandle;
    let viewerAvatar = viewerEntry?.avatar ?? viewerProfile?.avatar_url ?? null;
    let viewerCollegeName = viewerEntry?.college ?? sanitizeCollegeName(viewerProfile?.colleges ?? null);

    if (user && !viewerEntry && viewerProfile) {
      const mainHandle = viewerProfile.cf_handles?.reduce(
        (best: CFHandle, current: CFHandle) =>
          current.rating > best.rating ? current : best,
        viewerProfile.cf_handles[0]
      );

      viewerRating =
        (mainHandle && (ratings[mainHandle.handle]?.rating ?? mainHandle.rating)) ??
        mainHandle?.rating ??
        null;

      const viewerSkill = viewerProfile?.user_id
        ? skillMap.get(viewerProfile.user_id)
        : undefined;

      viewerProblems = viewerSkill?.total_problems_solved ?? viewerProblems;
      viewerStreak = viewerSkill?.current_streak ?? viewerStreak;
      viewerLastActive =
        viewerSkill?.last_activity_at || viewerProfile.last_active_at || null;
    }

    let viewerRank: number | null = viewerEntry?.rank ?? null;

    if (user && viewerRating !== null && viewerRank === null) {
      try {
        let higherCountQuery = supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .not('cf_handles.handle', 'is', null)
          .gte('cf_handles.rating', ratingMin)
          .lte('cf_handles.rating', ratingMax)
          .gt('cf_handles.rating', viewerRating);

        if (type === 'same' && viewerCollegeId) {
          higherCountQuery = higherCountQuery.eq('college_id', viewerCollegeId);
        }

        const { count: higherCount } = await higherCountQuery;
        if (typeof higherCount === 'number') {
          viewerRank = higherCount + 1;
        }
      } catch (rankError) {
        console.warn('Leaderboard rank error:', rankError);
      }
    }

    const viewerSummary: ViewerSummary | null = user
      ? {
          userId: user.id,
          name: viewerName,
          avatar: viewerAvatar,
          handle: viewerHandle,
          rating: viewerRating ?? 0,
          rank: viewerRank,
          college: viewerCollegeId ? viewerCollegeName : null,
          totalPeers: totalPeers,
          problemsSolved: viewerProblems,
          streak: viewerStreak,
          lastActive: viewerLastActive,
          scope,
        }
      : null;

    return NextResponse.json({
      leaderboard,
      pagination: {
        limit,
        offset,
        total: totalPeers ?? (leaderboard.length + offset),
      },
      scope,
      viewer: viewerSummary,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Unexpected server error' },
      { status: 500 }
    );
  }
}
