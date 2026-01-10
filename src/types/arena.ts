/**
 * Type definitions for Battle Arena system
 * Matches the database schema from 003_battle_arena.sql
 */

export type MatchType = '1v1' | '3v3';
export type MatchMode = 'ranked' | 'unranked';
export type MatchState = 'waiting' | 'live' | 'finished' | 'cancelled';
export type ArenaTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';
export type ActivityStatus = 'idle' | 'attempting' | 'close' | 'solved';

export type ArenaEventType = 
  | 'lock' 
  | 'solve' 
  | 'attempt' 
  | 'streak' 
  | 'momentum' 
  | 'state_change' 
  | 'suspicious';

export interface ArenaRating {
  user_id: string;
  elo_1v1: number;
  elo_3v3: number;
  tier_1v1: ArenaTier;
  tier_3v3: ArenaTier;
  matches_played_1v1: number;
  matches_played_3v3: number;
  matches_won_1v1: number;
  matches_won_3v3: number;
  current_win_streak: number;
  best_win_streak: number;
  titles: string[];
  last_match_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ArenaTeam {
  id: string;
  match_id?: string;
  player1_id?: string;
  player2_id?: string;
  player3_id?: string;
  team_name?: string;
  average_elo: number;
  created_at: string;
}

export interface ArenaMatch {
  id: string;
  match_type: MatchType;
  mode: MatchMode;
  player1_id?: string;
  player2_id?: string;
  team1_id?: string;
  team2_id?: string;
  state: MatchState;
  problem_ids: string[];
  winner_id?: string;
  started_at?: string;
  finished_at?: string;
  duration_seconds?: number;
  pressure_phase_start?: string;
  fog_of_progress: boolean;
  final_scores: Record<string, number>;
  elo_changes: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface ArenaPlayer {
  id: string;
  match_id: string;
  user_id: string;
  team_id?: string;
  current_problem_id?: string;
  problems_solved: string[];
  problems_attempted: string[];
  activity_status: ActivityStatus;
  last_activity_at: string;
  locked_problem_id?: string;
  locked_at?: string;
  score: number;
  penalties: number;
  solve_times: Record<string, number>;
  current_solve_streak: number;
  suspicious_events: SuspiciousEvent[];
  joined_at: string;
  last_seen_at: string;
}

export interface ArenaEvent {
  id: string;
  match_id: string;
  user_id?: string;
  event_type: ArenaEventType;
  event_data: Record<string, unknown>;
  created_at: string;
}

export interface ArenaMatchHistory {
  id: string;
  match_id: string;
  user_id: string;
  match_type: MatchType;
  mode: MatchMode;
  placement: number;
  score: number;
  problems_solved: number;
  average_solve_time: number;
  elo_before: number;
  elo_after: number;
  elo_change: number;
  streak_achieved: number;
  match_finished_at: string;
  created_at: string;
}

export interface ArenaDailyLimit {
  id: string;
  user_id: string;
  match_date: string;
  matches_played: number;
  matches_limit: number;
}

export interface SuspiciousEvent {
  type: string;
  timestamp: string;
  details: Record<string, unknown>;
}

// ============================================================================
// Client-side types for UI components
// ============================================================================

export interface MatchmakingRequest {
  matchType: MatchType;
  mode: MatchMode;
}

export interface MatchmakingResponse {
  success: boolean;
  matchId?: string;
  estimatedWaitTime?: number;
  message?: string;
  error?: string;
}

export interface LiveMatchState {
  match: ArenaMatch;
  players: ArenaPlayer[];
  teams?: ArenaTeam[];
  currentUser: ArenaPlayer;
  opponentStatus: OpponentStatus[];
  timeRemaining: number;
  isPressurePhase: boolean;
}

export interface OpponentStatus {
  userId: string;
  username?: string;
  activityStatus: ActivityStatus;
  problemsSolved: number;
  currentStreak: number;
}

export interface MatchResult {
  match: ArenaMatch;
  placement: number;
  score: number;
  problemsSolved: number;
  averageSolveTime: number;
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  streakAchieved: number;
  newTier?: ArenaTier;
  titleEarned?: string;
  breakdown: ProblemBreakdown[];
}

export interface ProblemBreakdown {
  problemId: string;
  problemTitle: string;
  solved: boolean;
  attempts: number;
  timeSpent: number;
  penalties: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  elo: number;
  tier: ArenaTier;
  matchesPlayed: number;
  winRate: number;
  currentStreak: number;
  titles: string[];
}

// ============================================================================
// Fog of Progress - abstracted opponent information
// ============================================================================
export interface FogOfProgressStatus {
  opponentId: string;
  status: ActivityStatus;
  problemsSolvedCount: number;
  lastActivityTime: number; // seconds ago
}

// ============================================================================
// Momentum System - UI feedback for streaks
// ============================================================================
export interface MomentumEffect {
  type: 'double_solve' | 'triple_solve' | 'speed_demon' | 'comeback';
  intensity: 'low' | 'medium' | 'high';
  message: string;
}

// ============================================================================
// ELO calculation utilities
// ============================================================================
export interface EloCalculation {
  playerElo: number;
  opponentElo: number;
  kFactor: number; // 32 for new players, 24 for intermediate, 16 for experienced
  result: 'win' | 'loss' | 'draw';
}

export interface EloResult {
  newElo: number;
  change: number;
  expectedWinProbability: number;
}

// ============================================================================
// Constants
// ============================================================================
export const TIER_THRESHOLDS: Record<ArenaTier, { min: number; max: number }> = {
  bronze: { min: 800, max: 1199 },
  silver: { min: 1200, max: 1599 },
  gold: { min: 1600, max: 1999 },
  platinum: { min: 2000, max: 2399 },
  diamond: { min: 2400, max: 2999 },
  master: { min: 3000, max: 4000 },
};

export const TIER_COLORS: Record<ArenaTier, string> = {
  bronze: 'text-amber-700 dark:text-amber-400',
  silver: 'text-gray-500 dark:text-gray-300',
  gold: 'text-yellow-500 dark:text-yellow-400',
  platinum: 'text-cyan-500 dark:text-cyan-400',
  diamond: 'text-blue-500 dark:text-blue-400',
  master: 'text-purple-500 dark:text-purple-400',
};

export const TIER_BADGES: Record<ArenaTier, string> = {
  bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  silver: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  platinum: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  diamond: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  master: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
};

export const FREE_DAILY_LIMIT = 3;
export const MATCH_DURATION_MINUTES = 30;
export const PRESSURE_PHASE_MINUTES = 5;
export const PROBLEMS_PER_MATCH = 3;

// Titles that can be earned
export const ARENA_TITLES = {
  FIRST_BLOOD: 'First Blood',
  SPEED_DEMON: 'Speed Demon',
  COMEBACK_KING: 'Comeback King',
  PERFECT_GAME: 'Perfect Game',
  STREAK_MASTER: 'Streak Master',
  UNDEFEATED: 'Undefeated',
  GIANT_SLAYER: 'Giant Slayer', // Beat someone with much higher ELO
  CONSISTENT_CHAMPION: 'Consistent Champion',
} as const;

export type ArenaTitle = typeof ARENA_TITLES[keyof typeof ARENA_TITLES];

/**
 * Format ELO change for display
 */
export function formatEloChange(change: number): string {
  if (change > 0) {
    return `+${change}`;
  }
  return change.toString();
}
