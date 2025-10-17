// Battle matchmaking service for Code Battle Arena

import { createClient } from '@/lib/supabase/server';
import { RealTimeNotificationManager } from '@/lib/realtime-notifications';

export interface BattleQueueEntry {
  userId: string;
  rating: number;
  joinedAt: Date;
  preferredFormat?: 'best_of_1' | 'best_of_3' | 'best_of_5';
}

export interface ActiveBattle {
  id: string;
  hostUserId: string;
  guestUserId: string;
  status: 'waiting' | 'in_progress' | 'completed';
  format: 'best_of_1' | 'best_of_3' | 'best_of_5';
}

// In-memory queue for demonstration - in production, this would be stored in Redis or database
class BattleMatchmakingService {
  private static instance: BattleMatchmakingService;
  private queue: BattleQueueEntry[] = [];
  private activeBattles: Map<string, ActiveBattle> = new Map();
  private supabase: any;

  private constructor() {
    // Initialize Supabase client
    this.supabase = createClient();
  }

  static getInstance(): BattleMatchmakingService {
    if (!BattleMatchmakingService.instance) {
      BattleMatchmakingService.instance = new BattleMatchmakingService();
    }
    return BattleMatchmakingService.instance;
  }

  // Add user to matchmaking queue
  async joinQueue(
    userId: string,
    rating: number,
    format: 'best_of_1' | 'best_of_3' | 'best_of_5' = 'best_of_3'
  ): Promise<{ success: boolean; message: string; battleId?: string }> {
    try {
      // Check if user is already in queue
      const existingEntry = this.queue.find(entry => entry.userId === userId);
      if (existingEntry) {
        return { success: false, message: 'Already in queue' };
      }

      // Add user to queue
      this.queue.push({
        userId,
        rating,
        joinedAt: new Date(),
        preferredFormat: format
      });

      console.log(`User ${userId} joined battle queue with rating ${rating}`);

      // Try to find a match
      const matchResult = await this.findMatch(userId, rating);
      if (matchResult.success && matchResult.battleId) {
        return matchResult;
      }

      // Notify user they're in queue
      const rtManager = RealTimeNotificationManager.getInstance();
      await rtManager.sendToUser(userId, {
        type: 'battle_queue_joined',
        message: 'Joined matchmaking queue. Waiting for opponent...',
        queuePosition: this.getQueuePosition(userId)
      });

      return { success: true, message: 'Joined queue successfully' };
    } catch (error) {
      console.error('Error joining battle queue:', error);
      return { success: false, message: 'Failed to join queue' };
    }
  }

  // Remove user from matchmaking queue
  async leaveQueue(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const index = this.queue.findIndex(entry => entry.userId === userId);
      if (index !== -1) {
        this.queue.splice(index, 1);
        
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

  // Find a suitable opponent for the user
  private async findMatch(
    userId: string,
    userRating: number
  ): Promise<{ success: boolean; message: string; battleId?: string }> {
    // Find opponent within rating range (±200 by default)
    const ratingRange = 200;
    const suitableOpponents = this.queue.filter(
      entry => 
        entry.userId !== userId && 
        Math.abs(entry.rating - userRating) <= ratingRange
    );

    if (suitableOpponents.length === 0) {
      return { success: false, message: 'No suitable opponents found' };
    }

    // Select the best match (closest rating)
    const bestMatch = suitableOpponents.reduce((best, current) => {
      const bestDiff = Math.abs(best.rating - userRating);
      const currentDiff = Math.abs(current.rating - userRating);
      return currentDiff < bestDiff ? current : best;
    });

    // Remove both players from queue
    this.queue = this.queue.filter(
      entry => entry.userId !== userId && entry.userId !== bestMatch.userId
    );

    // Create battle
    const battleResult = await this.createBattle(userId, bestMatch.userId);
    if (battleResult.success && battleResult.battleId) {
      // Notify both players
      const rtManager = RealTimeNotificationManager.getInstance();
      await rtManager.sendToUsers([userId, bestMatch.userId], {
        type: 'battle_matched',
        message: 'Found opponent! Battle starting soon...',
        battleId: battleResult.battleId
      });

      return {
        success: true,
        message: 'Match found',
        battleId: battleResult.battleId
      };
    }

    return { success: false, message: 'Failed to create battle' };
  }

  // Create a new battle between two players
  private async createBattle(
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

      // Add to active battles
      this.activeBattles.set(battle.id, {
        id: battle.id,
        hostUserId,
        guestUserId,
        status: 'waiting',
        format: 'best_of_3'
      });

      return { success: true, message: 'Battle created', battleId: battle.id };
    } catch (error) {
      console.error('Error creating battle:', error);
      return { success: false, message: 'Failed to create battle' };
    }
  }

  // Get user's position in queue
  private getQueuePosition(userId: string): number {
    const index = this.queue.findIndex(entry => entry.userId === userId);
    return index === -1 ? -1 : index + 1;
  }

  // Get queue status
  getQueueStatus(): { 
    totalPlayers: number; 
    averageWaitTime: number; 
    formatDistribution: Record<string, number> 
  } {
    const totalPlayers = this.queue.length;
    
    // Calculate average wait time (simplified)
    const now = new Date();
    const totalWaitTime = this.queue.reduce((sum, entry) => {
      return sum + (now.getTime() - entry.joinedAt.getTime());
    }, 0);
    
    const averageWaitTime = totalPlayers > 0 ? totalWaitTime / totalPlayers : 0;
    
    // Calculate format distribution
    const formatDistribution = {
      best_of_1: this.queue.filter(e => e.preferredFormat === 'best_of_1').length,
      best_of_3: this.queue.filter(e => e.preferredFormat === 'best_of_3').length,
      best_of_5: this.queue.filter(e => e.preferredFormat === 'best_of_5').length
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
}

export default BattleMatchmakingService;