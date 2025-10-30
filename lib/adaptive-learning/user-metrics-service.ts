/**
 * User Metrics Service
 * Tracks and analyzes user learning metrics including:
 * - Problem attempts and solve times
 * - Topic mastery levels
 * - Skill level calculation
 * - Learning velocity
 */

import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

// ==================== TYPES ====================

export interface ProblemAttempt {
  id?: string;
  user_id: string;
  problem_id: string;
  problem_title: string;
  problem_url?: string;
  rating?: number;
  tags: string[];
  attempt_number: number;
  status: 'attempted' | 'solved' | 'failed' | 'timed_out';
  time_spent_seconds?: number;
  hints_used?: number;
  test_cases_passed?: number;
  total_test_cases?: number;
  language?: string;
  code_length?: number;
  started_at: string;
  completed_at?: string;
}

export interface TopicMastery {
  topic: string;
  problems_attempted: number;
  problems_solved: number;
  success_rate: number;
  avg_solve_time_seconds?: number;
  avg_attempts_per_problem: number;
  min_rating_solved?: number;
  max_rating_solved?: number;
  current_level: number;
  mastery_level: 'beginner' | 'learning' | 'proficient' | 'master' | 'expert';
  last_practiced_at?: string;
}

export interface UserSkillProfile {
  user_id: string;
  current_skill_level: number;
  problems_per_week: number;
  avg_solve_time_seconds?: number;
  skill_level_7d_ago?: number;
  skill_level_30d_ago?: number;
  improvement_rate: number;
  total_problems_attempted: number;
  total_problems_solved: number;
  overall_success_rate: number;
  current_streak: number;
  longest_streak: number;
  weak_topics: string[];
  strong_topics: string[];
  last_activity_at?: string;
}

export interface UserMetricsSummary {
  skillProfile: UserSkillProfile;
  topicMastery: TopicMastery[];
  recentAttempts: ProblemAttempt[];
  weeklyActivity: {
    week: string;
    problemsSolved: number;
    timeSpent: number;
  }[];
}

// ==================== USER METRICS SERVICE ====================

