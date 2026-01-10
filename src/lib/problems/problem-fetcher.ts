// Problem fetching utilities with diversity and anti-repetition logic
// NEVER hardcode problems - always fetch from database

import { createClient } from '@/lib/supabase/server';

export interface Problem {
  id: string;
  platform: string;
  external_id: string;
  title: string;
  difficulty_rating: number;
  topic: string[];
  tags: string[];
  time_limit: number;
  memory_limit: number;
  problem_statement: string;
  input_format?: string;
  output_format?: string;
  constraints?: string;
  test_cases: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  source_url?: string;
  hints?: Array<{
    id: string;
    level: number;
    hint_type: 'restatement' | 'algorithm' | 'pseudocode' | 'solution';
    content: string;
  }>;
}

export interface ProblemFetchOptions {
  targetRating: number;
  ratingRange?: number;
  count?: number;
  daysThreshold?: number; // Don't repeat problems seen in last N days
  excludeTopics?: string[]; // Exclude certain topics
  requireTopics?: string[]; // Only include certain topics
}

/**
 * Fetch problems for matchmaking with diversity and anti-repetition
 */
export async function fetchMatchmakingProblems(
  userId: string,
  options: ProblemFetchOptions
): Promise<Problem[]> {
  const supabase = await createClient();

  const {
    targetRating,
    ratingRange = 200,
    count = 2,
    daysThreshold = 7,
  } = options;

  try {
    // Call the database function that handles diversity and anti-repetition
    const { data: problems, error } = await supabase.rpc(
      'get_matchmaking_problems',
      {
        p_user_id: userId,
        p_target_rating: targetRating,
        p_rating_range: ratingRange,
        p_count: count,
        p_days_threshold: daysThreshold,
      }
    );

    if (error) {
      console.error('Error fetching matchmaking problems:', error);
      throw new Error('Failed to fetch problems');
    }

    // If we don't have enough problems, try with a wider range
    if (!problems || problems.length < count) {
      console.warn(
        `Only found ${problems?.length || 0} problems, trying wider range`
      );

      const { data: expandedProblems, error: expandedError } = await supabase
        .rpc('get_matchmaking_problems', {
          p_user_id: userId,
          p_target_rating: targetRating,
          p_rating_range: ratingRange * 2,
          p_count: count,
          p_days_threshold: daysThreshold,
        });

      if (expandedError) {
        throw new Error('Failed to fetch problems with expanded range');
      }

      return (expandedProblems || []) as Problem[];
    }

    return (problems || []) as Problem[];
  } catch (error) {
    console.error('Error in fetchMatchmakingProblems:', error);
    throw error;
  }
}

/**
 * Fetch a specific problem by ID with all details
 */
export async function fetchProblemById(problemId: string): Promise<Problem | null> {
  const supabase = await createClient();

  try {
    // Fetch problem details
    const { data: problem, error: problemError } = await supabase
      .from('problems')
      .select('*')
      .eq('id', problemId)
      .eq('is_active', true)
      .single();

    if (problemError || !problem) {
      console.error('Error fetching problem:', problemError);
      return null;
    }

    // Fetch hints
    const { data: hints, error: hintsError } = await supabase
      .from('problem_hints')
      .select('*')
      .eq('problem_id', problemId)
      .order('level', { ascending: true });

    if (hintsError) {
      console.warn('Error fetching hints:', hintsError);
    }

    return {
      ...problem,
      hints: hints || [],
    } as Problem;
  } catch (error) {
    console.error('Error in fetchProblemById:', error);
    return null;
  }
}

/**
 * Record that a user has viewed a problem
 */
export async function recordProblemView(
  userId: string,
  problemId: string
): Promise<void> {
  const supabase = await createClient();

  try {
    await supabase.rpc('record_problem_view', {
      p_user_id: userId,
      p_problem_id: problemId,
      p_battle_id: null,
      p_battle_round_id: null,
    });
  } catch (error) {
    console.error('Error recording problem view:', error);
  }
}

/**
 * Update problem interaction (attempt, solve, time spent)
 */
export async function updateProblemInteraction(
  userId: string,
  problemId: string,
  action: 'attempt' | 'solve',
  timeSpentSeconds?: number
): Promise<void> {
  const supabase = await createClient();

  try {
    const response = await fetch(`/api/problems/${problemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        timeSpentSeconds,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update problem interaction');
    }
  } catch (error) {
    console.error('Error updating problem interaction:', error);
  }
}

/**
 * Get user's problem history
 */
export async function getUserProblemHistory(
  userId: string,
  limit = 50
): Promise<any[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('problem_history')
      .select(`
        *,
        problems (
          id,
          title,
          platform,
          external_id,
          difficulty_rating
        )
      `)
      .eq('user_id', userId)
      .order('first_seen_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching problem history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserProblemHistory:', error);
    return [];
  }
}

/**
 * Check if a problem has been seen recently
 */
export async function hasSeenRecently(
  userId: string,
  problemId: string,
  daysThreshold = 7
): Promise<boolean> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('problem_history')
      .select('first_seen_at')
      .eq('user_id', userId)
      .eq('problem_id', problemId)
      .single();

    if (error || !data) {
      return false;
    }

    const seenDate = new Date(data.first_seen_at);
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysThreshold);

    return seenDate > threshold;
  } catch (error) {
    console.error('Error checking problem history:', error);
    return false;
  }
}

/**
 * Ensure topic diversity in problem selection
 * This prevents getting multiple problems from the same topic
 */
export function ensureTopicDiversity(problems: Problem[]): Problem[] {
  if (problems.length <= 1) return problems;

  const diverseProblems: Problem[] = [];
  const usedTopics = new Set<string>();

  // First pass: add problems with unique primary topics
  for (const problem of problems) {
    const primaryTopic = problem.topic?.[0];
    if (primaryTopic && !usedTopics.has(primaryTopic)) {
      diverseProblems.push(problem);
      usedTopics.add(primaryTopic);
    }
  }

  // If we still need more problems, add remaining ones
  if (diverseProblems.length < problems.length) {
    for (const problem of problems) {
      if (!diverseProblems.includes(problem)) {
        diverseProblems.push(problem);
      }
    }
  }

  return diverseProblems;
}
