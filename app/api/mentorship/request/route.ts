import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('mentor_requests')
      .select('id, mentor_id, requester_id, topics, message, status, created_at, responded_at')
      .or(`requester_id.eq.${user.id},mentor_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('mentor_requests fetch error:', error);
      return NextResponse.json({ error: 'Unable to load mentorship requests' }, { status: 500 });
    }

    return NextResponse.json({ requests: data || [] });
  } catch (error: any) {
    console.error('Mentorship requests GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const mentorId = body?.mentorId;
    const topics = body?.topics;
    const message = (body?.message || '').slice(0, 500);

    if (!mentorId || typeof mentorId !== 'string') {
      return NextResponse.json({ error: 'mentorId is required' }, { status: 400 });
    }

    if (mentorId === user.id) {
      return NextResponse.json({ error: 'You cannot request yourself as mentor' }, { status: 400 });
    }

    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json({ error: 'At least one topic is required' }, { status: 400 });
    }

    const normalizedTopics = topics
      .map((topic: unknown) => (typeof topic === 'string' ? topic.trim() : null))
      .filter((topic: string | null): topic is string => Boolean(topic));

    if (normalizedTopics.length === 0) {
      return NextResponse.json({ error: 'Topics must be strings' }, { status: 400 });
    }

    const { error } = await supabase.from('mentor_requests').insert({
      requester_id: user.id,
      mentor_id: mentorId,
      topics: normalizedTopics,
      message: message || null,
    });

    if (error) {
      console.error('mentor_requests insert error:', error);
      return NextResponse.json({ error: 'Failed to send mentorship request' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Mentorship requests POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
