/**
 * ELO Rating System for Battle Arena
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface RatingUpdate {
  userId: string;
  oldRating: number;
  newRating: number;
  change: number;
  volatility: number;
}

export class ELORatingSystem {
  private static instance: ELORatingSystem;
  
  // K-factor determines how much ratings change per match
  private readonly BASE_K = 32;
  private readonly HIGH_VOLATILITY_K = 40;
  private readonly LOW_VOLATILITY_K = 24;
  
  // Rating thresholds
  private readonly PROVISIONAL_MATCHES = 20; // Consider player provisional until this many matches
  
  private constructor() {}
  
  static getInstance(): ELORatingSystem {
    if (!ELORatingSystem.instance) {
      ELORatingSystem.instance = new ELORatingSystem();
    }
    return ELORatingSystem.instance;
  }

  /**
   * Calculate new ratings after a 1v1 match
   */
  async calculate1v1Rating(
    player1Id: string,
    player2Id: string,
    winner: string
  ): Promise<{ player1: RatingUpdate; player2: RatingUpdate }> {
    // Get current ratings
    const [rating1, rating2] = await Promise.all([
      this.getPlayerRating(player1Id, '1v1'),
      this.getPlayerRating(player2Id, '1v1')
    ]);

    // Calculate expected scores
    const expected1 = this.calculateExpectedScore(rating1.rating, rating2.rating);
    const expected2 = 1 - expected1;

    // Actual scores
    const actual1 = winner === player1Id ? 1 : 0;
    const actual2 = 1 - actual1;

    // Determine K-factors based on volatility
    const k1 = this.calculateKFactor(rating1.matchesPlayed, rating1.volatility);
    const k2 = this.calculateKFactor(rating2.matchesPlayed, rating2.volatility);

    // Calculate new ratings
    const newRating1 = Math.round(rating1.rating + k1 * (actual1 - expected1));
    const newRating2 = Math.round(rating2.rating + k2 * (actual2 - expected2));

    // Update volatility based on surprise factor
    const surprise1 = Math.abs(actual1 - expected1);
    const surprise2 = Math.abs(actual2 - expected2);
    
    const newVolatility1 = this.updateVolatility(rating1.volatility, surprise1);
    const newVolatility2 = this.updateVolatility(rating2.volatility, surprise2);

    return {
      player1: {
        userId: player1Id,
        oldRating: rating1.rating,
        newRating: newRating1,
        change: newRating1 - rating1.rating,
        volatility: newVolatility1
      },
      player2: {
        userId: player2Id,
        oldRating: rating2.rating,
        newRating: newRating2,
        change: newRating2 - rating2.rating,
        volatility: newVolatility2
      }
    };
  }

  /**
   * Calculate new ratings for 3v3 team match
   */
  async calculate3v3Rating(
    teamAIds: string[],
    teamBIds: string[],
    winningTeam: 'team_a' | 'team_b'
  ): Promise<RatingUpdate[]> {
    // Get all player ratings
    const teamARatings = await Promise.all(
      teamAIds.map(id => this.getPlayerRating(id, '3v3'))
    );
    const teamBRatings = await Promise.all(
      teamBIds.map(id => this.getPlayerRating(id, '3v3'))
    );

    // Calculate average team ratings
    const avgRatingA = teamARatings.reduce((sum, r) => sum + r.rating, 0) / teamARatings.length;
    const avgRatingB = teamBRatings.reduce((sum, r) => sum + r.rating, 0) / teamBRatings.length;

    // Calculate expected scores
    const expectedA = this.calculateExpectedScore(avgRatingA, avgRatingB);
    const expectedB = 1 - expectedA;

    // Actual scores
    const actualA = winningTeam === 'team_a' ? 1 : 0;
    const actualB = 1 - actualA;

    const updates: RatingUpdate[] = [];

    // Update team A
    for (let i = 0; i < teamAIds.length; i++) {
      const rating = teamARatings[i];
      const k = this.calculateKFactor(rating.matchesPlayed, rating.volatility);
      const newRating = Math.round(rating.rating + k * (actualA - expectedA));
      const surprise = Math.abs(actualA - expectedA);
      const newVolatility = this.updateVolatility(rating.volatility, surprise);

      updates.push({
        userId: teamAIds[i],
        oldRating: rating.rating,
        newRating,
        change: newRating - rating.rating,
        volatility: newVolatility
      });
    }

    // Update team B
    for (let i = 0; i < teamBIds.length; i++) {
      const rating = teamBRatings[i];
      const k = this.calculateKFactor(rating.matchesPlayed, rating.volatility);
      const newRating = Math.round(rating.rating + k * (actualB - expectedB));
      const surprise = Math.abs(actualB - expectedB);
      const newVolatility = this.updateVolatility(rating.volatility, surprise);

      updates.push({
        userId: teamBIds[i],
        oldRating: rating.rating,
        newRating,
        change: newRating - rating.rating,
        volatility: newVolatility
      });
    }

    return updates;
  }

  /**
   * Calculate expected score using ELO formula
   */
  private calculateExpectedScore(rating1: number, rating2: number): number {
    return 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  }

  /**
   * Calculate K-factor based on matches played and volatility
   */
  private calculateKFactor(matchesPlayed: number, volatility: number): number {
    // Higher K for provisional players
    if (matchesPlayed < this.PROVISIONAL_MATCHES) {
      return this.HIGH_VOLATILITY_K;
    }
    
    // Adjust based on volatility
    if (volatility > 35) {
      return this.HIGH_VOLATILITY_K;
    } else if (volatility < 25) {
      return this.LOW_VOLATILITY_K;
    }
    
    return this.BASE_K;
  }

  /**
   * Update volatility based on match surprise
   */
  private updateVolatility(currentVolatility: number, surprise: number): number {
    // Increase volatility if result was surprising, decrease if expected
    const adjustment = surprise > 0.5 ? 2 : -1;
    const newVolatility = currentVolatility + adjustment;
    
    // Clamp between 16 and 40
    return Math.max(16, Math.min(40, newVolatility));
  }

  /**
   * Get player rating from database
   */
  private async getPlayerRating(
    userId: string,
    mode: '1v1' | '3v3'
  ): Promise<{ rating: number; matchesPlayed: number; volatility: number }> {
    const { data, error } = await supabase
      .from('player_ratings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Create initial rating
      await supabase.from('player_ratings').insert({
        user_id: userId,
        rating_1v1: 1200,
        rating_3v3: 1200,
        volatility: 32
      });

      return {
        rating: 1200,
        matchesPlayed: 0,
        volatility: 32
      };
    }

    const rating = mode === '1v1' ? data.rating_1v1 : data.rating_3v3;
    const matchesPlayed = mode === '1v1' ? data.matches_played_1v1 : data.matches_played_3v3;

    return {
      rating,
      matchesPlayed,
      volatility: data.volatility
    };
  }

  /**
   * Save rating updates to database
   */
  async saveRatingUpdates(updates: RatingUpdate[], mode: '1v1' | '3v3', matchId: string): Promise<void> {
    for (const update of updates) {
      // Update player_ratings table
      const ratingField = mode === '1v1' ? 'rating_1v1' : 'rating_3v3';
      const matchesField = mode === '1v1' ? 'matches_played_1v1' : 'matches_played_3v3';
      const winsField = mode === '1v1' ? 'wins_1v1' : 'wins_3v3';
      const lossesField = mode === '1v1' ? 'losses_1v1' : 'losses_3v3';
      const peakField = mode === '1v1' ? 'peak_rating_1v1' : 'peak_rating_3v3';

      const isWin = update.change > 0;

      // Get current data to update peak
      const { data: current } = await supabase
        .from('player_ratings')
        .select('*')
        .eq('user_id', update.userId)
        .single();

      const peakRating = Math.max(
        current?.[peakField] || 1200,
        update.newRating
      );

      await supabase
        .from('player_ratings')
        .update({
          [ratingField]: update.newRating,
          [matchesField]: (current?.[matchesField] || 0) + 1,
          [winsField]: (current?.[winsField] || 0) + (isWin ? 1 : 0),
          [lossesField]: (current?.[lossesField] || 0) + (isWin ? 0 : 1),
          [peakField]: peakRating,
          volatility: update.volatility
        })
        .eq('user_id', update.userId);

      // Insert rating history
      await supabase.from('rating_history').insert({
        user_id: update.userId,
        match_id: matchId,
        mode,
        rating_before: update.oldRating,
        rating_after: update.newRating,
        rating_change: update.change
      });
    }
  }

  /**
   * Get rating tier based on rating value
   */
  getRatingTier(rating: number): string {
    if (rating < 800) return 'Bronze';
    if (rating < 1000) return 'Silver';
    if (rating < 1200) return 'Gold';
    if (rating < 1400) return 'Platinum';
    if (rating < 1600) return 'Diamond';
    if (rating < 1800) return 'Master';
    return 'Grandmaster';
  }

  /**
   * Calculate percentile rank
   */
  async getPercentileRank(userId: string, mode: '1v1' | '3v3'): Promise<number> {
    const ratingField = mode === '1v1' ? 'rating_1v1' : 'rating_3v3';
    
    const { data: playerRating } = await supabase
      .from('player_ratings')
      .select(ratingField)
      .eq('user_id', userId)
      .single();

    if (!playerRating) return 0;

    const rating = playerRating[ratingField];

    const { count: totalPlayers } = await supabase
      .from('player_ratings')
      .select('*', { count: 'exact', head: true });

    const { count: lowerRated } = await supabase
      .from('player_ratings')
      .select('*', { count: 'exact', head: true })
      .lt(ratingField, rating);

    if (!totalPlayers || totalPlayers === 0) return 0;

    return ((lowerRated || 0) / totalPlayers) * 100;
  }
}

export default ELORatingSystem.getInstance();
