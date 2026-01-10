import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cfGetUserInfo } from '@/lib/codeforces-api'

function generateVerificationCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `AR-${code}`
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
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { error: upsertErr } = await supabase.from('cf_handles').upsert(
      {
        user_id: user.id,
        handle: normalizedHandle,
        verified: false,
        verification_token: token,
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

    return NextResponse.json({
      handle: normalizedHandle,
      token,
      expiresAt,
      instructions: `To verify ownership of your Codeforces account, add "${token}" to your Organization field on Codeforces. Go to codeforces.com/settings/social and paste the token in the "Organization" field, then save. Once done, click "Verify" to complete the process. You can remove the token after verification.`,
    })
  } catch (e) {
    console.error('Verification start error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
