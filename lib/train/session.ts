import { z } from 'zod';

/**
 * Session planning, persistence, and summary aggregation.
 * 
 * TODO: Replace in-memory storage with Supabase for persistence.
 * TODO: Integrate with app/problem-generator for actual problem sourcing.
 */

// ============================================================================
// SCHEMAS
// ============================================================================

export const DifficultyDistributionSchema = z.object({
  easy: z.number().min(0).max(100).default(30),
  medium: z.number().min(0).max(100).default(50),
  hard: z.number().min(0).max(100).default(20),
});

export const SessionConfigSchema = z.object({
  template: z.enum(['quick', 'standard', 'intensive', 'custom']).default('standard'),
  topics: z.array(z.string()).min(1, 'At least one topic required'),
  difficultyDistribution: DifficultyDistributionSchema.optional(),
  durationMinutes: z.number().min(5).max(180).default(30),
  language: z.enum(['cpp', 'python', 'java', 'javascript', 'go', 'rust']).default('cpp'),
  hintsEnabled: z.boolean().default(true),
  problemCount: z.number().min(1).max(20).optional(),
});

export type SessionConfig = z.infer<typeof SessionConfigSchema>;
export type DifficultyDistribution = z.infer<typeof DifficultyDistributionSchema>;

// ============================================================================
// TYPES
// ============================================================================

export type ProblemDifficulty = 'easy' | 'medium' | 'hard';

export interface PlannedProblem {
  id: string;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  topic: string;
  hints: string[];
  testCases: { input: string; expected: string }[];
  // TODO: Add actual problem URL when integrated with problem-generator
  sourceUrl?: string;
}

export interface SessionMetrics {
  totalProblems: number;
  solvedCount: number;
  skippedCount: number;
  hintsUsed: number;
  attempts: number;
  passedTests: number;
  failedTests: number;
  totalTimeMs: number;
  avgTimePerProblemMs: number;
  accuracy: number; // 0-1
  topicStats: Record<string, { solved: number; attempted: number; hintsUsed: number }>;
}

export type SessionStatus = 'planning' | 'active' | 'paused' | 'finished' | 'cancelled';

export interface TrainSession {
  id: string;
  userId: string;
  config: SessionConfig;
  status: SessionStatus;
  problems: PlannedProblem[];
  currentProblemIndex: number;
  metrics: SessionMetrics;
  startedAt: number;
  pausedAt?: number;
  finishedAt?: number;
  recommendations: string[];
  createdAt: number;
  updatedAt: number;
}

export interface SessionSummary {
  sessionId: string;
  status: SessionStatus;
  config: SessionConfig;
  metrics: SessionMetrics;
  recommendations: string[];
  topicMastery: Record<string, number>; // topic -> mastery level 0-1
  nextSteps: string[];
  completedAt: number;
}

// ============================================================================
// IN-MEMORY STORAGE (STUB)
// ============================================================================

// TODO: Replace with Supabase storage
const sessions = new Map<string, TrainSession>();

// ============================================================================
// PROBLEM GENERATION (STUB)
// ============================================================================

/**
 * Generate stub problems based on session config.
 * 
 * TODO: Replace with actual problem sourcing from app/problem-generator.
 */
function generateProblems(config: SessionConfig): PlannedProblem[] {
  const { topics, difficultyDistribution = { easy: 30, medium: 50, hard: 20 }, durationMinutes } = config;
  
  // Estimate problem count based on duration (roughly 3-5 min per problem)
  const problemCount = config.problemCount ?? Math.max(3, Math.floor(durationMinutes / 5));
  
  const problems: PlannedProblem[] = [];
  const difficulties: ProblemDifficulty[] = [];
  
  // Distribute difficulties
  const totalWeight = difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard;
  const easyCount = Math.round((difficultyDistribution.easy / totalWeight) * problemCount);
  const mediumCount = Math.round((difficultyDistribution.medium / totalWeight) * problemCount);
  const hardCount = problemCount - easyCount - mediumCount;
  
  for (let i = 0; i < easyCount; i++) difficulties.push('easy');
  for (let i = 0; i < mediumCount; i++) difficulties.push('medium');
  for (let i = 0; i < hardCount; i++) difficulties.push('hard');
  
  // Shuffle difficulties
  for (let i = difficulties.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [difficulties[i], difficulties[j]] = [difficulties[j], difficulties[i]];
  }
  
  // Generate stub problems
  for (let i = 0; i < difficulties.length; i++) {
    const difficulty = difficulties[i];
    const topic = topics[i % topics.length];
    
    problems.push({
      id: `prob_${Date.now()}_${i}`,
      title: `${topic} Problem ${i + 1} (${difficulty})`,
      description: generateProblemDescription(topic, difficulty),
      difficulty,
      topic,
      hints: generateHints(topic, difficulty),
      testCases: generateTestCases(difficulty),
    });
  }
  
  return problems;
}

