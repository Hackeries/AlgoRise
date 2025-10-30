/**
 * Adaptive Learning Engine
 * Main entry point for all adaptive learning functionality
 */

export { UserMetricsService, createUserMetricsService } from './user-metrics-service';
export type {
  ProblemAttempt,
  TopicMastery,
  UserSkillProfile,
  UserMetricsSummary,
} from './user-metrics-service';

export { RecommendationService } from './recommendation-service';
export type {
  RecommendedProblem,
  RecommendationOptions,
} from './recommendation-service';

export { LearningPathService } from './learning-path-service';
export type {
  LearningPath,
  LearningPathProgress,
  LearningPathModule,
  StructuredPath,
} from './learning-path-service';

export { SpacedRepetitionService } from './spaced-repetition-service';
export type {
  SpacedRepetitionReview,
  ReviewOutcome,
  DueReview,
} from './spaced-repetition-service';

// Factory function to create all services
import { SupabaseClient } from '@supabase/supabase-js';
import { UserMetricsService } from './user-metrics-service';
import { RecommendationService } from './recommendation-service';
import { LearningPathService } from './learning-path-service';
import { SpacedRepetitionService } from './spaced-repetition-service';

export interface AdaptiveLearningEngine {
  metrics: UserMetricsService;
  recommendations: RecommendationService;
  learningPaths: LearningPathService;
  spacedRepetition: SpacedRepetitionService;
}

export function createAdaptiveLearningEngine(
  supabase: SupabaseClient
): AdaptiveLearningEngine {
  const metrics = new UserMetricsService(supabase);
  const recommendations = new RecommendationService(supabase, metrics);
  const learningPaths = new LearningPathService(supabase, metrics);
  const spacedRepetition = new SpacedRepetitionService(supabase);

  return {
    metrics,
    recommendations,
    learningPaths,
    spacedRepetition,
  };
}
