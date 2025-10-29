import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { RealTimeNotificationManager } from '@/lib/realtime-notifications';

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
  botUserId: string,
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
      try {
        // Insert submission
        const { data: newSubmission, error } = await supabase
          .from('battle_submissions')
          .insert({
            battle_id: battleId,
            user_id: botUserId,
            problem_id: submission.problemId,
            status: submission.verdict === 'AC' ? 'solved' : 
                    submission.verdict === 'WA' ? 'failed' : 'timeout',
            language: 'cpp',
            code_text: '// Bot solution',
            submitted_at: new Date().toISOString(),
            execution_time_ms: submission.verdict === 'AC' ? 
                              Math.floor(submission.delay / 1000) : null,
            memory_kb: submission.verdict === 'AC' ? 
                       Math.floor(Math.random() * 10000) + 1000 : null
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating bot submission:', error);
          return;
        }

        // Notify participants about the bot submission
        const rtManager = RealTimeNotificationManager.getInstance();
        await rtManager.broadcast({
          type: 'battle_submission_created',
          battleId,
          submission: newSubmission,
          message: `Bot submitted solution for problem ${submission.problemId}`
        });
      } catch (error) {
        console.error('Error processing bot submission:', error);
      }
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

/**
 * Create a bot user for practice battles
 */
export async function createBotUser(): Promise<{ id: string; rating: number }> {
  // In a real implementation, this would create a bot user in the database
  // For now, we'll return a placeholder bot
  return {
    id: `bot_${Date.now()}`,
    rating: Math.floor(Math.random() * 1000) + 800 // Random rating between 800-1800
  };
}

/**
 * Start a practice battle with a bot
 */
export async function startPracticeBattle(
  userId: string,
  userRating: number
): Promise<{ battleId: string; botId: string } | null> {
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

  try {
    // Create a bot user
    const bot = await createBotUser();
    
    // Create a practice battle
    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .insert({
        host_user_id: userId,
        guest_user_id: bot.id,
        status: 'waiting',
        format: 'best_of_3',
        is_practice: true
      })
      .select()
      .single();

    if (battleError) {
      console.error('Error creating practice battle:', battleError);
      return null;
    }

    // Create participant records
    const { error: participantError } = await supabase
      .from('battle_participants')
      .insert([
        {
          battle_id: battle.id,
          user_id: userId,
          rating_before: userRating,
          is_host: true
        },
        {
          battle_id: battle.id,
          user_id: bot.id,
          rating_before: bot.rating,
          is_host: false
        }
      ]);

    if (participantError) {
      console.error('Error creating battle participants:', participantError);
      return null;
    }

    // Start simulating bot submissions after a delay
    setTimeout(() => {
      simulateBotSubmissions(battle.id, bot.id, bot.rating, userRating);
    }, 5000); // Start after 5 seconds

    return { battleId: battle.id, botId: bot.id };
  } catch (error) {
    console.error('Error starting practice battle:', error);
    return null;
  }
}