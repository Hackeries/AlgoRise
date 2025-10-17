// Battle service for Code Battle Arena

import { createClient } from '@/lib/supabase/server';
import { RealTimeNotificationManager } from '@/lib/realtime-notifications';
import { simulateRatings } from '@/lib/contest-sim';

export interface BattleRound {
  id: string;
  battleId: string;
  roundNumber: number;
  problemId: string;
  title: string;
  rating: number;
  winnerUserId?: string;
  startedAt?: Date;
  endedAt?: Date;
}

export interface BattleSubmission {
  id: string;
  battleId: string;
  roundId: string;
  userId: string;
  problemId: string;
  status: 'pending' | 'solved' | 'failed' | 'compiling' | 'running';
  language: string;
  codeText?: string;
  submittedAt: Date;
  executionTimeMs?: number;
  memoryKb?: number;
}

export class BattleService {
  private supabase: any;
  private rtManager: RealTimeNotificationManager;

  constructor() {
    this.supabase = createClient();
    this.rtManager = RealTimeNotificationManager.getInstance();
  }

  // Start a battle
  async startBattle(battleId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Update battle status to in_progress
      const { error: updateError } = await this.supabase
        .from('battles')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', battleId);

      if (updateError) {
        console.error('Error starting battle:', updateError);
        return { success: false, message: 'Failed to start battle' };
      }

      // Create first round
      const roundResult = await this.createRound(battleId, 1);
      if (!roundResult.success) {
        return { success: false, message: 'Failed to create first round' };
      }

      // Notify participants
      const { data: participants, error: participantsError } = await this.supabase
        .from('battle_participants')
        .select('user_id')
        .eq('battle_id', battleId);

      if (!participantsError && participants) {
        const userIds = participants.map((p: any) => p.user_id);
        await this.rtManager.sendToUsers(userIds, {
          type: 'battle_started',
          battleId,
          message: 'Battle started! First round beginning now.'
        });
      }

      return { success: true, message: 'Battle started successfully' };
    } catch (error) {
      console.error('Error starting battle:', error);
      return { success: false, message: 'Failed to start battle' };
    }
  }

  // Create a battle round
  private async createRound(
    battleId: string,
    roundNumber: number
  ): Promise<{ success: boolean; message: string; roundId?: string }> {
    try {
      // Get a random problem (in a real implementation, this would select an appropriate problem)
      // For now, we'll use a placeholder
      const problem = {
        id: `PROB_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        title: `Problem ${roundNumber}`,
        rating: 1200 + (roundNumber - 1) * 200,
        contestId: 1000 + roundNumber,
        index: String.fromCharCode(64 + roundNumber) // A, B, C, etc.
      };

      // Create round record
      const { data: round, error: roundError } = await this.supabase
        .from('battle_rounds')
        .insert({
          battle_id: battleId,
          round_number: roundNumber,
          problem_id: problem.id,
          title: problem.title,
          rating: problem.rating,
          contest_id_cf: problem.contestId,
          index_cf: problem.index,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (roundError) {
        console.error('Error creating round:', roundError);
        return { success: false, message: 'Failed to create round' };
      }

      // Notify participants about new round
      const { data: participants, error: participantsError } = await this.supabase
        .from('battle_participants')
        .select('user_id')
        .eq('battle_id', battleId);

      if (!participantsError && participants) {
        const userIds = participants.map((p: any) => p.user_id);
        await this.rtManager.sendToUsers(userIds, {
          type: 'battle_round_started',
          battleId,
          roundNumber,
          roundId: round.id,
          problem: {
            id: problem.id,
            title: problem.title,
            rating: problem.rating
          },
          message: `Round ${roundNumber} started with problem: ${problem.title}`
        });
      }

      return { success: true, message: 'Round created', roundId: round.id };
    } catch (error) {
      console.error('Error creating round:', error);
      return { success: false, message: 'Failed to create round' };
    }
  }

  // Submit solution for a battle round
  async submitSolution(
    battleId: string,
    roundId: string,
    userId: string,
    codeText: string,
    language: string = 'cpp'
  ): Promise<{ success: boolean; message: string; submissionId?: string }> {
    try {
      // Create submission record
      const { data: submission, error: submissionError } = await this.supabase
        .from('battle_submissions')
        .insert({
          battle_id: battleId,
          round_id: roundId,
          user_id: userId,
          problem_id: '', // Will be filled after fetching round details
          status: 'pending',
          language,
          code_text: codeText,
          submitted_at: new Date().toISOString()
        })
        .select()
        .single();

      if (submissionError) {
        console.error('Error creating submission:', submissionError);
        return { success: false, message: 'Failed to submit solution' };
      }

      // Get round details to update problem_id
      const { data: round, error: roundError } = await this.supabase
        .from('battle_rounds')
        .select('problem_id')
        .eq('id', roundId)
        .single();

      if (!roundError && round) {
        await this.supabase
          .from('battle_submissions')
          .update({ problem_id: round.problem_id })
          .eq('id', submission.id);
      }

      // Simulate code execution (in a real implementation, this would connect to a judge system)
      setTimeout(async () => {
        await this.processSubmission(submission.id);
      }, 2000);

      // Notify user that submission is being processed
      await this.rtManager.sendToUser(userId, {
        type: 'battle_submission_received',
        battleId,
        roundId,
        submissionId: submission.id,
        message: 'Solution submitted. Judging in progress...'
      });

      return { success: true, message: 'Solution submitted', submissionId: submission.id };
    } catch (error) {
      console.error('Error submitting solution:', error);
      return { success: false, message: 'Failed to submit solution' };
    }
  }

  // Process a submission (simulate judging)
  private async processSubmission(submissionId: string): Promise<void> {
    try {
      // Get submission details
      const { data: submission, error: submissionError } = await this.supabase
        .from('battle_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (submissionError || !submission) {
        console.error('Error fetching submission for processing:', submissionError);
        return;
      }

      // Simulate judging - randomly determine if solution is correct
      const isCorrect = Math.random() > 0.3; // 70% chance of correct solution
      const status = isCorrect ? 'solved' : 'failed';
      const executionTime = Math.floor(Math.random() * 1000) + 50; // 50-1050ms
      const memory = Math.floor(Math.random() * 10000) + 1000; // 1000-11000KB

      // Update submission with results
      const { error: updateError } = await this.supabase
        .from('battle_submissions')
        .update({
          status,
          execution_time_ms: executionTime,
          memory_kb: memory
        })
        .eq('id', submissionId);

      if (updateError) {
        console.error('Error updating submission:', updateError);
        return;
      }

      // Notify user of results
      await this.rtManager.sendToUser(submission.user_id, {
        type: 'battle_submission_judged',
        submissionId,
        battleId: submission.battle_id,
        roundId: submission.round_id,
        status,
        executionTime,
        memory,
        message: isCorrect 
          ? 'Solution accepted! Well done.' 
          : 'Solution failed. Try again.'
      });

      // If solution is correct, check if round is complete
      if (isCorrect) {
        await this.checkRoundCompletion(submission.battle_id, submission.round_id);
      }
    } catch (error) {
      console.error('Error processing submission:', error);
    }
  }

  // Check if a round is complete (both players have submitted or one has solved)
  private async checkRoundCompletion(battleId: string, roundId: string): Promise<void> {
    try {
      // Get round submissions
      const { data: submissions, error: submissionsError } = await this.supabase
        .from('battle_submissions')
        .select('*')
        .eq('round_id', roundId);

      if (submissionsError) {
        console.error('Error fetching round submissions:', submissionsError);
        return;
      }

      // Check if any submission is solved
      const solvedSubmission = submissions.find((s: any) => s.status === 'solved');
      if (solvedSubmission) {
        // End round with winner
        await this.endRound(roundId, solvedSubmission.user_id);
        return;
      }

      // Check if both players have submitted
      const { data: participants, error: participantsError } = await this.supabase
        .from('battle_participants')
        .select('user_id')
        .eq('battle_id', battleId);

      if (participantsError || !participants) {
        console.error('Error fetching battle participants:', participantsError);
        return;
      }

      const participantIds = participants.map((p: any) => p.user_id);
      const allSubmitted = participantIds.every((userId: string) => 
        submissions.some((s: any) => s.user_id === userId)
      );

      if (allSubmitted) {
        // Both players submitted but neither solved - check for fastest submission
        const firstSubmission = submissions.reduce((first: any, current: any) => {
          return new Date(current.submitted_at) < new Date(first.submitted_at) ? current : first;
        });

        // Award round to the first submission (even if both failed)
        await this.endRound(roundId, firstSubmission.user_id);
      }
    } catch (error) {
      console.error('Error checking round completion:', error);
    }
  }

  // End a round and determine winner
  private async endRound(roundId: string, winnerUserId: string): Promise<void> {
    try {
      // Update round with winner
      const { error: roundError } = await this.supabase
        .from('battle_rounds')
        .update({
          winner_user_id: winnerUserId,
          ended_at: new Date().toISOString()
        })
        .eq('id', roundId);

      if (roundError) {
        console.error('Error ending round:', roundError);
        return;
      }

      // Get round details
      const { data: round, error: roundDetailsError } = await this.supabase
        .from('battle_rounds')
        .select('battle_id, round_number')
        .eq('id', roundId)
        .single();

      if (roundDetailsError || !round) {
        console.error('Error fetching round details:', roundDetailsError);
        return;
      }

      // Notify participants
      const { data: participants, error: participantsError } = await this.supabase
        .from('battle_participants')
        .select('user_id')
        .eq('battle_id', round.battle_id);

      if (!participantsError && participants) {
        const userIds = participants.map((p: any) => p.user_id);
        await this.rtManager.sendToUsers(userIds, {
          type: 'battle_round_ended',
          battleId: round.battle_id,
          roundNumber: round.round_number,
          roundId,
          winnerUserId,
          message: `Round ${round.round_number} completed. Winner: ${winnerUserId}`
        });
      }

      // Check if battle is complete
      await this.checkBattleCompletion(round.battle_id);
    } catch (error) {
      console.error('Error ending round:', error);
    }
  }

  // Check if battle is complete
  private async checkBattleCompletion(battleId: string): Promise<void> {
    try {
      // Get battle details
      const { data: battle, error: battleError } = await this.supabase
        .from('battles')
        .select('format')
        .eq('id', battleId)
        .single();

      if (battleError || !battle) {
        console.error('Error fetching battle details:', battleError);
        return;
      }

      // Get round winners
      const { data: rounds, error: roundsError } = await this.supabase
        .from('battle_rounds')
        .select('winner_user_id, round_number')
        .eq('battle_id', battleId)
        .not('winner_user_id', 'is', null)
        .order('round_number', { ascending: true });

      if (roundsError) {
        console.error('Error fetching battle rounds:', roundsError);
        return;
      }

      // Determine wins needed to win battle
      let winsNeeded = 2; // default for best_of_3
      if (battle.format === 'best_of_1') winsNeeded = 1;
      if (battle.format === 'best_of_5') winsNeeded = 3;

      // Count wins for each player
      const winCounts: Record<string, number> = {};
      rounds.forEach((round: any) => {
        winCounts[round.winner_user_id] = (winCounts[round.winner_user_id] || 0) + 1;
      });

      // Check if any player has enough wins
      let battleWinner: string | null = null;
      for (const [userId, wins] of Object.entries(winCounts)) {
        if (wins >= winsNeeded) {
          battleWinner = userId;
          break;
        }
      }

      // If we have a winner, end the battle
      if (battleWinner) {
        await this.endBattle(battleId, battleWinner);
      } else {
        // Create next round if battle isn't over
        const nextRoundNumber = rounds.length + 1;
        await this.createRound(battleId, nextRoundNumber);
      }
    } catch (error) {
      console.error('Error checking battle completion:', error);
    }
  }

  // End a battle and update ratings
  private async endBattle(battleId: string, winnerUserId: string): Promise<void> {
    try {
      // Update battle status
      const { error: battleError } = await this.supabase
        .from('battles')
        .update({
          status: 'completed',
          winner_user_id: winnerUserId,
          ended_at: new Date().toISOString()
        })
        .eq('id', battleId);

      if (battleError) {
        console.error('Error ending battle:', battleError);
        return;
      }

      // Get participants and their ratings
      const { data: participants, error: participantsError } = await this.supabase
        .from('battle_participants')
        .select('user_id, rating_before')
        .eq('battle_id', battleId);

      if (participantsError || !participants) {
        console.error('Error fetching battle participants:', participantsError);
        return;
      }

      // Calculate rating changes using ELO system
      const ratings = participants.map((p: any) => ({
        user_id: p.user_id,
        rating: p.rating_before
      }));

      // Create rank rows (winner gets rank 1, others get rank 2)
      const ranks = participants.map((p: any) => ({
        user_id: p.user_id,
        score: p.user_id === winnerUserId ? 1 : 0,
        penalty_s: 0
      }));

      // Sort ranks by score (descending)
      ranks.sort((a: any, b: any) => b.score - a.score);

      // Calculate rating deltas
      const deltas = simulateRatings({ ranks, ratings, K: 32 });

      // Update participant records with new ratings
      for (const participant of participants) {
        const delta = deltas.find(d => d.user_id === participant.user_id)?.delta || 0;
        const newRating = participant.rating_before + delta;

        await this.supabase
          .from('battle_participants')
          .update({
            rating_after: newRating,
            rating_delta: delta
          })
          .eq('battle_id', battleId)
          .eq('user_id', participant.user_id);

        // Update or create user's overall rating
        const { data: existingRating, error: ratingError } = await this.supabase
          .from('battle_ratings')
          .select('battles_count, wins, losses')
          .eq('user_id', participant.user_id)
          .single();

        if (ratingError && ratingError.code !== 'PGRST116') {
          console.error('Error fetching user rating:', ratingError);
          continue;
        }

        const isWinner = participant.user_id === winnerUserId;
        const battlesCount = (existingRating?.battles_count || 0) + 1;
        const wins = (existingRating?.wins || 0) + (isWinner ? 1 : 0);
        const losses = (existingRating?.losses || 0) + (isWinner ? 0 : 1);

        if (existingRating) {
          // Update existing rating
          await this.supabase
            .from('battle_ratings')
            .update({
              rating: newRating,
              battles_count: battlesCount,
              wins,
              losses,
              last_updated: new Date().toISOString()
            })
            .eq('user_id', participant.user_id);
        } else {
          // Create new rating record
          await this.supabase
            .from('battle_ratings')
            .insert({
              user_id: participant.user_id,
              rating: newRating,
              battles_count: battlesCount,
              wins,
              losses,
              last_updated: new Date().toISOString()
            });
        }
      }

      // Notify participants
      const userIds = participants.map((p: any) => p.user_id);
      await this.rtManager.sendToUsers(userIds, {
        type: 'battle_ended',
        battleId,
        winnerUserId,
        message: `Battle completed! Winner: ${winnerUserId}`,
        ratings: deltas
      });
    } catch (error) {
      console.error('Error ending battle:', error);
    }
  }

  // Get battle details
  async getBattle(battleId: string): Promise<any> {
    try {
      const { data: battle, error: battleError } = await this.supabase
        .from('battles')
        .select(`
          *,
          battle_participants(*),
          battle_rounds(*),
          battle_submissions(*)
        `)
        .eq('id', battleId)
        .single();

      if (battleError) {
        console.error('Error fetching battle:', battleError);
        return null;
      }

      return battle;
    } catch (error) {
      console.error('Error getting battle:', error);
      return null;
    }
  }
}

export default BattleService;