-- ============================================================================
-- ALGORISE MASTER SCHEMA - Production Ready (50k+ Users)
-- ============================================================================
-- Version: 1.0.0
-- Description: Consolidated, idempotent database schema for AlgoRise platform
-- 
-- USAGE:
--   Run this file once to set up the complete database schema.
--   Safe to re-run (all operations are idempotent).
--
-- TABLES:
--   1. Core: profiles, streaks, colleges, companies
--   2. Competitive: cf_handles, cf_snapshots
--   3. Problems: problems, problem_hints, problem_history, user_problems
--   4. Learning: adaptive_items, learning_paths, user_learning_path_progress,
--                problem_attempts, user_topic_mastery, user_skill_profiles,
--                problem_recommendations, spaced_repetition_reviews
--   5. Social: groups, group_memberships, group_invitations, group_challenges
--   6. Contests: contests, contest_participants, contest_problems, 
--                contest_submissions, contest_results
--   7. Commerce: subscriptions, purchases, payment_events
--   8. Sheets: user_sheets
-- ============================================================================

BEGIN;

-- ======================== EXTENSIONS ========================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ======================== SHARED UTILITY FUNCTIONS ========================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := timezone('utc', now());
  RETURN NEW;
END;
$$;

-- Alias for backward compatibility
CREATE OR REPLACE FUNCTION public.set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := timezone('utc', now());
  RETURN NEW;
END;
$$;

-- ======================== ENUM TYPES ========================

DO $$
BEGIN
  -- Profile enums
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_status') THEN
    CREATE TYPE profile_status AS ENUM ('student', 'working');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'degree_type_enum') THEN
    CREATE TYPE degree_type_enum AS ENUM (
      'high_school', 'associate', 'bachelor', 'master', 
      'doctorate', 'bootcamp', 'other'
    );
  END IF;

  -- Group enums
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'group_type') THEN
    CREATE TYPE group_type AS ENUM ('college', 'friends');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'group_role') THEN
    CREATE TYPE group_role AS ENUM ('member', 'admin');
  END IF;

  -- Contest enums
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contest_visibility') THEN
    CREATE TYPE contest_visibility AS ENUM ('private', 'public');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contest_status') THEN
    CREATE TYPE contest_status AS ENUM ('draft', 'upcoming', 'running', 'ended');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contest_mode') THEN
    CREATE TYPE contest_mode AS ENUM ('practice', 'icpc');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
    CREATE TYPE submission_status AS ENUM ('solved', 'failed');
  END IF;
END$$;

-- ======================== 1. COLLEGES TABLE ========================

