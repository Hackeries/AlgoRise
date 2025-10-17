// Simple script to test notifications via API
async function testNotification(type, name) {
  try {
    console.log(`Testing ${name} notification...`);
    
    const response = await fetch('http://localhost:3000/api/notifications/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✓ ${name} notification triggered successfully:`, data.message);
    } else {
      console.log(`✗ Failed to trigger ${name} notification:`, data.error || 'Unknown error');
    }
  } catch (error) {
    console.log(`✗ Network error while testing ${name} notification:`, error.message);
  }
}

async function testAllNotifications() {
  console.log('Starting notification API tests...\n');
  
  // Since we're in development mode, authentication is not required
  await testNotification('daily_problem_reminder', 'Daily Problem Reminder');
  await testNotification('upcoming_contest', 'Upcoming Contest');
  await testNotification('rating_change', 'Rating Change');
  await testNotification('friend_joined', 'Friend Joined Contest');
  await testNotification('all', 'All Notifications');
  
  console.log('\nNotification API tests completed.');
}

// Run the tests
testAllNotifications();