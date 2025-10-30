import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; challengeId: string }>;
  }
) {
  try {
    const { id: groupId, challengeId } = await params;
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

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: challenge, error: challengeError } = await supabase
      .from('group_challenges')
      .select('target_count, metric, status')
      .eq('id', challengeId)
      .eq('group_id', groupId)
      .maybeSingle();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const body = await req.json();
    const count = parseInt(body?.count ?? body?.currentCount ?? '0', 10);

    if (!Number.isFinite(count) || count < 0) {
      return NextResponse.json({ error: 'Count must be a positive number' }, { status: 400 });
    }

    const completed = count >= challenge.target_count;

    const { data: progress, error } = await supabase
      .from('group_challenge_progress')
      .upsert(
        {
          challenge_id: challengeId,
          user_id: user.id,
          current_count: count,
          completed,
        },
        {
          onConflict: 'challenge_id,user_id',
        }
      )
      .select('*')
      .single();

    if (error) {
      console.error('challenge progress upsert error:', error);
      return NextResponse.json({ error: 'Unable to update progress' }, { status: 500 });
    }

    return NextResponse.json({ progress });
  } catch (error: any) {
    console.error('challenge progress update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
