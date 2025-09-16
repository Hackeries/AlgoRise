// Test Contest Creation API
// You can run this in the browser console to test the API

const testContestCreation = async () => {
  const testData = {
    name: "Test Contest",
    description: "A test contest with rating-based problems",
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    end_time: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // Tomorrow + 2 hours
    duration_minutes: 120,
    problem_count: 5,
    rating_min: 1200,
    rating_max: 1400,
    max_participants: 50,
    allow_late_join: true
  }

  try {
    const response = await fetch('/api/contests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Contest created successfully:', result)
      console.log('Problems generated:', result.contest.problems)
    } else {
      console.error('❌ Contest creation failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Request failed:', error)
  }
}

// Run the test
// testContestCreation()

console.log('Test function ready. Run testContestCreation() to test the API.')