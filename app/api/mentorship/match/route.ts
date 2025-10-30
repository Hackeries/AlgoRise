import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface MentorMatchRow {
  mentor_id: string;
  topic: string;
  problems_solved: number;
  success_rate: number;
  current_streak: number;
  last_activity_at: string | null;
}

const badgeForTopic = (topic: string) => {
  const normalized = topic.trim().toLowerCase();
  if (normalized.includes('dynamic programming') || normalized === 'dp') {
    return 'Expert in DP';
  }
  if (normalized.includes('graph')) {
    return 'Graph Guru';
  }
  if (normalized.startsWith('math')) {
    return 'Math Master';
  }
  if (normalized.includes('data structure')) {
    return 'Data Structures Wizard';
  }
  if (normalized.includes('greedy')) {
    return 'Greedy Strategist';
  }
  return `${topic.replace(/\b\w/g, c => c.toUpperCase())} Expert`;
};

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const topicsParam = url.searchParams.get('topics');
    const limit = parseInt(url.searchParams.get('limit') || '6');

    const topics = topicsParam
      ? topicsParam
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
      : null;

    const { data: matches, error } = await supabase.rpc('match_mentors_for_user', {
      p_user_id: user.id,
      p_topics: topics && topics.length > 0 ? topics : null,
      p_limit: limit,
    });

    if (error) {
      console.error('match_mentors_for_user error:', error);
      return NextResponse.json({ error: 'Unable to fetch mentors' }, { status: 500 });
    }

    const rows = (matches || []) as MentorMatchRow[];
    const mentorIds = Array.from(new Set(rows.map(r => r.mentor_id))).filter(Boolean);

    if (mentorIds.length === 0) {
      return NextResponse.json({ mentors: [], topics });
    }

    const { data: mentorProfiles, error: profileError } = await supabase
      .from('profiles')
      .select(
        `user_id, full_name, avatar_url, last_active_at, colleges(name), cf_handles(handle, rating)`
      )
      .in('user_id', mentorIds);

    if (profileError) {
      console.error('mentor profile fetch error:', profileError);
      return NextResponse.json({ error: 'Unable to load mentor profiles' }, { status: 500 });
    }

    const profileMap = new Map<string, any>();
    (mentorProfiles || []).forEach(profile => {
      profileMap.set(profile.user_id, profile);
    });

    const mentors = rows.map(row => {
      const profile = profileMap.get(row.mentor_id) || {};
      const handles = profile?.cf_handles || [];
      const primaryHandle = Array.isArray(handles)
        ? handles.reduce(
            (best: any, current: any) =>
              current?.rating > (best?.rating ?? -Infinity) ? current : best,
            handles[0]
          )
        : null;

      const college = Array.isArray(profile?.colleges)
        ? profile?.colleges?.[0]?.name
        : profile?.colleges?.name;

      return {
        id: row.mentor_id,
        name: profile?.full_name || primaryHandle?.handle || 'Mentor',
        avatar: profile?.avatar_url || null,
        handle: primaryHandle?.handle || null,
        rating: primaryHandle?.rating || null,
        college: college || null,
        topic: row.topic,
        badge: badgeForTopic(row.topic),
        problemsSolved: row.problems_solved,
        successRate: row.success_rate,
        currentStreak: row.current_streak,
        lastActive: row.last_activity_at || profile?.last_active_at || null,
      };
    });

    return NextResponse.json({ mentors, topics });
  } catch (error: any) {
    console.error('Mentor matching error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
