-- ============================================================================
-- ALGORISE RLS POLICIES - Production Ready (50k+ Users)
-- ============================================================================
-- Description: Row Level Security policies for all tables
-- Run AFTER: 000_master_schema.sql
-- ============================================================================

BEGIN;

-- ======================== ENABLE RLS ON ALL TABLES ========================

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_handles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_path_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skill_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaced_repetition_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_items ENABLE ROW LEVEL SECURITY;

-- ======================== COLLEGES POLICIES ========================

DROP POLICY IF EXISTS "colleges_select_all" ON public.colleges;
DROP POLICY IF EXISTS "colleges_admin_manage" ON public.colleges;

CREATE POLICY "colleges_select_all" ON public.colleges
  FOR SELECT USING (true);

CREATE POLICY "colleges_admin_manage" ON public.colleges
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== COMPANIES POLICIES ========================

DROP POLICY IF EXISTS "companies_select_all" ON public.companies;
DROP POLICY IF EXISTS "companies_admin_manage" ON public.companies;

CREATE POLICY "companies_select_all" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "companies_admin_manage" ON public.companies
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== PROFILES POLICIES ========================

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_full_access" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id OR auth.role() = 'service_role');

-- ======================== STREAKS POLICIES ========================

DROP POLICY IF EXISTS "streaks_select_own" ON public.streaks;
DROP POLICY IF EXISTS "streaks_insert_own" ON public.streaks;
DROP POLICY IF EXISTS "streaks_update_own" ON public.streaks;
DROP POLICY IF EXISTS "streaks_delete_own" ON public.streaks;
DROP POLICY IF EXISTS "streaks_admin_full_access" ON public.streaks;

CREATE POLICY "streaks_select_own" ON public.streaks
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "streaks_insert_own" ON public.streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "streaks_update_own" ON public.streaks
  FOR UPDATE 
  USING (auth.uid() = user_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "streaks_admin_full_access" ON public.streaks
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== CF_HANDLES POLICIES ========================

DROP POLICY IF EXISTS "select own cf handle" ON public.cf_handles;
DROP POLICY IF EXISTS "insert own cf handle" ON public.cf_handles;
DROP POLICY IF EXISTS "update own cf handle" ON public.cf_handles;
DROP POLICY IF EXISTS "admin manage cf handles" ON public.cf_handles;

CREATE POLICY "select own cf handle" ON public.cf_handles
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "insert own cf handle" ON public.cf_handles
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "update own cf handle" ON public.cf_handles
  FOR UPDATE 
  USING (auth.uid() = user_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "admin manage cf handles" ON public.cf_handles
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== CF_SNAPSHOTS POLICIES ========================

DROP POLICY IF EXISTS "cf_snapshots_select_own" ON public.cf_snapshots;
DROP POLICY IF EXISTS "cf_snapshots_insert_own" ON public.cf_snapshots;
DROP POLICY IF EXISTS "cf_snapshots_admin" ON public.cf_snapshots;

CREATE POLICY "cf_snapshots_select_own" ON public.cf_snapshots
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "cf_snapshots_insert_own" ON public.cf_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "cf_snapshots_admin" ON public.cf_snapshots
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== GROUPS POLICIES ========================

DROP POLICY IF EXISTS "groups_select_discoverable" ON public.groups;
DROP POLICY IF EXISTS "groups_insert_friends" ON public.groups;
DROP POLICY IF EXISTS "groups_update_admin" ON public.groups;
DROP POLICY IF EXISTS "groups_delete_admin" ON public.groups;
DROP POLICY IF EXISTS "groups_admin_bypass" ON public.groups;

CREATE POLICY "groups_select_discoverable" ON public.groups
  FOR SELECT USING (
    type = 'college'
    OR EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = id AND gm.user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

CREATE POLICY "groups_insert_friends" ON public.groups
  FOR INSERT WITH CHECK (
    (type = 'friends' AND created_by = auth.uid())
    OR auth.role() = 'service_role'
  );

CREATE POLICY "groups_update_admin" ON public.groups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
    OR auth.role() = 'service_role'
  );

CREATE POLICY "groups_delete_admin" ON public.groups
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
    OR auth.role() = 'service_role'
  );

-- ======================== GROUP_MEMBERSHIPS POLICIES ========================

DROP POLICY IF EXISTS "gm_select_members" ON public.group_memberships;
DROP POLICY IF EXISTS "gm_insert_self" ON public.group_memberships;
DROP POLICY IF EXISTS "gm_update_admin" ON public.group_memberships;
DROP POLICY IF EXISTS "gm_delete_self_or_admin" ON public.group_memberships;
DROP POLICY IF EXISTS "gm_admin_bypass" ON public.group_memberships;

CREATE POLICY "gm_select_members" ON public.group_memberships
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_memberships gm2
      WHERE gm2.group_id = group_id AND gm2.user_id = auth.uid()
    )
    OR auth.role() = 'service_role'
  );

