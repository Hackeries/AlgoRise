/**
 * Matchmaking Service for Battle Arena
 * Handles finding opponents based on rating and mode
 */

import redis from '../redis';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface QueueEntry {
  userId: string;
  username: string;
  rating: number;
  mode: 'quick_1v1' | 'ranked_1v1' | '3v3_team';
  joinedAt: number;
  metadata?: {
    preferredDifficulty?: string;
    teamId?: string;
    teamMembers?: string[];
  };
}

export interface MatchmakingResult {
  matchId: string;
  players: QueueEntry[];
  teams?: {
    team_a: QueueEntry[];
    team_b: QueueEntry[];
  };
}

export class MatchmakingService {
  private static instance: MatchmakingService;
  private readonly RATING_RANGE_BASE = 100; // Initial rating range
  private readonly RATING_RANGE_EXPANSION = 50; // Expand range every 10 seconds
  private readonly MAX_WAIT_TIME = 120000; // 2 minutes max wait
  
  private constructor() {}
  
  static getInstance(): MatchmakingService {
    if (!MatchmakingService.instance) {
      MatchmakingService.instance = new MatchmakingService();
    }
    return MatchmakingService.instance;
  }

  /**
   * Add player to matchmaking queue
   */
  async joinQueue(entry: QueueEntry): Promise<void> {
    const queueKey = this.getQueueKey(entry.mode);
    
    // Store in Redis sorted set with rating as score for efficient range queries
    await redis.zadd(queueKey, entry.rating, JSON.stringify({
      ...entry,
      joinedAt: Date.now()
    }));
    
    // Also add to database queue table
    await supabase.from('matchmaking_queue').upsert({
      user_id: entry.userId,
      mode: entry.mode,
      rating: entry.rating,
      metadata: entry.metadata || {},
      joined_at: new Date().toISOString()
    });

    console.log(`Player ${entry.userId} joined ${entry.mode} queue with rating ${entry.rating}`);
  }

  /**
   * Remove player from matchmaking queue
   */
  async leaveQueue(userId: string, mode: string): Promise<void> {
    const queueKey = this.getQueueKey(mode);
    
    // Remove from Redis
    const members = await redis.zrange(queueKey, 0, -1);
    for (const member of members) {
      const entry: QueueEntry = JSON.parse(member);
      if (entry.userId === userId) {
        await redis.zrem(queueKey, member);
        break;
      }
    }
    
    // Remove from database
    await supabase
      .from('matchmaking_queue')
      .delete()
      .eq('user_id', userId)
      .eq('mode', mode);

    console.log(`Player ${userId} left ${mode} queue`);
  }

  /**
   * Find matches for waiting players
   * This should be called periodically (e.g., every 2-3 seconds)
   */
  async findMatches(mode: 'quick_1v1' | 'ranked_1v1' | '3v3_team'): Promise<MatchmakingResult[]> {
    if (mode === '3v3_team') {
      return this.find3v3Matches();
    } else {
      return this.find1v1Matches(mode);
    }
  }

  /**
   * Find 1v1 matches
   */
  private async find1v1Matches(mode: 'quick_1v1' | 'ranked_1v1'): Promise<MatchmakingResult[]> {
    const queueKey = this.getQueueKey(mode);
    const matches: MatchmakingResult[] = [];
    
    // Get all players in queue
    const members = await redis.zrange(queueKey, 0, -1, 'WITHSCORES');
    const queue: QueueEntry[] = [];
    
    for (let i = 0; i < members.length; i += 2) {
      const entry: QueueEntry = JSON.parse(members[i] as string);
      queue.push(entry);
    }
    
    // Sort by join time (FIFO within rating range)
    queue.sort((a, b) => a.joinedAt - b.joinedAt);
    
    const matched = new Set<string>();
    
    for (const player1 of queue) {
      if (matched.has(player1.userId)) continue;
      
      const waitTime = Date.now() - player1.joinedAt;
      const ratingRange = this.calculateRatingRange(waitTime);
      
      // Find opponent within rating range
      for (const player2 of queue) {
        if (matched.has(player2.userId)) continue;
        if (player1.userId === player2.userId) continue;
        
        const ratingDiff = Math.abs(player1.rating - player2.rating);
        
        if (ratingDiff <= ratingRange) {
          // Match found!
          const matchId = await this.createMatch(mode, [player1, player2]);
          
          matches.push({
            matchId,
            players: [player1, player2]
          });
          
          matched.add(player1.userId);
          matched.add(player2.userId);
          
          // Remove from queue
          await this.removeFromQueue([player1, player2], mode);
          
          break;
        }
      }
    }
    
    return matches;
  }

