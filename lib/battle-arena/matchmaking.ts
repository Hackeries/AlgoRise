import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cfGetUserInfo } from '@/lib/codeforces-api';

interface UserRating {
  userId: string;
  handle: string;
  rating: number;
}

interface MatchResult {
  matched: boolean;
  opponent?: UserRating;
  battleId?: string;
}

interface CFUserResponse {
  status: string;
  result?: Array<{
    handle: string;
    rating?: number;
    maxRating?: number;
    rank?: string;
  }>;
  comment?: string;
}

/**
 * Get user's current ELO rating for a mode
 */
export async function getUserBattleRating(
  userId: string,
  mode: '1v1' | '3v3'
): Promise<number> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data, error } = await supabase
    .from('battle_ratings')
    .select('elo')
    .eq('entity_id', userId)
    .eq('entity_type', 'user')
    .eq('mode', mode)
    .single();

  if (error || !data) {
    return 1500; // Default rating
  }

  return data.elo;
}

/**
 * Get user's Codeforces rating
 */
export async function getUserCodeforcesRating(userId: string): Promise<number> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // Get user's CF handle from profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('codeforces_handle')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.codeforces_handle) {
    return 1500; // Default if no CF handle
  }

  // Fetch CF rating
  const response = (await cfGetUserInfo(
    profile.codeforces_handle
  )) as CFUserResponse;
  if (
    response.status === 'OK' &&
    response.result &&
    Array.isArray(response.result)
  ) {
    return response.result[0]?.rating || 1500;
  }

  return 1500;
}

/**
 * Find matching opponent based on rating window
 * 1v1: ±200 / -100 window
 */
export async function findMatchingOpponent(
  userId: string,
  mode: '1v1' | '3v3'
): Promise<MatchResult> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // Get current user's rating
  const userRating = await getUserCodeforcesRating(userId);

  // Define matching window: +200 / -100
  const minRating = userRating - 100;
  const maxRating = userRating + 200;

  // Find waiting opponents in queue with matching rating
  const { data: opponents, error } = await supabase
    .from('battle_queue')
    .select('user_id, current_elo')
    .eq('mode', mode)
    .eq('status', 'waiting')
    .neq('user_id', userId)
    .gte('current_elo', minRating)
    .lte('current_elo', maxRating)
    .limit(1);

  if (error || !opponents || opponents.length === 0) {
    return { matched: false };
  }

  const opponentId = opponents[0].user_id;

  // Get opponent's CF handle
  const { data: opponentProfile } = await supabase
    .from('profiles')
    .select('codeforces_handle')
    .eq('id', opponentId)
    .single();

  return {
    matched: true,
    opponent: {
      userId: opponentId,
      handle: opponentProfile?.codeforces_handle || 'Unknown',
      rating: opponents[0].current_elo,
    },
  };
}

/**
 * Calculate problem rating range based on user ratings
 * Lower bound = min(800, lower_rating + 200)
 * Upper bound = min(3500, max_rating + 200)
 */
export function calculateProblemRatingRange(
  rating1: number,
  rating2?: number
): { min: number; max: number } {
  const ratings = rating2 ? [rating1, rating2] : [rating1];
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);

  return {
    min: Math.min(800, minRating + 200),
    max: Math.min(3500, maxRating + 200),
  };
}

/**
 * Calculate ELO change after battle
 */
export function calculateEloChange(
  winnerRating: number,
  loserRating: number,
  K = 32
): { winnerChange: number; loserChange: number } {
  const expectedWinner =
    1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser =
    1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  const winnerChange = Math.round(K * (1 - expectedWinner));
  const loserChange = Math.round(K * (0 - expectedLoser));

  return { winnerChange, loserChange };
}
