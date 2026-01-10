import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// POST /api/notifications/mark-read - Mark notifications as read
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Authentication check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'You need to be signed in to manage notifications' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { notificationIds, markAll = false } = body;

    if (markAll) {
      const { data: affectedCount } = await supabase.rpc(
        'mark_all_notifications_read',
        { target_user_id: user.id }
      );

      return NextResponse.json({
        success: true,
        markedCount: affectedCount || 0,
        message: 'All notifications marked as read',
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .in('id', notificationIds)
        .is('read_at', null);

      if (error) {
        console.error('Error marking notifications as read:', error);
        return NextResponse.json(
          { error: 'Unable to update notifications. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        markedCount: notificationIds.length,
        message: 'Selected notifications marked as read',
      });
    } else {
      return NextResponse.json(
        {
          error:
            'Invalid request. Please provide notification IDs or set markAll to true.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in mark-read API:', error);
    return NextResponse.json(
      { error: 'Something went wrong updating notifications' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/mark-read - Get unread count
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Authentication check
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'You need to be signed in to view notifications' },
        { status: 401 }
      );
    }

    // Get unread count
    const { data: unreadCount } = await supabase.rpc(
      'get_unread_notification_count',
      { target_user_id: user.id }
    );

    return NextResponse.json({
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return NextResponse.json(
      { error: 'Unable to load notification count' },
      { status: 500 }
    );
  }
}
