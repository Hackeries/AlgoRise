-- ============================================================================
-- ALGORISE ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Script 2 of 4: Enables RLS and creates all security policies
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

-- ======================== HELPER FUNCTIONS ========================
-- These functions help avoid RLS recursion issues

CREATE OR REPLACE FUNCTION public.is_contest_participant(p_contest_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.contest_participants
        WHERE contest_id = p_contest_id AND user_id = p_user_id
    );
$$;

CREATE OR REPLACE FUNCTION public.get_contest_info(p_contest_id uuid)
RETURNS TABLE(visibility text, host_user_id uuid) LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT visibility::text, host_user_id FROM public.contests WHERE id = p_contest_id;
$$;

-- Helper function to check group membership without recursion
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.group_memberships
        WHERE group_id = p_group_id AND user_id = p_user_id
    );
$$;

-- Helper function to check if user is group admin
CREATE OR REPLACE FUNCTION public.is_group_admin(p_group_id uuid, p_user_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.group_memberships
        WHERE group_id = p_group_id AND user_id = p_user_id AND role = 'admin'
    );
$$;

-- Helper function to get group creator
CREATE OR REPLACE FUNCTION public.get_group_creator(p_group_id uuid)
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
    SELECT created_by FROM public.groups WHERE id = p_group_id;
$$;

