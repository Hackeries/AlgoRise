import { z } from 'zod';
import { 
  getSession, 
  updateSession, 
  advanceToNextProblem,
  getCurrentProblem,
  type TrainSession,
  type PlannedProblem,
} from './session';
import { publish } from './stream';

/**
 * Event handling for training sessions.
 * Ingests events, updates metrics/state, and emits SSE messages.
 * 
 * TODO: Add rate limiting for event ingestion.
 * TODO: Integrate with analytics for event tracking.
 */

// ============================================================================
// SCHEMAS
// ============================================================================

export const EventTypeSchema = z.enum([
  'attempt',       // User submitted an attempt
  'hint',          // User requested a hint
  'skip',          // User skipped the problem
  'pass_tests',    // User's code passed all tests
  'fail_tests',    // User's code failed tests
  'submit',        // User submitted final answer
  'pause',         // User paused the session
  'resume',        // User resumed the session
  'navigate',      // User navigated to a different problem
]);

export type EventType = z.infer<typeof EventTypeSchema>;

export const SessionEventSchema = z.object({
  type: EventTypeSchema,
  problemId: z.string().optional(),
  code: z.string().optional(),
  language: z.string().optional(),
  hintIndex: z.number().optional(),
  testResults: z.array(z.object({
    input: z.string(),
    expected: z.string(),
    actual: z.string(),
    passed: z.boolean(),
  })).optional(),
  timestamp: z.number().optional(),
});

export type SessionEvent = z.infer<typeof SessionEventSchema>;

// ============================================================================
// EVENT PROCESSING RESULT
// ============================================================================

