/**
 * ELO Rating System Utilities
 * Implements standard ELO calculation for Arena matches
 */

import type { EloCalculation, EloResult, ArenaTier } from '@/types/arena';
import { TIER_THRESHOLDS } from '@/types/arena';

/**
 * Calculate expected win probability using ELO formula
 */
export function calculateExpectedScore(
  playerElo: number,
  opponentElo: number
): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

/**
 * Determine K-factor based on player experience
 * Higher K-factor for new players (more volatile rating changes)
 */
export function getKFactor(matchesPlayed: number): number {
  if (matchesPlayed < 10) {
    return 32; // New player - rapid adjustment
  } else if (matchesPlayed < 30) {
    return 24; // Intermediate - moderate adjustment
  } else {
    return 16; // Experienced - stable adjustment
  }
}

/**
 * Calculate new ELO rating after a match
 */
export function calculateNewElo(params: EloCalculation): EloResult {
  const { playerElo, opponentElo, kFactor, result } = params;

  // Calculate expected win probability
  const expectedScore = calculateExpectedScore(playerElo, opponentElo);

  // Actual score: 1 for win, 0 for loss, 0.5 for draw
  const actualScore = result === 'win' ? 1 : result === 'loss' ? 0 : 0.5;

  // Calculate ELO change
  const change = Math.round(kFactor * (actualScore - expectedScore));

  // Calculate new ELO (minimum 0)
  const newElo = Math.max(0, playerElo + change);

  return {
    newElo,
    change,
    expectedWinProbability: expectedScore,
  };
}

/**
 * Get tier based on ELO rating
 */
export function getTierFromElo(elo: number): ArenaTier {
  if (elo < 1000) return 'bronze';
  if (elo < 1200) return 'silver';
  if (elo < 1400) return 'gold';
  if (elo < 1600) return 'platinum';
  if (elo < 1800) return 'diamond';
  return 'master';
}

/**
 * Check if player achieved a new tier
 */
export function checkTierPromotion(
  oldElo: number,
  newElo: number
): ArenaTier | null {
  const oldTier = getTierFromElo(oldElo);
  const newTier = getTierFromElo(newElo);

  if (oldTier !== newTier) {
    return newTier;
  }
  return null;
}

/**
 * Calculate ELO for team-based matches (3v3)
 * Uses average team ELO
 */
export function calculateTeamElo(
  player1Elo: number,
  player2Elo: number,
  player3Elo: number
): number {
  return Math.round((player1Elo + player2Elo + player3Elo) / 3);
}

/**
 * Calculate individual ELO changes in team matches
 * Players closer to team average get standard change
 * Players far from average get adjusted change
 */
export function calculateTeamMemberEloChange(
  playerElo: number,
  teamAverageElo: number,
  baseChange: number
): number {
  // If player is significantly better than team average, reduce their gain/loss
  const difference = playerElo - teamAverageElo;
  const adjustmentFactor = 1 - Math.min(0.3, Math.abs(difference) / 1000);

  return Math.round(baseChange * adjustmentFactor);
}

/**
 * Get ELO range for matchmaking
 * Wider range for higher tier players (fewer players available)
 */
export function getMatchmakingRange(elo: number, matchesPlayed: number): number {
  const tier = getTierFromElo(elo);

  // Base range
  let range = 200;

  // Wider range for higher tiers
  if (tier === 'master') {
    range = 400;
  } else if (tier === 'diamond') {
    range = 300;
  } else if (tier === 'platinum') {
    range = 250;
  }

  // Wider range for new players
  if (matchesPlayed < 5) {
    range = Math.min(range * 1.5, 500);
  }

  return range;
}

/**
 * Check if ELO difference qualifies for "Giant Slayer" title
 * (defeating someone significantly higher rated)
 */
export function isGiantSlayerVictory(
  winnerElo: number,
  loserElo: number
): boolean {
  return loserElo - winnerElo >= 300;
}

/**
 * Calculate bonus ELO for perfect games or exceptional performance
 */
export function calculatePerformanceBonus(
  problemsSolved: number,
  totalProblems: number,
  averageSolveTime: number,
  baseChange: number
): number {
  let bonus = 0;

  // Perfect game bonus
  if (problemsSolved === totalProblems) {
    bonus += Math.round(baseChange * 0.1); // 10% bonus
  }

  // Speed bonus (if average solve time is very fast)
  if (averageSolveTime < 300) {
    // Less than 5 minutes average
    bonus += Math.round(baseChange * 0.05); // 5% bonus
  }

  return bonus;
}

/**
 * Calculate penalty for suspicious behavior
 */
export function calculateCheatPenalty(
  suspiciousEventCount: number
): number {
  // Each suspicious event reduces ELO gain/increases ELO loss
  return suspiciousEventCount * 5;
}

/**
 * Format ELO change for display
 */
export function formatEloChange(change: number): string {
  if (change > 0) {
    return `+${change}`;
  }
  return change.toString();
}

/**
 * Get tier progress percentage
 */
export function getTierProgress(elo: number): number {
  const tier = getTierFromElo(elo);
  const thresholds = TIER_THRESHOLDS[tier];

  const progress =
    ((elo - thresholds.min) / (thresholds.max - thresholds.min)) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Calculate points needed for next tier
 */
export function getPointsToNextTier(elo: number): number {
  const tier = getTierFromElo(elo);

  if (tier === 'master') {
    return 0; // Already at max tier
  }

  const thresholds = TIER_THRESHOLDS[tier];
  return thresholds.max + 1 - elo;
}

/**
 * Validate ELO value
 */
export function isValidElo(elo: number): boolean {
  return elo >= 0 && elo <= 5000 && Number.isInteger(elo);
}

