import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { judgeSubmission, storeSubmission } from '@/lib/judge';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const battleId = params.id;
    const { code, language, problemId, teamId } = await request.json();

    // Judge the submission
    const judgeResult = await judgeSubmission({
      code,
      language,
      problemId,
      battleId,
      teamId,
      userId: user.id,
    });

    // Store submission
    const submission = await storeSubmission(
      battleId,
      user.id,
      problemId,
      code,
      language,
      judgeResult.verdict,
      judgeResult.penalty || 0,
      teamId
    );

    await supabase.channel(`battle:${battleId}`).send({
      type: 'broadcast',
      event: 'submission',
      payload: {
        submission,
        verdict: judgeResult.verdict,
        penalty: judgeResult.penalty,
      },
    });

    return NextResponse.json({
      submission,
      verdict: judgeResult.verdict,
      penalty: judgeResult.penalty,
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
