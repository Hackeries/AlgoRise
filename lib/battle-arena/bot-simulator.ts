import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { broadcastBattleUpdate } from '@/hooks/use-battle-realtime';

interface BotSubmission {
  problemId: string;
  verdict: 'AC' | 'WA' | 'TLE';
  delay: number; // milliseconds
}

/**
 * Simulate bot submissions with realistic delays
 * Bot difficulty = user rating ± offset
 */
export async function simulateBotSubmissions(
  battleId: string,
  botTeamId: string,
  botRating: number,
  userRating: number,
  problemCount = 5
) {
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

  // Get problems for this battle
  const { data: battle } = await supabase
    .from('battles')
    .select('problem_set_id')
    .eq('id', battleId)
    .single();

  if (!battle?.problem_set_id) return;

  const { data: problems } = await supabase
    .from('contests')
    .select('id, problems')
    .eq('id', battle.problem_set_id)
    .single();

  if (!problems?.problems) return;

  // Simulate submissions with delays
  const submissions: BotSubmission[] = [];
  const ratingDiff = botRating - userRating;

  // Bot success rate based on rating difference
  // If bot is stronger, higher success rate
  const baseSuccessRate = 0.6 + (ratingDiff / 500) * 0.2; // 40-80% success rate

  for (let i = 0; i < Math.min(problemCount, 5); i++) {
    const problemId = problems.problems[i]?.id || `problem_${i}`;

    // Random delay: 5-30 minutes
    const delay = Math.random() * 25 * 60 * 1000 + 5 * 60 * 1000;

    // Determine verdict
    const rand = Math.random();
    let verdict: 'AC' | 'WA' | 'TLE' = 'AC';
    if (rand > baseSuccessRate) {
      verdict = Math.random() > 0.5 ? 'WA' : 'TLE';
    }

    submissions.push({
      problemId,
      verdict,
      delay,
    });
  }

  // Sort by delay
  submissions.sort((a, b) => a.delay - b.delay);

  // Schedule submissions
  for (const submission of submissions) {
    setTimeout(async () => {
      // Insert submission
      const { data: newSubmission } = await supabase
        .from('battle_submissions')
        .insert({
          battle_id: battleId,
          team_id: botTeamId,
          user_id: 'bot', // Placeholder
          problem_id: submission.problemId,
          verdict: submission.verdict,
          penalty:
            submission.verdict === 'AC'
              ? Math.floor(submission.delay / 60000)
              : 0,
          code: '// Bot solution',
          language: 'C++',
        })
        .select()
        .single();

      // Broadcast update
      await broadcastBattleUpdate(battleId, {
        type: 'submission',
        submission: {
          userId: 'bot',
          problemId: submission.problemId,
          verdict: submission.verdict,
          timestamp: new Date().toISOString(),
        },
      });
    }, submission.delay);
  }
}

/**
 * Calculate bot performance based on rating
 */
export function calculateBotPerformance(botRating: number, userRating: number) {
  const ratingDiff = botRating - userRating;

  return {
    successRate: Math.max(0.3, Math.min(0.9, 0.6 + (ratingDiff / 500) * 0.2)),
    avgSubmissionTime: 15 * 60 * 1000 - (ratingDiff / 500) * 5 * 60 * 1000, // 10-20 minutes
    problemsSolved: Math.max(1, Math.floor(3 + (ratingDiff / 500) * 2)), // 1-5 problems
  };
}