GRANT EXECUTE ON FUNCTION public.is_contest_participant(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_contest_info(uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_group_admin(uuid, uuid) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_group_creator(uuid) TO authenticated, anon, service_role;

-- ======================== COLLEGES POLICIES ========================
DROP POLICY IF EXISTS "colleges_select" ON public.colleges;
DROP POLICY IF EXISTS "colleges_insert" ON public.colleges;
DROP POLICY IF EXISTS "colleges_admin" ON public.colleges;

CREATE POLICY "colleges_select" ON public.colleges FOR SELECT USING (true);
CREATE POLICY "colleges_insert" ON public.colleges FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');
CREATE POLICY "colleges_admin" ON public.colleges FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ======================== COMPANIES POLICIES ========================
DROP POLICY IF EXISTS "companies_select" ON public.companies;
DROP POLICY IF EXISTS "companies_insert" ON public.companies;
DROP POLICY IF EXISTS "companies_admin" ON public.companies;

CREATE POLICY "companies_select" ON public.companies FOR SELECT USING (true);
CREATE POLICY "companies_insert" ON public.companies FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');
CREATE POLICY "companies_admin" ON public.companies FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ======================== PROFILES POLICIES ========================
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
    USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE
    USING (auth.uid() = id OR auth.role() = 'service_role');

-- ======================== STREAKS POLICIES ========================
DROP POLICY IF EXISTS "streaks_select" ON public.streaks;
DROP POLICY IF EXISTS "streaks_insert" ON public.streaks;
DROP POLICY IF EXISTS "streaks_update" ON public.streaks;

CREATE POLICY "streaks_select" ON public.streaks FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "streaks_insert" ON public.streaks FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "streaks_update" ON public.streaks FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== CF_HANDLES POLICIES ========================
DROP POLICY IF EXISTS "cf_handles_select" ON public.cf_handles;
DROP POLICY IF EXISTS "cf_handles_insert" ON public.cf_handles;
DROP POLICY IF EXISTS "cf_handles_update" ON public.cf_handles;

CREATE POLICY "cf_handles_select" ON public.cf_handles FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "cf_handles_insert" ON public.cf_handles FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "cf_handles_update" ON public.cf_handles FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== CF_SNAPSHOTS POLICIES ========================
DROP POLICY IF EXISTS "cf_snapshots_select" ON public.cf_snapshots;
DROP POLICY IF EXISTS "cf_snapshots_insert" ON public.cf_snapshots;

CREATE POLICY "cf_snapshots_select" ON public.cf_snapshots FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "cf_snapshots_insert" ON public.cf_snapshots FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== GROUPS POLICIES ========================
DROP POLICY IF EXISTS "groups_select" ON public.groups;
DROP POLICY IF EXISTS "groups_insert" ON public.groups;
DROP POLICY IF EXISTS "groups_update" ON public.groups;
DROP POLICY IF EXISTS "groups_delete" ON public.groups;

CREATE POLICY "groups_select" ON public.groups FOR SELECT USING (
    type = 'college'
    OR created_by = auth.uid()
    OR public.is_group_member(id, auth.uid())
    OR auth.role() = 'service_role'
);

CREATE POLICY "groups_insert" ON public.groups FOR INSERT
    WITH CHECK (created_by = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "groups_update" ON public.groups FOR UPDATE USING (
    created_by = auth.uid()
    OR public.is_group_admin(id, auth.uid())
    OR auth.role() = 'service_role'
);

CREATE POLICY "groups_delete" ON public.groups FOR DELETE USING (
    created_by = auth.uid() OR auth.role() = 'service_role'
);

-- ======================== GROUP_MEMBERSHIPS POLICIES ========================
DROP POLICY IF EXISTS "gm_select" ON public.group_memberships;
DROP POLICY IF EXISTS "gm_insert" ON public.group_memberships;
DROP POLICY IF EXISTS "gm_delete" ON public.group_memberships;

-- Use helper function to avoid recursion
CREATE POLICY "gm_select" ON public.group_memberships FOR SELECT USING (
    user_id = auth.uid()
    OR public.get_group_creator(group_id) = auth.uid()
    OR auth.role() = 'service_role'
);

CREATE POLICY "gm_insert" ON public.group_memberships FOR INSERT
    WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "gm_delete" ON public.group_memberships FOR DELETE
    USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- ======================== GROUP_INVITATIONS POLICIES ========================
DROP POLICY IF EXISTS "gi_select" ON public.group_invitations;
DROP POLICY IF EXISTS "gi_insert" ON public.group_invitations;
DROP POLICY IF EXISTS "gi_update" ON public.group_invitations;
DROP POLICY IF EXISTS "gi_delete" ON public.group_invitations;

CREATE POLICY "gi_select" ON public.group_invitations FOR SELECT
    USING (inviter_id = auth.uid() OR invitee_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "gi_insert" ON public.group_invitations FOR INSERT
    WITH CHECK (inviter_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "gi_update" ON public.group_invitations FOR UPDATE
    USING (inviter_id = auth.uid() OR invitee_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "gi_delete" ON public.group_invitations FOR DELETE
    USING (inviter_id = auth.uid() OR auth.role() = 'service_role');

-- ======================== PROBLEMS POLICIES ========================
DROP POLICY IF EXISTS "problems_select" ON public.problems;
DROP POLICY IF EXISTS "problems_admin" ON public.problems;

CREATE POLICY "problems_select" ON public.problems FOR SELECT
    USING (is_active = true OR auth.role() = 'service_role');

CREATE POLICY "problems_admin" ON public.problems FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ======================== PROBLEM_HINTS POLICIES ========================
DROP POLICY IF EXISTS "problem_hints_select" ON public.problem_hints;
DROP POLICY IF EXISTS "problem_hints_admin" ON public.problem_hints;

CREATE POLICY "problem_hints_select" ON public.problem_hints FOR SELECT USING (true);
CREATE POLICY "problem_hints_admin" ON public.problem_hints FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ======================== PROBLEM_HISTORY POLICIES ========================
DROP POLICY IF EXISTS "problem_history_select" ON public.problem_history;
DROP POLICY IF EXISTS "problem_history_insert" ON public.problem_history;
DROP POLICY IF EXISTS "problem_history_update" ON public.problem_history;

CREATE POLICY "problem_history_select" ON public.problem_history FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "problem_history_insert" ON public.problem_history FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "problem_history_update" ON public.problem_history FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== USER_PROBLEMS POLICIES ========================
DROP POLICY IF EXISTS "user_problems_select" ON public.user_problems;
DROP POLICY IF EXISTS "user_problems_insert" ON public.user_problems;
DROP POLICY IF EXISTS "user_problems_update" ON public.user_problems;
DROP POLICY IF EXISTS "user_problems_delete" ON public.user_problems;

CREATE POLICY "user_problems_select" ON public.user_problems FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_problems_insert" ON public.user_problems FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_problems_update" ON public.user_problems FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_problems_delete" ON public.user_problems FOR DELETE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== CONTESTS POLICIES ========================
DROP POLICY IF EXISTS "contests_select" ON public.contests;
DROP POLICY IF EXISTS "contests_insert" ON public.contests;
DROP POLICY IF EXISTS "contests_update" ON public.contests;
DROP POLICY IF EXISTS "contests_delete" ON public.contests;

CREATE POLICY "contests_select" ON public.contests FOR SELECT USING (
    visibility = 'public'
    OR host_user_id = auth.uid()
    OR public.is_contest_participant(id, auth.uid())
    OR auth.role() = 'service_role'
);

CREATE POLICY "contests_insert" ON public.contests FOR INSERT
    WITH CHECK (host_user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "contests_update" ON public.contests FOR UPDATE
    USING (host_user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "contests_delete" ON public.contests FOR DELETE
    USING (host_user_id = auth.uid() OR auth.role() = 'service_role');

-- ======================== CONTEST_PARTICIPANTS POLICIES ========================
DROP POLICY IF EXISTS "cp_select" ON public.contest_participants;
DROP POLICY IF EXISTS "cp_insert" ON public.contest_participants;
DROP POLICY IF EXISTS "cp_delete" ON public.contest_participants;

CREATE POLICY "cp_select" ON public.contest_participants FOR SELECT USING (
    user_id = auth.uid()
    OR (SELECT visibility = 'public' FROM public.get_contest_info(contest_id))
    OR (SELECT host_user_id = auth.uid() FROM public.get_contest_info(contest_id))
    OR auth.role() = 'service_role'
);

CREATE POLICY "cp_insert" ON public.contest_participants FOR INSERT
    WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "cp_delete" ON public.contest_participants FOR DELETE
    USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- ======================== CONTEST_PROBLEMS POLICIES ========================
DROP POLICY IF EXISTS "contest_problems_select" ON public.contest_problems;
DROP POLICY IF EXISTS "contest_problems_admin" ON public.contest_problems;

CREATE POLICY "contest_problems_select" ON public.contest_problems FOR SELECT USING (
    (SELECT visibility = 'public' FROM public.get_contest_info(contest_id))
    OR (SELECT host_user_id = auth.uid() FROM public.get_contest_info(contest_id))
    OR public.is_contest_participant(contest_id, auth.uid())
    OR auth.role() = 'service_role'
);

CREATE POLICY "contest_problems_admin" ON public.contest_problems FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ======================== CONTEST_SUBMISSIONS POLICIES ========================
DROP POLICY IF EXISTS "cs_select" ON public.contest_submissions;
DROP POLICY IF EXISTS "cs_insert" ON public.contest_submissions;

CREATE POLICY "cs_select" ON public.contest_submissions FOR SELECT USING (
    user_id = auth.uid()
    OR (SELECT host_user_id = auth.uid() FROM public.get_contest_info(contest_id))
    OR auth.role() = 'service_role'
);

CREATE POLICY "cs_insert" ON public.contest_submissions FOR INSERT
    WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

-- ======================== CONTEST_RESULTS POLICIES ========================
DROP POLICY IF EXISTS "cr_select" ON public.contest_results;
DROP POLICY IF EXISTS "cr_admin" ON public.contest_results;

CREATE POLICY "cr_select" ON public.contest_results FOR SELECT USING (
    user_id = auth.uid()
    OR (SELECT visibility = 'public' FROM public.get_contest_info(contest_id))
    OR (SELECT host_user_id = auth.uid() FROM public.get_contest_info(contest_id))
    OR auth.role() = 'service_role'
);

CREATE POLICY "cr_admin" ON public.contest_results FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ======================== SUBSCRIPTIONS POLICIES ========================
DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update" ON public.subscriptions;

CREATE POLICY "subscriptions_select" ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "subscriptions_insert" ON public.subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "subscriptions_update" ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== PURCHASES POLICIES ========================
DROP POLICY IF EXISTS "purchases_select" ON public.purchases;
DROP POLICY IF EXISTS "purchases_insert" ON public.purchases;

CREATE POLICY "purchases_select" ON public.purchases FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "purchases_insert" ON public.purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== PAYMENT_EVENTS POLICIES ========================
DROP POLICY IF EXISTS "payment_events_admin" ON public.payment_events;

CREATE POLICY "payment_events_admin" ON public.payment_events FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ======================== USER_SHEETS POLICIES ========================
DROP POLICY IF EXISTS "user_sheets_select" ON public.user_sheets;
DROP POLICY IF EXISTS "user_sheets_insert" ON public.user_sheets;
DROP POLICY IF EXISTS "user_sheets_update" ON public.user_sheets;
DROP POLICY IF EXISTS "user_sheets_delete" ON public.user_sheets;

CREATE POLICY "user_sheets_select" ON public.user_sheets FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_sheets_insert" ON public.user_sheets FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_sheets_update" ON public.user_sheets FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "user_sheets_delete" ON public.user_sheets FOR DELETE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== GROUP_CHALLENGES POLICIES ========================
DROP POLICY IF EXISTS "gc_select" ON public.group_challenges;
DROP POLICY IF EXISTS "gc_insert" ON public.group_challenges;
DROP POLICY IF EXISTS "gc_update" ON public.group_challenges;
DROP POLICY IF EXISTS "gc_delete" ON public.group_challenges;

CREATE POLICY "gc_select" ON public.group_challenges FOR SELECT USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.group_memberships gm WHERE gm.group_id = public.group_challenges.group_id AND gm.user_id = auth.uid())
    OR auth.role() = 'service_role'
);

CREATE POLICY "gc_insert" ON public.group_challenges FOR INSERT
    WITH CHECK (created_by = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "gc_update" ON public.group_challenges FOR UPDATE
    USING (created_by = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "gc_delete" ON public.group_challenges FOR DELETE
    USING (created_by = auth.uid() OR auth.role() = 'service_role');

-- ======================== GROUP_CHALLENGE_PROGRESS POLICIES ========================
DROP POLICY IF EXISTS "gcp_select" ON public.group_challenge_progress;
DROP POLICY IF EXISTS "gcp_insert" ON public.group_challenge_progress;
DROP POLICY IF EXISTS "gcp_update" ON public.group_challenge_progress;

CREATE POLICY "gcp_select" ON public.group_challenge_progress FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "gcp_insert" ON public.group_challenge_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "gcp_update" ON public.group_challenge_progress FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== LEARNING_PATHS POLICIES ========================
DROP POLICY IF EXISTS "learning_paths_select" ON public.learning_paths;
DROP POLICY IF EXISTS "learning_paths_admin" ON public.learning_paths;

CREATE POLICY "learning_paths_select" ON public.learning_paths FOR SELECT
    USING (is_active = true OR auth.role() = 'service_role');

CREATE POLICY "learning_paths_admin" ON public.learning_paths FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ======================== USER_LEARNING_PATH_PROGRESS POLICIES ========================
DROP POLICY IF EXISTS "ulpp_select" ON public.user_learning_path_progress;
DROP POLICY IF EXISTS "ulpp_insert" ON public.user_learning_path_progress;
DROP POLICY IF EXISTS "ulpp_update" ON public.user_learning_path_progress;

CREATE POLICY "ulpp_select" ON public.user_learning_path_progress FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "ulpp_insert" ON public.user_learning_path_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "ulpp_update" ON public.user_learning_path_progress FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== PROBLEM_ATTEMPTS POLICIES ========================
DROP POLICY IF EXISTS "pa_select" ON public.problem_attempts;
DROP POLICY IF EXISTS "pa_insert" ON public.problem_attempts;
DROP POLICY IF EXISTS "pa_update" ON public.problem_attempts;

CREATE POLICY "pa_select" ON public.problem_attempts FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "pa_insert" ON public.problem_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "pa_update" ON public.problem_attempts FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== USER_TOPIC_MASTERY POLICIES ========================
DROP POLICY IF EXISTS "utm_select" ON public.user_topic_mastery;
DROP POLICY IF EXISTS "utm_insert" ON public.user_topic_mastery;
DROP POLICY IF EXISTS "utm_update" ON public.user_topic_mastery;

CREATE POLICY "utm_select" ON public.user_topic_mastery FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "utm_insert" ON public.user_topic_mastery FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "utm_update" ON public.user_topic_mastery FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== USER_SKILL_PROFILES POLICIES ========================
DROP POLICY IF EXISTS "usp_select" ON public.user_skill_profiles;
DROP POLICY IF EXISTS "usp_insert" ON public.user_skill_profiles;
DROP POLICY IF EXISTS "usp_update" ON public.user_skill_profiles;

CREATE POLICY "usp_select" ON public.user_skill_profiles FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "usp_insert" ON public.user_skill_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "usp_update" ON public.user_skill_profiles FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== PROBLEM_RECOMMENDATIONS POLICIES ========================
DROP POLICY IF EXISTS "pr_select" ON public.problem_recommendations;
DROP POLICY IF EXISTS "pr_insert" ON public.problem_recommendations;
DROP POLICY IF EXISTS "pr_update" ON public.problem_recommendations;

CREATE POLICY "pr_select" ON public.problem_recommendations FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "pr_insert" ON public.problem_recommendations FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "pr_update" ON public.problem_recommendations FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== SPACED_REPETITION_REVIEWS POLICIES ========================
DROP POLICY IF EXISTS "srr_select" ON public.spaced_repetition_reviews;
DROP POLICY IF EXISTS "srr_insert" ON public.spaced_repetition_reviews;
DROP POLICY IF EXISTS "srr_update" ON public.spaced_repetition_reviews;

CREATE POLICY "srr_select" ON public.spaced_repetition_reviews FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "srr_insert" ON public.spaced_repetition_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "srr_update" ON public.spaced_repetition_reviews FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== ADAPTIVE_ITEMS POLICIES ========================
DROP POLICY IF EXISTS "ai_select" ON public.adaptive_items;
DROP POLICY IF EXISTS "ai_insert" ON public.adaptive_items;
DROP POLICY IF EXISTS "ai_update" ON public.adaptive_items;

CREATE POLICY "ai_select" ON public.adaptive_items FOR SELECT
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "ai_insert" ON public.adaptive_items FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "ai_update" ON public.adaptive_items FOR UPDATE
    USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ======================== SUCCESS ========================
DO $$ BEGIN
    RAISE NOTICE '✅ RLS policies created successfully!';
    RAISE NOTICE 'Next: Run 03_functions_and_triggers.sql';
END $$;