CREATE POLICY "gm_insert_self" ON public.group_memberships
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
  );

CREATE POLICY "gm_update_admin" ON public.group_memberships
  FOR UPDATE
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
  );

CREATE POLICY "gm_delete_self_or_admin" ON public.group_memberships
  FOR DELETE USING (
    auth.role() = 'service_role'
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
  );

-- ======================== GROUP_INVITATIONS POLICIES ========================

DROP POLICY IF EXISTS "group_invitations_select" ON public.group_invitations;
DROP POLICY IF EXISTS "group_invitations_insert" ON public.group_invitations;
DROP POLICY IF EXISTS "group_invitations_update" ON public.group_invitations;
DROP POLICY IF EXISTS "group_invitations_delete" ON public.group_invitations;

CREATE POLICY "group_invitations_select" ON public.group_invitations
  FOR SELECT USING (
    inviter_id = auth.uid() 
    OR invitee_id = auth.uid()
    OR auth.role() = 'service_role'
  );

CREATE POLICY "group_invitations_insert" ON public.group_invitations
  FOR INSERT WITH CHECK (
    inviter_id = auth.uid()
    OR auth.role() = 'service_role'
  );

CREATE POLICY "group_invitations_update" ON public.group_invitations
  FOR UPDATE
  USING (invitee_id = auth.uid() OR auth.role() = 'service_role')
  WITH CHECK (invitee_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "group_invitations_delete" ON public.group_invitations
  FOR DELETE USING (
    inviter_id = auth.uid() 
    OR invitee_id = auth.uid()
    OR auth.role() = 'service_role'
  );

-- ======================== PROBLEMS POLICIES ========================

DROP POLICY IF EXISTS "problems_select_active" ON public.problems;
DROP POLICY IF EXISTS "Admins can manage problems" ON public.problems;

CREATE POLICY "problems_select_active" ON public.problems
  FOR SELECT USING (auth.role() = 'service_role' OR is_active = true);

CREATE POLICY "Admins can manage problems" ON public.problems
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== PROBLEM_HINTS POLICIES ========================

DROP POLICY IF EXISTS "Anyone can view hints for active problems" ON public.problem_hints;
DROP POLICY IF EXISTS "Admins can manage hints" ON public.problem_hints;

CREATE POLICY "Anyone can view hints for active problems" ON public.problem_hints
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.problems p
      WHERE p.id = public.problem_hints.problem_id AND p.is_active = true
    )
  );

CREATE POLICY "Admins can manage hints" ON public.problem_hints
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== PROBLEM_HISTORY POLICIES ========================

DROP POLICY IF EXISTS "Users can view own problem history" ON public.problem_history;
DROP POLICY IF EXISTS "Users can insert own problem history" ON public.problem_history;
DROP POLICY IF EXISTS "Users can update own problem history" ON public.problem_history;

CREATE POLICY "Users can view own problem history" ON public.problem_history
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "Users can insert own problem history" ON public.problem_history
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "Users can update own problem history" ON public.problem_history
  FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.uid() = user_id)
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== USER_PROBLEMS POLICIES ========================

DROP POLICY IF EXISTS "user_problems_select_own" ON public.user_problems;
DROP POLICY IF EXISTS "user_problems_insert_own" ON public.user_problems;
DROP POLICY IF EXISTS "user_problems_update_own" ON public.user_problems;
DROP POLICY IF EXISTS "user_problems_delete_own" ON public.user_problems;

CREATE POLICY "user_problems_select_own" ON public.user_problems
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_problems_insert_own" ON public.user_problems
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_problems_update_own" ON public.user_problems
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_problems_delete_own" ON public.user_problems
  FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== CONTESTS POLICIES ========================

-- Helper function for contest access
CREATE OR REPLACE FUNCTION public.can_read_contest(p_contest_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    auth.role() = 'service_role'
    OR c.visibility = 'public'
    OR c.host_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.contest_participants cp
      WHERE cp.contest_id = p_contest_id AND cp.user_id = auth.uid()
    )
  FROM public.contests c
  WHERE c.id = p_contest_id
