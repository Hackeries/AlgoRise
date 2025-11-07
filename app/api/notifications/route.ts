import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createNotificationService } from '@/lib/notification-service';
import RealTimeNotificationManager from '@/lib/realtime-notifications';

export const dynamic = 'force-dynamic';

// Lightweight, relatable logger for this route
const SCOPE = 'Notifications';
const log = {
  info: (msg: string, meta?: unknown) =>
    meta !== undefined
      ? console.log(`${SCOPE} - ${msg}`, meta)
      : console.log(`${SCOPE} - ${msg}`),
  warn: (msg: string, meta?: unknown) =>
    meta !== undefined
      ? console.warn(`${SCOPE} - ${msg}`, meta)
      : console.warn(`${SCOPE} - ${msg}`),
  error: (msg: string, meta?: unknown) =>
    meta !== undefined
      ? console.error(`${SCOPE} - ${msg}`, meta)
      : console.error(`${SCOPE} - ${msg}`),
};

export async function GET(_req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Quiet for logged-out users to avoid noisy 401 spam:
    if (!user || authError) {
      log.warn('GET - unauthenticated; returning empty notifications');
      return NextResponse.json(
        {
          status: 'ok',
          notifications: [],
          unreadCount: 0,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    }

    // Recent notifications
    const { data: recentNotifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (notifError) {
      log.error('GET - failed to fetch notifications', notifError);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    // Unread count (non-fatal)
    const { data: unreadData, error: countError } = await supabase.rpc(
      'get_unread_notification_count',
      {
        target_user_id: user.id,
      }
    );

    if (countError) {
      log.warn(
        'GET - failed to fetch unread count, defaulting to 0',
        countError
      );
    }

    const unreadCount = typeof unreadData === 'number' ? unreadData : 0;

    return NextResponse.json({
      status: 'ok',
      notifications: recentNotifications || [],
      unreadCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error('GET - unexpected error', error);
    return NextResponse.json(
      {
        error: 'Failed to get notifications',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/notifications/test - Test notification system
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      log.warn('POST test - unauthenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { testType = 'basic', ...params } = body ?? {};

    const notificationService = await createNotificationService();
    const rtManager = RealTimeNotificationManager.getInstance();

    let result: any;

    switch (testType) {
      case 'basic': {
        result = await notificationService.createNotification(user.id, {
          type: 'system_announcement',
          title: 'Test Notification',
          message:
            'This is a test notification to verify the system is working correctly.',
          priority: 2,
        });
        if (result?.success && result?.notification) {
          await rtManager.sendToUser(user.id, result.notification);
        }
        break;
      }

      case 'achievement': {
        result = await notificationService.notifyAchievement(
          user.id,
          'streak_milestone',
          {
            days: params.days || 7,
          }
        );
        break;
      }

      case 'contest': {
        const contestName = params.contestName || 'Test Contest';
        const startTime =
          typeof params.startTime === 'string'
            ? params.startTime
            : new Date(Date.now() + 3600000).toISOString();
        result = await notificationService.createNotification(user.id, {
          type: 'contest_starting',
          title: 'Contest Starting Soon!',
          message: `${contestName} will start at ${new Date(
            startTime
          ).toLocaleString()}`,
          priority: 3,
          data: { contestName, startTime },
        });
        break;
      }

      case 'realtime': {
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
      }

      case 'bulk': {
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
          success: bulkResults.every(r => r?.success),
          count: bulkResults.filter(r => r?.success).length,
          details: bulkResults,
        };
        break;
      }

      case 'cleanup': {
        result = await notificationService.cleanupExpiredNotifications();
        break;
      }

      default: {
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        );
      }
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
    log.error('POST test - unexpected error', error);
    return NextResponse.json(
      {
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
