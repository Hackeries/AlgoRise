import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger, getRequestContext } from '@/lib/error/logger';
import { checkRateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';
import { validateData, cfVerificationStartSchema } from '@/lib/security/validation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = validateData(cfVerificationStartSchema, body);
    if (!validation.success) {
      const context = getRequestContext(req);
      logger.logValidationError(context, 'cf_handle', validation.error);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { handle } = validation.data;

    const supabase = await createClient();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    
    if (userErr || !user) {
      const context = getRequestContext(req);
      logger.logUnauthorizedAccess(context, 'cf.verification.start');
      return NextResponse.json(
        { error: 'Unauthorized. Please log in first.' },
        { status: 401 }
      );
    }

    // Apply rate limiting
    const rateLimitResponse = await checkRateLimit(
      req,
      'cf_verify_start',
      RATE_LIMITS.CF_VERIFY_START,
      user.id
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const context = getRequestContext(req);
    logger.logCFVerificationStart({ ...context, userId: user.id }, handle);

    // ✅ Verify handle exists on Codeforces
    const cfResponse = await fetch(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );
    const cfData = await cfResponse.json();

    if (cfData.status !== 'OK' || !cfData.result?.[0]) {
      logger.logCFVerificationCheck({ ...context, userId: user.id }, handle, false, new Error('Handle not found'));
      return NextResponse.json(
        { error: 'Codeforces handle not found' },
        { status: 404 }
      );
    }

    // ✅ Generate verification ID and timestamps
    const verificationId = `RG-${Math.random()
      .toString(36)
      .slice(2, 8)}-${Date.now().toString(36)}`;
    const verificationStartedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString(); // expires in 2 minutes

    // ✅ Code snippet that forces Compilation Error
    const codeSnippet = `#include <bits/stdc++.h>
      using namespace std;
      // Verification ID: ${verificationId}
      #define fastIO ios_base::sync_with_stdio(false);cin.tie(0);cout.tie(0)
      #define lli long long

      void solve(){
          cout << "AlgoRise Verification" << endl  // <-- Missing semicolon intentionally
      }

      signed main(){
          fastIO;
          lli t=1;
          cin >> t;
          while(t--){
              solve();
          }
      }`;


    // ✅ Store verification attempt in Supabase
    const { error: upErr } = await supabase.from('cf_handles').upsert(
      {
        user_id: user.id,
        handle,
        verified: false,
        verification_token: verificationId,
        verification_started_at: verificationStartedAt,
        expires_at: expiresAt,
      },
      { onConflict: 'user_id' }
    );

    if (upErr) {
      logger.logError('cf.verification.start.db_error', { ...context, userId: user.id }, upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    // ✅ Return consistent JSON response
    return NextResponse.json({
      handle,
      verificationId,
      codeSnippet,
      verificationStartedAt,
      expiresAt,
    });
  } catch (e: any) {
    const context = getRequestContext(req);
    logger.logError('cf.verification.start.error', context, e);
    return NextResponse.json(
      { error: e?.message || 'Unknown server error' },
      { status: 500 }
    );
  }
}
