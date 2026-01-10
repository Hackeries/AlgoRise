import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}`);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const grid = days.map(() => hours.map(() => 0));
    return NextResponse.json({ grid, hours, days, mock: false });
  }

  // Get user activity from the last 30 days
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: activities, error } = await supabase
    .from('adaptive_items')
    .select('created_at, updated_at')
    .eq('user_id', user.id)
    .gte('updated_at', thirtyDaysAgo)
    .not('status', 'eq', 'pending');

  const hours = Array.from({ length: 24 }, (_, i) => `${i}`);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Initialize grid with zeros
  const grid = days.map(() => hours.map(() => 0));

  if (activities && !error) {
    activities.forEach(activity => {
      const date = new Date(activity.updated_at);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hour = date.getHours();

      // Convert Sunday (0) to index 6, Monday (1) to index 0, etc.
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      if (dayIndex >= 0 && dayIndex < 7 && hour >= 0 && hour < 24) {
        grid[dayIndex][hour]++;
      }
    });
  }

  return NextResponse.json({ grid, hours, days, mock: false });
}
