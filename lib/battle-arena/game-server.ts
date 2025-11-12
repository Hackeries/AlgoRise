/**
 * Game Server - Manages match lifecycle, scoring, and real-time state
 */

import redis from '../redis';
import { createClient } from '@supabase/supabase-js';
import {
  BattleEventType,
  EventFactory,
  MatchState,
  PlayerState,
  TeamState,
  ProblemState,
  FinalScores,
  RatingChange
} from './websocket-events';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface GameRoom {
  matchId: string;
  mode: 'quick_1v1' | 'ranked_1v1' | '3v3_team' | 'private_room' | 'tournament';
  status: 'waiting' | 'countdown' | 'in_progress' | 'finished' | 'cancelled';
  players: Map<string, PlayerState>;
  teams?: Map<'team_a' | 'team_b', TeamState>;
  problems: Map<string, ProblemState>;
  startTime?: number;
  endTime?: number;
  duration: number; // seconds
  countdown?: number;
}

export class GameServer {
  private static instance: GameServer;
  private rooms: Map<string, GameRoom> = new Map();
  private countdownIntervals: Map<string, NodeJS.Timeout> = new Map();
  private matchTimers: Map<string, NodeJS.Timeout> = new Map();
  
  private constructor() {}
  
  static getInstance(): GameServer {
    if (!GameServer.instance) {
      GameServer.instance = new GameServer();
    }
    return GameServer.instance;
  }

  /**
   * Initialize a game room for a match
   */
  async initializeRoom(matchId: string): Promise<GameRoom> {
    // Fetch match data from database
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      throw new Error('Match not found');
    }

    // Fetch players
    const { data: matchPlayers, error: playersError } = await supabase
      .from('match_players')
      .select('*, profiles!inner(name)')
      .eq('match_id', matchId);

    if (playersError || !matchPlayers) {
      throw new Error('Failed to load match players');
    }

    // Fetch problems
    const problemIds = match.problem_ids as string[];
    const { data: problems } = await supabase
      .from('problems')
      .select('cf_id, name, difficulty, rating')
      .in('cf_id', problemIds);

    // Initialize room
    const players = new Map<string, PlayerState>();
    const teams = new Map<'team_a' | 'team_b', TeamState>();

    for (const mp of matchPlayers) {
      const playerState: PlayerState = {
        userId: mp.user_id,
        username: mp.profiles?.name || 'Unknown',
        rating: mp.rating_before || 1200,
        team: mp.team as 'team_a' | 'team_b' | undefined,
        score: mp.score || 0,
        fullSolves: mp.full_solves || 0,
        partialSolves: mp.partial_solves || 0,
        submissions: 0,
        isConnected: false
      };
      
      players.set(mp.user_id, playerState);

      // Initialize teams
      if (mp.team) {
        if (!teams.has(mp.team)) {
          teams.set(mp.team, {
            name: mp.team,
            score: 0,
            fullSolves: 0,
            members: []
          });
        }
        teams.get(mp.team)!.members.push(mp.user_id);
      }
    }

    const problemsMap = new Map<string, ProblemState>();
    for (const problem of problems || []) {
      problemsMap.set(problem.cf_id, {
        problemId: problem.cf_id,
        title: problem.name,
        difficulty: problem.difficulty,
        points: this.calculateProblemPoints(problem.difficulty),
        solvedBy: [],
        firstSolveBonus: 20,
        timeBonusEnabled: true
      });
    }

    const room: GameRoom = {
      matchId,
      mode: match.mode,
      status: match.status,
      players,
      teams: teams.size > 0 ? teams : undefined,
      problems: problemsMap,
      duration: match.duration_seconds,
      countdown: 5 // 5 second countdown
    };

    this.rooms.set(matchId, room);
    
    // Store room state in Redis for distributed access
    await this.saveRoomState(matchId, room);

