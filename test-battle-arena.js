// Simple test script to verify battle arena API endpoints

async function testBattleArenaAPI() {
  console.log('Testing Battle Arena API endpoints...');
  
  try {
    // Test getting battles (this will fail without authentication)
    console.log('1. Testing GET /api/battles');
    const battlesResponse = await fetch('/api/battles');
    console.log('Status:', battlesResponse.status);
    
    // Test creating a battle (this will fail without authentication)
    console.log('2. Testing POST /api/battles');
    const createResponse = await fetch('/api/battles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'join_queue',
        format: 'best_of_3'
      })
    });
    console.log('Status:', createResponse.status);
    
    console.log('API tests completed.');
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run the test
testBattleArenaAPI();