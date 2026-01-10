import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cfHandle, error: selectErr } = await supabase
      .from('cf_handles')
      .select('handle, verified, verification_token, verification_problem_id, expires_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (selectErr) {
      console.error('Failed to fetch verification status:', selectErr)
      return NextResponse.json(
        { error: 'Failed to fetch verification status' },
        { status: 500 }
      )
    }

    if (!cfHandle) {
      return NextResponse.json({
        verified: false,
        handle: null,
        pendingToken: null,
      })
    }

    if (cfHandle.verified) {
      return NextResponse.json({
        verified: true,
        handle: cfHandle.handle,
        pendingToken: null,
      })
    }

    const isExpired =
      cfHandle.expires_at && new Date(cfHandle.expires_at) < new Date()

    let problem = null
    if (cfHandle.verification_problem_id && !isExpired) {
      const contestId = cfHandle.verification_problem_id.match(/^(\d+)/)?.[1] || ''
      const index = cfHandle.verification_problem_id.replace(/^\d+/, '') || ''
      problem = {
        contestId: parseInt(contestId, 10),
        index,
        url: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
      }
    }

    return NextResponse.json({
      verified: false,
      handle: cfHandle.handle,
      pendingToken: isExpired ? null : cfHandle.verification_token,
      problem: isExpired ? null : problem,
      tokenExpired: isExpired,
      expiresAt: cfHandle.expires_at,
    })
  } catch (e) {
    console.error('Verification status error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
