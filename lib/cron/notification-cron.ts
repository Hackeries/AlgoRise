import { createClient } from '@/lib/supabase/server';
import { createNotificationService } from '@/lib/notification-service';
import { cfGetUserStatus } from '@/lib/codeforces-api';

// Types for our smart notifications
interface UserProfile {
  id: string;
  codeforces_handles: string[];
  notification_preferences: any;
}

interface Contest {
  id: string;
  name: string;
  starts_at: string;
}

interface UserStreak {
  user_id: string;
  current_streak: number;
  last_solved_date: string;
}

// Function to send daily problem reminders
export async function sendDailyProblemReminders() {
  try {
    const supabase = await createClient();
    const notificationService = await createNotificationService();

    // Get all users with active accounts
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, codeforces_handles')
      .eq('is_active', true);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    // For each user, send a daily problem reminder
    for (const user of users) {
      if (user.codeforces_handles && user.codeforces_handles.length > 0) {
        // Create notification for daily problem reminder
        await notificationService.createNotification(user.id, {
          type: 'daily_problem_reminder',
          title: 'Daily Problem Reminder',
          message: 'Time to solve your daily problem! Keep up the streak!',
          priority: 2,
        });
      }
    }

    console.log(`Sent daily problem reminders to ${users?.length || 0} users`);
  } catch (error) {
    console.error('Error sending daily problem reminders:', error);
  }
}

// Function to send upcoming contest notifications
export async function sendUpcomingContestNotifications() {
  try {
    const supabase = await createClient();
    const notificationService = await createNotificationService();

    // Get contests starting in the next hour
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    
    const { data: upcomingContests, error: contestsError } = await supabase
      .from('contests')
      .select('id, name, starts_at')
      .gte('starts_at', new Date().toISOString())
      .lte('starts_at', oneHourFromNow.toISOString())
      .eq('status', 'upcoming');

    if (contestsError) {
      console.error('Error fetching upcoming contests:', contestsError);
      return;
    }

    // For each upcoming contest, notify participants
    for (const contest of upcomingContests) {
      // Get participants of this contest
      const { data: participants, error: participantsError } = await supabase
        .from('contest_participants')
        .select('user_id')
        .eq('contest_id', contest.id);

      if (participantsError) {
        console.error(`Error fetching participants for contest ${contest.id}:`, participantsError);
        continue;
      }

      // Notify each participant
      for (const participant of participants) {
        await notificationService.createNotification(participant.user_id, {
          type: 'contest_starting',
          title: 'Contest Starting Soon!',
          message: `${contest.name} is starting in 1 hour. Get ready!`,
          data: { contestId: contest.id, contestName: contest.name },
          priority: 3,
          contestId: contest.id,
        });
      }
    }

    console.log(`Sent upcoming contest notifications for ${upcomingContests?.length || 0} contests`);
  } catch (error) {
    console.error('Error sending upcoming contest notifications:', error);
  }
}

// Function to check and send Codeforces rating change notifications
export async function sendRatingChangeNotifications() {
  try {
    const supabase = await createClient();
    const notificationService = await createNotificationService();

    // Get users with Codeforces handles
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, codeforces_handles')
      .not('codeforces_handles', 'is', null)
      .neq('codeforces_handles', '{}');

    if (usersError) {
      console.error('Error fetching users with Codeforces handles:', usersError);
      return;
    }

    // For each user, check for rating changes
    for (const user of users) {
      if (!user.codeforces_handles || user.codeforces_handles.length === 0) continue;

      // Check each handle for the user
      for (const handle of user.codeforces_handles) {
        try {
          // Get recent submissions for this handle to infer contest participation
          const recentSubmissionsResponse = await cfGetUserStatus(handle, 0, 5);
          
          if (recentSubmissionsResponse.status === "OK" && 'result' in recentSubmissionsResponse && recentSubmissionsResponse.result) {
            const submissions: any[] = Array.isArray(recentSubmissionsResponse.result) 
              ? recentSubmissionsResponse.result 
              : [recentSubmissionsResponse.result];
              
            // Process submissions to find recent contests
            for (const submission of submissions) {
              if (submission.contestId && submission.creationTimeSeconds) {
                // Check if we've already notified about this contest
                const { data: existingNotification, error: notificationError } = await supabase
                  .from('notifications')
                  .select('id')
                  .eq('user_id', user.id)
                  .eq('type', 'rating_change')
                  .eq('data->>contestId', submission.contestId.toString())
                  .maybeSingle();
                
                if (notificationError) {
                  console.error(`Error checking existing notification for user ${user.id}:`, notificationError);
                  continue;
                }
                
                // If no existing notification, create one
                if (!existingNotification) {
                  await notificationService.createNotification(user.id, {
                    type: 'rating_change',
                    title: 'Rating Update',
                    message: `Your Codeforces rating may have changed after recent contests. Check your performance!`,
                    data: { 
                      contestId: submission.contestId,
                      handle: handle
                    },
                    priority: 3,
                  });
                  
                  // Break after first notification to avoid spam
                  break;
                }
              }
            }
          }
        } catch (handleError) {
          console.error(`Error checking submissions for handle ${handle}:`, handleError);
        }
      }
    }

    console.log(`Checked rating changes for ${users?.length || 0} users`);
  } catch (error) {
    console.error('Error sending rating change notifications:', error);
  }
}

// Function to send friend joining contest notifications
export async function sendFriendJoinNotifications() {
  try {
    const supabase = await createClient();
    const notificationService = await createNotificationService();

    // Get recently joined contest participants (last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const { data: recentParticipants, error: participantsError } = await supabase
      .from('contest_participants')
      .select('user_id, contest_id, joined_at, contests(name)')
      .gte('joined_at', tenMinutesAgo.toISOString())
      .order('joined_at', { ascending: false });

    if (participantsError) {
      console.error('Error fetching recent participants:', participantsError);
      return;
    }

    // For each recent participant, check if their friends are in the same contest
    for (const participant of recentParticipants) {
      // Get friends of this participant (simplified - in a real implementation, you'd have a friends table)
      // For now, we'll just notify other participants in the same contest
      const { data: otherParticipants, error: otherParticipantsError } = await supabase
        .from('contest_participants')
        .select('user_id')
        .eq('contest_id', participant.contest_id)
        .neq('user_id', participant.user_id);

      if (otherParticipantsError) {
        console.error(`Error fetching other participants for contest ${participant.contest_id}:`, otherParticipantsError);
        continue;
      }

      // Notify other participants that someone joined
      for (const otherParticipant of otherParticipants) {
        await notificationService.createNotification(otherParticipant.user_id, {
          type: 'friend_joined_contest',
          title: 'Friend Joined Contest',
          message: `Someone joined the same contest as you. ${participant.contests?.name || 'The contest'} is getting more competitive!`,
          data: { 
            contestId: participant.contest_id,
            joinedUserId: participant.user_id
          },
          priority: 2,
          contestId: participant.contest_id,
        });
      }
    }

    console.log(`Sent friend join notifications for ${recentParticipants?.length || 0} participants`);
  } catch (error) {
    console.error('Error sending friend join notifications:', error);
  }
}