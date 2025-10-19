import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { battleId, accept } = await request.json()

    if (accept) {
      // Create battle teams
      const teamResult = await sql(
        `INSERT INTO public.battle_teams (battle_id, team_name)
         VALUES ($1, $2)
         RETURNING *`,
        [battleId, `Team ${user.id.slice(0, 8)}`],
      )

      const team = teamResult[0]

      // Add user to team
      await sql(
        `INSERT INTO public.battle_team_players (team_id, user_id, role)
         VALUES ($1, $2, 'captain')`,
        [team.id, user.id],
      )

      // Update battle status
      await sql(
        `UPDATE public.battles SET status = 'active', start_at = NOW()
         WHERE id = $1`,
        [battleId],
      )

      return NextResponse.json({ success: true, battleId, teamId: team.id })
    } else {
      // Decline match
      await sql(
        `UPDATE public.battles SET status = 'cancelled'
         WHERE id = $1`,
        [battleId],
      )

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error("Match accept error:", error)
    return NextResponse.json({ error: "Failed to accept match" }, { status: 500 })
  }
}
