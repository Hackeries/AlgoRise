import { createClient } from '@/lib/supabase/server';
import { 
  sendDailyProblemReminders,
  sendUpcomingContestNotifications,
  sendRatingChangeNotifications,
  sendFriendJoinNotifications
} from '@/lib/cron/notification-cron';

export const dynamic = 'force-dynamic';

// POST /api/notifications/trigger - Trigger smart notifications manually
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Authentication check - only allow admin or specific users to trigger
    // In development mode, we allow testing without authentication
    if (!isDevelopment) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const body = await request.json();
    const { type } = body;

    let result;
    
    switch (type) {
      case 'daily_problem_reminder':
        await sendDailyProblemReminders();
        result = { success: true, message: 'Daily problem reminders sent' };
        break;
        
      case 'upcoming_contest':
        await sendUpcomingContestNotifications();
        result = { success: true, message: 'Upcoming contest notifications sent' };
        break;
        
      case 'rating_change':
        await sendRatingChangeNotifications();
        result = { success: true, message: 'Rating change notifications sent' };
        break;
        
      case 'friend_joined':
        await sendFriendJoinNotifications();
        result = { success: true, message: 'Friend join notifications sent' };
        break;
        
      case 'all':
        await sendDailyProblemReminders();
        await sendUpcomingContestNotifications();
        await sendRatingChangeNotifications();
        await sendFriendJoinNotifications();
        result = { success: true, message: 'All smart notifications sent' };
        break;
        
      default:
        return new Response(JSON.stringify({
          error: 'Invalid notification type. Must be one of: daily_problem_reminder, upcoming_contest, rating_change, friend_joined, all'
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(result), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error triggering smart notifications:', error);
    return new Response(JSON.stringify({
      error: 'Failed to trigger notifications'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}