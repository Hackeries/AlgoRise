// Test file for Battle Rating Calculations

import { simulateRatings } from '../lib/contest-sim';

// Simple test function
function runTest(name: string, testFn: () => void) {
  try {
    testFn();
    console.log(`✅ ${name}: PASSED`);
  } catch (error) {
    console.log(`❌ ${name}: FAILED - ${error}`);
  }
}

// Simple assertion function
function assertEqual(actual: any, expected: any, message: string = '') {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, but got ${actual}. ${message}`);
  }
}

function assertGreaterThan(actual: number, expected: number, message: string = '') {
  if (actual <= expected) {
    throw new Error(`Expected ${actual} to be greater than ${expected}. ${message}`);
  }
}

function assertLessThan(actual: number, expected: number, message: string = '') {
  if (actual >= expected) {
    throw new Error(`Expected ${actual} to be less than ${expected}. ${message}`);
  }
}

// Test cases
console.log('Running Battle Rating Calculation Tests...\n');

// Test 1: Winner should gain rating, loser should lose rating
runTest('Rating changes for win/loss', () => {
  const ratings = [
    { user_id: 'user1', rating: 1200 },
    { user_id: 'user2', rating: 1200 }
  ];
  
  const ranks = [
    { user_id: 'user1', score: 1, penalty_s: 0 }, // Winner
    { user_id: 'user2', score: 0, penalty_s: 0 }  // Loser
  ];
  
  const deltas = simulateRatings({ ranks, ratings, K: 32 });
  
  // Winner should gain rating, loser should lose rating
  const winnerDelta = deltas.find(d => d.user_id === 'user1')?.delta;
  const loserDelta = deltas.find(d => d.user_id === 'user2')?.delta;
  
  assertGreaterThan(winnerDelta!, 0, 'Winner should gain rating');
  assertLessThan(loserDelta!, 0, 'Loser should lose rating');
  assertEqual(Math.round(winnerDelta! + loserDelta!), 0, 'Total rating change should be zero');
});

// Test 2: Equal players should have equal magnitude changes
runTest('Equal players rating changes', () => {
  const ratings = [
    { user_id: 'user1', rating: 1500 },
    { user_id: 'user2', rating: 1500 }
  ];
  
  const ranks = [
    { user_id: 'user1', score: 1, penalty_s: 0 }, // Winner
    { user_id: 'user2', score: 0, penalty_s: 0 }  // Loser
  ];
  
  const deltas = simulateRatings({ ranks, ratings, K: 32 });
  
  // Both players have same rating, so changes should be equal in magnitude
  const winnerDelta = Math.abs(deltas.find(d => d.user_id === 'user1')?.delta || 0);
  const loserDelta = Math.abs(deltas.find(d => d.user_id === 'user2')?.delta || 0);
  
  assertGreaterThan(winnerDelta, 0, 'Winner should gain rating');
  assertGreaterThan(loserDelta, 0, 'Loser should lose rating');
  assertEqual(winnerDelta, loserDelta, 'Rating changes should be equal in magnitude');
});

// Test 3: Higher rated player winning should gain less
runTest('Higher rated player winning', () => {
  const ratings = [
    { user_id: 'user1', rating: 1800 }, // Higher rated player
    { user_id: 'user2', rating: 1200 }  // Lower rated player
  ];
  
  const ranks = [
    { user_id: 'user1', score: 1, penalty_s: 0 }, // Higher rated player wins
    { user_id: 'user2', score: 0, penalty_s: 0 }
  ];
  
  const deltas = simulateRatings({ ranks, ratings, K: 32 });
  
  // Higher rated player wins, so should gain less rating
  const higherRatedDelta = deltas.find(d => d.user_id === 'user1')?.delta || 0;
  const lowerRatedDelta = deltas.find(d => d.user_id === 'user2')?.delta || 0;
  
  assertGreaterThan(higherRatedDelta, 0, 'Higher rated player should gain rating');
  assertLessThan(lowerRatedDelta, 0, 'Lower rated player should lose rating');
  assertLessThan(Math.abs(higherRatedDelta), Math.abs(lowerRatedDelta), 
    'Higher rated player should gain less rating than lower rated player loses');
});

console.log('\nAll tests completed!');