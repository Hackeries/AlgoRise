import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cfGetProblems } from '@/lib/codeforces-api';
import { z } from 'zod';

const createContestSchema = z.object({
  name: z.string().min(1, 'Contest name is required').max(200),
  description: z.string().max(2000).optional().default(''),
  visibility: z.enum(['public', 'private']).optional().default('private'),
  starts_at: z.string().datetime().nullable().optional(),
  ends_at: z.string().datetime().nullable().optional(),
  max_participants: z.number().int().positive().nullable().optional(),
  allow_late_join: z.boolean().optional().default(true),
  contest_mode: z.enum(['icpc', 'practice']).optional().default('practice'),
  duration_minutes: z.number().int().min(5).max(720).optional().default(120),
  problem_count: z.number().int().min(1).max(20).optional().default(5),
  rating_min: z.number().int().min(800).max(3500).optional().default(800),
  rating_max: z.number().int().min(800).max(3500).optional().default(1600),
});

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
    const body = await req.json();
    const parseResult = createContestSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = parseResult.error.flatten();
      return NextResponse.json(
        { error: 'Validation failed', details: errors.fieldErrors },
        { status: 400 }
      );
    }

    const validated = parseResult.data;

    if (validated.rating_min > validated.rating_max) {
      return NextResponse.json(
        { error: 'rating_min must be less than or equal to rating_max' },
        { status: 400 }
      );
    }

    const contestInsert = {
      name: validated.name.trim(),
      description: validated.description?.trim() || '',
      visibility: validated.visibility,
      status: 'draft',
      host_user_id: user.id,
      starts_at: validated.starts_at || null,
      ends_at: validated.ends_at || null,
      max_participants: validated.max_participants || null,
      allow_late_join: validated.allow_late_join,
      contest_mode: validated.contest_mode,
      duration_minutes: validated.duration_minutes,
      problem_count: validated.problem_count,
      rating_min: validated.rating_min,
      rating_max: validated.rating_max,
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
