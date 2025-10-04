import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import RealTimeNotificationManager from '@/lib/realtime-notifications';

export const dynamic = 'force-dynamic';

// WebSocket-like functionality using Server-Sent Events (SSE)
// GET /api/notifications/sse - Establish SSE connection for real-time notifications
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

    // Set up SSE headers
    const encoder = new TextEncoder();
    const rtManager = RealTimeNotificationManager.getInstance();

    const customReadable = new ReadableStream({
      start(controller) {
        // Add connection to real-time manager
        rtManager.addConnection(user.id, controller);

        // Send initial connection message
        const data = JSON.stringify({
          type: 'connected',
          message: 'Connected to notifications stream',
          timestamp: new Date().toISOString(),
          stats: {
            activeUsers: rtManager.getActiveUsersCount(),
            totalConnections: rtManager.getTotalConnectionsCount(),
          },
        });

        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

        // Send initial unread count
        const sendInitialUnreadCount = async () => {
          try {
            const { data: unreadCount } = await supabase.rpc(
              'get_unread_notification_count',
              { target_user_id: user.id }
            );

            const unreadData = JSON.stringify({
              type: 'unread_count_update',
              unreadCount: unreadCount || 0,
              timestamp: new Date().toISOString(),
            });

            controller.enqueue(encoder.encode(`data: ${unreadData}\n\n`));
          } catch (error) {
            console.error('Error sending initial unread count:', error);
          }
        };

        sendInitialUnreadCount();

        // Set up periodic heartbeat
        const heartbeat = setInterval(() => {
          try {
            const heartbeatData = JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
            });
            controller.enqueue(encoder.encode(`data: ${heartbeatData}\n\n`));
          } catch (error) {
            console.error('Error sending heartbeat:', error);
            clearInterval(heartbeat);
            rtManager.removeConnection(user.id, controller);
            controller.close();
          }
        }, 30000); // Send heartbeat every 30 seconds

        // Cleanup on connection close
        const cleanup = () => {
          clearInterval(heartbeat);
          rtManager.removeConnection(user.id, controller);
          controller.close();
        };

        req.signal?.addEventListener('abort', cleanup);

        // Handle any errors in the stream
        const originalEnqueue = controller.enqueue.bind(controller);
        controller.enqueue = (chunk: any) => {
          try {
            return originalEnqueue(chunk);
          } catch (error) {
            cleanup();
            throw error;
          }
        };
      },
    });

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  } catch (error) {
    console.error('Error in SSE notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
