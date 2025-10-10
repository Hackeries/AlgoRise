import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { handle } = await req.json();
    if (!handle || typeof handle !== 'string') {
      return NextResponse.json(
        { error: 'Codeforces handle is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user)
      return NextResponse.json(
        { error: 'Unauthorized. Please log in first.' },
        { status: 401 }
      );

    // ✅ Verify handle exists on Codeforces
    const cfResponse = await fetch(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );
    const cfData = await cfResponse.json();

    if (cfData.status !== 'OK' || !cfData.result?.[0]) {
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
    return NextResponse.json(
      { error: e?.message || 'Unknown server error' },
      { status: 500 }
    );
  }
}