$$;

CREATE OR REPLACE FUNCTION public.can_manage_contest(p_contest_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    auth.role() = 'service_role'
    OR c.host_user_id = auth.uid()
  FROM public.contests c
  WHERE c.id = p_contest_id
$$;

DROP POLICY IF EXISTS "contests_select_access" ON public.contests;
DROP POLICY IF EXISTS "contests_insert_own" ON public.contests;
DROP POLICY IF EXISTS "contests_update_manage" ON public.contests;

CREATE POLICY "contests_select_access" ON public.contests
  FOR SELECT USING (public.can_read_contest(id));

CREATE POLICY "contests_insert_own" ON public.contests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND host_user_id = auth.uid());

CREATE POLICY "contests_update_manage" ON public.contests
  FOR UPDATE
  USING (public.can_manage_contest(id))
  WITH CHECK (public.can_manage_contest(id));

-- ======================== CONTEST_PARTICIPANTS POLICIES ========================

DROP POLICY IF EXISTS "participants_select_access" ON public.contest_participants;
DROP POLICY IF EXISTS "participants_insert_self" ON public.contest_participants;
DROP POLICY IF EXISTS "participants_delete_self" ON public.contest_participants;

CREATE POLICY "participants_select_access" ON public.contest_participants
  FOR SELECT USING (public.can_read_contest(contest_id));

CREATE POLICY "participants_insert_self" ON public.contest_participants
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND public.can_read_contest(contest_id)
  );

CREATE POLICY "participants_delete_self" ON public.contest_participants
  FOR DELETE USING (user_id = auth.uid());

-- ======================== CONTEST_PROBLEMS POLICIES ========================

DROP POLICY IF EXISTS "problems_select_access" ON public.contest_problems;
DROP POLICY IF EXISTS "problems_insert_manage" ON public.contest_problems;
DROP POLICY IF EXISTS "problems_update_manage" ON public.contest_problems;
DROP POLICY IF EXISTS "problems_delete_manage" ON public.contest_problems;

CREATE POLICY "problems_select_access" ON public.contest_problems
  FOR SELECT USING (public.can_read_contest(contest_id));

CREATE POLICY "problems_insert_manage" ON public.contest_problems
  FOR INSERT WITH CHECK (public.can_manage_contest(contest_id));

CREATE POLICY "problems_update_manage" ON public.contest_problems
  FOR UPDATE
  USING (public.can_manage_contest(contest_id))
  WITH CHECK (public.can_manage_contest(contest_id));

CREATE POLICY "problems_delete_manage" ON public.contest_problems
  FOR DELETE USING (public.can_manage_contest(contest_id));

-- ======================== CONTEST_SUBMISSIONS POLICIES ========================

DROP POLICY IF EXISTS "submissions_select_access" ON public.contest_submissions;
DROP POLICY IF EXISTS "submissions_insert_self" ON public.contest_submissions;

CREATE POLICY "submissions_select_access" ON public.contest_submissions
  FOR SELECT USING (public.can_read_contest(contest_id));

CREATE POLICY "submissions_insert_self" ON public.contest_submissions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND public.can_read_contest(contest_id)
    AND EXISTS (
      SELECT 1 FROM public.contest_participants cp
      WHERE cp.contest_id = contest_id AND cp.user_id = auth.uid()
    )
  );

-- ======================== CONTEST_RESULTS POLICIES ========================

DROP POLICY IF EXISTS "results_select_access" ON public.contest_results;
DROP POLICY IF EXISTS "results_manage" ON public.contest_results;

CREATE POLICY "results_select_access" ON public.contest_results
  FOR SELECT USING (public.can_read_contest(contest_id));

CREATE POLICY "results_manage" ON public.contest_results
  FOR ALL
  USING (public.can_manage_contest(contest_id))
  WITH CHECK (public.can_manage_contest(contest_id));

-- ======================== SUBSCRIPTIONS POLICIES ========================

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_owner_or_service" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_owner_or_service" ON public.subscriptions;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_owner_or_service" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "subscriptions_update_owner_or_service" ON public.subscriptions
  FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.uid() = user_id)
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== PURCHASES POLICIES ========================

DROP POLICY IF EXISTS "purchases_select_own" ON public.purchases;
DROP POLICY IF EXISTS "purchases_insert_own" ON public.purchases;
DROP POLICY IF EXISTS "purchases_update_service" ON public.purchases;