function generateProblemDescription(topic: string, difficulty: ProblemDifficulty): string {
  // TODO: Replace with actual problem descriptions from problem-generator
  const descriptions: Record<string, string> = {
    'arrays': `Given an array of integers, find the ${difficulty === 'easy' ? 'maximum element' : difficulty === 'medium' ? 'subarray with maximum sum' : 'longest increasing subsequence'}.`,
    'strings': `Given a string, ${difficulty === 'easy' ? 'count the vowels' : difficulty === 'medium' ? 'find the longest palindromic substring' : 'find all distinct substrings'}.`,
    'trees': `Given a binary tree, ${difficulty === 'easy' ? 'find its height' : difficulty === 'medium' ? 'check if it is balanced' : 'serialize and deserialize it'}.`,
    'graphs': `Given a graph with N nodes, ${difficulty === 'easy' ? 'find if a path exists between two nodes' : difficulty === 'medium' ? 'find the shortest path' : 'find all strongly connected components'}.`,
    'dp': `${difficulty === 'easy' ? 'Calculate the nth Fibonacci number' : difficulty === 'medium' ? 'Find the minimum cost to reach the end of the array' : 'Count the number of distinct subsequences'}.`,
    'sorting': `${difficulty === 'easy' ? 'Implement bubble sort' : difficulty === 'medium' ? 'Implement merge sort' : 'Sort an array in O(n) using counting sort constraints'}.`,
  };
  
  return descriptions[topic.toLowerCase()] || 
    `Solve this ${difficulty} ${topic} problem. This is a placeholder for the actual problem description.`;
}

function generateHints(topic: string, difficulty: ProblemDifficulty): string[] {
  const hintCount = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  const hints = [
    `Consider the constraints of the ${topic} problem.`,
    `Think about edge cases and boundary conditions.`,
    `Try breaking down the problem into smaller subproblems.`,
    `Consider using a data structure that optimizes for the most frequent operation.`,
  ];
  return hints.slice(0, hintCount);
}

function generateTestCases(difficulty: ProblemDifficulty): { input: string; expected: string }[] {
  const count = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
  const testCases = [];
  for (let i = 1; i <= count; i++) {
    testCases.push({
      input: `Test input ${i}`,
      expected: `Expected output ${i}`,
    });
  }
  return testCases;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Create a new training session.
 */
export function createSession(userId: string, config: SessionConfig): TrainSession {
  const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const problems = generateProblems(config);
  const now = Date.now();
  
  const session: TrainSession = {
    id,
    userId,
    config,
    status: 'active',
    problems,
    currentProblemIndex: 0,
    metrics: {
      totalProblems: problems.length,
      solvedCount: 0,
      skippedCount: 0,
      hintsUsed: 0,
      attempts: 0,
      passedTests: 0,
      failedTests: 0,
      totalTimeMs: 0,
      avgTimePerProblemMs: 0,
      accuracy: 0,
      topicStats: {},
    },
    startedAt: now,
    recommendations: [],
    createdAt: now,
    updatedAt: now,
  };
  
  // Initialize topic stats
  for (const problem of problems) {
    if (!session.metrics.topicStats[problem.topic]) {
      session.metrics.topicStats[problem.topic] = { solved: 0, attempted: 0, hintsUsed: 0 };
    }
  }
  
  sessions.set(id, session);
  return session;
}

/**
 * Get a session by ID.
 */
export function getSession(sessionId: string): TrainSession | null {
  return sessions.get(sessionId) ?? null;
}

/**
 * Update a session.
 */
export function updateSession(sessionId: string, updates: Partial<TrainSession>): TrainSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  
  const updated = {
    ...session,
    ...updates,
    updatedAt: Date.now(),
  };
  
  sessions.set(sessionId, updated);
  return updated;
}

/**
 * Finalize a session and generate summary.
 */
