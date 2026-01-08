-- ============================================================================
-- FIX: Infinite recursion in contests RLS policies
-- ============================================================================
-- The original policies have circular dependencies:
-- - contests_select checks contest_participants
-- - cp_select checks contests
-- This causes "infinite recursion detected in policy" error
-- ============================================================================

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "contests_select" ON public.contests;
DROP POLICY IF EXISTS "cp_select" ON public.contest_participants;

-- Step 2: Create helper function to check contest visibility without recursion
-- This function uses SECURITY DEFINER to bypass RLS within the function
CREATE OR REPLACE FUNCTION public.user_can_view_contest(p_contest_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contests c
    WHERE c.id = p_contest_id
    AND (
      c.visibility = 'public'
      OR c.host_user_id = p_user_id
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.contest_participants cp
    WHERE cp.contest_id = p_contest_id
    AND cp.user_id = p_user_id
  );
$$;

-- Step 3: Create helper function to check if user is participant
CREATE OR REPLACE FUNCTION public.is_contest_participant(p_contest_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.contest_participants cp
    WHERE cp.contest_id = p_contest_id
    AND cp.user_id = p_user_id
  );
$$;

-- Step 4: Create helper function to get contest visibility/host without recursion
CREATE OR REPLACE FUNCTION public.get_contest_access(p_contest_id uuid)
RETURNS TABLE(visibility text, host_user_id uuid)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT c.visibility::text, c.host_user_id
  FROM public.contests c
  WHERE c.id = p_contest_id;
$$;

-- Step 5: Recreate contests_select policy using the helper function
CREATE POLICY "contests_select" ON public.contests
  FOR SELECT USING (
    visibility = 'public'
    OR host_user_id = auth.uid()
    OR public.is_contest_participant(id, auth.uid())
    OR auth.role() = 'service_role'
  );

-- Step 6: Recreate cp_select policy without referencing contests table directly
-- Instead use helper function
CREATE POLICY "cp_select" ON public.contest_participants
  FOR SELECT USING (
    user_id = auth.uid()
    OR (
      SELECT ca.visibility = 'public' OR ca.host_user_id = auth.uid()
      FROM public.get_contest_access(contest_id) ca
    )
    OR auth.role() = 'service_role'
  );

-- Also fix contest_problems_select which has similar issue
DROP POLICY IF EXISTS "contest_problems_select" ON public.contest_problems;

CREATE POLICY "contest_problems_select" ON public.contest_problems
  FOR SELECT USING (
    public.user_can_view_contest(contest_id, auth.uid())
    OR auth.role() = 'service_role'
  );

-- Fix contest_submissions cs_select
DROP POLICY IF EXISTS "cs_select" ON public.contest_submissions;

CREATE POLICY "cs_select" ON public.contest_submissions
  FOR SELECT USING (
    user_id = auth.uid()
    OR (
      SELECT ca.host_user_id = auth.uid()
      FROM public.get_contest_access(contest_id) ca
    )
    OR auth.role() = 'service_role'
  );

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.user_can_view_contest(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_can_view_contest(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_contest_participant(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_contest_participant(uuid, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_contest_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_contest_access(uuid) TO anon;

-- ============================================================================
-- VERIFICATION: Test the policies work
-- ============================================================================
-- After running this script, test with:
-- SELECT * FROM contests LIMIT 5;
-- SELECT * FROM contest_participants LIMIT 5;
-- ============================================================================
