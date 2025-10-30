/**
 * Problem Recommendation Service
 * Generates intelligent problem recommendations based on:
 * - User skill level
 * - Weak topics
 * - Learning velocity
 * - Mix of targeted and exploratory problems
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { UserMetricsService } from './user-metrics-service';

// ==================== TYPES ====================

export interface RecommendedProblem {
  problem_id: string;
  problem_title: string;
  problem_url?: string;
  rating: number;
  tags: string[];
  recommendation_reason: string;
  priority_score: number;
  category: 'skill_level' | 'weak_topic' | 'exploratory' | 'spaced_repetition';
}

export interface RecommendationOptions {
  count?: number; // Total number of recommendations (default: 10)
  skillLevelRatio?: number; // % of problems at user's level (default: 0.6)
  exploratoryRatio?: number; // % of exploratory problems (default: 0.4)
  includeWeakTopics?: boolean; // Include weak topic problems (default: true)
  excludeSolved?: boolean; // Exclude already solved problems (default: true)
}

export interface ProblemSearchResult {
  problem_id: string;
  title: string;
  url: string;
  rating: number;
  tags: string[];
}

// ==================== RECOMMENDATION SERVICE ====================

export class RecommendationService {
  constructor(
    private supabase: SupabaseClient,
    private metricsService: UserMetricsService
  ) {}

  /**
   * Generate problem recommendations for a user
   */
  async generateRecommendations(
    userId: string,
    options: RecommendationOptions = {}
  ): Promise<RecommendedProblem[]> {
    try {
      const {
        count = 10,
        skillLevelRatio = 0.6,
        exploratoryRatio = 0.4,
        includeWeakTopics = true,
        excludeSolved = true,
      } = options;

      // Get user skill profile
      const skillProfile = await this.metricsService.getUserSkillProfile(userId);
      if (!skillProfile) {
        return this.getBeginnerRecommendations(count);
      }

      const currentSkill = skillProfile.current_skill_level;
      const weakTopics = skillProfile.weak_topics || [];
      const strongTopics = skillProfile.strong_topics || [];

      // Calculate distribution
      const skillLevelCount = Math.floor(count * skillLevelRatio);
      const exploratoryCount = count - skillLevelCount;

      const recommendations: RecommendedProblem[] = [];

      // Get solved problem IDs to exclude
      const solvedIds = excludeSolved ? await this.getSolvedProblemIds(userId) : [];

      // 1. Skill level problems (60%)
      if (weakTopics.length > 0 && includeWeakTopics) {
        // Focus on weak topics at slightly lower difficulty
        const weakTopicProblems = await this.findProblems({
          rating: currentSkill - 200,
          ratingRange: 200,
          tags: weakTopics,
          excludeIds: solvedIds,
          limit: Math.ceil(skillLevelCount / 2),
        });

        recommendations.push(...weakTopicProblems.map(p => ({
          ...p,
          recommendation_reason: `Practice ${weakTopics[0]} - your success rate is below 50%`,
          priority_score: 0.9,
          category: 'weak_topic' as const,
        })));
      }

      // General skill level problems
      const generalProblems = await this.findProblems({
        rating: currentSkill,
        ratingRange: 100,
        excludeTags: weakTopics.slice(0, 2), // Avoid too many weak topics
        excludeIds: [...solvedIds, ...recommendations.map(r => r.problem_id)],
        limit: skillLevelCount - recommendations.length,
      });

      recommendations.push(...generalProblems.map(p => ({
        ...p,
        recommendation_reason: `Matches your current skill level (${currentSkill})`,
        priority_score: 0.7,
        category: 'skill_level' as const,
      })));

      // 2. Exploratory problems (40%)
      // Mix of slightly harder and new topics
      const isImproving = skillProfile.improvement_rate > 0;
      const exploratoryRating = isImproving ? currentSkill + 200 : currentSkill + 100;

      const exploratoryProblems = await this.findProblems({
        rating: exploratoryRating,
        ratingRange: 200,
        excludeIds: [...solvedIds, ...recommendations.map(r => r.problem_id)],
        limit: exploratoryCount,
      });

      recommendations.push(...exploratoryProblems.map(p => {
        const isNewTopic = p.tags.some(tag => 
          !weakTopics.includes(tag) && !strongTopics.includes(tag)
        );
        return {
          ...p,
          recommendation_reason: isNewTopic
            ? `Explore new topic: ${p.tags[0]}`
            : `Level up - try a harder problem (${p.rating})`,
          priority_score: 0.5,
          category: 'exploratory' as const,
        };
      }));

      // 3. Add spaced repetition problems (if due)
      const reviewProblems = await this.getDueReviews(userId, 3);
      recommendations.push(...reviewProblems);

      // Sort by priority and return
      return recommendations
        .sort((a, b) => b.priority_score - a.priority_score)
        .slice(0, count);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Find problems matching criteria using Codeforces API
   * In production, this would query your problems table
   */
  private async findProblems(criteria: {
    rating: number;
    ratingRange: number;
    tags?: string[];
    excludeTags?: string[];
    excludeIds?: string[];
    limit: number;
  }): Promise<ProblemSearchResult[]> {
    try {
      const {
        rating,
        ratingRange,
        tags,
        excludeTags,
        excludeIds = [],
        limit,
      } = criteria;

      // This is a placeholder - in production, you'd query your problems table
      // For now, return mock data
      const minRating = rating - ratingRange;
      const maxRating = rating + ratingRange;

      // Mock implementation - replace with actual database query
      const mockProblems: ProblemSearchResult[] = [
        {
          problem_id: `${rating}A`,
          title: `Problem at rating ${rating}`,
          url: `https://codeforces.com/problemset/problem/${Math.floor(rating / 100)}/${rating % 100}A`,
          rating: rating,
          tags: tags || ['implementation', 'math'],
        },
      ];

      return mockProblems
        .filter(p => !excludeIds.includes(p.problem_id))
        .slice(0, limit);
    } catch (error) {
      console.error('Error finding problems:', error);
      return [];
    }
  }

  /**
   * Get solved problem IDs for a user
   */
  private async getSolvedProblemIds(userId: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('problem_attempts')
        .select('problem_id')
        .eq('user_id', userId)
        .eq('status', 'solved');

      if (error) throw error;
      return data?.map(d => d.problem_id) || [];
    } catch (error) {
      console.error('Error getting solved problems:', error);
      return [];
    }
  }

  /**
   * Get problems due for review (spaced repetition)
   */
  private async getDueReviews(userId: string, limit: number = 3): Promise<RecommendedProblem[]> {
    try {
      const { data, error } = await this.supabase
        .from('spaced_repetition_reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .lte('next_review_at', new Date().toISOString())
        .order('next_review_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.map(review => ({
        problem_id: review.problem_id,
        problem_title: review.problem_title,
        problem_url: review.problem_url,
        rating: review.rating || 0,
        tags: review.tags || [],
        recommendation_reason: `🔄 Review: You struggled with this problem ${review.review_count || 0} time(s). Time to retry!`,
        priority_score: 1.0, // Highest priority
        category: 'spaced_repetition' as const,
      }));
    } catch (error) {
      console.error('Error getting due reviews:', error);
      return [];
    }
  }

  /**
   * Get beginner recommendations (for new users)
   */
  private async getBeginnerRecommendations(count: number): Promise<RecommendedProblem[]> {
    const beginnerProblems = await this.findProblems({
      rating: 800,
      ratingRange: 100,
      tags: ['implementation', 'math', 'brute-force'],
      limit: count,
    });

    return beginnerProblems.map(p => ({
      ...p,
      recommendation_reason: 'Start with beginner-friendly problems',
      priority_score: 0.8,
      category: 'skill_level' as const,
    }));
  }

  /**
   * Save recommendations to database
   */
  async saveRecommendations(userId: string, recommendations: RecommendedProblem[]): Promise<void> {
    try {
      // Clear old recommendations
      await this.supabase
        .from('problem_recommendations')
        .delete()
        .eq('user_id', userId)
        .eq('status', 'pending')
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Insert new recommendations
      const records = recommendations.map(rec => ({
        user_id: userId,
        problem_id: rec.problem_id,
        problem_title: rec.problem_title,
        problem_url: rec.problem_url,
        rating: rec.rating,
        tags: rec.tags,
        recommendation_reason: rec.recommendation_reason,
        recommended_difficulty: rec.rating,
        priority_score: rec.priority_score,
        category: rec.category,
        status: 'pending',
      }));

      const { error } = await this.supabase
        .from('problem_recommendations')
        .upsert(records, {
          onConflict: 'user_id,problem_id',
          ignoreDuplicates: false,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving recommendations:', error);
    }
  }

  /**
   * Get saved recommendations for user
   */
  async getRecommendations(userId: string, status: string = 'pending'): Promise<RecommendedProblem[]> {
    try {
      const { data, error } = await this.supabase
        .from('problem_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .gt('expires_at', new Date().toISOString())
        .order('priority_score', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(rec => ({
        problem_id: rec.problem_id,
        problem_title: rec.problem_title,
        problem_url: rec.problem_url,
        rating: rec.rating,
        tags: rec.tags,
        recommendation_reason: rec.recommendation_reason,
        priority_score: rec.priority_score,
        category: rec.category,
      }));
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Mark recommendation as viewed/started/completed
   */
  async updateRecommendationStatus(
    userId: string,
    problemId: string,
    status: 'viewed' | 'started' | 'completed' | 'skipped'
  ): Promise<void> {
    try {
      const updateFields: any = { status };

      if (status === 'viewed') updateFields.viewed_at = new Date().toISOString();
      if (status === 'started') updateFields.started_at = new Date().toISOString();
      if (status === 'completed') updateFields.completed_at = new Date().toISOString();

      await this.supabase
        .from('problem_recommendations')
        .update(updateFields)
        .eq('user_id', userId)
        .eq('problem_id', problemId);
    } catch (error) {
      console.error('Error updating recommendation status:', error);
    }
  }

  /**
   * Get recommendation insights for display
   */
  async getRecommendationInsights(userId: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    topReasons: string[];
  }> {
    try {
      const recommendations = await this.getRecommendations(userId);

      const byCategory = recommendations.reduce((acc, rec) => {
        acc[rec.category] = (acc[rec.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topReasons = recommendations
        .slice(0, 5)
        .map(r => r.recommendation_reason);

      return {
        total: recommendations.length,
        byCategory,
        topReasons,
      };
    } catch (error) {
      console.error('Error getting recommendation insights:', error);
      return { total: 0, byCategory: {}, topReasons: [] };
    }
  }
}
