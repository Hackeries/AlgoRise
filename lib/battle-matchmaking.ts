// Battle matchmaking service for Code Battle Arena

import { createClient } from '@/lib/supabase/server';
import { RealTimeNotificationManager } from '@/lib/realtime-notifications';
import redis from '@/lib/redis';

export interface BattleQueueEntry {
  userId: string;
  rating: number;
  joinedAt: number; // Store as timestamp for easier serialization
  preferredFormat?: 'best_of_1' | 'best_of_3' | 'best_of_5';
  // AI-based matching preferences
  preferredDifficulty?: 'easy' | 'medium' | 'hard';
  preferredTimeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  preferredWeekday?: number; // 0-6 (Sunday-Saturday)
  lastPlayedWith?: string[]; // Users they've played with recently
  performanceHistory?: {
    timeOfDay: Record<string, number>; // performance by time of day
    weekday: Record<number, number>; // performance by day of week
    problemTypes: Record<string, number>; // performance by problem type
  };
}

export interface ActiveBattle {
  id: string;
  hostUserId: string;
  guestUserId: string;
  status: 'waiting' | 'in_progress' | 'completed';
  format: 'best_of_1' | 'best_of_3' | 'best_of_5';
}

// AI-based matchmaking algorithm
class AIBattleMatchmaker {
  // Calculate compatibility score between two players
  static calculateCompatibility(player1: BattleQueueEntry, player2: BattleQueueEntry): number {
    let score = 0;
    
    // Rating proximity (higher score for closer ratings)
    const ratingDiff = Math.abs(player1.rating - player2.rating);
    score += Math.max(0, 100 - ratingDiff / 10); // Max 100 points for exact rating match
    
    // Time preference compatibility
    if (player1.preferredTimeOfDay && player2.preferredTimeOfDay) {
      if (player1.preferredTimeOfDay === player2.preferredTimeOfDay) {
        score += 20;
      }
    }
    
    // Day preference compatibility
    if (player1.preferredWeekday !== undefined && player2.preferredWeekday !== undefined) {
      if (player1.preferredWeekday === player2.preferredWeekday) {
        score += 15;
      }
    }
    
    // Avoid matching players who recently played together
    if (player1.lastPlayedWith?.includes(player2.userId) || 
        player2.lastPlayedWith?.includes(player1.userId)) {
      score -= 50; // Significant penalty for recent opponents
    }
    
    // Performance history compatibility
    if (player1.performanceHistory && player2.performanceHistory) {
      // Similar performance patterns increase compatibility
      const timeOfDayCompatibility = this.calculateTimeOfDayCompatibility(
        player1.performanceHistory.timeOfDay,
        player2.performanceHistory.timeOfDay
      );
      score += timeOfDayCompatibility * 10;
      
      const weekdayCompatibility = this.calculateWeekdayCompatibility(
        player1.performanceHistory.weekday,
        player2.performanceHistory.weekday
      );
      score += weekdayCompatibility * 5;
    }
    
    return Math.max(0, score); // Ensure non-negative score
  }
  
  // Calculate time of day compatibility
  private static calculateTimeOfDayCompatibility(
    time1: Record<string, number>,
    time2: Record<string, number>
  ): number {
    const times = ['morning', 'afternoon', 'evening', 'night'];
    let similarity = 0;
    let total = 0;
    
    for (const time of times) {
      const perf1 = time1[time] || 0;
      const perf2 = time2[time] || 0;
      similarity += Math.min(perf1, perf2);
      total += Math.max(perf1, perf2);
    }
    
    return total > 0 ? similarity / total : 0;
  }
  
  // Calculate weekday compatibility
  private static calculateWeekdayCompatibility(
    day1: Record<number, number>,
    day2: Record<number, number>
  ): number {
    let similarity = 0;
    let total = 0;
    
    for (let i = 0; i < 7; i++) {
      const perf1 = day1[i] || 0;
      const perf2 = day2[i] || 0;
      similarity += Math.min(perf1, perf2);
      total += Math.max(perf1, perf2);
    }
    
    return total > 0 ? similarity / total : 0;
  }
  
