import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cfGetUserInfo, cfGetProblems } from '@/lib/codeforces-api'

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `AR_${code}`
}

async function getRandomProblem(): Promise<{ contestId: number; index: string; name: string } | null> {
  try {
    const response = await cfGetProblems()
    if (response.status !== 'OK' || !response.result?.problems) {
      return null
    }

    const problems = response.result.problems.filter(
      (p: any) => p.contestId && p.contestId >= 1 && p.contestId <= 2100 && p.index
    )

    if (problems.length === 0) return null

    const randomIndex = Math.floor(Math.random() * Math.min(problems.length, 500))
    const problem = problems[randomIndex]

    return {
      contestId: problem.contestId,
      index: problem.index,
      name: problem.name,
    }
  } catch (error) {
    console.error('Failed to get random problem:', error)
    return null
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const handle = body?.handle?.trim()

    if (!handle || typeof handle !== 'string') {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      )
    }

    if (!/^[A-Za-z0-9_]+$/.test(handle)) {
      return NextResponse.json(
        { error: 'Invalid handle format. Only letters, numbers, and underscores are allowed.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cfResponse = await cfGetUserInfo(handle)

    if (cfResponse.status !== 'OK' || !cfResponse.result?.[0]) {
      const message =
        'comment' in cfResponse && cfResponse.comment
          ? cfResponse.comment
          : 'Codeforces handle not found'
      return NextResponse.json({ error: message }, { status: 404 })
    }

    const cfUser = cfResponse.result[0]
    const normalizedHandle = cfUser.handle

    const { data: existing } = await supabase
      .from('cf_handles')
      .select('user_id, verified')
      .eq('handle', normalizedHandle)
      .neq('user_id', user.id)
      .maybeSingle()

    if (existing?.verified) {
      return NextResponse.json(
        { error: 'This Codeforces handle is already verified by another user' },
        { status: 409 }
      )
    }

    const token = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    const problem = await getRandomProblem()
    if (!problem) {
      return NextResponse.json(
        { error: 'Failed to fetch a verification problem. Please try again.' },
        { status: 500 }
      )
    }

    const { error: upsertErr } = await supabase.from('cf_handles').upsert(
      {
        user_id: user.id,
        handle: normalizedHandle,
        verified: false,
        verification_token: token,
        verification_problem_id: `${problem.contestId}${problem.index}`,
        expires_at: expiresAt,
      },
      { onConflict: 'user_id' }
    )

    if (upsertErr) {
      console.error('Failed to save verification token:', upsertErr)
      return NextResponse.json(
        { error: 'Failed to start verification' },
        { status: 500 }
      )
    }

    const problemUrl = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`

    return NextResponse.json({
      handle: normalizedHandle,
      token,
      expiresAt,
      problem: {
        contestId: problem.contestId,
        index: problem.index,
        name: problem.name,
        url: problemUrl,
      },
      instructions: `To verify ownership of your Codeforces account, submit a solution containing "${token}" (which will cause a Compilation Error) to the problem "${problem.name}". After submitting, click "Check Verification" to complete the process.`,
    })
  } catch (e) {
    console.error('Verification start error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
