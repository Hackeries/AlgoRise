import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Get CF handle verification status
    const { data: cfHandle } = await supabase
      .from('cf_handles')
      .select('handle, verified')
      .eq('user_id', user.id)
      .single();

    const { data: profile } = await supabase
      .from('profiles')
      .select(
        'name, status, degree_type, college_id, year, company_id, custom_company, colleges(name), companies(name), leetcode_handle, codechef_handle, atcoder_handle, gfg_handle'
      )
      .eq('user_id', user.id)
      .single();

    // Normalize related names
    const collegeName = Array.isArray((profile as any)?.colleges)
      ? (profile as any)?.colleges?.[0]?.name
      : (profile as any)?.colleges?.name;
    const companyName = Array.isArray((profile as any)?.companies)
      ? (profile as any)?.companies?.[0]?.name
      : (profile as any)?.companies?.name;

    return NextResponse.json({
      name: profile?.name || '',
      full_name: profile?.name || '',
      cf_verified: cfHandle?.verified || false,
      cf_handle: cfHandle?.handle || '',
      status: profile?.status || null,
      degree_type: profile?.degree_type || '',
      college_id: profile?.college_id || '',
      college_name: collegeName || '',
      year: profile?.year || '',
      company_id: profile?.company_id || '',
      company_name: companyName || '',
      custom_company: profile?.custom_company || '',
      leetcode_handle: (profile as any)?.leetcode_handle || '',
      codechef_handle: (profile as any)?.codechef_handle || '',
      atcoder_handle: (profile as any)?.atcoder_handle || '',
      gfg_handle: (profile as any)?.gfg_handle || '',
    });
  } catch (e: any) {
    console.error('Failed to fetch profile:', e);
    return NextResponse.json(
      { error: e?.message || 'unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      status,
      degree_type,
      college_id,
      year,
      company_id,
      custom_company,
      leetcode_handle,
      codechef_handle,
      atcoder_handle,
      gfg_handle,
    } = body;

    const isPartialUpdate =
      !status &&
      (leetcode_handle !== undefined ||
        codechef_handle !== undefined ||
        atcoder_handle !== undefined ||
        gfg_handle !== undefined);

    if (isPartialUpdate) {
      const updateData: any = {
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (leetcode_handle !== undefined)
        updateData.leetcode_handle = leetcode_handle || null;
      if (codechef_handle !== undefined)
        updateData.codechef_handle = codechef_handle || null;
      if (atcoder_handle !== undefined)
        updateData.atcoder_handle = atcoder_handle || null;
      if (gfg_handle !== undefined) updateData.gfg_handle = gfg_handle || null;

      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert(updateData, { onConflict: 'user_id' });

      if (upsertErr) {
        console.error('Failed to update profile:', upsertErr);
        return NextResponse.json({ error: upsertErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (!status || !['student', 'working'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "student" or "working"' },
        { status: 400 }
      );
    }

    if (status === 'student' && (!degree_type || !college_id || !year)) {
      return NextResponse.json(
        { error: 'Degree type, college, and year are required for students' },
        { status: 400 }
      );
    }

    if (status === 'working' && !company_id) {
      return NextResponse.json(
        { error: 'Company is required for working professionals' },
        { status: 400 }
      );
    }

    // Upsert profile
    const { error: upsertErr } = await supabase.from('profiles').upsert(
      {
        user_id: user.id,
        status,
        degree_type: status === 'student' ? degree_type : null,
        college_id: status === 'student' ? college_id : null,
        year: status === 'student' ? year : null,
        company_id: status === 'working' ? company_id : null,
        custom_company: status === 'working' ? custom_company : null,
        leetcode_handle: leetcode_handle ?? null,
        codechef_handle: codechef_handle ?? null,
        atcoder_handle: atcoder_handle ?? null,
        gfg_handle: gfg_handle ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (upsertErr) {
      console.error('Failed to update profile:', upsertErr);
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Profile update failed:', e);
    return NextResponse.json(
      { error: e?.message || 'unknown error' },
      { status: 500 }
    );
  }
}