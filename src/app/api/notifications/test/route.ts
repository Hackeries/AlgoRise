import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createNotificationService } from '@/lib/notification-service';
import RealTimeNotificationManager from '@/lib/realtime-notifications';

export const dynamic = 'force-dynamic';

// POST /api/notifications/test - Test notification system
export async function POST(req: NextRequest) {
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
    const { testType = 'basic', ...params } = body;

    const notificationService = await createNotificationService();
    const rtManager = RealTimeNotificationManager.getInstance();

    let result;

    switch (testType) {
      case 'basic':
        // Test basic notification creation
        result = await notificationService.createNotification(user.id, {
          type: 'system_announcement',
          title: 'Test Notification',
          message:
            'This is a test notification to verify the system is working correctly.',
          priority: 2,
        });

        if (result.success && result.notification) {
          // Send real-time notification
          await rtManager.sendToUser(user.id, result.notification);
        }
        break;

      case 'achievement':
        // Test achievement notification
        result = await notificationService.notifyAchievement(
          user.id,
          'streak_milestone',
          { days: params.days || 7 }
        );
        break;

      case 'contest':
        // Test contest notification
        const contestName = params.contestName || 'Test Contest';
        const startTime =
          params.startTime || new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

        result = await notificationService.createNotification(user.id, {
          type: 'contest_starting',
          title: 'Contest Starting Soon!',
          message: `${contestName} will start at ${new Date(startTime).toLocaleString()}`,
          priority: 3,
          data: { contestName, startTime },
        });
        break;

      case 'realtime':
        // Test real-time functionality
        await rtManager.sendToUser(user.id, {
          id: 'test-realtime',
          type: 'test',
          title: 'Real-time Test',
          message: 'This notification was sent via real-time connection',
          priority: 1,
          created_at: new Date().toISOString(),
        });

        result = { success: true, message: 'Real-time notification sent' };
        break;

      case 'bulk':
        // Test bulk notifications (send to current user multiple times)
        const notifications = [
          {
            type: 'system_announcement' as const,
            title: 'Bulk Test 1',
            message: 'First bulk notification',
            priority: 1,
          },
          {
            type: 'system_announcement' as const,
            title: 'Bulk Test 2',
            message: 'Second bulk notification',
            priority: 2,
          },
          {
            type: 'achievement' as const,
            title: 'Bulk Test 3',
            message: 'Third bulk notification (achievement)',
            priority: 4,
          },
        ];

        const bulkResults = await Promise.all(
          notifications.map(notif =>
            notificationService.createNotification(user.id, notif)
          )
        );

        result = {
          success: bulkResults.every(r => r.success),
          count: bulkResults.filter(r => r.success).length,
          details: bulkResults,
        };
        break;

      case 'cleanup':
        // Test cleanup functionality
        result = await notificationService.cleanupExpiredNotifications();
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      testType,
      result,
      timestamp: new Date().toISOString(),
      connectionStats: {
        activeUsers: rtManager.getActiveUsersCount(),
        totalConnections: rtManager.getTotalConnectionsCount(),
      },
    });
  } catch (error) {
    console.error('Error in notification test:', error);
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET /api/notifications/test - Get test status and stats
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

    const rtManager = RealTimeNotificationManager.getInstance();

    // Get recent notifications for the user
    const { data: recentNotifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get unread count
    const { data: unreadCount } = await supabase.rpc(
      'get_unread_notification_count',
      { target_user_id: user.id }
    );

    return NextResponse.json({
      status: 'ok',
      user: {
        id: user.id,
        email: user.email,
      },
      notifications: {
        recent: recentNotifications || [],
        unreadCount: unreadCount || 0,
      },
      realTime: {
        activeUsers: rtManager.getActiveUsersCount(),
        totalConnections: rtManager.getTotalConnectionsCount(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting test status:', error);
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    );
  }
}