export function finalizeSession(sessionId: string): SessionSummary | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  
  const now = Date.now();
  session.status = 'finished';
  session.finishedAt = now;
  session.updatedAt = now;
  
  // Calculate final metrics
  const { metrics, config } = session;
  const solved = metrics.solvedCount;
  const total = metrics.totalProblems;
  
  metrics.accuracy = total > 0 ? solved / total : 0;
  metrics.totalTimeMs = now - session.startedAt;
  metrics.avgTimePerProblemMs = solved > 0 ? metrics.totalTimeMs / solved : 0;
  
  // Calculate topic mastery
  const topicMastery: Record<string, number> = {};
  for (const [topic, stats] of Object.entries(metrics.topicStats)) {
    if (stats.attempted > 0) {
      // Mastery = solve rate, with penalty for hints
      const solveRate = stats.solved / stats.attempted;
      const hintPenalty = Math.min(0.3, stats.hintsUsed * 0.1);
      topicMastery[topic] = Math.max(0, solveRate - hintPenalty);
    } else {
      topicMastery[topic] = 0;
    }
  }
  
  // Generate recommendations
  const recommendations = generateRecommendations(session, topicMastery);
  session.recommendations = recommendations;
  
  // Generate next steps
  const nextSteps = generateNextSteps(session, topicMastery);
  
  sessions.set(sessionId, session);
  
  return {
    sessionId,
    status: session.status,
    config,
    metrics,
    recommendations,
    topicMastery,
    nextSteps,
    completedAt: now,
  };
}

function generateRecommendations(session: TrainSession, topicMastery: Record<string, number>): string[] {
  const recommendations: string[] = [];
  const { metrics } = session;
  
  // Low accuracy recommendation
  if (metrics.accuracy < 0.5) {
    recommendations.push('Focus on understanding the problem before coding. Read constraints carefully.');
  }
  
  // High hint usage recommendation
  if (metrics.hintsUsed > metrics.solvedCount) {
    recommendations.push('Try solving problems without hints first. Struggle builds understanding.');
  }
  
  // Topic-specific recommendations
  for (const [topic, mastery] of Object.entries(topicMastery)) {
    if (mastery < 0.4) {
      recommendations.push(`Review ${topic} fundamentals. Consider practicing easier problems first.`);
    } else if (mastery > 0.8) {
      recommendations.push(`Strong in ${topic}! Try harder problems or move to related topics.`);
    }
  }
  
  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('Good progress! Keep practicing consistently.');
  }
  
  return recommendations.slice(0, 5);
}

function generateNextSteps(session: TrainSession, topicMastery: Record<string, number>): string[] {
  const nextSteps: string[] = [];
  
  // Find weakest topics
  const sortedTopics = Object.entries(topicMastery)
    .sort(([, a], [, b]) => a - b);
  
  if (sortedTopics.length > 0) {
    const [weakestTopic] = sortedTopics[0];
    nextSteps.push(`Practice more ${weakestTopic} problems to build mastery.`);
  }
  
  // Suggest session adjustments
  if (session.metrics.accuracy > 0.8) {
    nextSteps.push('Increase difficulty distribution for more challenge.');
  } else if (session.metrics.accuracy < 0.3) {
    nextSteps.push('Consider focusing on fewer topics with easier problems.');
  }
  
  nextSteps.push('Schedule your next training session to maintain consistency.');
  
  return nextSteps;
}

/**
 * Get current problem for a session.
 */
export function getCurrentProblem(sessionId: string): PlannedProblem | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  
  if (session.currentProblemIndex >= session.problems.length) {
    return null;
  }
  
  return session.problems[session.currentProblemIndex];
}

/**
 * Advance to next problem.
 */
export function advanceToNextProblem(sessionId: string): PlannedProblem | null {
  const session = sessions.get(sessionId);
  if (!session) return null;
  
  session.currentProblemIndex++;
  session.updatedAt = Date.now();
  sessions.set(sessionId, session);
  
  return getCurrentProblem(sessionId);
}

/**
 * Delete a session (for cleanup).
 */
export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

/**
 * Get all sessions for a user.
 * TODO: Implement with Supabase for actual user sessions.
 */
export function getUserSessions(userId: string): TrainSession[] {
  const userSessions: TrainSession[] = [];
  sessions.forEach((session) => {
    if (session.userId === userId) {
      userSessions.push(session);
    }
  });
  return userSessions;
}
