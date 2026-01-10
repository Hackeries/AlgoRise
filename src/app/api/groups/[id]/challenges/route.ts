import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ChallengeRow {
  id: string;
  title: string;
  description: string | null;
  metric: string;
  target_count: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'expired';
  created_at: string;
  created_by: string;
}

interface ProgressRow {
  id: string;
  challenge_id: string;
  user_id: string;
  current_count: number;
  completed: boolean;
  last_updated: string;
}

const ensureDateRange = (startDate: string, duration: string | null, explicitEnd?: string | null) => {
  const base = new Date(startDate);
  if (Number.isNaN(base.getTime())) base.setTime(Date.now());
  if (explicitEnd) {
    const explicit = new Date(explicitEnd);
    if (!Number.isNaN(explicit.getTime())) return explicit.toISOString().slice(0, 10);
  }

  if (duration === 'monthly') {
    base.setDate(base.getDate() + 30);
  } else {
    base.setDate(base.getDate() + 7);
  }
  return base.toISOString().slice(0, 10);
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from('group_memberships')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError || !membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: challenges, error } = await supabase
      .from('group_challenges')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('group challenges fetch error:', error);
      return NextResponse.json({ error: 'Unable to load challenges' }, { status: 500 });
    }

    const challengeIds = (challenges || []).map(ch => ch.id);
    const { data: progressRows } = challengeIds.length
      ? await supabase
          .from('group_challenge_progress')
          .select('*')
          .in('challenge_id', challengeIds)
      : { data: [] };

    const progressByChallenge = new Map<string, ProgressRow[]>();
    (progressRows || []).forEach((row: any) => {
      const list = progressByChallenge.get(row.challenge_id) || [];
      list.push(row as ProgressRow);
      progressByChallenge.set(row.challenge_id, list);
    });

    const payload = (challenges || []).map(challenge => {
      const progress = progressByChallenge.get(challenge.id) || [];
      const userProgress = progress.find(row => row.user_id === user.id);
      const membersCompleted = progress.filter(row => row.completed).length;
      const totalParticipation = progress.length;

      const currentCount = userProgress?.current_count ?? 0;
      const percentComplete = Math.min(
        100,
        Math.round((currentCount / challenge.target_count) * 100)
      );

      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        metric: challenge.metric,
        target: challenge.target_count,
        startDate: challenge.start_date,
        endDate: challenge.end_date,
        status: challenge.status,
        createdAt: challenge.created_at,
        createdBy: challenge.created_by,
        currentUserCount: currentCount,
        percentComplete,
        membersCompleted,
        participants: totalParticipation,
        lastUpdated: userProgress?.last_updated || null,
      };
    });

    return NextResponse.json({ challenges: payload, role: membership.role });
  } catch (error: any) {
    console.error('group challenges GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: membership } = await supabase
      .from('group_memberships')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create challenges' }, { status: 403 });
    }

    const body = await req.json();
    const title = (body?.title || '').trim();
    const target = parseInt(body?.target || '0', 10);
    const description = body?.description ? String(body.description).slice(0, 280) : null;
    const metric = (body?.metric || 'problems_solved') as string;
    const startDate = body?.startDate || new Date().toISOString().slice(0, 10);
    const duration = body?.duration || 'weekly';
    const endDate = ensureDateRange(startDate, duration, body?.endDate);

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!Number.isFinite(target) || target <= 0) {
      return NextResponse.json({ error: 'Target must be a positive number' }, { status: 400 });
    }

    const { data: challenge, error } = await supabase
      .from('group_challenges')
      .insert({
        group_id: groupId,
        title,
        description,
        metric,
        target_count: target,
        start_date: startDate,
        end_date: endDate,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error) {
      console.error('group challenge insert error:', error);
      return NextResponse.json({ error: 'Unable to create challenge' }, { status: 500 });
    }

    return NextResponse.json({ challenge });
  } catch (error: any) {
    console.error('group challenges POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
