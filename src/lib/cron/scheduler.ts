// Scheduler for running notification cron jobs at specified intervals
import { 
  sendDailyProblemReminders,
  sendUpcomingContestNotifications,
  sendRatingChangeNotifications,
  sendFriendJoinNotifications
} from './notification-cron';

// Schedule configurations (in minutes)
const SCHEDULES = {
  DAILY_PROBLEM_REMINDERS: 15,     // Every 15 minutes
  UPCOMING_CONTESTS: 30,           // Every 30 minutes
  RATING_CHANGES: 60,              // Every 60 minutes
  FRIEND_JOINS: 10                 // Every 10 minutes
};

// Store interval IDs for cleanup
const intervals: any[] = [];

export function startNotificationScheduler() {
  console.log('Starting notification scheduler...');
  
  // Schedule daily problem reminders
  const dailyProblemInterval = setInterval(
    sendDailyProblemReminders,
    SCHEDULES.DAILY_PROBLEM_REMINDERS * 60 * 1000
  );
  intervals.push(dailyProblemInterval);
  
  // Schedule upcoming contest notifications
  const upcomingContestInterval = setInterval(
    sendUpcomingContestNotifications,
    SCHEDULES.UPCOMING_CONTESTS * 60 * 1000
  );
  intervals.push(upcomingContestInterval);
  
  // Schedule rating change notifications
  const ratingChangeInterval = setInterval(
    sendRatingChangeNotifications,
    SCHEDULES.RATING_CHANGES * 60 * 1000
  );
  intervals.push(ratingChangeInterval);
  
  // Schedule friend join notifications
  const friendJoinInterval = setInterval(
    sendFriendJoinNotifications,
    SCHEDULES.FRIEND_JOINS * 60 * 1000
  );
  intervals.push(friendJoinInterval);
  
  console.log('Notification scheduler started with the following intervals:');
  console.log(`- Daily problem reminders: every ${SCHEDULES.DAILY_PROBLEM_REMINDERS} minutes`);
  console.log(`- Upcoming contests: every ${SCHEDULES.UPCOMING_CONTESTS} minutes`);
  console.log(`- Rating changes: every ${SCHEDULES.RATING_CHANGES} minutes`);
  console.log(`- Friend joins: every ${SCHEDULES.FRIEND_JOINS} minutes`);
}

export function stopNotificationScheduler() {
  console.log('Stopping notification scheduler...');
  intervals.forEach(interval => clearInterval(interval));
  intervals.length = 0; // Clear the array
  console.log('Notification scheduler stopped.');
}

// For immediate testing
export async function runAllNotificationsOnce() {
  console.log('Running all notification checks once...');
  
  await sendDailyProblemReminders();
  await sendUpcomingContestNotifications();
  await sendRatingChangeNotifications();
  await sendFriendJoinNotifications();
  
  console.log('All notification checks completed.');
}