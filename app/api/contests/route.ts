import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cfGetProblems, type CodeforcesProblem } from '@/lib/codeforces-api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ contests: [] });
  }

  // Get all contests (public and private where user is host or participant)
  const { data: contests, error } = await supabase
    .from('contests')
    .select('*')
    .or(`host_user_id.eq.${user.id},visibility.eq.public`)
    .order('starts_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching contests:', error);
    return NextResponse.json({ contests: [] });
  }

  // Check which contests the user is registered for
  const { data: participations } = await supabase
    .from('contest_participants')
    .select('contest_id')
    .eq('user_id', user.id);

  const registeredContestIds = new Set(
    participations?.map(p => p.contest_id) || []
  );

  const formattedContests =
    contests?.map(contest => ({
      ...contest,
      isRegistered: registeredContestIds.has(contest.id),
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
    const {
      name,
      description,
      start_time,
      end_time,
      duration_minutes,
      problem_count,
      rating_min,
      rating_max,
      max_participants,
      allow_late_join,
      contest_mode, // 'practice' or 'icpc'
    } = body;

    // Validation
    if (!name || !start_time || !duration_minutes || !problem_count) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Fetching problems from Codeforces API...');

    const problemsResponse = await cfGetProblems();

    // ✅ Define expected type from Codeforces API
    type CFProblemResponse = {
      status: string;
      comment?: string;
      result?: {
        problems: CodeforcesProblem[];
      };
    };

    const cfData = problemsResponse as CFProblemResponse;

    if (cfData.status !== 'OK' || !cfData.result) {
      return NextResponse.json(
        { error: 'Failed to fetch problems from Codeforces' },
        { status: 500 }
      );
    }

    const allProblems = cfData.result.problems;

    // Filter problems by rating range
    const filteredProblems = allProblems.filter(
      problem =>
        problem.rating &&
        problem.rating >= rating_min &&
        problem.rating <= rating_max
    );

    if (filteredProblems.length < problem_count) {
      return NextResponse.json(
        {
          error: `Not enough problems in rating range ${rating_min}-${rating_max}. Found ${filteredProblems.length}, need ${problem_count}`,
        },
        { status: 400 }
      );
    }

    // Randomly select problems
    const shuffled = filteredProblems.sort(() => Math.random() - 0.5);
    const selectedProblems = shuffled.slice(0, problem_count);

    console.log(`Selected ${selectedProblems.length} problems for contest`);

    // Create contest
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .insert({
        name,
        description: description || '',
        visibility: 'private',
        status: 'draft',
        host_user_id: user.id,
        starts_at: start_time,
        ends_at: end_time,
        max_participants: max_participants || null,
        allow_late_join: allow_late_join ?? true,
        contest_mode: contest_mode || 'practice',
        duration_minutes,
        problem_count,
        rating_min,
        rating_max,
      })
      .select()
      .single();

    if (contestError) {
      console.error('Failed to create contest:', contestError);
      return NextResponse.json(
        { error: `Database error: ${contestError.message}` },
        { status: 500 }
      );
    }

    console.log(`Contest created successfully: ${contest.id}`);

    // Insert problems
    const problemsToInsert = selectedProblems.map(problem => ({
      contest_id: contest.id,
      problem_id: `${problem.contestId}${problem.index}`,
      title: problem.name,
      points: 1,
      contest_id_cf: problem.contestId,
      index_cf: problem.index,
      rating: problem.rating || 0,
    }));

    const { error: problemsError } = await supabase
      .from('contest_problems')
      .insert(problemsToInsert);

    if (problemsError) {
      console.error('Failed to insert contest problems:', problemsError);
      // Rollback: delete the contest
      await supabase.from('contests').delete().eq('id', contest.id);
      return NextResponse.json(
        { error: 'Failed to add problems to contest' },
        { status: 500 }
      );
    }

    console.log(`Successfully inserted ${problemsToInsert.length} problems`);

    return NextResponse.json({ id: contest.id, contest });
  } catch (error) {
    console.error('Contest creation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}