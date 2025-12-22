import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ArenaLobby } from '@/components/arena';

export default async function ArenaPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/login?redirect=/arena');
  }

  // Get user profile to check subscription
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_status, subscription_end')
    .eq('id', user.id)
    .single();

  const isPro = profile?.subscription_plan !== 'free' && 
                profile?.subscription_status === 'active' &&
                (!profile?.subscription_end || new Date(profile.subscription_end) > new Date());

  // Get or create arena rating
  let { data: rating } = await supabase
    .from('arena_ratings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!rating) {
    const { data: newRating } = await supabase
      .from('arena_ratings')
      .insert({ user_id: user.id })
      .select()
      .single();
    rating = newRating;
  }

  // Get daily limit
  const today = new Date().toISOString().split('T')[0];
  let { data: dailyLimit } = await supabase
    .from('arena_daily_limits')
    .select('*')
    .eq('user_id', user.id)
    .eq('match_date', today)
    .single();

  return (
    <ArenaLobby
      userId={user.id}
      userRating={rating}
      dailyLimit={dailyLimit}
      isPro={isPro}
    />
  );
}

