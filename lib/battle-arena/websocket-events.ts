/**
 * WebSocket Event Specifications for Battle Arena
 * 
 * All events include eventId for idempotence and proper event ordering
 */

// ==================== EVENT TYPES ====================

export enum BattleEventType {
  // Connection & Room Management
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  ROOM_STATE = 'room_state',
  
  // Match Lifecycle
  MATCH_STARTING = 'match_starting',
  MATCH_COUNTDOWN = 'match_countdown',
  MATCH_START = 'match_start',
  MATCH_END = 'match_end',
  
  // Submissions
  SUBMIT_CODE = 'submit_code',
  SUBMISSION_QUEUED = 'submission_queued',
  SUBMISSION_EXECUTING = 'submission_executing',
  SUBMISSION_RESULT = 'submission_result',
  
  // Scoring & Updates
  SCORE_UPDATE = 'score_update',
  PLAYER_UPDATE = 'player_update',
  TEAM_SCORE_UPDATE = 'team_score_update',
  
  // Real-time Status
  PLAYER_TYPING = 'player_typing',
  PROBLEM_UNLOCK = 'problem_unlock',
  
  // Errors
  ERROR = 'error',
  VALIDATION_ERROR = 'validation_error',
}

// ==================== BASE EVENT INTERFACE ====================

export interface BaseEvent {
  eventId: string; // Unique event ID for idempotence
  timestamp: number; // Unix timestamp in milliseconds
  roomId: string;
}

// ==================== CONNECTION EVENTS ====================

export interface JoinRoomEvent extends BaseEvent {
  type: BattleEventType.JOIN_ROOM;
  userId: string;
  token: string; // JWT token for authentication
  metadata?: Record<string, any>;
}

export interface LeaveRoomEvent extends BaseEvent {
  type: BattleEventType.LEAVE_ROOM;
  userId: string;
  reason?: string;
}

export interface RoomStateEvent extends BaseEvent {
  type: BattleEventType.ROOM_STATE;
  match: MatchState;
  players: PlayerState[];
  teams?: TeamState[];
  problems: ProblemState[];
  timeRemaining: number; // Seconds
}

// ==================== MATCH LIFECYCLE EVENTS ====================

export interface MatchStartingEvent extends BaseEvent {
  type: BattleEventType.MATCH_STARTING;
  matchId: string;
  mode: 'quick_1v1' | 'ranked_1v1' | '3v3_team' | 'private_room' | 'tournament';
  players: string[]; // User IDs
  teams?: { team_a: string[]; team_b: string[] };
}

export interface MatchCountdownEvent extends BaseEvent {
  type: BattleEventType.MATCH_COUNTDOWN;
  secondsRemaining: number;
}

export interface MatchStartEvent extends BaseEvent {
  type: BattleEventType.MATCH_START;
  startTime: number; // Unix timestamp
  duration: number; // Seconds
  problems: ProblemState[];
}

export interface MatchEndEvent extends BaseEvent {
  type: BattleEventType.MATCH_END;
  endTime: number;
  finalScores: FinalScores;
  winner: string | string[]; // User ID(s) or team name
  ratingChanges?: RatingChange[];
}

// ==================== SUBMISSION EVENTS ====================

export interface SubmitCodeEvent extends BaseEvent {
  type: BattleEventType.SUBMIT_CODE;
  userId: string;
  problemId: string;
  code: string;
  language: string;
}

export interface SubmissionQueuedEvent extends BaseEvent {
  type: BattleEventType.SUBMISSION_QUEUED;
  submissionId: string;
  userId: string;
  problemId: string;
  queuePosition: number;
}

export interface SubmissionExecutingEvent extends BaseEvent {
  type: BattleEventType.SUBMISSION_EXECUTING;
  submissionId: string;
  userId: string;
  problemId: string;
}

export interface SubmissionResultEvent extends BaseEvent {
  type: BattleEventType.SUBMISSION_RESULT;
  submissionId: string;
  userId: string;
  problemId: string;
  status: 'accepted' | 'wrong_answer' | 'compilation_error' | 'runtime_error' | 'time_limit_exceeded' | 'memory_limit_exceeded' | 'internal_error';
  testsPassed: number;
  testsTotal: number;
  executionTime?: number; // milliseconds
  memoryUsed?: number; // KB
  score: number;
  isFirstSolve?: boolean;
}

// ==================== SCORING EVENTS ====================

