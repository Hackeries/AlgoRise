// Test file for Profile Completion Calculations

import {
  calculateProfileCompletion,
  getProfileCompletionMessage,
  getNextSuggestion,
  hasMinimumProfile,
  getProfileTier,
} from '@/lib/profile/completion';

// Simple test function
function runTest(name: string, testFn: () => void) {
  try {
    testFn();
    console.log(`✅ ${name}: PASSED`);
  } catch (error) {
    console.log(`❌ ${name}: FAILED - ${error}`);
  }
}

// Simple assertion functions
function assertEqual(actual: any, expected: any, message: string = '') {
  if (actual !== expected) {
    throw new Error(
      `Expected ${expected}, but got ${actual}. ${message}`
    );
  }
}

function assertGreaterThan(
  actual: number,
  expected: number,
  message: string = ''
) {
  if (actual <= expected) {
    throw new Error(
      `Expected ${actual} to be greater than ${expected}. ${message}`
    );
  }
}

function assertTrue(value: boolean, message: string = '') {
  if (!value) {
    throw new Error(`Expected true, but got false. ${message}`);
  }
}

function assertFalse(value: boolean, message: string = '') {
  if (value) {
    throw new Error(`Expected false, but got true. ${message}`);
  }
}

// Tests for calculateProfileCompletion
runTest('Empty profile should be 0% complete', () => {
  const result = calculateProfileCompletion({});
  assertEqual(result.percentage, 0, 'Empty profile should be 0%');
  assertFalse(result.isComplete, 'Empty profile should not be complete');
});

runTest('CF verified profile should have 30% completion', () => {
  const result = calculateProfileCompletion({
    cf_verified: true,
    cf_handle: 'testuser',
  });
  assertEqual(
    result.percentage,
    30,
    'CF verified should contribute 30%'
  );
});

runTest('Student with all required fields should have 70% completion', () => {
  const result = calculateProfileCompletion({
    cf_verified: true,
    cf_handle: 'testuser',
    status: 'student',
    degree_type: 'btech',
    college_id: '123e4567-e89b-12d3-a456-426614174000',
    year: '3',
  });
  assertEqual(
    result.percentage,
    70,
    'Student with all required fields should have 70%'
  );
  assertTrue(
    hasMinimumProfile({
      cf_verified: true,
      status: 'student',
      degree_type: 'btech',
      college_id: '123e4567-e89b-12d3-a456-426614174000',
      year: '3',
    }),
    'Should have minimum profile'
  );
});

runTest('Working professional with all required fields should have 70% completion', () => {
  const result = calculateProfileCompletion({
    cf_verified: true,
    cf_handle: 'testuser',
    status: 'working',
    company_id: '123e4567-e89b-12d3-a456-426614174000',
  });
  assertEqual(
    result.percentage,
    70,
    'Working professional with all required fields should have 70%'
  );
  assertTrue(
    hasMinimumProfile({
      cf_verified: true,
      status: 'working',
      company_id: '123e4567-e89b-12d3-a456-426614174000',
    }),
    'Should have minimum profile'
  );
});

runTest('Complete profile should be 100%', () => {
  const result = calculateProfileCompletion({
    cf_verified: true,
    cf_handle: 'testuser',
    status: 'student',
    degree_type: 'btech',
    college_id: '123e4567-e89b-12d3-a456-426614174000',
    year: '3',
    leetcode_handle: 'testuser',
    codechef_handle: 'testuser',
    atcoder_handle: 'testuser',
    gfg_handle: 'testuser',
  });
  assertEqual(result.percentage, 100, 'Complete profile should be 100%');
  assertTrue(result.isComplete, 'Profile should be complete');
});

runTest('Profile without CF verification should not have minimum profile', () => {
  const result = hasMinimumProfile({
    cf_verified: false,
    status: 'student',
    degree_type: 'btech',
    college_id: '123e4567-e89b-12d3-a456-426614174000',
    year: '3',
  });
  assertFalse(result, 'Profile without CF verification should not be minimum');
});

runTest('Student without education details should not have minimum profile', () => {
  const result = hasMinimumProfile({
    cf_verified: true,
    status: 'student',
    degree_type: null,
    college_id: null,
    year: null,
  });
  assertFalse(result, 'Student without education should not be minimum');
});

// Tests for getProfileCompletionMessage
runTest('Completion message should vary with percentage', () => {
  const msg100 = getProfileCompletionMessage({
    percentage: 100,
    completed: [],
    missing: [],
    isComplete: true,
  });
  assertTrue(msg100.includes('100%'), 'Should mention 100%');

  const msg70 = getProfileCompletionMessage({
    percentage: 70,
    completed: [],
    missing: [],
    isComplete: false,
  });
  assertTrue(msg70.includes('70%'), 'Should mention 70%');

  const msg40 = getProfileCompletionMessage({
    percentage: 40,
    completed: [],
    missing: [],
    isComplete: false,
  });
  assertTrue(msg40.includes('40%'), 'Should mention 40%');
});

// Tests for getProfileTier
runTest('Profile tier should be based on percentage', () => {
  const expert = getProfileTier(100);
  assertEqual(expert.tier, 'expert', 'Should be expert tier');

  const advanced = getProfileTier(80);
  assertEqual(advanced.tier, 'advanced', 'Should be advanced tier');

  const intermediate = getProfileTier(50);
  assertEqual(intermediate.tier, 'intermediate', 'Should be intermediate tier');

  const beginner = getProfileTier(30);
  assertEqual(beginner.tier, 'beginner', 'Should be beginner tier');
});

// Tests for getNextSuggestion
runTest('Next suggestion should prioritize required fields', () => {
  const completion = calculateProfileCompletion({});
  const suggestion = getNextSuggestion(completion);
  assertEqual(
    suggestion,
    'Codeforces verification',
    'Should suggest CF verification first'
  );
});

runTest('Next suggestion should be null for complete profile', () => {
  const completion = calculateProfileCompletion({
    cf_verified: true,
    cf_handle: 'testuser',
    status: 'student',
    degree_type: 'btech',
    college_id: '123e4567-e89b-12d3-a456-426614174000',
    year: '3',
    leetcode_handle: 'testuser',
    codechef_handle: 'testuser',
    atcoder_handle: 'testuser',
    gfg_handle: 'testuser',
  });
  const suggestion = getNextSuggestion(completion);
  assertEqual(suggestion, null, 'Should have no next suggestion');
});

console.log('\n✨ All profile completion tests completed!');
