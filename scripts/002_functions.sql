-- ============================================================================
-- ALGORISE HELPER FUNCTIONS - Production Ready (50k+ Users)
-- ============================================================================
-- Description: All helper functions, triggers, and stored procedures
-- Run AFTER: 000_master_schema.sql, 001_rls_policies.sql
-- ============================================================================

BEGIN;

-- ======================== STREAK FUNCTIONS ========================

CREATE OR REPLACE FUNCTION public.touch_streak(
  p_user_id uuid,
  p_activity_date date DEFAULT (timezone('utc', now()))::date
)
RETURNS public.streaks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.streaks%rowtype;
  v_current int;
  v_longest int;
  v_diff int;
BEGIN
  IF auth.role() <> 'service_role' AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'insufficient_privilege';
  END IF;

  INSERT INTO public.streaks AS t (user_id, current_streak, last_active_day, longest_streak)
  VALUES (p_user_id, 1, p_activity_date, 1)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO s FROM public.streaks WHERE user_id = p_user_id FOR UPDATE;

  IF s.last_active_day IS NULL THEN
    v_current := 1;
    v_longest := greatest(1, coalesce(s.longest_streak, 0));
    UPDATE public.streaks
       SET current_streak = v_current,
           longest_streak = v_longest,
           last_active_day = p_activity_date
     WHERE user_id = p_user_id
     RETURNING * INTO s;
    RETURN s;
  END IF;

  IF p_activity_date <= s.last_active_day THEN
    RETURN s;
  END IF;

  v_diff := p_activity_date - s.last_active_day;

  IF v_diff = 1 THEN
    v_current := s.current_streak + 1;
  ELSE
    v_current := 1;
  END IF;

  v_longest := greatest(coalesce(s.longest_streak, 0), v_current);

  UPDATE public.streaks
     SET current_streak = v_current,
         longest_streak = v_longest,
         last_active_day = p_activity_date
   WHERE user_id = p_user_id
   RETURNING * INTO s;

  RETURN s;
END;
$$;

-- ======================== COLLEGE FUNCTIONS ========================

CREATE OR REPLACE FUNCTION public.upsert_college(
  p_name text,
  p_country text DEFAULT 'India'
)
RETURNS public.colleges
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.colleges%rowtype;
BEGIN
  IF p_name IS NULL OR length(trim(p_name)) = 0 THEN
    RAISE EXCEPTION 'college name required';
  END IF;

  p_name := trim(p_name);
  p_country := trim(coalesce(p_country, 'India'));

  SELECT * INTO v_row FROM public.colleges
  WHERE lower(name) = lower(p_name) AND lower(country) = lower(p_country)
  LIMIT 1;

  IF found THEN
    RETURN v_row;
  END IF;

  INSERT INTO public.colleges (name, country)
  VALUES (p_name, p_country)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- ======================== CF HANDLE FUNCTIONS ========================

CREATE OR REPLACE FUNCTION public.enforce_handle_immutability()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.verified = true
     AND NEW.handle IS DISTINCT FROM OLD.handle
     AND auth.role() <> 'service_role'
  THEN
    RAISE EXCEPTION 'handle immutable after verification';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cf_handles_handle_immutable ON public.cf_handles;
CREATE TRIGGER trg_cf_handles_handle_immutable
BEFORE UPDATE OF handle ON public.cf_handles
FOR EACH ROW EXECUTE FUNCTION public.enforce_handle_immutability();

CREATE OR REPLACE FUNCTION public.request_cf_handle_verification(
  p_user_id uuid,
  p_handle text,
  p_ttl_minutes int DEFAULT 15
)
RETURNS public.cf_handles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.cf_handles%rowtype;
  v_token text;