export interface ScoreUpdateEvent extends BaseEvent {
  type: BattleEventType.SCORE_UPDATE;
  userId: string;
  problemId: string;
  score: number;
  totalScore: number;
  bonus?: {
    firstSolve?: number;
    timeBonus?: number;
  };
}

export interface PlayerUpdateEvent extends BaseEvent {
  type: BattleEventType.PLAYER_UPDATE;
  userId: string;
  updates: Partial<PlayerState>;
}

export interface TeamScoreUpdateEvent extends BaseEvent {
  type: BattleEventType.TEAM_SCORE_UPDATE;
  team: 'team_a' | 'team_b';
  score: number;
  fullSolves: number;
  members: Array<{
    userId: string;
    score: number;
    fullSolves: number;
  }>;
}

// ==================== REAL-TIME STATUS EVENTS ====================

export interface PlayerTypingEvent extends BaseEvent {
  type: BattleEventType.PLAYER_TYPING;
  userId: string;
  problemId: string;
  isTyping: boolean;
}

export interface ProblemUnlockEvent extends BaseEvent {
  type: BattleEventType.PROBLEM_UNLOCK;
  problemId: string;
  unlockedFor: string[]; // User IDs
}

// ==================== ERROR EVENTS ====================

export interface ErrorEvent extends BaseEvent {
  type: BattleEventType.ERROR;
  code: string;
  message: string;
  details?: any;
}

export interface ValidationErrorEvent extends BaseEvent {
  type: BattleEventType.VALIDATION_ERROR;
  field: string;
  message: string;
}

// ==================== STATE INTERFACES ====================

export interface MatchState {
  matchId: string;
  mode: 'quick_1v1' | 'ranked_1v1' | '3v3_team' | 'private_room' | 'tournament';
  status: 'waiting' | 'countdown' | 'in_progress' | 'finished' | 'cancelled';
  startedAt?: number;
  endsAt?: number;
  duration: number; // Seconds
}

export interface PlayerState {
  userId: string;
  username: string;
  avatar?: string;
  rating?: number;
  team?: 'team_a' | 'team_b';
  score: number;
  fullSolves: number;
  partialSolves: number;
  submissions: number;
  lastSubmissionAt?: number;
  isConnected: boolean;
  isTyping?: boolean;
}

export interface TeamState {
  name: 'team_a' | 'team_b';
  score: number;
  fullSolves: number;
  members: string[]; // User IDs
}

export interface ProblemState {
  problemId: string;
  title: string;
  difficulty: string;
  points: number;
  solvedBy: string[]; // User IDs
  firstSolveBonus: number;
  timeBonusEnabled: boolean;
}

export interface FinalScores {
  players: Array<{
    userId: string;
    score: number;
    rank: number;
    fullSolves: number;
    submissions: number;
    timeTaken: number; // Seconds
  }>;
  teams?: Array<{
    team: 'team_a' | 'team_b';
    score: number;
    fullSolves: number;
    members: string[];
  }>;
}

export interface RatingChange {
  userId: string;
  before: number;
  after: number;
  change: number;
}

// ==================== UNION TYPE FOR ALL EVENTS ====================

export type BattleEvent =
  | JoinRoomEvent
  | LeaveRoomEvent
  | RoomStateEvent
  | MatchStartingEvent
  | MatchCountdownEvent
  | MatchStartEvent
  | MatchEndEvent
  | SubmitCodeEvent
  | SubmissionQueuedEvent
  | SubmissionExecutingEvent
  | SubmissionResultEvent
  | ScoreUpdateEvent
  | PlayerUpdateEvent
  | TeamScoreUpdateEvent
  | PlayerTypingEvent
  | ProblemUnlockEvent
  | ErrorEvent
  | ValidationErrorEvent;

// ==================== EVENT VALIDATION ====================

export function validateEvent(event: any): event is BattleEvent {
  if (!event || typeof event !== 'object') return false;
  if (!event.eventId || !event.timestamp || !event.roomId || !event.type) return false;
  
  // Validate event type
  if (!Object.values(BattleEventType).includes(event.type)) return false;
  
  return true;
}

// ==================== EVENT FACTORY ====================

export class EventFactory {
  static createEvent<T extends BattleEvent>(
    type: T['type'],
    roomId: string,
    data: Omit<T, 'eventId' | 'timestamp' | 'roomId' | 'type'>
  ): T {
    return {
      eventId: generateEventId(),
      timestamp: Date.now(),
      roomId,
      type,
      ...data,
    } as T;
  }
}

function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