  // Predict player performance based on historical data
  static predictPerformance(player: BattleQueueEntry, context: Partial<BattleQueueEntry>): number {
    let performance = 0.5; // Baseline 50% performance
    
    // Adjust based on time of day
    if (context.preferredTimeOfDay && player.performanceHistory?.timeOfDay) {
      const timePerformance = player.performanceHistory.timeOfDay[context.preferredTimeOfDay] || 0.5;
      performance = (performance + timePerformance) / 2;
    }
    
    // Adjust based on weekday
    if (context.preferredWeekday !== undefined && player.performanceHistory?.weekday) {
      const dayPerformance = player.performanceHistory.weekday[context.preferredWeekday] || 0.5;
      performance = (performance + dayPerformance) / 2;
    }
    
    return performance;
  }
}

// Redis-based queue for production use
class BattleMatchmakingService {
  private static instance: BattleMatchmakingService;
  private supabase: any;
  private redis: any;

  private constructor() {
    // Initialize Supabase client
    this.supabase = createClient();
    // Initialize Redis client
    this.redis = redis;
  }

  static getInstance(): BattleMatchmakingService {
    if (!BattleMatchmakingService.instance) {
      BattleMatchmakingService.instance = new BattleMatchmakingService();
    }
    return BattleMatchmakingService.instance;
  }

  // Add user to matchmaking queue with acceptance handshake
  async joinQueue(
    userId: string,
    rating: number,
    format: 'best_of_1' | 'best_of_3' | 'best_of_5' = 'best_of_3'
  ): Promise<{ success: boolean; message: string; battleId?: string }> {
    try {
      // Check if user is already in queue
      const existingEntry = await this.redis.hget('battle_queue', userId);
      if (existingEntry) {
        return { success: false, message: 'Already in queue' };
      }

      // Get user's matchmaking preferences and performance history
      const userPreferences = await this.getUserPreferences(userId);
      
      // Add user to queue with AI-enhanced data
      const queueEntry: BattleQueueEntry = {
        userId,
        rating,
        joinedAt: Date.now(),
        preferredFormat: format,
        ...userPreferences
      };

      await this.redis.hset('battle_queue', userId, JSON.stringify(queueEntry));

      console.log(`User ${userId} joined battle queue with rating ${rating}`);

      // Try to find a match using AI-based matching
      const matchResult = await this.findMatchAI(userId, queueEntry);
      if (matchResult.success && matchResult.battleId) {
        return matchResult;
      }

      // Notify user they're in queue
      const rtManager = RealTimeNotificationManager.getInstance();
      await rtManager.sendToUser(userId, {
        type: 'battle_queue_joined',
        message: 'Joined matchmaking queue. Waiting for opponent...',
        queuePosition: await this.getQueuePosition(userId)
      });

      return { success: true, message: 'Joined queue successfully' };
    } catch (error) {
      console.error('Error joining battle queue:', error);
      return { success: false, message: 'Failed to join queue' };
    }
  }