BEGIN
  IF auth.role() <> 'service_role' AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'insufficient_privilege';
  END IF;

  IF p_ttl_minutes < 1 OR p_ttl_minutes > 120 THEN
    RAISE EXCEPTION 'ttl out of bounds (1..120)';
  END IF;

  v_token := replace(gen_random_uuid()::text, '-', '');

  INSERT INTO public.cf_handles (user_id, handle, verified, verification_token, expires_at)
  VALUES (p_user_id, p_handle, false, v_token, timezone('utc', now()) + (p_ttl_minutes || ' minutes')::interval)
  ON CONFLICT (user_id) DO UPDATE
    SET handle = EXCLUDED.handle,
        verified = false,
        verification_token = EXCLUDED.verification_token,
        expires_at = EXCLUDED.expires_at;

  SELECT * INTO v_row FROM public.cf_handles WHERE user_id = p_user_id;
  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_cf_handle(
  p_user_id uuid,
  p_token text
)
RETURNS public.cf_handles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.cf_handles%rowtype;
BEGIN
  IF auth.role() <> 'service_role' AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'insufficient_privilege';
  END IF;

  SELECT * INTO v_row FROM public.cf_handles WHERE user_id = p_user_id FOR UPDATE;

  IF NOT found THEN
    RAISE EXCEPTION 'handle row not found';
  END IF;

  IF v_row.verified THEN
    RETURN v_row;
  END IF;

  IF v_row.verification_token IS NULL OR v_row.verification_token <> p_token THEN
    RAISE EXCEPTION 'invalid token';
  END IF;

  IF v_row.expires_at IS NOT NULL AND v_row.expires_at < timezone('utc', now()) THEN
    RAISE EXCEPTION 'token expired';
  END IF;

  UPDATE public.cf_handles
     SET verified = true,
         verification_token = null,
         expires_at = null
   WHERE user_id = p_user_id
   RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.touch_cf_handle_sync(p_user_id uuid)
RETURNS public.cf_handles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.cf_handles%rowtype;
BEGIN
  IF auth.role() <> 'service_role' AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'insufficient_privilege';
  END IF;

  UPDATE public.cf_handles
     SET last_sync_at = timezone('utc', now())
   WHERE user_id = p_user_id
   RETURNING * INTO v_row;

  IF NOT found THEN
    RAISE EXCEPTION 'handle row not found';
  END IF;

  RETURN v_row;
END;
$$;

-- ======================== GROUP FUNCTIONS ========================

CREATE OR REPLACE FUNCTION public.enforce_last_admin()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  remaining_admins int;
BEGIN
  IF tg_table_name = 'group_memberships' THEN
    IF (tg_op = 'DELETE' AND OLD.role = 'admin')
       OR (tg_op = 'UPDATE' AND OLD.role = 'admin' AND NEW.role <> 'admin') THEN
      SELECT count(*) INTO remaining_admins
      FROM public.group_memberships
      WHERE group_id = OLD.group_id
        AND id <> OLD.id
        AND role = 'admin';
      IF remaining_admins = 0 THEN
        RAISE EXCEPTION 'cannot remove last admin from group %', OLD.group_id;
      END IF;
    END IF;
  END IF;
  RETURN CASE WHEN tg_op = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

DROP TRIGGER IF EXISTS trg_gm_enforce_last_admin ON public.group_memberships;
CREATE TRIGGER trg_gm_enforce_last_admin
BEFORE DELETE OR UPDATE OF role ON public.group_memberships
FOR EACH ROW EXECUTE FUNCTION public.enforce_last_admin();

CREATE OR REPLACE FUNCTION public.create_group_with_admin(
  p_creator uuid,
  p_name text,
  p_type group_type,
  p_college_id uuid DEFAULT null
)
RETURNS public.groups
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group public.groups%rowtype;
BEGIN
  IF auth.role() <> 'service_role' AND auth.uid() <> p_creator THEN
    RAISE EXCEPTION 'insufficient_privilege';
  END IF;

  IF p_type IS NULL THEN
    RAISE EXCEPTION 'group type required';
  END IF;

  IF length(trim(coalesce(p_name,''))) = 0 THEN
    RAISE EXCEPTION 'group name required';
  END IF;

  INSERT INTO public.groups (name, type, college_id, created_by)
  VALUES (trim(p_name), p_type, p_college_id, p_creator)
  RETURNING * INTO v_group;

  INSERT INTO public.group_memberships (group_id, user_id, role)
  VALUES (v_group.id, p_creator, 'admin');

  RETURN v_group;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_member_to_group(
  p_actor uuid,
  p_group_id uuid,
  p_user_id uuid,
  p_role group_role DEFAULT 'member'
)
RETURNS public.group_memberships
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_membership public.group_memberships%rowtype;
BEGIN
  IF auth.role() <> 'service_role'
     AND NOT EXISTS (
       SELECT 1 FROM public.group_memberships gm
       WHERE gm.group_id = p_group_id AND gm.user_id = p_actor AND gm.role = 'admin'
     ) THEN
    RAISE EXCEPTION 'actor not admin of group';
  END IF;

  INSERT INTO public.group_memberships (group_id, user_id, role)
  VALUES (p_group_id, p_user_id, p_role)
  ON CONFLICT (group_id, user_id) DO UPDATE
    SET role = EXCLUDED.role
  RETURNING * INTO v_membership;

  RETURN v_membership;