  /**
   * Find 3v3 team matches
   */
  private async find3v3Matches(): Promise<MatchmakingResult[]> {
    const queueKey = this.getQueueKey('3v3_team');
    const matches: MatchmakingResult[] = [];
    
    // Get all teams in queue
    const members = await redis.zrange(queueKey, 0, -1);
    const teams: QueueEntry[][] = [];
    const teamMap = new Map<string, QueueEntry[]>();
    
    for (const member of members) {
      const entry: QueueEntry = JSON.parse(member);
      const teamId = entry.metadata?.teamId;
      
      if (!teamId) continue;
      
      if (!teamMap.has(teamId)) {
        teamMap.set(teamId, []);
      }
      teamMap.get(teamId)!.push(entry);
    }
    
    // Filter complete teams (3 members)
    for (const [teamId, members] of teamMap) {
      if (members.length === 3) {
        teams.push(members);
      }
    }
    
    // Match teams with similar average rating
    const matched = new Set<string>();
    
    for (let i = 0; i < teams.length; i++) {
      const team1 = teams[i];
      const teamId1 = team1[0].metadata?.teamId;
      
      if (!teamId1 || matched.has(teamId1)) continue;
      
      const avgRating1 = team1.reduce((sum, p) => sum + p.rating, 0) / team1.length;
      const waitTime = Math.min(...team1.map(p => p.joinedAt));
      const ratingRange = this.calculateRatingRange(Date.now() - waitTime);
      
      for (let j = i + 1; j < teams.length; j++) {
        const team2 = teams[j];
        const teamId2 = team2[0].metadata?.teamId;
        
        if (!teamId2 || matched.has(teamId2)) continue;
        
        const avgRating2 = team2.reduce((sum, p) => sum + p.rating, 0) / team2.length;
        const ratingDiff = Math.abs(avgRating1 - avgRating2);
        
        if (ratingDiff <= ratingRange) {
          // Match found!
          const matchId = await this.createMatch('3v3_team', [...team1, ...team2], {
            team_a: team1,
            team_b: team2
          });
          
          matches.push({
            matchId,
            players: [...team1, ...team2],
            teams: {
              team_a: team1,
              team_b: team2
            }
          });
          
          matched.add(teamId1);
          matched.add(teamId2);
          
          // Remove from queue
          await this.removeFromQueue([...team1, ...team2], '3v3_team');
          
          break;
        }
      }
    }
    
    return matches;
  }

  /**
   * Calculate rating range based on wait time
   */
  private calculateRatingRange(waitTime: number): number {
    const expansions = Math.floor(waitTime / 10000); // Every 10 seconds
    return this.RATING_RANGE_BASE + (expansions * this.RATING_RANGE_EXPANSION);
  }

  /**
   * Create a new match in database
   */
  private async createMatch(
    mode: string,
    players: QueueEntry[],
    teams?: { team_a: QueueEntry[]; team_b: QueueEntry[] }
  ): Promise<string> {
    // Select random problem(s) based on mode
    const problemIds = await this.selectProblems(mode, players);
    
    // Create match
    const { data: match, error } = await supabase
      .from('matches')
      .insert({
        mode,
        status: 'waiting',
        problem_ids: problemIds,
        duration_seconds: mode === 'quick_1v1' ? 900 : 1800, // 15 or 30 minutes
        metadata: {
          teams: teams ? {
            team_a: teams.team_a.map(p => p.userId),
            team_b: teams.team_b.map(p => p.userId)
          } : null
        }
      })
      .select()
      .single();

    if (error || !match) {
      throw new Error('Failed to create match');
    }

    // Add players to match
    const playerInserts = players.map(player => ({
      match_id: match.id,
      user_id: player.userId,
      team: teams
        ? (teams.team_a.some(p => p.userId === player.userId) ? 'team_a' : 'team_b')
        : null,
      rating_before: player.rating
    }));

    await supabase.from('match_players').insert(playerInserts);

    console.log(`Created match ${match.id} for mode ${mode} with ${players.length} players`);

    return match.id;
  }

  /**
   * Select problems for the match
   */
  private async selectProblems(mode: string, players: QueueEntry[]): Promise<string[]> {
    // For now, select 1 problem for 1v1, 3 problems for 3v3
    // In production, this would use a more sophisticated algorithm
    const count = mode === '3v3_team' ? 3 : 1;
    
    // Calculate average rating to select appropriate difficulty
    const avgRating = players.reduce((sum, p) => sum + p.rating, 0) / players.length;
    let difficulty = 'medium';
    
    if (avgRating < 1000) difficulty = 'easy';
    else if (avgRating > 1400) difficulty = 'hard';
    
    // Query problems from database
    const { data: problems } = await supabase
      .from('problems')
      .select('cf_id')
      .eq('difficulty', difficulty)
      .limit(count);
    
    if (!problems || problems.length === 0) {
      // Fallback to any problems
      const { data: fallback } = await supabase
        .from('problems')
        .select('cf_id')
        .limit(count);
      
      return fallback?.map(p => p.cf_id) || ['1A']; // Ultimate fallback
    }
    
    return problems.map(p => p.cf_id);
  }

  /**
   * Remove players from queue
   */
  private async removeFromQueue(players: QueueEntry[], mode: string): Promise<void> {
    const queueKey = this.getQueueKey(mode);
    
    // Remove from Redis
    const members = await redis.zrange(queueKey, 0, -1);
    for (const member of members) {
      const entry: QueueEntry = JSON.parse(member);
      if (players.some(p => p.userId === entry.userId)) {
        await redis.zrem(queueKey, member);
      }
    }
    
    // Remove from database
    const userIds = players.map(p => p.userId);
    await supabase
      .from('matchmaking_queue')
      .delete()
      .in('user_id', userIds)
      .eq('mode', mode);
  }

  /**
   * Get queue key for Redis
   */
  private getQueueKey(mode: string): string {
    return `matchmaking:${mode}`;
  }

  /**
   * Get queue status
   */
  async getQueueStatus(mode: string): Promise<{
    playersInQueue: number;
    averageWaitTime: number;
  }> {
    const queueKey = this.getQueueKey(mode);
    const members = await redis.zrange(queueKey, 0, -1);
    
    if (members.length === 0) {
      return { playersInQueue: 0, averageWaitTime: 0 };
    }
    
    const entries: QueueEntry[] = members.map(m => JSON.parse(m));
    const now = Date.now();
    const totalWaitTime = entries.reduce((sum, e) => sum + (now - e.joinedAt), 0);
    
    return {
      playersInQueue: entries.length,
      averageWaitTime: totalWaitTime / entries.length
    };
  }
}

export default MatchmakingService.getInstance();
