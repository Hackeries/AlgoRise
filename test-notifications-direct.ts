// Test script to directly call notification functions without API authentication
import { 
  sendDailyProblemReminders,
  sendUpcomingContestNotifications,
  sendRatingChangeNotifications,
  sendFriendJoinNotifications
} from './lib/cron/notification-cron';

async function testNotification(functionToTest: Function, name: string) {
  try {
    console.log(`Testing ${name}...`);
    await functionToTest();
    console.log(`✓ ${name} executed successfully`);
  } catch (error: any) {
    console.log(`✗ Error in ${name}:`, error.message);
  }
}

async function runAllTests() {
  console.log('Starting direct notification tests...\n');
  
  // Test each notification function
  await testNotification(sendDailyProblemReminders, 'Daily Problem Reminders');
  await testNotification(sendUpcomingContestNotifications, 'Upcoming Contest Notifications');
  await testNotification(sendRatingChangeNotifications, 'Rating Change Notifications');
  await testNotification(sendFriendJoinNotifications, 'Friend Join Notifications');
  
  console.log('\nAll direct notification tests completed.');
}

// Run the tests
runAllTests().catch(console.error);