CREATE TABLE IF NOT EXISTS public.colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL DEFAULT 'India',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  CONSTRAINT colleges_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT colleges_country_not_blank CHECK (length(trim(country)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_colleges_name_country_ci 
  ON public.colleges (lower(name), lower(country));
CREATE INDEX IF NOT EXISTS idx_colleges_country ON public.colleges (lower(country));
CREATE INDEX IF NOT EXISTS idx_colleges_name_trgm ON public.colleges USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_colleges_lower_name ON public.colleges (lower(name));

DROP TRIGGER IF EXISTS trg_colleges_updated_at ON public.colleges;
CREATE TRIGGER trg_colleges_updated_at
  BEFORE UPDATE ON public.colleges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 2. COMPANIES TABLE ========================

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  CONSTRAINT companies_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_companies_lower_name ON public.companies (lower(name));

DROP TRIGGER IF EXISTS trg_companies_updated_at ON public.companies;
CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 3. PROFILES TABLE ========================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  name text,
  profile_image_url text,
  show_profile_image boolean NOT NULL DEFAULT true,
  
  -- Status
  status profile_status,
  degree_type degree_type_enum,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  custom_company text,
  college_id uuid REFERENCES public.colleges(id) ON DELETE SET NULL,
  year text,
  
  -- Preferences
  preferred_language text,
  programming_languages text[],
  
  -- Platform handles
  codeforces_handle text,
  leetcode_handle text,
  codechef_handle text,
  
  -- Subscription
  subscription_plan text NOT NULL DEFAULT 'free',
  subscription_status text NOT NULL DEFAULT 'active',
  subscription_start timestamptz,
  subscription_end timestamptz,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  -- Constraints
  CONSTRAINT company_exclusive_check CHECK (company_id IS NULL OR custom_company IS NULL),
  CONSTRAINT programming_languages_len_check CHECK (programming_languages IS NULL OR cardinality(programming_languages) <= 50),
  CONSTRAINT valid_subscription_plan CHECK (subscription_plan IN ('free', 'entry-gate', 'core-builder', 'algorithmic-ascend', 'competitive-forge', 'master-craft')),
  CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('active', 'expired', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_college_id ON public.profiles(college_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON public.profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end ON public.profiles(subscription_end);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 4. STREAKS TABLE ========================

CREATE TABLE IF NOT EXISTS public.streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  last_active_day date,
  longest_streak integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  CONSTRAINT streaks_nonnegative CHECK (current_streak >= 0 AND longest_streak >= 0),
  CONSTRAINT streaks_longest_ge_current CHECK (longest_streak >= current_streak),
  CONSTRAINT streaks_last_active_not_future CHECK (last_active_day IS NULL OR last_active_day <= (timezone('utc', now()))::date)
);

CREATE INDEX IF NOT EXISTS idx_streaks_last_active_day ON public.streaks(last_active_day);
CREATE INDEX IF NOT EXISTS idx_streaks_current_streak ON public.streaks(current_streak DESC);

DROP TRIGGER IF EXISTS trg_streaks_updated_at ON public.streaks;
CREATE TRIGGER trg_streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 5. CF_HANDLES TABLE ========================

CREATE TABLE IF NOT EXISTS public.cf_handles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  handle text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  verification_token text,
  expires_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id),
  
  CONSTRAINT cf_handles_handle_not_blank CHECK (length(trim(handle)) > 0),
  CONSTRAINT cf_handles_handle_pattern CHECK (handle ~ '^[A-Za-z0-9_]+$')
);

CREATE INDEX IF NOT EXISTS idx_cf_handles_lower_handle ON public.cf_handles (lower(handle));
CREATE INDEX IF NOT EXISTS idx_cf_handles_verified ON public.cf_handles (verified) WHERE verified;
CREATE INDEX IF NOT EXISTS idx_cf_handles_user_id ON public.cf_handles(user_id);

DROP TRIGGER IF EXISTS trg_cf_handles_updated_at ON public.cf_handles;
CREATE TRIGGER trg_cf_handles_updated_at
  BEFORE UPDATE ON public.cf_handles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 6. CF_SNAPSHOTS TABLE ========================

CREATE TABLE IF NOT EXISTS public.cf_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  handle text NOT NULL,
  rating integer,
  max_rating integer,
  rank text,
  max_rank text,
  contribution integer,
  problems_solved integer DEFAULT 0,
  contests_participated integer DEFAULT 0,
  snapshot_data jsonb,
  fetched_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_cf_snapshots_user_id ON public.cf_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_cf_snapshots_fetched_at ON public.cf_snapshots(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_cf_snapshots_rating ON public.cf_snapshots(rating);

-- ======================== 7. GROUPS TABLE ========================

CREATE TABLE IF NOT EXISTS public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type group_type NOT NULL,
  college_id uuid REFERENCES public.colleges(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_code text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  CONSTRAINT groups_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_groups_college_name 
  ON public.groups (college_id, lower(name)) 
  WHERE type = 'college' AND college_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_groups_lower_name ON public.groups (lower(name));
CREATE INDEX IF NOT EXISTS idx_groups_type ON public.groups (type);
CREATE INDEX IF NOT EXISTS idx_groups_college_id ON public.groups (college_id);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups (created_by);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON public.groups (invite_code) WHERE invite_code IS NOT NULL;

DROP TRIGGER IF EXISTS trg_groups_updated_at ON public.groups;
CREATE TRIGGER trg_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 8. GROUP_MEMBERSHIPS TABLE ========================

CREATE TABLE IF NOT EXISTS public.group_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role group_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_gm_group_user ON public.group_memberships (group_id, user_id);
CREATE INDEX IF NOT EXISTS idx_gm_user ON public.group_memberships (user_id);
CREATE INDEX IF NOT EXISTS idx_gm_group_role ON public.group_memberships (group_id, role);

DROP TRIGGER IF EXISTS trg_group_memberships_updated_at ON public.group_memberships;
CREATE TRIGGER trg_group_memberships_updated_at
  BEFORE UPDATE ON public.group_memberships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 9. GROUP_INVITATIONS TABLE ========================

CREATE TABLE IF NOT EXISTS public.group_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  expires_at timestamptz DEFAULT (timezone('utc', now()) + interval '7 days'),
  UNIQUE (group_id, invitee_id),
  
  CONSTRAINT group_invitations_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_group_invitations_invitee ON public.group_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON public.group_invitations(status);
CREATE INDEX IF NOT EXISTS idx_group_invitations_expires ON public.group_invitations(expires_at);

DROP TRIGGER IF EXISTS trg_group_invitations_updated_at ON public.group_invitations;
CREATE TRIGGER trg_group_invitations_updated_at
  BEFORE UPDATE ON public.group_invitations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 10. PROBLEMS TABLE ========================

CREATE TABLE IF NOT EXISTS public.problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  external_id text NOT NULL,
  title text NOT NULL,
  difficulty_rating integer NOT NULL,
  topic text[],
  tags text[],
  time_limit integer NOT NULL DEFAULT 1000,
  memory_limit integer NOT NULL DEFAULT 256,
  problem_statement text NOT NULL,
  input_format text,
  output_format text,
  constraints text,
  editorial text,
  test_cases jsonb DEFAULT '[]'::jsonb,
  hidden_test_cases jsonb DEFAULT '[]'::jsonb,
  judge0_language_id integer DEFAULT 54,
  reference_solution text,
  solved_count integer DEFAULT 0,
  attempt_count integer DEFAULT 0,
  successful_submission_rate double precision DEFAULT 0.0,
  average_solve_time integer DEFAULT 0,
  source_url text,
  author text,
  contest_name text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  
  CONSTRAINT problems_platform_check CHECK (platform IN ('codeforces', 'atcoder', 'leetcode', 'codechef', 'usaco', 'cses', 'custom')),
  CONSTRAINT problems_difficulty_rating_check CHECK (difficulty_rating BETWEEN 800 AND 3500)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_problems_platform_external_id ON public.problems(platform, external_id);
CREATE INDEX IF NOT EXISTS idx_problems_platform ON public.problems(platform);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON public.problems(difficulty_rating);
CREATE INDEX IF NOT EXISTS idx_problems_topic ON public.problems USING gin(topic);
CREATE INDEX IF NOT EXISTS idx_problems_tags ON public.problems USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_problems_active ON public.problems(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_problems_rating_active ON public.problems(difficulty_rating, is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_problems_set_updated_at ON public.problems;
CREATE TRIGGER trg_problems_set_updated_at
  BEFORE UPDATE ON public.problems
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 11. PROBLEM_HINTS TABLE ========================

CREATE TABLE IF NOT EXISTS public.problem_hints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id uuid NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  level integer NOT NULL,
  hint_type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc', now()),
  
  CONSTRAINT problem_hints_level_check CHECK (level BETWEEN 1 AND 4),
  CONSTRAINT problem_hints_type_check CHECK (hint_type IN ('restatement', 'algorithm', 'pseudocode', 'solution'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_problem_hints_problem_level ON public.problem_hints(problem_id, level);
CREATE INDEX IF NOT EXISTS idx_problem_hints_problem ON public.problem_hints(problem_id);

-- ======================== 12. PROBLEM_HISTORY TABLE ========================

CREATE TABLE IF NOT EXISTS public.problem_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  first_seen_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  last_attempted_at timestamptz,
  solved_at timestamptz,
  view_count integer DEFAULT 1,
  attempt_count integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  battle_id uuid,
  battle_round_id uuid
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_problem_history_user_problem ON public.problem_history(user_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_history_user ON public.problem_history(user_id);
CREATE INDEX IF NOT EXISTS idx_problem_history_problem ON public.problem_history(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_history_user_seen ON public.problem_history(user_id, first_seen_at DESC);

-- ======================== 13. USER_PROBLEMS TABLE ========================

CREATE TABLE IF NOT EXISTS public.user_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id text NOT NULL,
  platform text NOT NULL,
  status text NOT NULL DEFAULT 'unsolved',
  solved_at timestamptz,
  attempts integer DEFAULT 0,
  time_spent_seconds integer DEFAULT 0,
  difficulty_rating integer,
  tags text[],
  notes text,
  is_bookmarked boolean DEFAULT false,
  next_revision_at timestamptz,
  revision_count integer DEFAULT 0,
  last_revised_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, problem_id, platform),
  
  CONSTRAINT user_problems_status_check CHECK (status IN ('unsolved', 'attempting', 'solved', 'reviewed'))
);

CREATE INDEX IF NOT EXISTS idx_user_problems_user ON public.user_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_problems_status ON public.user_problems(status);
CREATE INDEX IF NOT EXISTS idx_user_problems_platform ON public.user_problems(platform);
CREATE INDEX IF NOT EXISTS idx_user_problems_bookmarked ON public.user_problems(user_id, is_bookmarked) WHERE is_bookmarked = true;
CREATE INDEX IF NOT EXISTS idx_user_problems_revision ON public.user_problems(user_id, next_revision_at) WHERE next_revision_at IS NOT NULL;

DROP TRIGGER IF EXISTS trg_user_problems_updated_at ON public.user_problems;
CREATE TRIGGER trg_user_problems_updated_at
  BEFORE UPDATE ON public.user_problems
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 14. CONTESTS TABLE ========================

CREATE TABLE IF NOT EXISTS public.contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  visibility contest_visibility NOT NULL DEFAULT 'private',
  status contest_status NOT NULL DEFAULT 'draft',
  host_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  starts_at timestamptz,
  ends_at timestamptz,
  max_participants int,
  allow_late_join boolean NOT NULL DEFAULT true,
  contest_mode contest_mode NOT NULL DEFAULT 'practice',
  duration_minutes int,
  problem_count int NOT NULL DEFAULT 5,
  rating_min int NOT NULL DEFAULT 800,
  rating_max int NOT NULL DEFAULT 1600,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  CONSTRAINT contests_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT contests_time_window CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at),
  CONSTRAINT contests_duration_positive CHECK (duration_minutes IS NULL OR duration_minutes > 0),
  CONSTRAINT contests_problem_count_positive CHECK (problem_count > 0 AND problem_count <= 20),
  CONSTRAINT contests_rating_bounds CHECK (rating_min >= 0 AND rating_max >= rating_min AND rating_max <= 5000),
  CONSTRAINT contests_max_participants_positive CHECK (max_participants IS NULL OR max_participants > 0)
);

CREATE INDEX IF NOT EXISTS idx_contests_host ON public.contests(host_user_id);
CREATE INDEX IF NOT EXISTS idx_contests_visibility ON public.contests(visibility);
CREATE INDEX IF NOT EXISTS idx_contests_status ON public.contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_starts_ends ON public.contests(starts_at, ends_at);

DROP TRIGGER IF EXISTS trg_contests_updated ON public.contests;
CREATE TRIGGER trg_contests_updated
  BEFORE UPDATE ON public.contests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 15. CONTEST_PARTICIPANTS TABLE ========================

CREATE TABLE IF NOT EXISTS public.contest_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  handle_snapshot text,
  joined_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (contest_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_participants_user ON public.contest_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_participants_contest ON public.contest_participants(contest_id);

DROP TRIGGER IF EXISTS trg_participants_updated ON public.contest_participants;
CREATE TRIGGER trg_participants_updated
  BEFORE UPDATE ON public.contest_participants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 16. CONTEST_PROBLEMS TABLE ========================

CREATE TABLE IF NOT EXISTS public.contest_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  problem_id text NOT NULL,
  title text NOT NULL,
  points int NOT NULL DEFAULT 1,
  contest_id_cf int,
  index_cf text,
  rating int,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  CONSTRAINT problems_title_not_blank CHECK (length(trim(title)) > 0),
  CONSTRAINT problems_points_nonnegative CHECK (points >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_contest_problem ON public.contest_problems (contest_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_problems_contest ON public.contest_problems(contest_id);

DROP TRIGGER IF EXISTS trg_problems_updated ON public.contest_problems;
CREATE TRIGGER trg_problems_updated
  BEFORE UPDATE ON public.contest_problems
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 17. CONTEST_SUBMISSIONS TABLE ========================

CREATE TABLE IF NOT EXISTS public.contest_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id text NOT NULL,
  status submission_status NOT NULL,
  penalty_s int NOT NULL DEFAULT 0,
  submitted_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  CONSTRAINT submissions_penalty_nonnegative CHECK (penalty_s >= 0)
);

CREATE INDEX IF NOT EXISTS idx_submissions_contest_user ON public.contest_submissions(contest_id, user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_contest_user_problem_time ON public.contest_submissions(contest_id, user_id, problem_id, submitted_at);

DROP TRIGGER IF EXISTS trg_submissions_updated ON public.contest_submissions;
CREATE TRIGGER trg_submissions_updated
  BEFORE UPDATE ON public.contest_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 18. CONTEST_RESULTS TABLE ========================

CREATE TABLE IF NOT EXISTS public.contest_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank int NOT NULL,
  score int NOT NULL,
  penalty_s int NOT NULL,
  rating_delta int NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (contest_id, user_id),
  
  CONSTRAINT results_rank_positive CHECK (rank > 0),
  CONSTRAINT results_penalty_nonnegative CHECK (penalty_s >= 0)
);

CREATE INDEX IF NOT EXISTS idx_results_contest ON public.contest_results(contest_id);
CREATE INDEX IF NOT EXISTS idx_results_contest_rank ON public.contest_results(contest_id, rank);

DROP TRIGGER IF EXISTS trg_results_updated ON public.contest_results;
CREATE TRIGGER trg_results_updated
  BEFORE UPDATE ON public.contest_results
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 19. SUBSCRIPTIONS TABLE ========================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  plan_code text NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  order_id text UNIQUE NOT NULL,
  payment_id text,
  signature text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'pending',
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  CONSTRAINT valid_subscription_status_subs CHECK (status IN ('pending', 'active', 'expired', 'cancelled', 'refunded')),
  CONSTRAINT valid_payment_status_subs CHECK (payment_status IN ('pending', 'completed', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_order_id ON public.subscriptions(order_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_id ON public.subscriptions(payment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON public.subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON public.subscriptions(created_at DESC);

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 20. PURCHASES TABLE ========================

CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id text,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  order_id text UNIQUE NOT NULL,
  payment_id text,
  status text NOT NULL DEFAULT 'pending',
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  plan_code text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_order_id ON public.purchases(order_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_subscription_id ON public.purchases(subscription_id);
CREATE INDEX IF NOT EXISTS idx_purchases_plan_code ON public.purchases(plan_code);

DROP TRIGGER IF EXISTS trg_purchases_updated_at ON public.purchases;
CREATE TRIGGER trg_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 21. PAYMENT_EVENTS TABLE ========================

CREATE TABLE IF NOT EXISTS public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  order_id text,
  payment_id text,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  payload jsonb NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  processed_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_payment_events_event_id ON public.payment_events(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_order_id ON public.payment_events(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_processed ON public.payment_events(processed);
CREATE INDEX IF NOT EXISTS idx_payment_events_created_at ON public.payment_events(created_at DESC);

-- ======================== 22. USER_SHEETS TABLE ========================

CREATE TABLE IF NOT EXISTS public.user_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sheet_id text NOT NULL,
  sheet_name text NOT NULL,
  progress jsonb DEFAULT '{}'::jsonb,
  total_problems integer DEFAULT 0,
  solved_problems integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, sheet_id)
);

CREATE INDEX IF NOT EXISTS idx_user_sheets_user_id ON public.user_sheets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sheets_sheet_id ON public.user_sheets(sheet_id);

DROP TRIGGER IF EXISTS trg_user_sheets_updated_at ON public.user_sheets;
CREATE TRIGGER trg_user_sheets_updated_at
  BEFORE UPDATE ON public.user_sheets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 23. GROUP_CHALLENGES TABLE ========================

CREATE TABLE IF NOT EXISTS public.group_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  metric text NOT NULL DEFAULT 'problems_solved',
  target_count integer NOT NULL,
  start_date date NOT NULL DEFAULT (timezone('utc', now()))::date,
  end_date date NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  CONSTRAINT group_challenges_metric_check CHECK (metric IN ('problems_solved')),
  CONSTRAINT group_challenges_target_positive CHECK (target_count > 0),
  CONSTRAINT group_challenges_status_check CHECK (status IN ('active', 'completed', 'expired')),
  CONSTRAINT group_challenges_date_order CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_group_challenges_group_id ON public.group_challenges(group_id);
CREATE INDEX IF NOT EXISTS idx_group_challenges_status ON public.group_challenges(status);
CREATE INDEX IF NOT EXISTS idx_group_challenges_active_window ON public.group_challenges(group_id, status, start_date, end_date);

DROP TRIGGER IF EXISTS trg_group_challenges_updated_at ON public.group_challenges;
CREATE TRIGGER trg_group_challenges_updated_at
  BEFORE UPDATE ON public.group_challenges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 24. GROUP_CHALLENGE_PROGRESS TABLE ========================

CREATE TABLE IF NOT EXISTS public.group_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.group_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_count integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  last_updated timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (challenge_id, user_id),
  
  CONSTRAINT group_challenge_progress_nonneg CHECK (current_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_group_challenge_progress_challenge ON public.group_challenge_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_group_challenge_progress_user ON public.group_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_group_challenge_progress_completed ON public.group_challenge_progress(challenge_id, completed);

DROP TRIGGER IF EXISTS trg_group_challenge_progress_updated_at ON public.group_challenge_progress;
CREATE TRIGGER trg_group_challenge_progress_updated_at
  BEFORE UPDATE ON public.group_challenge_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 25. LEARNING_PATHS TABLE ========================

CREATE TABLE IF NOT EXISTS public.learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  difficulty_range_min int NOT NULL,
  difficulty_range_max int NOT NULL,
  level_number int NOT NULL,
  prerequisites text[],
  topics text[] NOT NULL,
  estimated_problems int NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_learning_paths_level ON public.learning_paths(level_number);
CREATE INDEX IF NOT EXISTS idx_learning_paths_difficulty ON public.learning_paths(difficulty_range_min, difficulty_range_max);
CREATE INDEX IF NOT EXISTS idx_learning_paths_active ON public.learning_paths(is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_learning_paths_updated_at ON public.learning_paths;
CREATE TRIGGER trg_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 26. USER_LEARNING_PATH_PROGRESS TABLE ========================

CREATE TABLE IF NOT EXISTS public.user_learning_path_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_path_id uuid NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  problems_completed int NOT NULL DEFAULT 0,
  total_problems int NOT NULL,
  completion_percentage real NOT NULL DEFAULT 0.0,
  status text NOT NULL DEFAULT 'in_progress',
  started_at timestamptz DEFAULT timezone('utc', now()),
  completed_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, learning_path_id),
  
  CONSTRAINT user_learning_path_status_check CHECK (status IN ('not_started', 'in_progress', 'completed', 'paused'))
);

CREATE INDEX IF NOT EXISTS idx_user_learning_path_progress_user_id ON public.user_learning_path_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_path_progress_path_id ON public.user_learning_path_progress(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_path_progress_status ON public.user_learning_path_progress(status);

DROP TRIGGER IF EXISTS trg_user_learning_path_progress_updated_at ON public.user_learning_path_progress;
CREATE TRIGGER trg_user_learning_path_progress_updated_at
  BEFORE UPDATE ON public.user_learning_path_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 27. PROBLEM_ATTEMPTS TABLE ========================

CREATE TABLE IF NOT EXISTS public.problem_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id text NOT NULL,
  problem_title text NOT NULL,
  problem_url text,
  rating int,
  tags text[],
  attempt_number int NOT NULL DEFAULT 1,
  status text NOT NULL,
  time_spent_seconds int,
  hints_used int DEFAULT 0,
  test_cases_passed int DEFAULT 0,
  total_test_cases int DEFAULT 0,
  language text,
  code_length int,
  started_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  
  CONSTRAINT problem_attempts_status_check CHECK (status IN ('attempted', 'solved', 'failed', 'timed_out'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_problem_attempts_user_problem_attempt ON public.problem_attempts(user_id, problem_id, attempt_number);
CREATE INDEX IF NOT EXISTS idx_problem_attempts_user_id ON public.problem_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_problem_attempts_problem_id ON public.problem_attempts(problem_id);
CREATE INDEX IF NOT EXISTS idx_problem_attempts_status ON public.problem_attempts(status);
CREATE INDEX IF NOT EXISTS idx_problem_attempts_created_at ON public.problem_attempts(created_at);

DROP TRIGGER IF EXISTS trg_problem_attempts_updated_at ON public.problem_attempts;
CREATE TRIGGER trg_problem_attempts_updated_at
  BEFORE UPDATE ON public.problem_attempts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 28. USER_TOPIC_MASTERY TABLE ========================

CREATE TABLE IF NOT EXISTS public.user_topic_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  problems_attempted int NOT NULL DEFAULT 0,
  problems_solved int NOT NULL DEFAULT 0,
  success_rate real NOT NULL DEFAULT 0.0,
  avg_solve_time_seconds int,
  avg_attempts_per_problem real DEFAULT 1.0,
  min_rating_solved int,
  max_rating_solved int,
  current_level int DEFAULT 800,
  mastery_level text DEFAULT 'beginner',
  last_practiced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, topic),
  
  CONSTRAINT user_topic_mastery_level_check CHECK (mastery_level IN ('beginner', 'learning', 'proficient', 'master', 'expert'))
);

CREATE INDEX IF NOT EXISTS idx_user_topic_mastery_user_id ON public.user_topic_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_mastery_topic ON public.user_topic_mastery(topic);
CREATE INDEX IF NOT EXISTS idx_user_topic_mastery_success_rate ON public.user_topic_mastery(success_rate);

DROP TRIGGER IF EXISTS trg_user_topic_mastery_updated_at ON public.user_topic_mastery;
CREATE TRIGGER trg_user_topic_mastery_updated_at
  BEFORE UPDATE ON public.user_topic_mastery
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 29. USER_SKILL_PROFILES TABLE ========================

CREATE TABLE IF NOT EXISTS public.user_skill_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_skill_level int NOT NULL DEFAULT 800,
  problems_per_week real DEFAULT 0.0,
  avg_solve_time_seconds int,
  skill_level_7d_ago int,
  skill_level_30d_ago int,
  improvement_rate real DEFAULT 0.0,
  total_problems_attempted int NOT NULL DEFAULT 0,
  total_problems_solved int NOT NULL DEFAULT 0,
  overall_success_rate real DEFAULT 0.0,
  current_streak int DEFAULT 0,
  longest_streak int DEFAULT 0,
  weak_topics text[],
  strong_topics text[],
  last_activity_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_user_skill_profiles_user_id ON public.user_skill_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_profiles_skill_level ON public.user_skill_profiles(current_skill_level);

DROP TRIGGER IF EXISTS trg_user_skill_profiles_updated_at ON public.user_skill_profiles;
CREATE TRIGGER trg_user_skill_profiles_updated_at
  BEFORE UPDATE ON public.user_skill_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 30. PROBLEM_RECOMMENDATIONS TABLE ========================

CREATE TABLE IF NOT EXISTS public.problem_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id text NOT NULL,
  problem_title text NOT NULL,
  problem_url text,
  rating int NOT NULL,
  tags text[],
  recommendation_reason text NOT NULL,
  recommended_difficulty int NOT NULL,
  priority_score real NOT NULL DEFAULT 0.5,
  category text,
  status text NOT NULL DEFAULT 'pending',
  viewed_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (timezone('utc', now()) + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, problem_id),
  
  CONSTRAINT problem_recommendations_priority_range CHECK (priority_score >= 0.0 AND priority_score <= 1.0),
  CONSTRAINT problem_recommendations_category_check CHECK (category IN ('skill_level', 'weak_topic', 'exploratory', 'spaced_repetition')),
  CONSTRAINT problem_recommendations_status_check CHECK (status IN ('pending', 'viewed', 'started', 'completed', 'skipped'))
);

CREATE INDEX IF NOT EXISTS idx_problem_recommendations_user_id ON public.problem_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_problem_recommendations_status ON public.problem_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_problem_recommendations_expires ON public.problem_recommendations(expires_at);
CREATE INDEX IF NOT EXISTS idx_problem_recommendations_priority ON public.problem_recommendations(user_id, priority_score DESC);

DROP TRIGGER IF EXISTS trg_problem_recommendations_updated_at ON public.problem_recommendations;
CREATE TRIGGER trg_problem_recommendations_updated_at
  BEFORE UPDATE ON public.problem_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 31. SPACED_REPETITION_REVIEWS TABLE ========================

CREATE TABLE IF NOT EXISTS public.spaced_repetition_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id text NOT NULL,
  problem_title text NOT NULL,
  problem_url text,
  rating int,
  tags text[],
  review_count int NOT NULL DEFAULT 0,
  last_review_outcome text,
  ease_factor real NOT NULL DEFAULT 2.5,
  interval_days real NOT NULL DEFAULT 1.0,
  next_review_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  review_dates timestamptz[],
  review_outcomes text[],
  status text NOT NULL DEFAULT 'active',
  first_failed_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  last_reviewed_at timestamptz,
  mastered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, problem_id),
  
  CONSTRAINT srr_ease_factor_bounds CHECK (ease_factor >= 1.3 AND ease_factor <= 3.5),
  CONSTRAINT srr_interval_days_nonneg CHECK (interval_days >= 0),
  CONSTRAINT srr_last_review_outcome_check CHECK (last_review_outcome IN ('failed', 'partial', 'success')),
  CONSTRAINT srr_status_check CHECK (status IN ('active', 'mastered', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_spaced_repetition_reviews_user_id ON public.spaced_repetition_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_reviews_next_review ON public.spaced_repetition_reviews(next_review_at);
CREATE INDEX IF NOT EXISTS idx_spaced_repetition_reviews_status ON public.spaced_repetition_reviews(status);

DROP TRIGGER IF EXISTS trg_spaced_repetition_reviews_updated_at ON public.spaced_repetition_reviews;
CREATE TRIGGER trg_spaced_repetition_reviews_updated_at
  BEFORE UPDATE ON public.spaced_repetition_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 32. ADAPTIVE_ITEMS TABLE ========================

CREATE TABLE IF NOT EXISTS public.adaptive_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id text NOT NULL,
  difficulty real DEFAULT 0.5,
  discrimination real DEFAULT 1.0,
  last_response boolean,
  response_count int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_adaptive_items_user ON public.adaptive_items(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_items_type ON public.adaptive_items(item_type);

DROP TRIGGER IF EXISTS trg_adaptive_items_updated_at ON public.adaptive_items;
CREATE TRIGGER trg_adaptive_items_updated_at
  BEFORE UPDATE ON public.adaptive_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;

-- ============================================================================
-- END OF MASTER SCHEMA
-- ============================================================================
