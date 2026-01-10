import { createClient } from '@/lib/supabase/client';

export interface UserStats {
  currentRating: number;
  problemsSolved: number;
  currentStreak: number;
  contests: number;
  maxRating?: number;
  rank?: string;
}

export interface RecentActivity {
  id: string;
  problem: string;
  rating: number;
  status: 'solved' | 'failed';
  time: string;
  tags: string[];
  solvedAt: Date;
}

/**
 * Fetch user statistics from database
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = createClient();

  try {
    // Get latest CF snapshot for rating and problems solved
    const { data: latestSnapshot } = await supabase
      .from('cf_snapshots')
      .select('rating, max_rating, rank, problems_solved')
      .eq('user_id', userId)
      .order('snapshot_at', { ascending: false })
      .limit(1)
      .single();

    // Get current streak
    const { data: streakData } = await supabase
      .from('streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .single();

    // For contests, we'd need a contests table - using 0 for now
    // TODO: Implement contests tracking

    return {
      currentRating: latestSnapshot?.rating || 0,
      problemsSolved: latestSnapshot?.problems_solved || 0,
      currentStreak: streakData?.current_streak || 0,
      contests: 0, // TODO: Implement contests counting
      maxRating: latestSnapshot?.max_rating,
      rank: latestSnapshot?.rank,
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      currentRating: 0,
      problemsSolved: 0,
      currentStreak: 0,
      contests: 0,
    };
  }
}

/**
 * Fetch recent problem-solving activity
 */
export async function getRecentActivity(
  userId: string
): Promise<RecentActivity[]> {
  // For now, return empty array as we don't have a submissions/activity table yet
  // TODO: Implement problem submissions tracking
  return [];
}

/**
 * Check if user has verified their CF handle
 */
export async function getCFVerificationStatus(userId: string) {
  const supabase = createClient();

  try {
    const { data } = await supabase
      .from('cf_handles')
      .select('handle, verified')
      .eq('user_id', userId)
      .single();

    return {
      isVerified: data?.verified || false,
      handle: data?.handle || null,
    };
  } catch (error) {
    console.error('Error checking CF verification:', error);
    return {
      isVerified: false,
      handle: null,
    };
  }
}