CREATE POLICY "purchases_select_own" ON public.purchases
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "purchases_insert_own" ON public.purchases
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "purchases_update_service" ON public.purchases
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== PAYMENT_EVENTS POLICIES ========================

DROP POLICY IF EXISTS "payment_events_admin_bypass" ON public.payment_events;

CREATE POLICY "payment_events_admin_bypass" ON public.payment_events
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== USER_SHEETS POLICIES ========================

DROP POLICY IF EXISTS "user_sheets_select_own" ON public.user_sheets;
DROP POLICY IF EXISTS "user_sheets_insert_own" ON public.user_sheets;
DROP POLICY IF EXISTS "user_sheets_update_own" ON public.user_sheets;
DROP POLICY IF EXISTS "user_sheets_delete_own" ON public.user_sheets;

CREATE POLICY "user_sheets_select_own" ON public.user_sheets
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_sheets_insert_own" ON public.user_sheets
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_sheets_update_own" ON public.user_sheets
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_sheets_delete_own" ON public.user_sheets
  FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== GROUP_CHALLENGES POLICIES ========================

DROP POLICY IF EXISTS "group_challenges_select_members" ON public.group_challenges;
DROP POLICY IF EXISTS "group_challenges_insert_admin" ON public.group_challenges;
DROP POLICY IF EXISTS "group_challenges_update_admin" ON public.group_challenges;
DROP POLICY IF EXISTS "group_challenges_delete_admin" ON public.group_challenges;

CREATE POLICY "group_challenges_select_members" ON public.group_challenges
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = public.group_challenges.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "group_challenges_insert_admin" ON public.group_challenges
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = public.group_challenges.group_id
        AND gm.user_id = auth.uid() AND gm.role = 'admin'
    )
  );

CREATE POLICY "group_challenges_update_admin" ON public.group_challenges
  FOR UPDATE
  USING (
    auth.role() = 'service_role'
    OR (
      status = 'active'
      AND EXISTS (
        SELECT 1 FROM public.group_memberships gm
        WHERE gm.group_id = public.group_challenges.group_id
          AND gm.user_id = auth.uid() AND gm.role = 'admin'
      )
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR (
      status = 'active'
      AND EXISTS (
        SELECT 1 FROM public.group_memberships gm
        WHERE gm.group_id = public.group_challenges.group_id
          AND gm.user_id = auth.uid() AND gm.role = 'admin'
      )
    )
  );

CREATE POLICY "group_challenges_delete_admin" ON public.group_challenges
  FOR DELETE USING (
    auth.role() = 'service_role'
    OR (
      status = 'active'
      AND EXISTS (
        SELECT 1 FROM public.group_memberships gm
        WHERE gm.group_id = public.group_challenges.group_id
          AND gm.user_id = auth.uid() AND gm.role = 'admin'
      )
    )
  );

-- ======================== GROUP_CHALLENGE_PROGRESS POLICIES ========================

DROP POLICY IF EXISTS "group_challenge_progress_select_members" ON public.group_challenge_progress;
DROP POLICY IF EXISTS "group_challenge_progress_insert_member" ON public.group_challenge_progress;
DROP POLICY IF EXISTS "group_challenge_progress_update_member" ON public.group_challenge_progress;

CREATE POLICY "group_challenge_progress_select_members" ON public.group_challenge_progress
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.group_challenges gc
      JOIN public.group_memberships gm ON gm.group_id = gc.group_id
      WHERE gc.id = public.group_challenge_progress.challenge_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "group_challenge_progress_insert_member" ON public.group_challenge_progress
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "group_challenge_progress_update_member" ON public.group_challenge_progress
  FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.uid() = user_id)
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== LEARNING_PATHS POLICIES ========================

DROP POLICY IF EXISTS "learning_paths_select_all" ON public.learning_paths;
DROP POLICY IF EXISTS "learning_paths_admin" ON public.learning_paths;

CREATE POLICY "learning_paths_select_all" ON public.learning_paths
  FOR SELECT USING (auth.role() = 'service_role' OR is_active = true);

CREATE POLICY "learning_paths_admin" ON public.learning_paths
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== USER_LEARNING_PATH_PROGRESS POLICIES ========================

DROP POLICY IF EXISTS "user_learning_path_progress_select_own" ON public.user_learning_path_progress;
DROP POLICY IF EXISTS "user_learning_path_progress_insert_own" ON public.user_learning_path_progress;
DROP POLICY IF EXISTS "user_learning_path_progress_update_own" ON public.user_learning_path_progress;

