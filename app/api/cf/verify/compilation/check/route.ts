import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger, getRequestContext } from '@/lib/error/logger';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { validateData, cfVerificationCheckSchema } from '@/lib/security/validation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = validateData(cfVerificationCheckSchema, { 
      handle: body.handle || '', 
      verificationId: body.verificationId || '' 
    });
    if (!validation.success) {
      const context = getRequestContext(req);
      logger.logValidationError(context, 'cf_verification', validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { verificationId } = validation.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      const context = getRequestContext(req);
      logger.logUnauthorizedAccess(context, 'cf.verification.check');
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const rateLimitResponse = await checkRateLimit(
      req,
      'cf_verify_check',
      RATE_LIMITS.CF_VERIFY_CHECK,
      user.id
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const context = getRequestContext(req);

    // Fetch verification data
    const { data: row, error: selErr } = await supabase
      .from('cf_handles')
      .select(
        'handle, verification_token, verification_started_at, expires_at, verified'
      )
      .eq('user_id', user.id)
      .single();

    if (selErr || !row) {
      logger.logCFVerificationCheck({ ...context, userId: user.id }, '', false, new Error('No verification attempt found'));
      return NextResponse.json(
        { error: 'no verification attempt found' },
        { status: 400 }
      );
    }

    if (row.verified) {
      logger.logCFVerificationCheck({ ...context, userId: user.id }, row.handle, true);
      return NextResponse.json({ verified: true, handle: row.handle });
    }

    // Check expiration
    const now = new Date();
    const expiry = new Date(row.expires_at);
    if (now > expiry) {
      logger.logCFVerificationCheck({ ...context, userId: user.id }, row.handle, false, new Error('Verification expired'));
      return NextResponse.json(
        { verified: false, message: 'Verification expired' },
        { status: 200 }
      );
    }

    if (row.verification_token !== verificationId) {
      logger.logCFVerificationCheck({ ...context, userId: user.id }, row.handle, false, new Error('Invalid verification ID'));
      return NextResponse.json(
        { verified: false, message: 'Invalid verification ID' },
        { status: 400 }
      );
    }

    // Fetch recent CF submissions
    const cfResponse = await fetch(
      `https://codeforces.com/api/user.status?handle=${row.handle}&from=1&count=10`
    );
    const cfData = await cfResponse.json();

    if (cfData.status !== 'OK') {
      logger.logCFVerificationCheck({ ...context, userId: user.id }, row.handle, false, new Error('Failed to fetch submissions'));
      return NextResponse.json(
        { verified: false, message: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    const recentSubmission = cfData.result?.find(
      (sub: any) =>
        sub.problem?.contestId === 1631 &&
        sub.problem?.index === 'B' &&
        sub.verdict === 'COMPILATION_ERROR'
    );

    if (!recentSubmission) {
      logger.logCFVerificationCheck({ ...context, userId: user.id }, row.handle, false, new Error('No compilation error submission found'));
      return NextResponse.json(
        {
          verified: false,
          message: 'No compilation error submission found for Problem 1631B',
        },
        { status: 200 }
      );
    }

    // Validate submission time
    const submissionTime = new Date(
      recentSubmission.creationTimeSeconds * 1000
    );
    const verificationStart = new Date(row.verification_started_at);

    if (submissionTime < verificationStart) {
      logger.logCFVerificationCheck({ ...context, userId: user.id }, row.handle, false, new Error('Submission was made before verification started'));
      return NextResponse.json(
        {
          verified: false,
          message: 'Submission was made before verification started',
        },
        { status: 200 }
      );
    }

    if (submissionTime > expiry) {
      logger.logCFVerificationCheck({ ...context, userId: user.id }, row.handle, false, new Error('Submission made after verification expired'));
      return NextResponse.json(
        {
          verified: false,
          message: 'Submission made after verification expired',
        },
        { status: 200 }
      );
    }

    // Fetch user info
    const userInfoResponse = await fetch(
      `https://codeforces.com/api/user.info?handles=${row.handle}`
    );
    const userInfoData = await userInfoResponse.json();
    if (userInfoData.status !== 'OK' || !userInfoData.result?.[0]) {
      logger.logCFVerificationCheck({ ...context, userId: user.id }, row.handle, false, new Error('Failed to fetch user info'));
      return NextResponse.json(
        { verified: false, message: 'Failed to fetch user info' },
        { status: 500 }
      );
    }

    const cfUser = userInfoData.result[0];

    // Update verified status
    const { error: upErr } = await supabase
      .from('cf_handles')
      .update({
        verified: true,
        verification_token: null,
        last_sync_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (upErr) {
      logger.logCFVerificationCheck({ ...context, userId: user.id }, row.handle, false, upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    // Insert snapshot - using existing cf_snapshots schema
    const { error: snapshotErr } = await supabase.from('cf_snapshots').insert({
      user_id: user.id,
      handle: cfUser.handle,
      last_rating: cfUser.rating ?? null,
      last_contest: null,
      rating_delta: 0,
      fetched_at: new Date().toISOString(),
    });

    if (snapshotErr) {
      logger.logError('cf.verification.snapshot.error', { ...context, userId: user.id, handle: cfUser.handle }, snapshotErr);
      // Don't fail the verification if snapshot insertion fails - verification is still successful
    }

    logger.logCFVerificationComplete({ ...context, userId: user.id }, cfUser.handle);

    return NextResponse.json({
      verified: true,
      handle: cfUser.handle,
      rating: cfUser.rating ?? null,
      maxRating: cfUser.maxRating ?? null,
      rank: cfUser.rank ?? 'unrated',
    });
  } catch (e: any) {
    const context = getRequestContext(req);
    logger.logError('cf.verification.check.error', context, e);
    return NextResponse.json(
      { error: e?.message || 'unknown error' },
      { status: 500 }
    );
  }
}
