import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cfGetProblems } from '@/lib/codeforces-api';

interface Contest {
  id: string;
  name: string;
  description: string;
  visibility: 'public' | 'private';
  status: string;
  host_user_id: string;
  starts_at: string | null;
  ends_at: string | null;
  max_participants: number | null;
  allow_late_join: boolean;
  contest_mode: 'icpc' | 'practice';
  duration_minutes: number;
  problem_count: number;
  rating_min: number;
  rating_max: number;
  created_at: string;
}

interface ContestParticipant {
  contest_id: string;
  user_id: string;
}

interface CFProblem {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Return only public contests for non-authenticated users
    const { data: contests, error } = await supabase
      .from('contests')
      .select('*')
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching public contests:', error);
      return NextResponse.json({ contests: [] }, { status: 500 });
    }

    return NextResponse.json({
      contests:
        contests?.map((contest: Contest) => ({
          ...contest,
          isRegistered: false,
          isHost: false,
        })) || [],
    });
  }

  // For authenticated users, let RLS handle the filtering
  const { data: contests, error } = await supabase
    .from('contests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching contests:', error);
    return NextResponse.json({ contests: [] }, { status: 500 });
  }

  // Check which contests the user is registered for
  const { data: participations, error: partErr } = await supabase
    .from('contest_participants')
    .select('contest_id')
    .eq('user_id', user.id);

  if (partErr) {
    console.error('Error fetching participations:', partErr);
  }

  const registeredContestIds = new Set(
    participations?.map((p: ContestParticipant) => p.contest_id) || []
  );

  const formattedContests =
    contests?.map((contest: Contest) => ({
      ...contest,
      isRegistered: registeredContestIds.has(contest.id),
      isHost: contest.host_user_id === user.id,
    })) || [];

  return NextResponse.json({ contests: formattedContests });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json()

    // Simple validation
    const name = body.name?.toString()?.trim() || '';
    if (!name) {
      return NextResponse.json(
        { error: 'Contest name is required' },
        { status: 400 }
      );
    }

    // Create basic contest - let RLS handle the rest
    const contestInsert = {
      name,
      description: body.description?.toString()?.trim() || '',
      visibility: body.visibility === 'public' ? 'public' : 'private',
      status: 'draft',
      host_user_id: user.id,
      starts_at: body.starts_at,
      ends_at: body.ends_at,
      max_participants: body.max_participants || null,
      allow_late_join: body.allow_late_join !== false,
      contest_mode: body.contest_mode === 'icpc' ? 'icpc' : 'practice',
      duration_minutes: body.duration_minutes || 120,
      problem_count: body.problem_count || 5,
      rating_min: body.rating_min || 800,
      rating_max: body.rating_max || 1600,
    };

    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .insert(contestInsert)
      .select()
      .single();

    if (contestError) {
      return NextResponse.json(
        {
          error: `Database error: ${contestError.message}`,
          details: contestError,
        },
        { status: 500 }
      );
    }

    // auto generate contest problems from codeforces by rating range
    try {
      const minR = Number(contestInsert.rating_min) || 800;
      const maxR = Number(contestInsert.rating_max) || 1600;
      const count = Number(contestInsert.problem_count) || 5;

      // Fetch all problems once
      const problemsResp = await cfGetProblems();
      if (
        problemsResp.status === 'OK' &&
        'result' in problemsResp &&
        problemsResp.result
      ) {
        const all = problemsResp.result.problems || [];
        // Filter by rating range and basic sanity
        const pool = all.filter((p: CFProblem) => {
          const r = p?.rating;
          return (
            r && r >= minR && r <= maxR && p.contestId && p.index && p.name
          );
        });

        // Shuffle and pick unique problems by contestId+index
        const shuffled = pool.sort(() => Math.random() - 0.5);
        const picked = [];
        const seen = new Set<string>();
        for (const p of shuffled) {
          const key = `${p.contestId}${p.index}`;
          if (seen.has(key)) continue;
          seen.add(key);
          picked.push(p);
          if (picked.length >= count) break;
        }

        if (picked.length > 0) {
          const rows = picked.map((p: CFProblem, i: number) => ({
            contest_id: contest.id,
            problem_id: `${p.contestId}${p.index}`,
            title: p.name,
            points: 1,
            contest_id_cf: p.contestId,
            index_cf: p.index,
            rating: p.rating ?? null,
          }));

          await supabase.from('contest_problems').insert(rows)
        }
      }
    } catch {
      // problem generation failed silently - contest still created
    }

    return NextResponse.json({
      success: true,
      contest: {
        id: contest.id,
        name: contest.name,
        status: contest.status,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to create contest' }, { status: 500 })
  }
}