export class UserMetricsService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Record a problem attempt
   */
  async recordAttempt(attempt: Omit<ProblemAttempt, 'id'>): Promise<{ success: boolean; error?: string }> {
    try {
      // Check existing attempts for this problem
      const { data: existing, error: fetchError } = await this.supabase
        .from('problem_attempts')
        .select('attempt_number')
        .eq('user_id', attempt.user_id)
        .eq('problem_id', attempt.problem_id)
        .order('attempt_number', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const attemptNumber = existing && existing.length > 0 ? existing[0].attempt_number + 1 : 1;

      const { error: insertError } = await this.supabase
        .from('problem_attempts')
        .insert({
          ...attempt,
          attempt_number: attemptNumber,
        });

      if (insertError) throw insertError;

      // Update spaced repetition if failed
      if (attempt.status === 'failed') {
        await this.addToSpacedRepetition(attempt.user_id, {
          problem_id: attempt.problem_id,
          problem_title: attempt.problem_title,
          problem_url: attempt.problem_url,
          rating: attempt.rating,
          tags: attempt.tags,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error recording attempt:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get user skill profile (creates if doesn't exist)
   */
  async getUserSkillProfile(userId: string): Promise<UserSkillProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_skill_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Create initial profile
        const initialProfile: Partial<UserSkillProfile> = {
          user_id: userId,
          current_skill_level: 800,
          problems_per_week: 0,
          improvement_rate: 0,
          total_problems_attempted: 0,
          total_problems_solved: 0,
          overall_success_rate: 0,
          current_streak: 0,
          longest_streak: 0,
          weak_topics: [],
          strong_topics: [],
        };

        const { data: newProfile, error: insertError } = await this.supabase
          .from('user_skill_profiles')
          .insert(initialProfile)
          .select()
          .single();

        if (insertError) throw insertError;
        return newProfile;
      }

      return data;
    } catch (error) {
      console.error('Error getting user skill profile:', error);
      return null;
    }
  }

  /**
   * Calculate user's current skill level from recent attempts
   * Uses weighted average of last 10 solved problems
   */
  async calculateCurrentSkillLevel(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('problem_attempts')
        .select('rating, created_at')
        .eq('user_id', userId)
        .eq('status', 'solved')
        .not('rating', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!data || data.length === 0) return 800; // Default for new users

      // Weight recent problems more heavily
      let weightedSum = 0;
      let totalWeight = 0;

      data.forEach((attempt, index) => {
        const weight = 1 / (index + 1); // More recent = higher weight
        weightedSum += (attempt.rating || 800) * weight;
        totalWeight += weight;
      });

      return Math.round(weightedSum / totalWeight);
    } catch (error) {
      console.error('Error calculating skill level:', error);
      return 800;
    }
  }

  /**
   * Update user skill profile with latest metrics
   */
  async updateSkillProfile(userId: string): Promise<void> {
    try {
      const currentSkillLevel = await this.calculateCurrentSkillLevel(userId);
      const problemsPerWeek = await this.calculateProblemsPerWeek(userId);
      const avgSolveTime = await this.calculateAvgSolveTime(userId);
      const weakTopics = await this.getWeakTopics(userId, 5);
      const strongTopics = await this.getStrongTopics(userId, 5);

      // Get historical skill levels
      const { data: profile } = await this.supabase
        .from('user_skill_profiles')
        .select('current_skill_level, skill_level_7d_ago, updated_at')
        .eq('user_id', userId)
        .single();

      let skill_level_7d_ago = profile?.skill_level_7d_ago;
      let skill_level_30d_ago = profile?.skill_level_7d_ago;

      // Update historical levels if needed
      if (profile?.updated_at) {
        const daysSinceUpdate = Math.floor(
          (Date.now() - new Date(profile.updated_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceUpdate >= 7) {
          skill_level_7d_ago = profile.current_skill_level;
        }
      }

      const improvementRate = skill_level_7d_ago 
        ? ((currentSkillLevel - skill_level_7d_ago) / skill_level_7d_ago) * 100 
        : 0;

      await this.supabase
        .from('user_skill_profiles')
        .upsert({
          user_id: userId,
          current_skill_level: currentSkillLevel,
          problems_per_week: problemsPerWeek,
          avg_solve_time_seconds: avgSolveTime,
          skill_level_7d_ago,
          skill_level_30d_ago,
          improvement_rate: improvementRate,
          weak_topics: weakTopics.map(t => t.topic),
          strong_topics: strongTopics.map(t => t.topic),
          last_activity_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error updating skill profile:', error);
    }
  }

  /**
   * Get weak topics (success rate < 50%)
   */
  async getWeakTopics(userId: string, limit: number = 5): Promise<TopicMastery[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_topic_mastery')
        .select('*')
        .eq('user_id', userId)
        .lt('success_rate', 0.5)
        .gte('problems_attempted', 3) // Minimum 3 attempts for meaningful data
        .order('success_rate', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting weak topics:', error);
      return [];
    }
  }

  /**
   * Get strong topics (success rate > 80%)
   */
  async getStrongTopics(userId: string, limit: number = 5): Promise<TopicMastery[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_topic_mastery')
        .select('*')
        .eq('user_id', userId)
        .gt('success_rate', 0.8)
        .gte('problems_attempted', 3)
        .order('success_rate', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting strong topics:', error);
      return [];
    }
  }

  /**
   * Calculate problems per week
   */
  private async calculateProblemsPerWeek(userId: string): Promise<number> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await this.supabase
        .from('problem_attempts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'solved')
        .gte('created_at', sevenDaysAgo);

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error calculating problems per week:', error);
      return 0;
    }
  }

  /**
   * Calculate average solve time
   */
  private async calculateAvgSolveTime(userId: string): Promise<number | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('problem_attempts')
        .select('time_spent_seconds')
        .eq('user_id', userId)
        .eq('status', 'solved')
        .not('time_spent_seconds', 'is', null)
        .limit(20);

      if (error) throw error;
      if (!data || data.length === 0) return undefined;

      const total = data.reduce((sum, attempt) => sum + (attempt.time_spent_seconds || 0), 0);
      return Math.round(total / data.length);
    } catch (error) {
      console.error('Error calculating avg solve time:', error);
      return undefined;
    }
  }

  /**
   * Add problem to spaced repetition system
   */
  private async addToSpacedRepetition(userId: string, problem: {
    problem_id: string;
    problem_title: string;
    problem_url?: string;
    rating?: number;
    tags: string[];
  }): Promise<void> {
    try {
      // Check if already exists
      const { data: existing } = await this.supabase
        .from('spaced_repetition_reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('problem_id', problem.problem_id)
        .single();

      if (existing) return; // Already in system

      // Add with initial review in 3 days
      const nextReview = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

      await this.supabase
        .from('spaced_repetition_reviews')
        .insert({
          user_id: userId,
          problem_id: problem.problem_id,
          problem_title: problem.problem_title,
          problem_url: problem.problem_url,
          rating: problem.rating,
          tags: problem.tags,
          next_review_at: nextReview,
          status: 'active',
        });
    } catch (error) {
      console.error('Error adding to spaced repetition:', error);
    }
  }

  /**
   * Get comprehensive metrics summary
   */
  async getMetricsSummary(userId: string): Promise<UserMetricsSummary | null> {
    try {
      const skillProfile = await this.getUserSkillProfile(userId);
      if (!skillProfile) return null;

      const { data: topicMastery } = await this.supabase
        .from('user_topic_mastery')
        .select('*')
        .eq('user_id', userId)
        .order('problems_solved', { ascending: false });

      const { data: recentAttempts } = await this.supabase
        .from('problem_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        skillProfile,
        topicMastery: topicMastery || [],
        recentAttempts: recentAttempts || [],
        weeklyActivity: [], // TODO: Implement weekly activity aggregation
      };
    } catch (error) {
      console.error('Error getting metrics summary:', error);
      return null;
    }
  }
}

/**
 * Factory function to create UserMetricsService
 */
export async function createUserMetricsService(): Promise<UserMetricsService> {
  const supabase = await createClient();
  return new UserMetricsService(supabase);
}
