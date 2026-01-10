-- ============================================================================
-- ALGORISE RLS POLICIES & FUNCTIONS - RUN SECOND
-- ============================================================================
-- Run AFTER: RUN_THIS_FIRST_reset_and_setup.sql
-- ============================================================================

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

CREATE POLICY "colleges_select_all" ON public.colleges
  FOR SELECT USING (true);

CREATE POLICY "colleges_admin_manage" ON public.colleges
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== COMPANIES POLICIES ========================

CREATE POLICY "companies_select_all" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "companies_admin_manage" ON public.companies
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== PROFILES POLICIES ========================

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id OR auth.role() = 'service_role');

-- ======================== STREAKS POLICIES ========================

CREATE POLICY "streaks_select_own" ON public.streaks
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "streaks_insert_own" ON public.streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "streaks_update_own" ON public.streaks
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== CF_HANDLES POLICIES ========================

CREATE POLICY "cf_handles_select_own" ON public.cf_handles
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "cf_handles_insert_own" ON public.cf_handles
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "cf_handles_update_own" ON public.cf_handles
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role')
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== CF_SNAPSHOTS POLICIES ========================

CREATE POLICY "cf_snapshots_select_own" ON public.cf_snapshots
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "cf_snapshots_insert_own" ON public.cf_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== GROUPS POLICIES ========================

CREATE POLICY "groups_select" ON public.groups
  FOR SELECT USING (
    type = 'college'
    OR EXISTS (SELECT 1 FROM public.group_memberships gm WHERE gm.group_id = id AND gm.user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

CREATE POLICY "groups_insert" ON public.groups
  FOR INSERT WITH CHECK (
    (type = 'friends' AND created_by = auth.uid())
    OR auth.role() = 'service_role'
  );

CREATE POLICY "groups_update" ON public.groups
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.group_memberships gm WHERE gm.group_id = id AND gm.user_id = auth.uid() AND gm.role = 'admin')
    OR auth.role() = 'service_role'
  );

CREATE POLICY "groups_delete" ON public.groups
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.group_memberships gm WHERE gm.group_id = id AND gm.user_id = auth.uid() AND gm.role = 'admin')
    OR auth.role() = 'service_role'
  );

-- ======================== GROUP_MEMBERSHIPS POLICIES ========================

CREATE POLICY "gm_select" ON public.group_memberships
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.group_memberships gm2 WHERE gm2.group_id = group_id AND gm2.user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

CREATE POLICY "gm_insert" ON public.group_memberships
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR auth.role() = 'service_role'
  );

CREATE POLICY "gm_update" ON public.group_memberships
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "gm_delete" ON public.group_memberships
  FOR DELETE USING (
    auth.role() = 'service_role'
    OR user_id = auth.uid()
  );

-- ======================== GROUP_INVITATIONS POLICIES ========================

CREATE POLICY "gi_select" ON public.group_invitations
  FOR SELECT USING (
    inviter_id = auth.uid() OR invitee_id = auth.uid() OR auth.role() = 'service_role'
  );

CREATE POLICY "gi_insert" ON public.group_invitations
  FOR INSERT WITH CHECK (
    inviter_id = auth.uid() OR auth.role() = 'service_role'
  );

CREATE POLICY "gi_update" ON public.group_invitations
  FOR UPDATE USING (
    inviter_id = auth.uid() OR invitee_id = auth.uid() OR auth.role() = 'service_role'
  );

CREATE POLICY "gi_delete" ON public.group_invitations
  FOR DELETE USING (
    inviter_id = auth.uid() OR auth.role() = 'service_role'
  );

-- ======================== PROBLEMS POLICIES ========================

CREATE POLICY "problems_select_active" ON public.problems
  FOR SELECT USING (is_active = true OR auth.role() = 'service_role');

CREATE POLICY "problems_admin" ON public.problems
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== PROBLEM_HINTS POLICIES ========================

CREATE POLICY "problem_hints_select" ON public.problem_hints
  FOR SELECT USING (true);

CREATE POLICY "problem_hints_admin" ON public.problem_hints
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== PROBLEM_HISTORY POLICIES ========================

CREATE POLICY "problem_history_select_own" ON public.problem_history
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "problem_history_insert_own" ON public.problem_history
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "problem_history_update_own" ON public.problem_history
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== USER_PROBLEMS POLICIES ========================

CREATE POLICY "user_problems_select_own" ON public.user_problems
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_problems_insert_own" ON public.user_problems
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_problems_update_own" ON public.user_problems
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_problems_delete_own" ON public.user_problems
  FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== CONTESTS POLICIES ========================

