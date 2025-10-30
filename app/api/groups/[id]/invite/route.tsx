import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { NotificationService } from '@/lib/notification-service';

const generateAlgoRiseEmail = (
  groupName: string,
  inviteLink: string,
  role: string
) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .features { margin: 20px 0; }
          .feature-item { margin: 12px 0; padding-left: 20px; }
          .feature-item:before { content: "⚡"; margin-right: 10px; }
          .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
          .badge { display: inline-block; background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 AlgoRise</h1>
            <p>You're Invited to Join a Competitive Programming Group</p>
          </div>
          <div class="content">
            <p>Hey there!</p>
            <p>You've been invited to join <strong>"${groupName}"</strong> on <strong>AlgoRise</strong> as a <span class="badge">${role.toUpperCase()}</span>.</p>
            
            <p><strong>What is AlgoRise?</strong></p>
            <p>AlgoRise is a competitive programming platform designed for serious coders who want to master algorithms and climb the ratings ladder from Pupil to Master.</p>
            
            <p><strong>What You'll Get:</strong></p>
            <div class="features">
              <div class="feature-item">Curated problem sets from Codeforces, AtCoder, and LeetCode</div>
              <div class="feature-item">Real-time contests and practice sessions</div>
              <div class="feature-item">AI-powered analytics to track your progress</div>
              <div class="feature-item">Collaborate with teammates and compete together</div>
              <div class="feature-item">Climb ratings from Pupil → Specialist → Expert → Candidate Master → Master</div>
            </div>
            
            <p><strong>Ready to start grinding?</strong></p>
            <a href="${inviteLink}" class="cta-button">Join ${groupName} Now</a>
            
            <p style="font-size: 12px; color: #666;">Or copy this link: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${inviteLink}</code></p>
            
            <p>See you on AlgoRise!</p>
            <p><strong>The AlgoRise Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 AlgoRise. All rights reserved.</p>
            <p>This is an automated message. Please don't reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: groupId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Ensure caller is at least a member
  const { data: membership } = await supabase
    .from('group_memberships')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single();

  if (!membership)
    return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  // Read existing code, or generate then persist
  const { data: groupRow, error: selErr } = await supabase
    .from('groups')
    .select('invite_code')
    .eq('id', groupId)
    .single();
  if (selErr)
    return NextResponse.json(
      { error: selErr.message || 'Failed to read group' },
      { status: 500 }
    );

  let inviteCode = (groupRow?.invite_code as string | null) || null;
  if (!inviteCode) {
    inviteCode = randomUUID();
    const { error: upErr } = await supabase
      .from('groups')
      .update({ invite_code: inviteCode })
      .eq('id', groupId);
    if (upErr)
      return NextResponse.json(
        { error: upErr.message || 'Failed to save invite code' },
        { status: 500 }
      );
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://myalgorise.in';
  const inviteLink = `${base}/groups/join/${inviteCode}`;
  return NextResponse.json({ link: inviteLink, code: inviteCode });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: groupId } = await params;
  const supabase = await createClient();

  const body = await req.json().catch(() => ({}));
  const email = (body?.email as string | undefined)?.trim();
  const role = (body?.role as 'member' | 'moderator' | undefined) || 'member';
  const inviteCode = (body?.code as string | undefined) || '';

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // If email provided → create invitation record and send email
  if (email) {
    // Must be admin or moderator to invite
    const { data: membership } = await supabase
      .from('group_memberships')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();
    if (!membership || !['admin', 'moderator'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Not authorized to invite' },
        { status: 403 }
      );
    }

    // Get group name and inviter's profile
    const { data: groupData } = await supabase
      .from('groups')
      .select('name')
      .eq('id', groupId)
      .single();

    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const inviterName = inviterProfile?.name || 'A team member';
    const groupName = groupData?.name || 'AlgoRise Group';

    // Ensure group has an invite_code and link
    const getRes = await GET(req, { params: Promise.resolve({ id: groupId }) });
    if (getRes.status !== 200) return getRes;
    const { code, link } = await getRes.json();

    // Track success/failure of different channels
    let emailSent = false;
    let notificationCreated = false;
    const errors: string[] = [];

    // 1. Try to find the user by email and create in-app notification
    const serviceRoleClient = await createServiceRoleClient();
    if (serviceRoleClient) {
      try {
        // Query auth.users to find user by email using admin API
        const { data: userData, error: userError } = await serviceRoleClient.auth.admin.getUserByEmail(email);

        if (userData?.user?.id && !userError) {
          const targetUserId = userData.user.id;
          // User exists - create in-app notification
          const notificationService = new NotificationService(serviceRoleClient);
          const result = await notificationService.notifyGroupInvite(
            targetUserId,
            groupId,
            groupName,
            inviterName
          );
          
          if (result.success) {
            notificationCreated = true;
            console.log('[v0] In-app notification created for', email);
          } else {
            console.error('[v0] Failed to create notification:', result.error);
            errors.push('In-app notification failed');
          }
        } else {
          console.log('[v0] User with email', email, 'not found in system - will only send email');
        }
      } catch (error) {
        console.error('[v0] Error checking for user or creating notification:', error);
        errors.push('Notification system error');
      }

      // 2. Insert invitation record
      const { error: insErr } = await serviceRoleClient
        .from('group_invitations')
        .insert({
          group_id: groupId,
          email,
          role,
          code,
          created_by: user.id,
        });
      if (insErr) {
        console.log('[v0] group_invitations insert error:', insErr.message);
      }
    }

    // 3. Try to send email
    try {
      const emailHtml = generateAlgoRiseEmail(groupName, link, role);

      if (process.env.RESEND_API_KEY) {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'AlgoRise Groups <groups@algorise.in>',
            to: email,
            subject: `Join ${groupName} on AlgoRise - Competitive Programming`,
            html: emailHtml,
          }),
        });

        if (emailRes.ok) {
          emailSent = true;
          console.log('[v0] Email sent successfully to', email);
        } else {
          const errorText = await emailRes.text();
          console.error('[v0] Email send failed:', errorText);
          errors.push('Email delivery failed');
        }
      } else {
        console.log('[v0] RESEND_API_KEY not configured - email not sent');
        errors.push('Email service not configured');
      }
    } catch (error) {
      console.error('[v0] Email error:', error);
      errors.push('Email sending error');
    }

    // Determine response based on what succeeded
    let message = '';
    if (notificationCreated && emailSent) {
      message = 'Invitation sent! The user will receive both an in-app notification and an email.';
    } else if (notificationCreated) {
      message = 'Invitation sent! The user will receive an in-app notification. (Email delivery unavailable)';
    } else if (emailSent) {
      message = 'Invitation email sent successfully!';
    } else {
      message = 'Invitation link generated. Please share the link manually.';
    }

    return NextResponse.json({
      ok: true,
      link,
      code,
      message,
      emailSent,
      notificationCreated,
      errors: errors.length > 0 ? errors : undefined,
    });
  }

  // Otherwise treat as "join by code" for current user
  if (!inviteCode)
    return NextResponse.json(
      { error: 'Invite code required' },
      { status: 400 }
    );

  const { data: group } = await supabase
    .from('groups')
    .select('type, college_id, invite_code, max_members')
    .eq('id', groupId)
    .eq('invite_code', inviteCode)
    .single();
  if (!group)
    return NextResponse.json({ error: 'Invalid invite code' }, { status: 400 });

  // College check for ICPC/college groups
  if ((group.type === 'icpc' || group.type === 'college') && group.college_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('college_id')
      .eq('user_id', user.id)
      .single();
    if (!profile?.college_id || profile.college_id !== group.college_id) {
      return NextResponse.json(
        {
          error: `College mismatch. ${
            group.type === 'icpc' ? 'ICPC teams' : 'College groups'
          } require same college.`,
        },
        { status: 400 }
      );
    }
  }

  const { count } = await supabase
    .from('group_memberships')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId);
  if (group.max_members && count && count >= group.max_members) {
    return NextResponse.json(
      { error: `Group is full (max ${group.max_members} members)` },
      { status: 400 }
    );
  }

  const serviceRoleClient = await createServiceRoleClient();
  if (!serviceRoleClient) {
    return NextResponse.json(
      { error: 'Service role not configured' },
      { status: 500 }
    );
  }

  const { error } = await serviceRoleClient
    .from('group_memberships')
    .upsert(
      { group_id: groupId, user_id: user.id, role: 'member' },
      { onConflict: 'group_id,user_id' }
    );
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}