    return room;
  }

  /**
   * Start countdown for a match
   */
  async startCountdown(matchId: string, broadcastFn: (event: any) => void): Promise<void> {
    const room = this.rooms.get(matchId);
    if (!room) throw new Error('Room not found');

    room.status = 'countdown';
    let countdown = room.countdown || 5;

    const interval = setInterval(async () => {
      if (countdown <= 0) {
        clearInterval(interval);
        this.countdownIntervals.delete(matchId);
        await this.startMatch(matchId, broadcastFn);
        return;
      }

      broadcastFn(
        EventFactory.createEvent(
          BattleEventType.MATCH_COUNTDOWN,
          matchId,
          { secondsRemaining: countdown }
        )
      );

      countdown--;
    }, 1000);

    this.countdownIntervals.set(matchId, interval);
  }

  /**
   * Start a match
   */
  async startMatch(matchId: string, broadcastFn: (event: any) => void): Promise<void> {
    const room = this.rooms.get(matchId);
    if (!room) throw new Error('Room not found');

    room.status = 'in_progress';
    room.startTime = Date.now();
    room.endTime = room.startTime + (room.duration * 1000);

    // Update database
    await supabase
      .from('matches')
      .update({
        status: 'in_progress',
        started_at: new Date(room.startTime).toISOString()
      })
      .eq('id', matchId);

    // Broadcast match start
    broadcastFn(
      EventFactory.createEvent(
        BattleEventType.MATCH_START,
        matchId,
        {
          startTime: room.startTime,
          duration: room.duration,
          problems: Array.from(room.problems.values())
        }
      )
    );

    // Set timer to end match
    const timeout = setTimeout(async () => {
      await this.endMatch(matchId, broadcastFn);
    }, room.duration * 1000);

    this.matchTimers.set(matchId, timeout);
    await this.saveRoomState(matchId, room);
  }

  /**
   * Handle code submission
   */
  async handleSubmission(
    matchId: string,
    userId: string,
    problemId: string,
    result: {
      status: string;
      testsPassed: number;
      testsTotal: number;
      executionTime?: number;
      memoryUsed?: number;
    },
    broadcastFn: (event: any) => void
  ): Promise<void> {
    const room = this.rooms.get(matchId);
    if (!room) throw new Error('Room not found');

    const player = room.players.get(userId);
    if (!player) throw new Error('Player not found');

    const problem = room.problems.get(problemId);
    if (!problem) throw new Error('Problem not found');

    // Calculate score
    const score = this.calculateScore(
      result.status,
      result.testsPassed,
      result.testsTotal,
      problem,
      room
    );

    // Update player state
    player.submissions++;
    player.lastSubmissionAt = Date.now();

    if (result.status === 'accepted') {
      player.fullSolves++;
      player.score += score;
      
      // Check if first solve
      const isFirstSolve = !problem.solvedBy.includes(userId) && problem.solvedBy.length === 0;
      problem.solvedBy.push(userId);

      // Update team score if applicable
      if (room.teams && player.team) {
        const team = room.teams.get(player.team)!;
        team.score += score;
        team.fullSolves++;
      }

      // Broadcast score update
      broadcastFn(
        EventFactory.createEvent(
          BattleEventType.SCORE_UPDATE,
          matchId,
          {
            userId,
            problemId,
            score,
            totalScore: player.score,
            bonus: isFirstSolve ? { firstSolve: problem.firstSolveBonus } : undefined
          }
        )
      );

      // Broadcast team score if applicable
      if (room.teams && player.team) {
        const team = room.teams.get(player.team)!;
        broadcastFn(
          EventFactory.createEvent(
            BattleEventType.TEAM_SCORE_UPDATE,
            matchId,
            {
              team: player.team,
              score: team.score,
              fullSolves: team.fullSolves,
              members: team.members.map(uid => {
                const p = room.players.get(uid)!;
                return {
                  userId: uid,
                  score: p.score,
                  fullSolves: p.fullSolves
                };
              })
            }
          )
        );
      }
    } else if (result.testsPassed > 0) {
      player.partialSolves++;
      player.score += score;
    }

    // Update database
    await supabase
      .from('match_players')
      .update({
        score: player.score,
        full_solves: player.fullSolves,
        partial_solves: player.partialSolves
      })
      .eq('match_id', matchId)
      .eq('user_id', userId);

    await this.saveRoomState(matchId, room);
  }

  /**
   * End a match
   */
  async endMatch(matchId: string, broadcastFn: (event: any) => void): Promise<void> {
    const room = this.rooms.get(matchId);
    if (!room) throw new Error('Room not found');

    room.status = 'finished';
    room.endTime = Date.now();

    // Clear timer if exists
    const timer = this.matchTimers.get(matchId);
    if (timer) {
      clearTimeout(timer);
      this.matchTimers.delete(matchId);
    }

    // Calculate final scores and determine winner
    const finalScores = this.calculateFinalScores(room);
    const winner = this.determineWinner(room);

    // Update ratings for ranked matches
    let ratingChanges: RatingChange[] = [];
    if (room.mode === 'ranked_1v1') {
      ratingChanges = await this.updateRatings(room, winner);
    }

    // Update database
    await supabase
      .from('matches')
      .update({
        status: 'finished',
        finished_at: new Date(room.endTime).toISOString()
      })
      .eq('id', matchId);

    // Update player results
    for (const [userId, player] of room.players) {
      const result = userId === winner || (Array.isArray(winner) && winner.includes(userId))
        ? 'win'
        : 'loss';

      await supabase
        .from('match_players')
        .update({ result })
        .eq('match_id', matchId)
        .eq('user_id', userId);
    }

    // Broadcast match end
    broadcastFn(
      EventFactory.createEvent(
        BattleEventType.MATCH_END,
        matchId,
        {
          endTime: room.endTime,
          finalScores,
          winner,
          ratingChanges: ratingChanges.length > 0 ? ratingChanges : undefined
        }
      )
    );

    await this.saveRoomState(matchId, room);
  }

  /**
   * Calculate score for a submission
   */
  private calculateScore(
    status: string,
    testsPassed: number,
    testsTotal: number,
    problem: ProblemState,
    room: GameRoom
  ): number {
    if (status === 'accepted') {
      let score = problem.points;
      
      // Add first solve bonus
      if (problem.solvedBy.length === 0) {
        score += problem.firstSolveBonus;
      }
      
      // Add time bonus if enabled
      if (problem.timeBonusEnabled && room.startTime) {
        const timeTaken = (Date.now() - room.startTime) / 1000; // seconds
        const timeRatio = 1 - (timeTaken / room.duration);
        const timeBonus = Math.floor(problem.points * 0.2 * timeRatio); // Up to 20% bonus
        score += Math.max(0, timeBonus);
      }
      
      return score;
    } else if (testsPassed > 0) {
      // Partial credit
      return Math.floor((problem.points * testsPassed) / testsTotal * 0.3); // 30% partial credit
    }
    
    return 0;
  }

  /**
   * Calculate problem points based on difficulty
   */
  private calculateProblemPoints(difficulty: string): number {
    const pointsMap: Record<string, number> = {
      'easy': 100,
      'medium': 200,
      'hard': 300
    };
    return pointsMap[difficulty] || 200;
  }

  /**
   * Calculate final scores
   */
  private calculateFinalScores(room: GameRoom): FinalScores {
    const players = Array.from(room.players.values())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.fullSolves !== a.fullSolves) return b.fullSolves - a.fullSolves;
        return a.submissions - b.submissions;
      })
      .map((player, index) => ({
        userId: player.userId,
        score: player.score,
        rank: index + 1,
        fullSolves: player.fullSolves,
        submissions: player.submissions,
        timeTaken: room.endTime && room.startTime ? (room.endTime - room.startTime) / 1000 : 0
      }));

    const teams = room.teams
      ? Array.from(room.teams.values()).map(team => ({
          team: team.name,
          score: team.score,
          fullSolves: team.fullSolves,
          members: team.members
        }))
      : undefined;

    return { players, teams };
  }

  /**
   * Determine winner
   */
  private determineWinner(room: GameRoom): string | string[] {
    if (room.teams) {
      // Team mode
      const teams = Array.from(room.teams.entries());
      teams.sort((a, b) => {
        if (b[1].score !== a[1].score) return b[1].score - a[1].score;
        return b[1].fullSolves - a[1].fullSolves;
      });
      return teams[0][1].members;
    } else {
      // 1v1 mode
      const players = Array.from(room.players.values());
      players.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.fullSolves !== a.fullSolves) return b.fullSolves - a.fullSolves;
        return a.submissions - b.submissions;
      });
      return players[0].userId;
    }
  }

  /**
   * Update ELO ratings
   */
  private async updateRatings(room: GameRoom, winner: string | string[]): Promise<RatingChange[]> {
    const changes: RatingChange[] = [];
    const players = Array.from(room.players.values());
    
    if (players.length !== 2) return changes; // Only for 1v1
    
    const [player1, player2] = players;
    const winner1 = winner === player1.userId;
    
    const K = 32; // K-factor
    const expectedScore1 = 1 / (1 + Math.pow(10, (player2.rating! - player1.rating!) / 400));
    const expectedScore2 = 1 - expectedScore1;
    
    const actualScore1 = winner1 ? 1 : 0;
    const actualScore2 = 1 - actualScore1;
    
    const newRating1 = Math.round(player1.rating! + K * (actualScore1 - expectedScore1));
    const newRating2 = Math.round(player2.rating! + K * (actualScore2 - expectedScore2));
    
    changes.push({
      userId: player1.userId,
      before: player1.rating!,
      after: newRating1,
      change: newRating1 - player1.rating!
    });
    
    changes.push({
      userId: player2.userId,
      before: player2.rating!,
      after: newRating2,
      change: newRating2 - player2.rating!
    });
    
    // Update database
    for (const change of changes) {
      await supabase
        .from('match_players')
        .update({
          rating_after: change.after,
          rating_change: change.change
        })
        .eq('match_id', room.matchId)
        .eq('user_id', change.userId);
      
      // Update player_ratings table
      await supabase.rpc('update_player_rating_1v1', {
        p_user_id: change.userId,
        p_new_rating: change.after,
        p_is_win: change.userId === winner
      });
      
      // Insert rating history
      await supabase
        .from('rating_history')
        .insert({
          user_id: change.userId,
          match_id: room.matchId,
          mode: '1v1',
          rating_before: change.before,
          rating_after: change.after,
          rating_change: change.change
        });
    }
    
    return changes;
  }

  /**
   * Save room state to Redis
   */
  private async saveRoomState(matchId: string, room: GameRoom): Promise<void> {
    const state = {
      ...room,
      players: Array.from(room.players.entries()),
      teams: room.teams ? Array.from(room.teams.entries()) : undefined,
      problems: Array.from(room.problems.entries())
    };
    
    await redis.setex(
      `room:${matchId}`,
      3600, // 1 hour TTL
      JSON.stringify(state)
    );
  }

  /**
   * Get room state
   */
  getRoom(matchId: string): GameRoom | undefined {
    return this.rooms.get(matchId);
  }

  /**
   * Remove room
   */
  async removeRoom(matchId: string): Promise<void> {
    this.rooms.delete(matchId);
    
    const timer = this.matchTimers.get(matchId);
    if (timer) {
      clearTimeout(timer);
      this.matchTimers.delete(matchId);
    }
    
    const countdown = this.countdownIntervals.get(matchId);
    if (countdown) {
      clearInterval(countdown);
      this.countdownIntervals.delete(matchId);
    }
    
    await redis.del(`room:${matchId}`);
  }
}

export default GameServer.getInstance();