CREATE POLICY "user_learning_path_progress_select_own" ON public.user_learning_path_progress
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "user_learning_path_progress_insert_own" ON public.user_learning_path_progress
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "user_learning_path_progress_update_own" ON public.user_learning_path_progress
  FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.uid() = user_id)
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== PROBLEM_ATTEMPTS POLICIES ========================

DROP POLICY IF EXISTS "problem_attempts_select_own" ON public.problem_attempts;
DROP POLICY IF EXISTS "problem_attempts_insert_own" ON public.problem_attempts;
DROP POLICY IF EXISTS "problem_attempts_update_own" ON public.problem_attempts;

CREATE POLICY "problem_attempts_select_own" ON public.problem_attempts
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "problem_attempts_insert_own" ON public.problem_attempts
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "problem_attempts_update_own" ON public.problem_attempts
  FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.uid() = user_id)
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== USER_TOPIC_MASTERY POLICIES ========================

DROP POLICY IF EXISTS "user_topic_mastery_select_own" ON public.user_topic_mastery;
DROP POLICY IF EXISTS "user_topic_mastery_upsert_own" ON public.user_topic_mastery;
DROP POLICY IF EXISTS "user_topic_mastery_update_own" ON public.user_topic_mastery;

CREATE POLICY "user_topic_mastery_select_own" ON public.user_topic_mastery
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "user_topic_mastery_upsert_own" ON public.user_topic_mastery
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "user_topic_mastery_update_own" ON public.user_topic_mastery
  FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.uid() = user_id)
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== USER_SKILL_PROFILES POLICIES ========================

DROP POLICY IF EXISTS "user_skill_profiles_select_own" ON public.user_skill_profiles;
DROP POLICY IF EXISTS "user_skill_profiles_upsert_own" ON public.user_skill_profiles;
DROP POLICY IF EXISTS "user_skill_profiles_update_own" ON public.user_skill_profiles;

CREATE POLICY "user_skill_profiles_select_own" ON public.user_skill_profiles
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "user_skill_profiles_upsert_own" ON public.user_skill_profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "user_skill_profiles_update_own" ON public.user_skill_profiles
  FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.uid() = user_id)
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== PROBLEM_RECOMMENDATIONS POLICIES ========================

DROP POLICY IF EXISTS "problem_recommendations_select_own" ON public.problem_recommendations;
DROP POLICY IF EXISTS "problem_recommendations_insert_own" ON public.problem_recommendations;
DROP POLICY IF EXISTS "problem_recommendations_update_own" ON public.problem_recommendations;

CREATE POLICY "problem_recommendations_select_own" ON public.problem_recommendations
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "problem_recommendations_insert_own" ON public.problem_recommendations
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "problem_recommendations_update_own" ON public.problem_recommendations
  FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.uid() = user_id)
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== SPACED_REPETITION_REVIEWS POLICIES ========================

DROP POLICY IF EXISTS "spaced_repetition_reviews_select_own" ON public.spaced_repetition_reviews;
DROP POLICY IF EXISTS "spaced_repetition_reviews_upsert_own" ON public.spaced_repetition_reviews;
DROP POLICY IF EXISTS "spaced_repetition_reviews_update_own" ON public.spaced_repetition_reviews;

CREATE POLICY "spaced_repetition_reviews_select_own" ON public.spaced_repetition_reviews
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "spaced_repetition_reviews_upsert_own" ON public.spaced_repetition_reviews
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "spaced_repetition_reviews_update_own" ON public.spaced_repetition_reviews
  FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.uid() = user_id)
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== ADAPTIVE_ITEMS POLICIES ========================

DROP POLICY IF EXISTS "adaptive_items_select_own" ON public.adaptive_items;
DROP POLICY IF EXISTS "adaptive_items_insert_own" ON public.adaptive_items;
DROP POLICY IF EXISTS "adaptive_items_update_own" ON public.adaptive_items;

CREATE POLICY "adaptive_items_select_own" ON public.adaptive_items
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "adaptive_items_insert_own" ON public.adaptive_items
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "adaptive_items_update_own" ON public.adaptive_items
  FOR UPDATE
  USING (auth.role() = 'service_role' OR auth.uid() = user_id)
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

COMMIT;

-- ============================================================================
-- END OF RLS POLICIES
-- ============================================================================