export interface EventResult {
  success: boolean;
  message: string;
  session: TrainSession | null;
  currentProblem: PlannedProblem | null;
  hint?: string;
  testResults?: Array<{ input: string; expected: string; actual: string; passed: boolean }>;
  recommendation?: string;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Process a session event.
 */
export function processEvent(sessionId: string, event: SessionEvent): EventResult {
  const session = getSession(sessionId);
  if (!session) {
    return {
      success: false,
      message: 'Session not found',
      session: null,
      currentProblem: null,
    };
  }
  
  // Validate session state
  if (session.status === 'finished' || session.status === 'cancelled') {
    return {
      success: false,
      message: `Session is ${session.status}`,
      session,
      currentProblem: getCurrentProblem(sessionId),
    };
  }
  
  const timestamp = event.timestamp ?? Date.now();
  
  switch (event.type) {
    case 'attempt':
      return handleAttempt(session, event, timestamp);
    case 'hint':
      return handleHint(session, event, timestamp);
    case 'skip':
      return handleSkip(session, timestamp);
    case 'pass_tests':
      return handlePassTests(session, event, timestamp);
    case 'fail_tests':
      return handleFailTests(session, event, timestamp);
    case 'submit':
      return handleSubmit(session, event, timestamp);
    case 'pause':
      return handlePause(session, timestamp);
    case 'resume':
      return handleResume(session, timestamp);
    case 'navigate':
      return handleNavigate(session, event);
    default:
      return {
        success: false,
        message: 'Unknown event type',
        session,
        currentProblem: getCurrentProblem(session.id),
      };
  }
}

function handleAttempt(
  session: TrainSession, 
  event: SessionEvent,
  timestamp: number
): EventResult {
  const currentProblem = getCurrentProblem(session.id);
  if (!currentProblem) {
    return {
      success: false,
      message: 'No current problem',
      session,
      currentProblem: null,
    };
  }
  
  // Update metrics
  session.metrics.attempts++;
  session.metrics.topicStats[currentProblem.topic].attempted++;
  
  updateSession(session.id, { metrics: session.metrics });
  
  // Emit SSE event
  publish(session.id, 'attempt', {
    problemId: currentProblem.id,
    timestamp,
    attempts: session.metrics.attempts,
  });
  
  return {
    success: true,
    message: 'Attempt recorded',
    session: getSession(session.id),
    currentProblem,
  };
}

function handleHint(
  session: TrainSession,
  event: SessionEvent,
  timestamp: number
): EventResult {
  const currentProblem = getCurrentProblem(session.id);
  if (!currentProblem) {
    return {
      success: false,
      message: 'No current problem',
      session,
      currentProblem: null,
    };
  }
  
  if (!session.config.hintsEnabled) {
    return {
      success: false,
      message: 'Hints are disabled for this session',
      session,
      currentProblem,
    };
  }
  
  const hintIndex = event.hintIndex ?? session.metrics.hintsUsed % currentProblem.hints.length;
  const hint = currentProblem.hints[hintIndex] ?? 'No more hints available.';
  
  // Update metrics
  session.metrics.hintsUsed++;
  session.metrics.topicStats[currentProblem.topic].hintsUsed++;
  
  updateSession(session.id, { metrics: session.metrics });
  
  // Emit SSE event
  publish(session.id, 'hint', {
    problemId: currentProblem.id,
    hint,
    hintIndex,
    timestamp,
    totalHintsUsed: session.metrics.hintsUsed,
  });
  
  return {
    success: true,
    message: 'Hint provided',
    session: getSession(session.id),
    currentProblem,
    hint,
  };
}

function handleSkip(session: TrainSession, timestamp: number): EventResult {
  const currentProblem = getCurrentProblem(session.id);
  if (!currentProblem) {
    return {
      success: false,
      message: 'No current problem',
      session,
      currentProblem: null,
    };
  }
  
  // Update metrics
  session.metrics.skippedCount++;
  
  updateSession(session.id, { metrics: session.metrics });
  
  // Move to next problem
  const nextProblem = advanceToNextProblem(session.id);
  
  // Emit SSE event
  publish(session.id, 'skip', {
    skippedProblemId: currentProblem.id,
    nextProblemId: nextProblem?.id,
    timestamp,
    skippedCount: session.metrics.skippedCount,
  });
  
  // Generate recommendation for skipped problem
  const recommendation = `Consider revisiting ${currentProblem.topic} problems later.`;
  
  publish(session.id, 'recommendation', {
    type: 'skip_feedback',
    message: recommendation,
    timestamp,
  });
  
  return {
    success: true,
    message: nextProblem ? 'Problem skipped, moved to next' : 'Problem skipped, no more problems',
    session: getSession(session.id),
    currentProblem: nextProblem,
    recommendation,
  };
}

function handlePassTests(
  session: TrainSession,
  event: SessionEvent,
  timestamp: number
): EventResult {
  const currentProblem = getCurrentProblem(session.id);
  if (!currentProblem) {
    return {
      success: false,
      message: 'No current problem',
      session,
      currentProblem: null,
    };
  }
  
  // Update metrics
  session.metrics.passedTests += event.testResults?.filter((t) => t.passed).length ?? 1;
  
  updateSession(session.id, { metrics: session.metrics });
  
  // Emit SSE event
  publish(session.id, 'pass_tests', {
    problemId: currentProblem.id,
    testResults: event.testResults,
    timestamp,
  });
  
  return {
    success: true,
    message: 'Tests passed',
    session: getSession(session.id),
    currentProblem,
    testResults: event.testResults,
  };
}

function handleFailTests(
  session: TrainSession,
  event: SessionEvent,
  timestamp: number
): EventResult {
  const currentProblem = getCurrentProblem(session.id);
  if (!currentProblem) {
    return {
      success: false,
      message: 'No current problem',
      session,
      currentProblem: null,
    };
  }
  
  // Update metrics
  session.metrics.failedTests += event.testResults?.filter((t) => !t.passed).length ?? 1;
  
  updateSession(session.id, { metrics: session.metrics });
  
  // Emit SSE event
  publish(session.id, 'fail_tests', {
    problemId: currentProblem.id,
    testResults: event.testResults,
    timestamp,
  });
  
  // Generate recommendation
  const recommendation = `Check edge cases for ${currentProblem.topic} problems.`;
  
  publish(session.id, 'recommendation', {
    type: 'test_feedback',
    message: recommendation,
    timestamp,
  });
  
  return {
    success: true,
    message: 'Tests failed',
    session: getSession(session.id),
    currentProblem,
    testResults: event.testResults,
    recommendation,
  };
}

function handleSubmit(
  session: TrainSession,
  event: SessionEvent,
  timestamp: number
): EventResult {
  const currentProblem = getCurrentProblem(session.id);
  if (!currentProblem) {
    return {
      success: false,
      message: 'No current problem',
      session,
      currentProblem: null,
    };
  }
  
  // For submission, we consider the problem solved
  session.metrics.solvedCount++;
  session.metrics.topicStats[currentProblem.topic].solved++;
  
  updateSession(session.id, { metrics: session.metrics });
  
  // Move to next problem
  const nextProblem = advanceToNextProblem(session.id);
  
  // Update accuracy
  const updatedSession = getSession(session.id);
  if (updatedSession) {
    updatedSession.metrics.accuracy = 
      updatedSession.metrics.solvedCount / updatedSession.metrics.totalProblems;
    updateSession(session.id, { metrics: updatedSession.metrics });
  }
  
  // Emit SSE event
  publish(session.id, 'submit', {
    solvedProblemId: currentProblem.id,
    nextProblemId: nextProblem?.id,
    code: event.code,
    language: event.language,
    timestamp,
    solvedCount: session.metrics.solvedCount,
  });
  
  // Emit metrics update
  publish(session.id, 'metrics_update', {
    metrics: getSession(session.id)?.metrics,
    timestamp,
  });
  
  return {
    success: true,
    message: nextProblem ? 'Problem solved, moved to next' : 'Problem solved, session complete!',
    session: getSession(session.id),
    currentProblem: nextProblem,
  };
}

function handlePause(session: TrainSession, timestamp: number): EventResult {
  if (session.status !== 'active') {
    return {
      success: false,
      message: 'Session is not active',
      session,
      currentProblem: getCurrentProblem(session.id),
    };
  }
  
  updateSession(session.id, { 
    status: 'paused',
    pausedAt: timestamp,
  });
  
  // Emit SSE event
  publish(session.id, 'pause', {
    timestamp,
    message: 'Session paused',
  });
  
  return {
    success: true,
    message: 'Session paused',
    session: getSession(session.id),
    currentProblem: getCurrentProblem(session.id),
  };
}

function handleResume(session: TrainSession, timestamp: number): EventResult {
  if (session.status !== 'paused') {
    return {
      success: false,
      message: 'Session is not paused',
      session,
      currentProblem: getCurrentProblem(session.id),
    };
  }
  
  updateSession(session.id, { 
    status: 'active',
    pausedAt: undefined,
  });
  
  // Emit SSE event
  publish(session.id, 'resume', {
    timestamp,
    message: 'Session resumed',
  });
  
  return {
    success: true,
    message: 'Session resumed',
    session: getSession(session.id),
    currentProblem: getCurrentProblem(session.id),
  };
}

function handleNavigate(session: TrainSession, event: SessionEvent): EventResult {
  // For now, navigation is just informational
  const currentProblem = getCurrentProblem(session.id);
  
  publish(session.id, 'navigate', {
    problemId: event.problemId,
    currentProblemId: currentProblem?.id,
    timestamp: event.timestamp ?? Date.now(),
  });
  
  return {
    success: true,
    message: 'Navigation recorded',
    session,
    currentProblem,
  };
}

// ============================================================================
// ADAPTIVE RECOMMENDATIONS
// ============================================================================

/**
 * Generate real-time adaptive recommendations based on session progress.
 */
export function generateAdaptiveRecommendations(sessionId: string): string[] {
  const session = getSession(sessionId);
  if (!session) return [];
  
  const recommendations: string[] = [];
  const { metrics } = session;
  
  // Accuracy-based recommendations
  if (metrics.solvedCount > 0) {
    const accuracy = metrics.solvedCount / (metrics.solvedCount + metrics.skippedCount + metrics.failedTests);
    
    if (accuracy < 0.3) {
      recommendations.push('Consider slowing down and reading problems more carefully.');
    } else if (accuracy > 0.8) {
      recommendations.push('Great accuracy! You might be ready for harder problems.');
    }
  }
  
  // Hint-based recommendations
  if (metrics.hintsUsed > 0 && metrics.solvedCount > 0) {
    const hintsPerProblem = metrics.hintsUsed / metrics.solvedCount;
    if (hintsPerProblem > 2) {
      recommendations.push('Try spending more time before using hints.');
    }
  }
  
  // Topic-based recommendations
  for (const [topic, stats] of Object.entries(metrics.topicStats)) {
    if (stats.attempted > 0 && stats.solved === 0) {
      recommendations.push(`Need more practice with ${topic}. Consider reviewing fundamentals.`);
    }
  }
  
  // Publish recommendations via SSE
  if (recommendations.length > 0) {
    publish(sessionId, 'adaptive_recommendations', {
      recommendations,
      timestamp: Date.now(),
    });
  }
  
  return recommendations;
}
