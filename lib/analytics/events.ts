/**
 * Analytics Event Tracking System for AlgoRise
 * 
 * Provides hooks and utilities for tracking user engagement and feature usage
 */

type EventCategory = 'engagement' | 'learning' | 'feature' | 'conversion' | 'error';

interface AnalyticsEvent {
  name: string;
  category: EventCategory;
  properties?: Record<string, unknown>;
}

interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  endpoint: string;
}

const config: AnalyticsConfig = {
  enabled: typeof window !== 'undefined',
  debug: process.env.NODE_ENV === 'development',
  endpoint: '/api/analytics/events',
};

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('ar_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('ar_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Track an analytics event
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  if (!config.enabled) return;

  const payload = {
    event_name: event.name,
    event_category: event.category,
    properties: event.properties || {},
    session_id: getSessionId(),
    page_url: typeof window !== 'undefined' ? window.location.href : '',
    timestamp: new Date().toISOString(),
  };

  if (config.debug) {
    console.log('[Analytics]', payload);
  }

  try {
    // Send to backend API
    await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // Don't wait for response
      keepalive: true,
    });
  } catch (error) {
    // Silently fail - analytics should never break the app
    if (config.debug) {
      console.error('[Analytics] Failed to send event:', error);
    }
  }
}

// Predefined event trackers for common actions

/**
 * Track page view
 */
export function trackPageView(page: string, properties?: Record<string, unknown>): void {
  trackEvent({
    name: 'page_view',
    category: 'engagement',
    properties: { page, ...properties },
  });
}

/**
 * Track problem attempt
 */
export function trackProblemAttempt(
  problemId: string,
  topic: string,
  difficulty?: string
): void {
  trackEvent({
    name: 'problem_attempt',
    category: 'learning',
    properties: { problemId, topic, difficulty },
  });
}

/**
 * Track problem solved
 */
export function trackProblemSolved(
  problemId: string,
  topic: string,
  difficulty?: string,
  timeSpentSeconds?: number
): void {
  trackEvent({
    name: 'problem_solved',
    category: 'learning',
    properties: { problemId, topic, difficulty, timeSpentSeconds },
  });
}

/**
 * Track AI feature usage
 */
export function trackAIUsage(
  featureType: 'hint' | 'tutor' | 'analyze' | 'debug',
  context?: Record<string, unknown>
): void {
  trackEvent({
    name: `ai_${featureType}_used`,
    category: 'feature',
    properties: { featureType, ...context },
  });
}

/**
 * Track visualizer interaction
 */
export function trackVisualizerUsage(
  visualizerType: string,
  algorithm: string,
  action: 'play' | 'pause' | 'step' | 'reset'
): void {
  trackEvent({
    name: 'visualizer_interaction',
    category: 'learning',
    properties: { visualizerType, algorithm, action },
  });
}

/**
 * Track streak update
 */
export function trackStreakUpdate(
  currentStreak: number,
  isNewRecord: boolean
): void {
  trackEvent({
    name: 'streak_update',
    category: 'engagement',
    properties: { currentStreak, isNewRecord },
  });
}

/**
 * Track achievement earned
 */
export function trackAchievementEarned(
  achievementId: string,
  achievementName: string,
  tier: string
): void {
  trackEvent({
    name: 'achievement_earned',
    category: 'engagement',
    properties: { achievementId, achievementName, tier },
  });
}

/**
 * Track feature engagement
 */
export function trackFeatureEngagement(
  featureName: string,
  action: string,
  details?: Record<string, unknown>
): void {
  trackEvent({
    name: 'feature_engagement',
    category: 'feature',
    properties: { featureName, action, ...details },
  });
}

/**
 * Track error occurrence
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  context?: Record<string, unknown>
): void {
  trackEvent({
    name: 'error_occurred',
    category: 'error',
    properties: { errorType, errorMessage, ...context },
  });
}

/**
 * Track conversion event
 */
export function trackConversion(
  conversionType: 'signup' | 'subscription' | 'upgrade' | 'referral',
  details?: Record<string, unknown>
): void {
  trackEvent({
    name: `conversion_${conversionType}`,
    category: 'conversion',
    properties: details,
  });
}
