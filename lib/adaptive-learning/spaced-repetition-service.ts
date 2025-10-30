/**
 * Spaced Repetition Service
 * Implements SM-2 algorithm for optimal review scheduling
 * Helps users retain knowledge of difficult problems
 */

import { SupabaseClient } from '@supabase/supabase-js';

// ==================== TYPES ====================

export interface SpacedRepetitionReview {
  id: string;
  user_id: string;
  problem_id: string;
  problem_title: string;
  problem_url?: string;
  rating?: number;
  tags: string[];
  review_count: number;
  last_review_outcome?: 'failed' | 'partial' | 'success';
  ease_factor: number;
  interval_days: number;
  next_review_at: string;
  review_dates: string[];
  review_outcomes: string[];
  status: 'active' | 'mastered' | 'archived';
  first_failed_at: string;
  last_reviewed_at?: string;
  mastered_at?: string;
}

export interface ReviewOutcome {
  outcome: 'failed' | 'partial' | 'success';
  timeSpentSeconds?: number;
  hintsUsed?: number;
}

export interface DueReview {
  problem: SpacedRepetitionReview;
  daysOverdue: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

// ==================== SPACED REPETITION SERVICE ====================

export class SpacedRepetitionService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Add a problem to spaced repetition (called when user fails)
   */
  async addProblem(
    userId: string,
    problem: {
      problem_id: string;
      problem_title: string;
      problem_url?: string;
      rating?: number;
      tags: string[];
    }
  ): Promise<{ success: boolean; nextReviewAt?: string }> {
    try {
      // Check if already exists
      const { data: existing } = await this.supabase
        .from('spaced_repetition_reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('problem_id', problem.problem_id)
        .single();

      if (existing) {
        // If archived, reactivate
        if (existing.status === 'archived') {
          const nextReview = this.calculateNextReview(1.0, 1); // Reset
          await this.supabase
            .from('spaced_repetition_reviews')
            .update({
              status: 'active',
              ease_factor: 2.5,
              interval_days: 1,
              next_review_at: nextReview,
            })
            .eq('id', existing.id);
          
          return { success: true, nextReviewAt: nextReview };
        }
        
        return { success: true, nextReviewAt: existing.next_review_at };
      }

      // Initial review in 3 days (SM-2 starting interval)
      const nextReview = this.calculateNextReview(1.0, 3);

      const { error } = await this.supabase
        .from('spaced_repetition_reviews')
        .insert({
          user_id: userId,
          problem_id: problem.problem_id,
          problem_title: problem.problem_title,
          problem_url: problem.problem_url,
          rating: problem.rating,
          tags: problem.tags,
          review_count: 0,
          ease_factor: 2.5, // SM-2 default
          interval_days: 3,
          next_review_at: nextReview,
          review_dates: [],
          review_outcomes: [],
          status: 'active',
          first_failed_at: new Date().toISOString(),
        });

      if (error) throw error;

      return { success: true, nextReviewAt: nextReview };
    } catch (error) {
      console.error('Error adding problem to spaced repetition:', error);
      return { success: false };
    }
  }

  /**
   * Record a review outcome and update schedule (SM-2 algorithm)
   */
  async recordReview(
    userId: string,
    problemId: string,
    outcome: ReviewOutcome
  ): Promise<{ success: boolean; nextReviewAt?: string; mastered?: boolean }> {
    try {
      // Get current review
      const { data: review, error: fetchError } = await this.supabase
        .from('spaced_repetition_reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('problem_id', problemId)
        .single();

      if (fetchError || !review) {
        return { success: false };
      }

      // SM-2 algorithm
      const quality = this.outcomeToQuality(outcome.outcome);
      const { easeFactor, intervalDays } = this.calculateSM2(
        review.ease_factor,
        review.interval_days,
        review.review_count,
        quality
      );

      const nextReview = this.calculateNextReview(intervalDays, 0);

      // Update review history
      const reviewDates = [...(review.review_dates || []), new Date().toISOString()];
      const reviewOutcomes = [...(review.review_outcomes || []), outcome.outcome];

      // Check if mastered (3 consecutive successes)
      const isMastered = this.checkMastered(reviewOutcomes);
      const newStatus = isMastered ? 'mastered' : 'active';

      const updateData: any = {
        review_count: review.review_count + 1,
        last_review_outcome: outcome.outcome,
        ease_factor: easeFactor,
        interval_days: intervalDays,
        next_review_at: nextReview,
        review_dates: reviewDates,
        review_outcomes: reviewOutcomes,
        status: newStatus,
        last_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isMastered) {
        updateData.mastered_at = new Date().toISOString();
      }

      const { error: updateError } = await this.supabase
        .from('spaced_repetition_reviews')
        .update(updateData)
        .eq('user_id', userId)
        .eq('problem_id', problemId);

      if (updateError) throw updateError;

      return {
        success: true,
        nextReviewAt: nextReview,
        mastered: isMastered,
      };
    } catch (error) {
      console.error('Error recording review:', error);
      return { success: false };
    }
  }

  /**
   * Get all due reviews for user
   */
  async getDueReviews(userId: string): Promise<DueReview[]> {
    try {
      const { data, error } = await this.supabase
        .from('spaced_repetition_reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .lte('next_review_at', new Date().toISOString())
        .order('next_review_at', { ascending: true });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.map(review => {
        const daysOverdue = Math.floor(
          (Date.now() - new Date(review.next_review_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        let urgency: 'critical' | 'high' | 'medium' | 'low' = 'low';
        if (daysOverdue > 7) urgency = 'critical';
        else if (daysOverdue > 3) urgency = 'high';
        else if (daysOverdue > 1) urgency = 'medium';

        return {
          problem: review,
          daysOverdue,
          urgency,
        };
      });
    } catch (error) {
      console.error('Error getting due reviews:', error);
      return [];
    }
  }

  /**
   * Get upcoming reviews (next 7 days)
   */
  async getUpcomingReviews(userId: string): Promise<SpacedRepetitionReview[]> {
    try {
      const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await this.supabase
        .from('spaced_repetition_reviews')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('next_review_at', new Date().toISOString())
        .lte('next_review_at', sevenDaysFromNow)
        .order('next_review_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting upcoming reviews:', error);
      return [];
    }
  }

  /**
   * Get review statistics
   */
  async getReviewStats(userId: string): Promise<{
    totalActive: number;
    dueToday: number;
    mastered: number;
    averageEaseFactor: number;
    averageInterval: number;
  }> {
    try {
      // Total active
      const { data: active, error: activeError } = await this.supabase
        .from('spaced_repetition_reviews')
        .select('ease_factor, interval_days')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (activeError) throw activeError;

      // Due today
      const { data: due, error: dueError } = await this.supabase
        .from('spaced_repetition_reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .lte('next_review_at', new Date().toISOString());

      if (dueError) throw dueError;

      // Mastered
      const { data: mastered, error: masteredError } = await this.supabase
        .from('spaced_repetition_reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'mastered');

      if (masteredError) throw masteredError;

      const avgEase = active && active.length > 0
        ? active.reduce((sum, r) => sum + r.ease_factor, 0) / active.length
        : 2.5;

      const avgInterval = active && active.length > 0
        ? active.reduce((sum, r) => sum + r.interval_days, 0) / active.length
        : 0;

      return {
        totalActive: active?.length || 0,
        dueToday: due?.length || 0,
        mastered: mastered?.length || 0,
        averageEaseFactor: avgEase,
        averageInterval: avgInterval,
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      return {
        totalActive: 0,
        dueToday: 0,
        mastered: 0,
        averageEaseFactor: 2.5,
        averageInterval: 0,
      };
    }
  }

  /**
   * Archive a review (user doesn't want to review anymore)
   */
  async archiveReview(userId: string, problemId: string): Promise<{ success: boolean }> {
    try {
      const { error } = await this.supabase
        .from('spaced_repetition_reviews')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('problem_id', problemId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error archiving review:', error);
      return { success: false };
    }
  }

  // ==================== PRIVATE HELPERS ====================

  /**
   * Convert outcome to SM-2 quality (0-5)
   */
  private outcomeToQuality(outcome: 'failed' | 'partial' | 'success'): number {
    switch (outcome) {
      case 'failed': return 0; // Complete blackout
      case 'partial': return 3; // Correct response with difficulty
      case 'success': return 5; // Perfect response
      default: return 3;
    }
  }

  /**
   * SM-2 algorithm implementation
   * Returns new ease factor and interval
   */
  private calculateSM2(
    oldEase: number,
    oldInterval: number,
    repetitionCount: number,
    quality: number
  ): { easeFactor: number; intervalDays: number } {
    // Update ease factor
    let newEase = oldEase + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Minimum ease factor is 1.3
    if (newEase < 1.3) newEase = 1.3;

    let newInterval: number;

    if (quality < 3) {
      // Failed - restart
      newInterval = 1;
    } else {
      // Success
      if (repetitionCount === 0) {
        newInterval = 1;
      } else if (repetitionCount === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(oldInterval * newEase);
      }
    }

    return {
      easeFactor: newEase,
      intervalDays: newInterval,
    };
  }

  /**
   * Calculate next review date
   */
  private calculateNextReview(intervalDays: number, additionalDays: number = 0): string {
    const days = intervalDays + additionalDays;
    const nextReview = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return nextReview.toISOString();
  }

  /**
   * Check if problem is mastered (3 consecutive successes)
   */
  private checkMastered(outcomes: string[]): boolean {
    if (outcomes.length < 3) return false;
    
    const lastThree = outcomes.slice(-3);
    return lastThree.every(o => o === 'success');
  }
}
