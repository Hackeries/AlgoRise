import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cfGetUserInfo, cfGetUserStatus, type CodeforcesUser } from '@/lib/codeforces-api'

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: pendingVerification, error: selectErr } = await supabase
      .from('cf_handles')
      .select('handle, verification_token, verification_problem_id, verified, expires_at')
      .eq('user_id', user.id)
      .single()

    if (selectErr || !pendingVerification) {
      return NextResponse.json(
        { error: 'No pending verification found. Please start verification first.' },
        { status: 400 }
      )
    }

    if (pendingVerification.verified) {
      return NextResponse.json({
        verified: true,
        handle: pendingVerification.handle,
        message: 'Handle is already verified',
      })
    }

    if (!pendingVerification.verification_token) {
      return NextResponse.json(
        { error: 'No verification token found. Please start verification again.' },
        { status: 400 }
      )
    }

    if (
      pendingVerification.expires_at &&
      new Date(pendingVerification.expires_at) < new Date()
    ) {
      return NextResponse.json(
        { verified: false, message: 'Verification token has expired. Please start verification again.' },
        { status: 400 }
      )
    }

    const statusResponse = await cfGetUserStatus(pendingVerification.handle, 1, 20)

    if (statusResponse.status !== 'OK' || !statusResponse.result) {
      return NextResponse.json(
        { error: 'Failed to fetch Codeforces submissions. Please try again.' },
        { status: 502 }
      )
    }

    const submissions = statusResponse.result as any[]
    const token = pendingVerification.verification_token.toUpperCase()
    const problemId = pendingVerification.verification_problem_id

    let foundCEWithToken = false
    let foundSubmission: any = null

    for (const submission of submissions) {
      const submissionProblemId = `${submission.problem?.contestId || ''}${submission.problem?.index || ''}`

      if (submissionProblemId === problemId && submission.verdict === 'COMPILATION_ERROR') {
        foundCEWithToken = true
        foundSubmission = submission
        break
      }
    }

    if (!foundCEWithToken) {
      const cfResponse = await cfGetUserInfo(pendingVerification.handle)
      if (cfResponse.status !== 'OK' || !cfResponse.result?.[0]) {
        return NextResponse.json(
          { error: 'Failed to fetch Codeforces user info. Please try again.' },
          { status: 502 }
        )
      }

      const contestId = problemId?.match(/^(\d+)/)?.[1] || ''
      const index = problemId?.replace(/^\d+/, '') || ''

      return NextResponse.json({
        verified: false,
        message: `Compilation Error submission not found for the specified problem. Make sure you submitted a solution containing "${pendingVerification.verification_token}" to problem ${contestId}${index} on Codeforces.`,
        hint: 'Submit code like: ' + pendingVerification.verification_token,
      })
    }

    const cfResponse = await cfGetUserInfo(pendingVerification.handle)
    if (cfResponse.status !== 'OK' || !cfResponse.result?.[0]) {
      return NextResponse.json(
        { error: 'Failed to fetch Codeforces user info. Please try again.' },
        { status: 502 }
      )
    }

    const cfUser = cfResponse.result[0] as CodeforcesUser

    const { error: updateErr } = await supabase
      .from('cf_handles')
      .update({
        verified: true,
        verification_token: null,
        verification_problem_id: null,
        expires_at: null,
        last_sync_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (updateErr) {
      console.error('Failed to update verification status:', updateErr)
      return NextResponse.json(
        { error: 'Failed to complete verification' },
        { status: 500 }
      )
    }

    const { error: snapshotErr } = await supabase.from('cf_snapshots').insert({
      user_id: user.id,
      handle: cfUser.handle,
      rating: cfUser.rating ?? null,
      max_rating: cfUser.maxRating ?? null,
      rank: cfUser.rank ?? null,
      max_rank: cfUser.maxRank ?? null,
      contribution: null,
      friend_of_count: null,
      solved_count: null,
      fetched_at: new Date().toISOString(),
    })

    if (snapshotErr) {
      console.error('Failed to insert snapshot:', snapshotErr)
    }

    return NextResponse.json({
      verified: true,
      handle: cfUser.handle,
      rating: cfUser.rating ?? null,
      maxRating: cfUser.maxRating ?? null,
      rank: cfUser.rank ?? null,
    })
  } catch (e) {
    console.error('Verification check error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