END;
$$;

-- ======================== PROBLEM STATISTICS FUNCTIONS ========================

CREATE OR REPLACE FUNCTION public.refresh_problem_statistics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_problem_id uuid := coalesce(NEW.problem_id, OLD.problem_id);
  v_solved integer := 0;
  v_attempts integer := 0;
BEGIN
  IF v_problem_id IS NULL THEN
    RETURN coalesce(NEW, OLD);
  END IF;

  SELECT
    count(*) FILTER (WHERE solved_at IS NOT NULL),
    coalesce(sum(coalesce(attempt_count, 0)), 0)
  INTO v_solved, v_attempts
  FROM public.problem_history
  WHERE problem_id = v_problem_id;

  UPDATE public.problems
     SET solved_count = v_solved,
         attempt_count = v_attempts,
         successful_submission_rate = CASE WHEN v_attempts > 0 THEN (v_solved::numeric / v_attempts::numeric) * 100 ELSE 0 END,
         updated_at = timezone('utc', now())
   WHERE id = v_problem_id;

  RETURN coalesce(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_problem_stats ON public.problem_history;
CREATE TRIGGER trigger_update_problem_stats
AFTER INSERT OR UPDATE OR DELETE ON public.problem_history
FOR EACH ROW EXECUTE FUNCTION public.refresh_problem_statistics();

CREATE OR REPLACE FUNCTION public.get_matchmaking_problems(
  p_user_id uuid,
  p_target_rating integer,
  p_rating_range integer DEFAULT 200,
  p_count integer DEFAULT 2,
  p_days_threshold integer DEFAULT 7
)
RETURNS TABLE (
  problem_id uuid,
  platform text,
  external_id text,
  title text,
  difficulty_rating integer,
  topic text[],
  time_limit integer,
  memory_limit integer
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.platform,
    p.external_id,
    p.title,
    p.difficulty_rating,
    p.topic,
    p.time_limit,
    p.memory_limit
  FROM public.problems p
  WHERE
    p.is_active = true
    AND p.difficulty_rating BETWEEN (p_target_rating - p_rating_range) AND (p_target_rating + p_rating_range)
    AND p.id NOT IN (
      SELECT ph.problem_id
      FROM public.problem_history ph
      WHERE ph.user_id = p_user_id
        AND ph.first_seen_at > timezone('utc', now()) - (interval '1 day' * p_days_threshold)
    )
  ORDER BY random()
  LIMIT p_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_problem_view(
  p_user_id uuid,
  p_problem_id uuid,
  p_battle_id uuid DEFAULT null,
  p_battle_round_id uuid DEFAULT null
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.problem_history (
    user_id, problem_id, battle_id, battle_round_id, first_seen_at, view_count
  )
  VALUES (p_user_id, p_problem_id, p_battle_id, p_battle_round_id, timezone('utc', now()), 1)
  ON CONFLICT (user_id, problem_id)
  DO UPDATE SET
    view_count = public.problem_history.view_count + 1,
    last_attempted_at = timezone('utc', now());
END;
$$;

-- ======================== SUBSCRIPTION FUNCTIONS ========================

CREATE OR REPLACE FUNCTION public.activate_subscription(
  p_user_id uuid,
  p_subscription_id uuid,
  p_plan_code text,
  p_end_date timestamptz DEFAULT null
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows int;
BEGIN
  UPDATE public.subscriptions
     SET status = 'active',
         payment_status = 'completed',
         updated_at = timezone('utc', now())
   WHERE id = p_subscription_id AND user_id = p_user_id;
  GET DIAGNOSTICS v_rows = ROW_COUNT;

  UPDATE public.profiles
     SET subscription_plan = p_plan_code,
         subscription_status = 'active',
         subscription_start = timezone('utc', now()),
         subscription_end = p_end_date,
         updated_at = timezone('utc', now())
   WHERE id = p_user_id;

  RETURN v_rows > 0;
EXCEPTION
  WHEN others THEN
    RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.expire_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.subscriptions
     SET status = 'expired',
         updated_at = timezone('utc', now())
   WHERE status = 'active'
     AND end_date IS NOT NULL
     AND end_date < timezone('utc', now());

  UPDATE public.profiles
     SET subscription_status = 'expired',
         updated_at = timezone('utc', now())
   WHERE subscription_status = 'active'
     AND subscription_end IS NOT NULL
     AND subscription_end < timezone('utc', now());
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_subscription(p_user_id uuid)
RETURNS TABLE (
  plan_code text,
  plan_name text,
  status text,
  start_date timestamptz,
  end_date timestamptz,
  is_lifetime boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.subscription_plan AS plan_code,
    s.plan_name,
    p.subscription_status AS status,
    p.subscription_start AS start_date,
    p.subscription_end AS end_date,
    (p.subscription_end IS NULL) AS is_lifetime
  FROM public.profiles p
  LEFT JOIN public.subscriptions s
    ON s.user_id = p.id AND s.status = 'active'
  WHERE p.id = p_user_id
  LIMIT 1;
END;
$$;

-- ======================== ADAPTIVE LEARNING FUNCTIONS ========================

CREATE OR REPLACE FUNCTION public.update_user_skill_profile()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_skill_profiles (user_id, last_activity_at, total_problems_attempted, created_at, updated_at)
  VALUES (NEW.user_id, timezone('utc', now()), 1, timezone('utc', now()), timezone('utc', now()))
  ON CONFLICT (user_id) DO UPDATE SET
    total_problems_attempted = public.user_skill_profiles.total_problems_attempted + 1,
    total_problems_solved = CASE WHEN NEW.status = 'solved'
      THEN public.user_skill_profiles.total_problems_solved + 1
      ELSE public.user_skill_profiles.total_problems_solved END,
    last_activity_at = timezone('utc', now()),
    updated_at = timezone('utc', now());

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_skill_profile ON public.problem_attempts;
CREATE TRIGGER trigger_update_skill_profile
AFTER INSERT ON public.problem_attempts
FOR EACH ROW EXECUTE FUNCTION public.update_user_skill_profile();

CREATE OR REPLACE FUNCTION public.update_topic_mastery()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  tag text;
BEGIN
  IF NEW.tags IS NOT NULL THEN
    FOREACH tag IN ARRAY NEW.tags
    LOOP
      CONTINUE WHEN tag IS NULL OR btrim(tag) = '';
      INSERT INTO public.user_topic_mastery
        (user_id, topic, problems_attempted, problems_solved, last_practiced_at, created_at, updated_at)
      VALUES
        (NEW.user_id, tag, 1, CASE WHEN NEW.status = 'solved' THEN 1 ELSE 0 END, timezone('utc', now()), timezone('utc', now()), timezone('utc', now()))
      ON CONFLICT (user_id, topic) DO UPDATE SET
        problems_attempted = public.user_topic_mastery.problems_attempted + 1,
        problems_solved = CASE WHEN NEW.status = 'solved'
          THEN public.user_topic_mastery.problems_solved + 1
          ELSE public.user_topic_mastery.problems_solved END,
        success_rate = CASE
          WHEN public.user_topic_mastery.problems_attempted + 1 > 0 THEN
            (public.user_topic_mastery.problems_solved + CASE WHEN NEW.status = 'solved' THEN 1 ELSE 0 END)::real /
            (public.user_topic_mastery.problems_attempted + 1)::real
          ELSE 0.0 END,
        last_practiced_at = timezone('utc', now()),
        updated_at = timezone('utc', now());
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_topic_mastery ON public.problem_attempts;
CREATE TRIGGER trigger_update_topic_mastery
AFTER INSERT ON public.problem_attempts
FOR EACH ROW EXECUTE FUNCTION public.update_topic_mastery();

-- ======================== GROUP CHALLENGE FUNCTIONS ========================

CREATE OR REPLACE FUNCTION public.auto_update_group_challenge_status()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_all_completed boolean;
BEGIN
  IF NEW.status = 'active' AND NEW.end_date < (timezone('utc', now()))::date THEN
    NEW.status := 'expired';
  END IF;

  IF NEW.status = 'active' THEN
    SELECT bool_and(completed) INTO v_all_completed
    FROM public.group_challenge_progress
    WHERE challenge_id = NEW.id;

    IF v_all_completed IS true AND v_all_completed IS NOT NULL THEN
      NEW.status := 'completed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_group_challenges_auto_status ON public.group_challenges;
CREATE TRIGGER trg_group_challenges_auto_status
BEFORE UPDATE ON public.group_challenges
FOR EACH ROW EXECUTE FUNCTION public.auto_update_group_challenge_status();

CREATE OR REPLACE FUNCTION public.auto_complete_progress()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_target int;
BEGIN
  SELECT target_count INTO v_target
  FROM public.group_challenges
  WHERE id = NEW.challenge_id;

  IF v_target IS NOT NULL THEN
    NEW.completed := (NEW.current_count >= v_target);
  END IF;

  NEW.last_updated := timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_group_challenge_progress_auto_complete ON public.group_challenge_progress;
CREATE TRIGGER trg_group_challenge_progress_auto_complete
BEFORE UPDATE ON public.group_challenge_progress
FOR EACH ROW EXECUTE FUNCTION public.auto_complete_progress();

CREATE OR REPLACE FUNCTION public.refresh_group_challenge_progress(p_challenge_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  challenge record;
BEGIN
  SELECT * INTO challenge FROM public.group_challenges WHERE id = p_challenge_id;
  IF NOT found THEN
    RAISE EXCEPTION 'Challenge % not found', p_challenge_id;
  END IF;

  UPDATE public.group_challenge_progress
     SET completed = (current_count >= challenge.target_count),
         last_updated = timezone('utc', now()),
         updated_at = timezone('utc', now())
   WHERE challenge_id = p_challenge_id;

  UPDATE public.group_challenges
     SET updated_at = timezone('utc', now())
   WHERE id = p_challenge_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_group_challenge_progress(
  p_challenge_id uuid,
  p_user_id uuid,
  p_increment int DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target int;
BEGIN
  IF p_increment <= 0 THEN
    RAISE EXCEPTION 'Increment must be positive';
  END IF;

  SELECT target_count INTO v_target
  FROM public.group_challenges
  WHERE id = p_challenge_id;

  IF v_target IS NULL THEN
    RAISE EXCEPTION 'Challenge % not found', p_challenge_id;
  END IF;

  INSERT INTO public.group_challenge_progress (challenge_id, user_id, current_count, completed, last_updated, created_at, updated_at)
  VALUES (p_challenge_id, p_user_id, p_increment, p_increment >= v_target, timezone('utc', now()), timezone('utc', now()), timezone('utc', now()))
  ON CONFLICT (challenge_id, user_id) DO UPDATE SET
    current_count = public.group_challenge_progress.current_count + p_increment,
    completed = (public.group_challenge_progress.current_count + p_increment) >= v_target,
    last_updated = timezone('utc', now()),
    updated_at = timezone('utc', now());

  UPDATE public.group_challenges
     SET updated_at = timezone('utc', now())
   WHERE id = p_challenge_id;
END;
$$;

-- ======================== GRANTS ========================

DO $$
BEGIN
  -- Streak functions
  GRANT EXECUTE ON FUNCTION public.touch_streak(uuid, date) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.touch_streak(uuid, date) TO service_role;
  
  -- College functions
  GRANT EXECUTE ON FUNCTION public.upsert_college(text, text) TO service_role;
  
  -- CF handle functions
  GRANT EXECUTE ON FUNCTION public.request_cf_handle_verification(uuid, text, int) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.verify_cf_handle(uuid, text) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.touch_cf_handle_sync(uuid) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.request_cf_handle_verification(uuid, text, int) TO service_role;
  GRANT EXECUTE ON FUNCTION public.verify_cf_handle(uuid, text) TO service_role;
  GRANT EXECUTE ON FUNCTION public.touch_cf_handle_sync(uuid) TO service_role;
  
  -- Group functions
  GRANT EXECUTE ON FUNCTION public.create_group_with_admin(uuid, text, group_type, uuid) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.add_member_to_group(uuid, uuid, uuid, group_role) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.create_group_with_admin(uuid, text, group_type, uuid) TO service_role;
  GRANT EXECUTE ON FUNCTION public.add_member_to_group(uuid, uuid, uuid, group_role) TO service_role;
  
  -- Group challenge functions
  GRANT EXECUTE ON FUNCTION public.refresh_group_challenge_progress(uuid) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.increment_group_challenge_progress(uuid, uuid, int) TO authenticated;
  
EXCEPTION WHEN undefined_object THEN NULL;
END$$;

-- ======================== ANALYTICS VIEW ========================

CREATE OR REPLACE VIEW public.subscription_analytics AS
SELECT 
  plan_code,
  count(*) AS total_subscriptions,
  count(*) FILTER (WHERE status = 'active') AS active_subscriptions,
  count(*) FILTER (WHERE status = 'expired') AS expired_subscriptions,
  sum(amount) FILTER (WHERE payment_status = 'completed')::bigint AS total_revenue,
  avg(amount) FILTER (WHERE payment_status = 'completed')::numeric AS average_revenue
FROM public.subscriptions
GROUP BY plan_code;

COMMIT;

-- ============================================================================
-- END OF FUNCTIONS
-- ============================================================================
