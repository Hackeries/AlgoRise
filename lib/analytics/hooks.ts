'use client';

import { useEffect, useCallback, useRef } from 'react';
import { 
  trackPageView, 
  trackProblemAttempt, 
  trackProblemSolved,
  trackAIUsage,
  trackVisualizerUsage,
  trackStreakUpdate,
  trackAchievementEarned,
  trackFeatureEngagement,
  trackError
} from './events';

/**
 * Hook to track page views automatically
 */
export function usePageTracking(pageName: string, properties?: Record<string, unknown>) {
  useEffect(() => {
    trackPageView(pageName, properties);
  }, [pageName, properties]);
}

/**
 * Hook for tracking problem solving session
 */
export function useProblemTracking(problemId: string, topic: string, difficulty?: string) {
  const startTimeRef = useRef<number | null>(null);
  const attemptTrackedRef = useRef(false);

  const startAttempt = useCallback(() => {
    if (!attemptTrackedRef.current) {
      trackProblemAttempt(problemId, topic, difficulty);
      attemptTrackedRef.current = true;
      startTimeRef.current = Date.now();
    }
  }, [problemId, topic, difficulty]);

  const markSolved = useCallback(() => {
    const timeSpent = startTimeRef.current 
      ? Math.floor((Date.now() - startTimeRef.current) / 1000) 
      : undefined;
    
    trackProblemSolved(problemId, topic, difficulty, timeSpent);
    startTimeRef.current = null;
    attemptTrackedRef.current = false;
  }, [problemId, topic, difficulty]);

  return { startAttempt, markSolved };
}

/**
 * Hook for tracking AI feature usage
 */
export function useAITracking() {
  const trackHint = useCallback((context?: Record<string, unknown>) => {
    trackAIUsage('hint', context);
  }, []);

  const trackTutor = useCallback((context?: Record<string, unknown>) => {
    trackAIUsage('tutor', context);
  }, []);

  const trackAnalyze = useCallback((context?: Record<string, unknown>) => {
    trackAIUsage('analyze', context);
  }, []);

  const trackDebug = useCallback((context?: Record<string, unknown>) => {
    trackAIUsage('debug', context);
  }, []);

  return { trackHint, trackTutor, trackAnalyze, trackDebug };
}

/**
 * Hook for tracking visualizer interactions
 */
export function useVisualizerTracking(visualizerType: string, algorithm: string) {
  const trackPlay = useCallback(() => {
    trackVisualizerUsage(visualizerType, algorithm, 'play');
  }, [visualizerType, algorithm]);

  const trackPause = useCallback(() => {
    trackVisualizerUsage(visualizerType, algorithm, 'pause');
  }, [visualizerType, algorithm]);

  const trackStep = useCallback(() => {
    trackVisualizerUsage(visualizerType, algorithm, 'step');
  }, [visualizerType, algorithm]);

  const trackReset = useCallback(() => {
    trackVisualizerUsage(visualizerType, algorithm, 'reset');
  }, [visualizerType, algorithm]);

  return { trackPlay, trackPause, trackStep, trackReset };
}

/**
 * Hook for tracking streak updates
 */
export function useStreakTracking() {
  const previousStreakRef = useRef<number>(0);

  const updateStreak = useCallback((newStreak: number, longestStreak: number) => {
    const isNewRecord = newStreak > previousStreakRef.current && newStreak === longestStreak;
    trackStreakUpdate(newStreak, isNewRecord);
    previousStreakRef.current = newStreak;
  }, []);

  return { updateStreak };
}

/**
 * Hook for tracking achievement notifications
 */
export function useAchievementTracking() {
  const trackAchievement = useCallback((id: string, name: string, tier: string) => {
    trackAchievementEarned(id, name, tier);
  }, []);

  return { trackAchievement };
}

/**
 * Hook for tracking general feature engagement
 */
export function useFeatureTracking(featureName: string) {
  const track = useCallback((action: string, details?: Record<string, unknown>) => {
    trackFeatureEngagement(featureName, action, details);
  }, [featureName]);

  return { track };
}

/**
 * Hook for error tracking
 */
export function useErrorTracking() {
  const track = useCallback((errorType: string, errorMessage: string, context?: Record<string, unknown>) => {
    trackError(errorType, errorMessage, context);
  }, []);

  return { trackError: track };
}

// Export events module for direct usage
export * from './events';