CREATE POLICY "contests_select" ON public.contests
  FOR SELECT USING (
    visibility = 'public'
    OR host_user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.contest_participants cp WHERE cp.contest_id = id AND cp.user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

CREATE POLICY "contests_insert" ON public.contests
  FOR INSERT WITH CHECK (host_user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "contests_update" ON public.contests
  FOR UPDATE USING (host_user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "contests_delete" ON public.contests
  FOR DELETE USING (host_user_id = auth.uid() OR auth.role() = 'service_role');

-- ======================== CONTEST_PARTICIPANTS POLICIES ========================

CREATE POLICY "cp_select" ON public.contest_participants
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.contests c WHERE c.id = contest_id AND (c.host_user_id = auth.uid() OR c.visibility = 'public'))
    OR auth.role() = 'service_role'
  );

CREATE POLICY "cp_insert" ON public.contest_participants
  FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "cp_delete" ON public.contest_participants
  FOR DELETE USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- ======================== CONTEST_PROBLEMS POLICIES ========================

CREATE POLICY "contest_problems_select" ON public.contest_problems
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.contests c WHERE c.id = contest_id AND (c.host_user_id = auth.uid() OR c.visibility = 'public'))
    OR EXISTS (SELECT 1 FROM public.contest_participants cp WHERE cp.contest_id = contest_id AND cp.user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

CREATE POLICY "contest_problems_admin" ON public.contest_problems
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== CONTEST_SUBMISSIONS POLICIES ========================

CREATE POLICY "cs_select" ON public.contest_submissions
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.contests c WHERE c.id = contest_id AND c.host_user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

CREATE POLICY "cs_insert" ON public.contest_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

-- ======================== CONTEST_RESULTS POLICIES ========================

CREATE POLICY "cr_select" ON public.contest_results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.contests c WHERE c.id = contest_id AND (c.host_user_id = auth.uid() OR c.visibility = 'public'))
    OR user_id = auth.uid()
    OR auth.role() = 'service_role'
  );

CREATE POLICY "cr_admin" ON public.contest_results
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== SUBSCRIPTIONS POLICIES ========================

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "subscriptions_insert_own" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "subscriptions_update_own" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== PURCHASES POLICIES ========================

CREATE POLICY "purchases_select_own" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "purchases_insert_own" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== PAYMENT_EVENTS POLICIES ========================

CREATE POLICY "payment_events_admin" ON public.payment_events
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== USER_SHEETS POLICIES ========================

CREATE POLICY "user_sheets_select_own" ON public.user_sheets
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_sheets_insert_own" ON public.user_sheets
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_sheets_update_own" ON public.user_sheets
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_sheets_delete_own" ON public.user_sheets
  FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== GROUP_CHALLENGES POLICIES ========================

CREATE POLICY "gc_select" ON public.group_challenges
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM public.group_memberships gm WHERE gm.group_id = public.group_challenges.group_id AND gm.user_id = auth.uid())
  );

CREATE POLICY "gc_insert" ON public.group_challenges
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR created_by = auth.uid());

CREATE POLICY "gc_update" ON public.group_challenges
  FOR UPDATE USING (auth.role() = 'service_role' OR created_by = auth.uid());

CREATE POLICY "gc_delete" ON public.group_challenges
  FOR DELETE USING (auth.role() = 'service_role' OR created_by = auth.uid());

-- ======================== GROUP_CHALLENGE_PROGRESS POLICIES ========================

CREATE POLICY "gcp_select" ON public.group_challenge_progress
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "gcp_insert" ON public.group_challenge_progress
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "gcp_update" ON public.group_challenge_progress
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== LEARNING_PATHS POLICIES ========================

CREATE POLICY "learning_paths_select" ON public.learning_paths
  FOR SELECT USING (is_active = true OR auth.role() = 'service_role');

CREATE POLICY "learning_paths_admin" ON public.learning_paths
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ======================== USER_LEARNING_PATH_PROGRESS POLICIES ========================

CREATE POLICY "ulpp_select_own" ON public.user_learning_path_progress
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "ulpp_insert_own" ON public.user_learning_path_progress
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "ulpp_update_own" ON public.user_learning_path_progress
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== PROBLEM_ATTEMPTS POLICIES ========================

CREATE POLICY "pa_select_own" ON public.problem_attempts
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "pa_insert_own" ON public.problem_attempts
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "pa_update_own" ON public.problem_attempts
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== USER_TOPIC_MASTERY POLICIES ========================

CREATE POLICY "utm_select_own" ON public.user_topic_mastery
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "utm_insert_own" ON public.user_topic_mastery
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "utm_update_own" ON public.user_topic_mastery
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== USER_SKILL_PROFILES POLICIES ========================

CREATE POLICY "usp_select_own" ON public.user_skill_profiles
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "usp_insert_own" ON public.user_skill_profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "usp_update_own" ON public.user_skill_profiles
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== PROBLEM_RECOMMENDATIONS POLICIES ========================

CREATE POLICY "pr_select_own" ON public.problem_recommendations
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "pr_insert_own" ON public.problem_recommendations
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "pr_update_own" ON public.problem_recommendations
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== SPACED_REPETITION_REVIEWS POLICIES ========================

CREATE POLICY "srr_select_own" ON public.spaced_repetition_reviews
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "srr_insert_own" ON public.spaced_repetition_reviews
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "srr_update_own" ON public.spaced_repetition_reviews
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = user_id);

-- ======================== ADAPTIVE_ITEMS POLICIES ========================

CREATE POLICY "ai_select_own" ON public.adaptive_items
  FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "ai_insert_own" ON public.adaptive_items
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

CREATE POLICY "ai_update_own" ON public.adaptive_items
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() = user_id);

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

-- ======================== AUTO-CREATE PROFILE ON SIGNUP ========================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- ======================== SUCCESS MESSAGE ========================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies and functions created successfully!';
  RAISE NOTICE 'Next step: Run the seed data script (optional) and performance indexes.';
END $$;
