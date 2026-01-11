-- ============================================================================
-- ALGORISE FUNCTIONS AND AUTH TRIGGERS
-- ============================================================================
-- Script 3 of 4: Creates database functions and auth triggers
--
-- CRITICAL: This script sets up the user creation trigger that runs when
-- users sign up via OAuth. The trigger MUST NOT fail or auth will break.
-- ============================================================================

-- ======================== CONTEST LEADERBOARD FUNCTION ========================
CREATE OR REPLACE FUNCTION public.contest_leaderboard(in_contest_id uuid)
RETURNS TABLE(
    user_id uuid,
    username text,
    solved bigint,
    penalty bigint,
    score bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.user_id,
        COALESCE(p.username, p.name, 'User') as username,
        COUNT(DISTINCT CASE WHEN cs.status = 'solved' THEN cs.problem_id END) as solved,
        COALESCE(SUM(cs.penalty_s), 0) as penalty,
        COUNT(DISTINCT CASE WHEN cs.status = 'solved' THEN cs.problem_id END) * 100 as score
    FROM public.contest_submissions cs
    LEFT JOIN public.profiles p ON p.id = cs.user_id
    WHERE cs.contest_id = in_contest_id
    GROUP BY cs.user_id, p.username, p.name
    ORDER BY solved DESC, penalty ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.contest_leaderboard(uuid) TO authenticated, anon, service_role;

-- ======================== AUTO-CREATE PROFILE ON SIGNUP ========================
-- This trigger creates a profile row when a new user signs up.
-- CRITICAL: This function MUST NOT fail or user creation will fail.
-- The function uses SECURITY DEFINER to bypass RLS.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Simple insert with ON CONFLICT - no SELECT needed
    -- This avoids any RLS issues with checking existence
    INSERT INTO public.profiles (id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- NEVER fail - just log and continue
    -- The ensure-profile API will handle profile creation if this fails
    RAISE LOG 'handle_new_user warning for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant execute permissions to all roles that might need it
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- ======================== UPDATE USER PROFILE STATS ========================
CREATE OR REPLACE FUNCTION public.update_user_stats(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_solved int;
    v_total_attempted int;
BEGIN
    SELECT 
        COUNT(*) FILTER (WHERE status = 'solved'),
        COUNT(*)
    INTO v_total_solved, v_total_attempted
    FROM public.user_problems
    WHERE user_id = p_user_id;

    UPDATE public.user_skill_profiles
    SET 
        total_problems_solved = COALESCE(v_total_solved, 0),
        total_problems_attempted = COALESCE(v_total_attempted, 0),
        overall_success_rate = CASE 
            WHEN v_total_attempted > 0 
            THEN (v_total_solved::real / v_total_attempted::real) 
            ELSE 0 
        END,
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_stats(uuid) TO authenticated, service_role;

-- ======================== CLEANUP EXPIRED INVITATIONS ========================
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.group_invitations
    SET status = 'expired'
    WHERE status = 'pending' AND expires_at < NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.cleanup_expired_invitations() TO service_role;

-- ======================== GET USER STREAK ========================
CREATE OR REPLACE FUNCTION public.get_or_create_streak(p_user_id uuid)
RETURNS public.streaks
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_streak public.streaks;
BEGIN
    SELECT * INTO v_streak FROM public.streaks WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.streaks (user_id, current_streak, longest_streak)
        VALUES (p_user_id, 0, 0)
        RETURNING * INTO v_streak;
    END IF;
    
    RETURN v_streak;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_streak(uuid) TO authenticated, service_role;

-- ======================== SUCCESS ========================
DO $$ BEGIN
    RAISE NOTICE '✅ Functions and triggers created successfully!';
    RAISE NOTICE 'Next: Run 04_seed_data.sql (optional)';
END $$;
