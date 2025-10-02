import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applyMeaningfulAction, getStreak } from "@/lib/streaks";

interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  lastActiveDay: string | null;
  updatedAt: string | null;
  newLongest?: boolean;
  error?: string;
}

async function getSupabaseUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw new Error(`Supabase auth error: ${error.message}`);
  if (!user) throw new Error("Unauthorized");
  return { supabase, user };
}

export async function GET(): Promise<Response> {
  try {
    const { supabase, user } = await getSupabaseUser();

    const row = await getStreak(supabase, user.id);

    const response: StreakResponse = row
      ? {
          currentStreak: row.current_streak,
          longestStreak: row.longest_streak,
          lastActiveDay: row.last_active_day ?? null,
          updatedAt: row.updated_at ?? null,
        }
      : {
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDay: null,
          updatedAt: null,
        };

    return Response.json(response);
  } catch (error) {
    console.error("GET /api/streaks error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { supabase, user } = await getSupabaseUser();

    const body = await req.json().catch(() => ({} as any));
    const now = body?.now ? new Date(body.now) : new Date();

    const prev = await getStreak(supabase, user.id);
    const updated = await applyMeaningfulAction(supabase, user.id, now);
    const newLongest = (prev?.longest_streak ?? 0) < updated.longest_streak;

    const response: StreakResponse = {
      currentStreak: updated.current_streak,
      longestStreak: updated.longest_streak,
      lastActiveDay: updated.last_active_day ?? null,
      updatedAt: updated.updated_at ?? null,
      newLongest,
    };

    return Response.json(response);
  } catch (error) {
    console.error("POST /api/streaks error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