  // Get user's matchmaking preferences and performance history
  private async getUserPreferences(userId: string): Promise<Partial<BattleQueueEntry>> {
    try {
      // In a real implementation, this would fetch from a user_preferences table
      // For now, we'll return some default preferences
      
      // Get user's recent battle history for performance analysis
      const { data: battles, error } = await this.supabase
        .from('battles')
        .select(`
          created_at,
          battle_participants(user_id, rating_delta)
        `)
        .or(`host_user_id.eq.${userId},guest_user_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(20); // Last 20 battles

      if (error) {
        console.error('Error fetching user battle history:', error);
        return {};
      }

      // Analyze performance patterns
      const performanceHistory = {
        timeOfDay: {} as Record<string, number>,
        weekday: {} as Record<number, number>,
        problemTypes: {} as Record<string, number>
      };

      // Simple performance analysis (in a real implementation, this would be more sophisticated)
      battles.forEach((battle: any) => {
        const date = new Date(battle.created_at);
        const hour = date.getHours();
        const weekday = date.getDay();
        
        // Categorize by time of day
        let timeCategory = 'night';
        if (hour >= 6 && hour < 12) timeCategory = 'morning';
        else if (hour >= 12 && hour < 18) timeCategory = 'afternoon';
        else if (hour >= 18 && hour < 22) timeCategory = 'evening';
        
        performanceHistory.timeOfDay[timeCategory] = (performanceHistory.timeOfDay[timeCategory] || 0) + 1;
        performanceHistory.weekday[weekday] = (performanceHistory.weekday[weekday] || 0) + 1;
      });

      // Get recently played opponents
      const recentOpponents = battles
        .slice(0, 5) // Last 5 battles
        .flatMap((battle: any) => 
          battle.battle_participants
            .filter((p: any) => p.user_id !== userId)
            .map((p: any) => p.user_id)
        );

      return {
        preferredTimeOfDay: this.getCurrentTimeCategory(),
        preferredWeekday: new Date().getDay(),
        lastPlayedWith: recentOpponents,
        performanceHistory
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {};
    }
  }

  // Get current time category
  private getCurrentTimeCategory(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  // Remove user from matchmaking queue
  async leaveQueue(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.redis.hdel('battle_queue', userId);
      
      if (result) {
        const rtManager = RealTimeNotificationManager.getInstance();
        await rtManager.sendToUser(userId, {
          type: 'battle_queue_left',
          message: 'Left matchmaking queue'
        });
        
        return { success: true, message: 'Left queue successfully' };
      }
      return { success: false, message: 'Not in queue' };
    } catch (error) {
      console.error('Error leaving battle queue:', error);
      return { success: false, message: 'Failed to leave queue' };
    }
  }

  // Find a suitable opponent using AI-based matching
  private async findMatchAI(
    userId: string,
    userEntry: BattleQueueEntry
  ): Promise<{ success: boolean; message: string; battleId?: string }> {
    // Get all users in queue
    const queueData = await this.redis.hgetall('battle_queue');
    
    // Convert queue data to BattleQueueEntry objects
    const queueEntries: BattleQueueEntry[] = Object.values(queueData).map(entry => 
      JSON.parse(entry as string)
    );
    
    // Remove the current user from potential matches
    const potentialOpponents = queueEntries.filter(entry => entry.userId !== userId);
    
    if (potentialOpponents.length === 0) {
      return { success: false, message: 'No suitable opponents found' };
    }

    // Calculate compatibility scores for all potential opponents
    const scoredOpponents = potentialOpponents.map(opponent => ({
      opponent,
      score: AIBattleMatchmaker.calculateCompatibility(userEntry, opponent)
    }));
    
    // Sort by compatibility score (highest first)
    scoredOpponents.sort((a, b) => b.score - a.score);
    
    // Select the best match based on compatibility and rating proximity
    const bestMatch = scoredOpponents[0];
    
    // Ensure the match is within reasonable rating bounds (+200/-100)
    const ratingDiff = Math.abs(userEntry.rating - bestMatch.opponent.rating);
    if (ratingDiff > 300) {
      // If the best AI match is too far in rating, fall back to rating-based matching
      const ratingBasedMatches = potentialOpponents.filter(
        entry => 
          entry.rating >= userEntry.rating - 100 &&
          entry.rating <= userEntry.rating + 200
      );
      
      if (ratingBasedMatches.length === 0) {
        return { success: false, message: 'No suitable opponents found' };
      }
      
      // Select the closest rating match
      const closestMatch = ratingBasedMatches.reduce((best, current) => {
        const bestDiff = Math.abs(best.rating - userEntry.rating);
        const currentDiff = Math.abs(current.rating - userEntry.rating);
        return currentDiff < bestDiff ? current : best;
      });
      
      // Remove both players from queue
      await this.redis.hdel('battle_queue', userId, closestMatch.userId);

      // Create battle with acceptance handshake
      const battleResult = await this.createBattleWithHandshake(userId, closestMatch.userId);
      if (battleResult.success && battleResult.battleId) {
        return {
          success: true,
          message: 'Match found',
          battleId: battleResult.battleId
        };
      }
    } else {
      // Use the AI-selected match
      // Remove both players from queue
      await this.redis.hdel('battle_queue', userId, bestMatch.opponent.userId);

      // Create battle with acceptance handshake
      const battleResult = await this.createBattleWithHandshake(userId, bestMatch.opponent.userId);
      if (battleResult.success && battleResult.battleId) {
        return {
          success: true,
          message: 'Match found',
          battleId: battleResult.battleId
        };
      }
    }

    return { success: false, message: 'Failed to create battle' };
  }

  // Create a new battle between two players with acceptance handshake
  private async createBattleWithHandshake(
    hostUserId: string,
    guestUserId: string
  ): Promise<{ success: boolean; message: string; battleId?: string }> {
    try {
      // Get user ratings
      const { data: hostRatingData, error: hostRatingError } = await this.supabase
        .from('battle_ratings')
        .select('rating')
        .eq('user_id', hostUserId)
        .single();

      const { data: guestRatingData, error: guestRatingError } = await this.supabase
        .from('battle_ratings')
        .select('rating')
        .eq('user_id', guestUserId)
        .single();

      const hostRating = hostRatingData?.rating || 1200;
      const guestRating = guestRatingData?.rating || 1200;

      // Create battle record
      const { data: battle, error: battleError } = await this.supabase
        .from('battles')
        .insert({
          host_user_id: hostUserId,
          guest_user_id: guestUserId,
          status: 'waiting',
          format: 'best_of_3'
        })
        .select()
        .single();

      if (battleError) {
        console.error('Error creating battle:', battleError);
        return { success: false, message: 'Failed to create battle' };
      }

      // Create participant records
      const { error: participantError } = await this.supabase
        .from('battle_participants')
        .insert([
          {
            battle_id: battle.id,
            user_id: hostUserId,
            rating_before: hostRating,
            is_host: true
          },
          {
            battle_id: battle.id,
            user_id: guestUserId,
            rating_before: guestRating,
            is_host: false
          }
        ]);

      if (participantError) {
        console.error('Error creating battle participants:', participantError);
        return { success: false, message: 'Failed to create battle participants' };
      }

      // Store battle in Redis for quick access
      await this.redis.set(`battle:${battle.id}`, JSON.stringify({
        id: battle.id,
        hostUserId,
        guestUserId,
        status: 'waiting',
        format: 'best_of_3'
      }));

      // Send match invitation to both players with 15-second timeout
      const rtManager = RealTimeNotificationManager.getInstance();
      
      // Notify host
      await rtManager.sendToUser(hostUserId, {
        type: 'battle_matched',
        message: 'Found opponent! Waiting for guest to accept...',
        battleId: battle.id,
        opponentId: guestUserId
      });
      
      // Notify guest with acceptance request
      await rtManager.sendToUser(guestUserId, {
        type: 'battle_invite',
        message: 'You have been challenged to a code battle!',
        battleId: battle.id,
        hostId: hostUserId,
        timeout: 15 // seconds
      });

      // Set timeout for acceptance (15 seconds)
      setTimeout(async () => {
        // Check if battle is still waiting
        const { data: battleStatus, error } = await this.supabase
          .from('battles')
          .select('status')
          .eq('id', battle.id)
          .single();
        
        if (!error && battleStatus && battleStatus.status === 'waiting') {
          // Cancel battle due to timeout
          await this.supabase
            .from('battles')
            .update({ 
              status: 'cancelled',
              ended_at: new Date().toISOString()
            })
            .eq('id', battle.id);
          
          // Remove from Redis
          await this.redis.del(`battle:${battle.id}`);
          
          // Notify both players
          await rtManager.sendToUsers([hostUserId, guestUserId], {
            type: 'battle_cancelled',
            battleId: battle.id,
            message: 'Battle cancelled due to timeout'
          });
        }
      }, 15000); // 15 seconds timeout

      return { success: true, message: 'Battle created', battleId: battle.id };
    } catch (error) {
      console.error('Error creating battle:', error);
      return { success: false, message: 'Failed to create battle' };
    }
  }

  // Get user's position in queue
  private async getQueuePosition(userId: string): Promise<number> {
    const queueData = await this.redis.hgetall('battle_queue');
    
    // Convert queue data to BattleQueueEntry objects and sort by join time
    const queueEntries: BattleQueueEntry[] = Object.values(queueData)
      .map(entry => JSON.parse(entry as string))
      .sort((a, b) => a.joinedAt - b.joinedAt);
    
    const index = queueEntries.findIndex(entry => entry.userId === userId);
    return index === -1 ? -1 : index + 1;
  }

  // Get queue status
  async getQueueStatus(): Promise<{ 
    totalPlayers: number; 
    averageWaitTime: number; 
    formatDistribution: Record<string, number> 
  }> {
    const queueData = await this.redis.hgetall('battle_queue');
    
    // Convert queue data to BattleQueueEntry objects
    const queueEntries: BattleQueueEntry[] = Object.values(queueData)
      .map(entry => JSON.parse(entry as string));
    
    const totalPlayers = queueEntries.length;
    
    // Calculate average wait time (simplified)
    const now = Date.now();
    const totalWaitTime = queueEntries.reduce((sum, entry) => {
      return sum + (now - entry.joinedAt);
    }, 0);
    
    const averageWaitTime = totalPlayers > 0 ? totalWaitTime / totalPlayers : 0;
    
    // Calculate format distribution
    const formatDistribution = {
      best_of_1: queueEntries.filter(e => e.preferredFormat === 'best_of_1').length,
      best_of_3: queueEntries.filter(e => e.preferredFormat === 'best_of_3').length,
      best_of_5: queueEntries.filter(e => e.preferredFormat === 'best_of_5').length
    };

    return { totalPlayers, averageWaitTime, formatDistribution };
  }

  // Get user's battle rating
  async getUserRating(userId: string): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('battle_ratings')
        .select('rating')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no rating exists, create initial rating
        if (error.code === 'PGRST116') {
          const { data: newRating, error: insertError } = await this.supabase
            .from('battle_ratings')
            .insert({
              user_id: userId,
              rating: 1200
            })
            .select('rating')
            .single();

          if (insertError) {
            console.error('Error creating initial rating:', insertError);
            return 1200;
          }

          return newRating?.rating || 1200;
        }
        
        console.error('Error fetching user rating:', error);
        return 1200;
      }

      return data?.rating || 1200;
    } catch (error) {
      console.error('Error getting user rating:', error);
      return 1200;
    }
  }

  // Periodic cleanup of stale queue entries (call this periodically)
  async cleanupStaleQueueEntries(maxWaitTimeMinutes: number = 30): Promise<void> {
    const maxWaitTimeMs = maxWaitTimeMinutes * 60 * 1000;
    const now = Date.now();
    
    const queueData = await this.redis.hgetall('battle_queue');
    
    // Convert queue data to BattleQueueEntry objects
    const queueEntries: BattleQueueEntry[] = Object.entries(queueData).map(([userId, entry]) => ({
      userId,
      ...(JSON.parse(entry as string))
    }));
    
    const staleEntries = queueEntries.filter(
      entry => (now - entry.joinedAt) > maxWaitTimeMs
    );
    
    // Remove stale entries
    if (staleEntries.length > 0) {
      const staleUserIds = staleEntries.map(entry => entry.userId);
      await this.redis.hdel('battle_queue', ...staleUserIds);
    }
    
    // Notify stale users
    if (staleEntries.length > 0) {
      const rtManager = RealTimeNotificationManager.getInstance();
      for (const entry of staleEntries) {
        await rtManager.sendToUser(entry.userId, {
          type: 'battle_queue_timeout',
          message: 'You have been removed from the queue due to inactivity'
        });
      }
    }
    
    console.log(`Cleaned up ${staleEntries.length} stale queue entries`);
  }
}

// Set up periodic cleanup (every 5 minutes)
setInterval(() => {
  const matchmakingService = BattleMatchmakingService.getInstance();
  matchmakingService.cleanupStaleQueueEntries(30);
}, 5 * 60 * 1000);

export default BattleMatchmakingService;