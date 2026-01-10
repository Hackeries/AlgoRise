import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/notifications/settings - Get user's notification settings
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Authentication check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get notification settings
    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error fetching notification settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notification settings' },
        { status: 500 }
      );
    }

    // Return default settings if none exist
    if (!settings) {
      const defaultSettings = {
        user_id: user.id,
        email_daily_problem_reminder: true,
        email_contest_starting: true,
        email_rating_change: true,
        email_friend_joined_contest: true,
        email_group_invites: true,
        email_achievements: true,
        email_system_announcements: true,
        push_daily_problem_reminder: true,
        push_contest_starting: true,
        push_rating_change: true,
        push_friend_joined_contest: true,
        push_group_invites: true,
        push_achievements: true,
        push_system_announcements: false,
        digest_frequency: 'daily',
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        timezone: 'UTC',
      };

      return NextResponse.json({ settings: defaultSettings });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error in notification settings GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/settings - Update user's notification settings
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Authentication check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      email_daily_problem_reminder,
      email_contest_starting,
      email_rating_change,
      email_friend_joined_contest,
      email_group_invites,
      email_achievements,
      email_system_announcements,
      push_daily_problem_reminder,
      push_contest_starting,
      push_rating_change,
      push_friend_joined_contest,
      push_group_invites,
      push_achievements,
      push_system_announcements,
      digest_frequency,
      quiet_hours_start,
      quiet_hours_end,
      timezone,
    } = body;

    // Validate digest_frequency
    if (
      digest_frequency &&
      !['none', 'daily', 'weekly'].includes(digest_frequency)
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid digest_frequency. Must be one of: none, daily, weekly',
        },
        { status: 400 }
      );
    }

    // Upsert notification settings
    const { data: settings, error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: user.id,
        email_daily_problem_reminder,
        email_contest_starting,
        email_rating_change,
        email_friend_joined_contest,
        email_group_invites,
        email_achievements,
        email_system_announcements,
        push_daily_problem_reminder,
        push_contest_starting,
        push_rating_change,
        push_friend_joined_contest,
        push_group_invites,
        push_achievements,
        push_system_announcements,
        digest_frequency,
        quiet_hours_start,
        quiet_hours_end,
        timezone,
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating notification settings:', error);
      return NextResponse.json(
        { error: 'Failed to update notification settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      settings,
      message: 'Notification settings updated successfully',
    });
  } catch (error) {
    console.error('Error in notification settings PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
