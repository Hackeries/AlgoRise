-- ============================================================================
-- ALGORISE DATABASE RESET & SETUP - RUN THIS FIRST
-- ============================================================================
-- This script will:
-- 1. Drop all existing tables (clean slate)
-- 2. Create all tables fresh
-- 3. Set up RLS policies
-- 4. Create all functions and triggers
-- 5. Add seed data
--
-- IMPORTANT: This will DELETE ALL DATA. Only run on fresh/empty databases
-- or when you want to completely reset.
--
-- After running this, run: RUN_THIS_SECOND_performance_indexes.sql
-- ============================================================================

-- ======================== CLEANUP - DROP ALL TABLES ========================
-- Run these drops to clear any existing tables with wrong schema

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Disable triggers temporarily
    SET session_replication_role = 'replica';
    
    -- Drop all tables in public schema (in dependency order)
    FOR r IN (
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'pg_%'
        ORDER BY tablename
    ) LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Re-enable triggers
    SET session_replication_role = 'origin';
END $$;

-- Drop existing types
DROP TYPE IF EXISTS profile_status CASCADE;
DROP TYPE IF EXISTS degree_type_enum CASCADE;
DROP TYPE IF EXISTS group_type CASCADE;
DROP TYPE IF EXISTS group_role CASCADE;
DROP TYPE IF EXISTS contest_visibility CASCADE;
DROP TYPE IF EXISTS contest_status CASCADE;
DROP TYPE IF EXISTS contest_mode CASCADE;
DROP TYPE IF EXISTS submission_status CASCADE;

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

CREATE TYPE profile_status AS ENUM ('student', 'working');
CREATE TYPE degree_type_enum AS ENUM ('high_school', 'associate', 'bachelor', 'master', 'doctorate', 'bootcamp', 'other');
CREATE TYPE group_type AS ENUM ('college', 'friends');
CREATE TYPE group_role AS ENUM ('member', 'admin');
CREATE TYPE contest_visibility AS ENUM ('private', 'public');
CREATE TYPE contest_status AS ENUM ('draft', 'upcoming', 'running', 'ended');
CREATE TYPE contest_mode AS ENUM ('practice', 'icpc');
CREATE TYPE submission_status AS ENUM ('solved', 'failed');

-- ======================== 1. COLLEGES TABLE ========================

CREATE TABLE public.colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL DEFAULT 'India',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT colleges_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT colleges_country_not_blank CHECK (length(trim(country)) > 0)
);

CREATE UNIQUE INDEX uq_colleges_name_country_ci ON public.colleges (lower(name), lower(country));
CREATE INDEX idx_colleges_country ON public.colleges (lower(country));
CREATE INDEX idx_colleges_name_trgm ON public.colleges USING gin (name gin_trgm_ops);
CREATE INDEX idx_colleges_lower_name ON public.colleges (lower(name));

CREATE TRIGGER trg_colleges_updated_at
  BEFORE UPDATE ON public.colleges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 2. COMPANIES TABLE ========================

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT companies_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE INDEX idx_companies_lower_name ON public.companies (lower(name));

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 3. PROFILES TABLE ========================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  username text,
  profile_image_url text,
  show_profile_image boolean NOT NULL DEFAULT true,
  status profile_status,
  degree_type degree_type_enum,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  custom_company text,
  college_id uuid REFERENCES public.colleges(id) ON DELETE SET NULL,
  year text,
  preferred_language text,
  programming_languages text[],
  codeforces_handle text,
  leetcode_handle text,
  codechef_handle text,
  subscription_plan text NOT NULL DEFAULT 'free',
  subscription_status text NOT NULL DEFAULT 'active',
  subscription_start timestamptz,
  subscription_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT company_exclusive_check CHECK (company_id IS NULL OR custom_company IS NULL),
  CONSTRAINT programming_languages_len_check CHECK (programming_languages IS NULL OR cardinality(programming_languages) <= 50),
  CONSTRAINT valid_subscription_plan CHECK (subscription_plan IN ('free', 'entry-gate', 'core-builder', 'algorithmic-ascend', 'competitive-forge', 'master-craft')),
  CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('active', 'expired', 'cancelled'))
);

CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_college_id ON public.profiles(college_id);
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);
CREATE INDEX idx_profiles_subscription_plan ON public.profiles(subscription_plan);
CREATE INDEX idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX idx_profiles_subscription_end ON public.profiles(subscription_end);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 4. STREAKS TABLE ========================

CREATE TABLE public.streaks (
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

CREATE INDEX idx_streaks_last_active_day ON public.streaks(last_active_day);
CREATE INDEX idx_streaks_current_streak ON public.streaks(current_streak DESC);

CREATE TRIGGER trg_streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 5. CF_HANDLES TABLE ========================

CREATE TABLE public.cf_handles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  handle text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  verification_token text,
  expires_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT cf_handles_handle_not_blank CHECK (length(trim(handle)) > 0),
  CONSTRAINT cf_handles_handle_pattern CHECK (handle ~ '^[A-Za-z0-9_]+$')
);

CREATE INDEX idx_cf_handles_lower_handle ON public.cf_handles (lower(handle));
CREATE INDEX idx_cf_handles_verified ON public.cf_handles (verified) WHERE verified;
CREATE INDEX idx_cf_handles_user_id ON public.cf_handles(user_id);

CREATE TRIGGER trg_cf_handles_updated_at
  BEFORE UPDATE ON public.cf_handles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 6. CF_SNAPSHOTS TABLE ========================

CREATE TABLE public.cf_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  handle text NOT NULL,
  rating integer,
  max_rating integer,
  rank text,
  max_rank text,
  contribution integer,
  friend_of_count integer,
  solved_count integer,
  fetched_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_cf_snapshots_user ON public.cf_snapshots(user_id);
CREATE INDEX idx_cf_snapshots_fetched_at ON public.cf_snapshots(fetched_at DESC);
CREATE INDEX idx_cf_snapshots_rating ON public.cf_snapshots(rating);

CREATE TRIGGER trg_cf_snapshots_updated_at
  BEFORE UPDATE ON public.cf_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 7. GROUPS TABLE ========================

CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type group_type NOT NULL,
  college_id uuid REFERENCES public.colleges(id) ON DELETE SET NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text UNIQUE,
  description text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT groups_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT groups_college_type_check CHECK (type <> 'college' OR college_id IS NOT NULL)
);

CREATE INDEX idx_groups_type ON public.groups(type);
CREATE INDEX idx_groups_college ON public.groups(college_id);
CREATE INDEX idx_groups_invite_code ON public.groups(invite_code) WHERE invite_code IS NOT NULL;

CREATE TRIGGER trg_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 8. GROUP_MEMBERSHIPS TABLE ========================

CREATE TABLE public.group_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role group_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (group_id, user_id)
);

CREATE INDEX idx_gm_group ON public.group_memberships (group_id);
CREATE INDEX idx_gm_user ON public.group_memberships (user_id);
CREATE INDEX idx_gm_group_role ON public.group_memberships (group_id, role);

CREATE TRIGGER trg_group_memberships_updated_at
  BEFORE UPDATE ON public.group_memberships
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 9. GROUP_INVITATIONS TABLE ========================

CREATE TABLE public.group_invitations (
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

CREATE INDEX idx_group_invitations_invitee ON public.group_invitations(invitee_id);
CREATE INDEX idx_group_invitations_status ON public.group_invitations(status);
CREATE INDEX idx_group_invitations_expires ON public.group_invitations(expires_at);

CREATE TRIGGER trg_group_invitations_updated_at
  BEFORE UPDATE ON public.group_invitations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 10. PROBLEMS TABLE ========================

CREATE TABLE public.problems (
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

CREATE UNIQUE INDEX uq_problems_platform_external_id ON public.problems(platform, external_id);
CREATE INDEX idx_problems_platform ON public.problems(platform);
CREATE INDEX idx_problems_difficulty ON public.problems(difficulty_rating);
CREATE INDEX idx_problems_topic ON public.problems USING gin(topic);
CREATE INDEX idx_problems_tags ON public.problems USING gin(tags);
CREATE INDEX idx_problems_active ON public.problems(is_active) WHERE is_active = true;
CREATE INDEX idx_problems_rating_active ON public.problems(difficulty_rating, is_active) WHERE is_active = true;

CREATE TRIGGER trg_problems_set_updated_at
  BEFORE UPDATE ON public.problems
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 11. PROBLEM_HINTS TABLE ========================

CREATE TABLE public.problem_hints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id uuid NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  level integer NOT NULL,
  hint_type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  UNIQUE (problem_id, level),
  CONSTRAINT problem_hints_level_range CHECK (level BETWEEN 1 AND 5),
  CONSTRAINT problem_hints_type_check CHECK (hint_type IN ('restatement', 'algorithm', 'implementation', 'solution'))
);

CREATE INDEX idx_problem_hints_problem ON public.problem_hints(problem_id);

CREATE TRIGGER trg_problem_hints_updated_at
  BEFORE UPDATE ON public.problem_hints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 12. PROBLEM_HISTORY TABLE ========================

CREATE TABLE public.problem_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  first_seen_at timestamptz DEFAULT timezone('utc', now()),
  last_seen_at timestamptz DEFAULT timezone('utc', now()),
  view_count integer DEFAULT 1,
  created_at timestamptz DEFAULT timezone('utc', now()),
  updated_at timestamptz DEFAULT timezone('utc', now()),
  UNIQUE (user_id, problem_id)
);

CREATE INDEX idx_problem_history_user ON public.problem_history(user_id);
CREATE INDEX idx_problem_history_user_seen ON public.problem_history(user_id, first_seen_at DESC);

-- ======================== 13. USER_PROBLEMS TABLE ========================

CREATE TABLE public.user_problems (
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

CREATE INDEX idx_user_problems_user ON public.user_problems(user_id);
CREATE INDEX idx_user_problems_status ON public.user_problems(status);
CREATE INDEX idx_user_problems_platform ON public.user_problems(platform);
CREATE INDEX idx_user_problems_bookmarked ON public.user_problems(user_id, is_bookmarked) WHERE is_bookmarked = true;
CREATE INDEX idx_user_problems_revision ON public.user_problems(user_id, next_revision_at) WHERE next_revision_at IS NOT NULL;

CREATE TRIGGER trg_user_problems_updated_at
  BEFORE UPDATE ON public.user_problems
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 14. CONTESTS TABLE ========================

CREATE TABLE public.contests (
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

CREATE INDEX idx_contests_host ON public.contests(host_user_id);
CREATE INDEX idx_contests_visibility ON public.contests(visibility);
CREATE INDEX idx_contests_status ON public.contests(status);
CREATE INDEX idx_contests_starts_ends ON public.contests(starts_at, ends_at);

CREATE TRIGGER trg_contests_updated
  BEFORE UPDATE ON public.contests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 15. CONTEST_PARTICIPANTS TABLE ========================

CREATE TABLE public.contest_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  handle_snapshot text,
  joined_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (contest_id, user_id)
);

CREATE INDEX idx_participants_user ON public.contest_participants(user_id);
CREATE INDEX idx_participants_contest ON public.contest_participants(contest_id);

CREATE TRIGGER trg_participants_updated
  BEFORE UPDATE ON public.contest_participants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 16. CONTEST_PROBLEMS TABLE ========================

CREATE TABLE public.contest_problems (
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

CREATE UNIQUE INDEX uq_contest_problem ON public.contest_problems (contest_id, problem_id);
CREATE INDEX idx_problems_contest ON public.contest_problems(contest_id);

CREATE TRIGGER trg_problems_updated
  BEFORE UPDATE ON public.contest_problems
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 17. CONTEST_SUBMISSIONS TABLE ========================

CREATE TABLE public.contest_submissions (
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

CREATE INDEX idx_submissions_contest_user ON public.contest_submissions(contest_id, user_id);
CREATE INDEX idx_submissions_contest_user_problem_time ON public.contest_submissions(contest_id, user_id, problem_id, submitted_at);

CREATE TRIGGER trg_submissions_updated
  BEFORE UPDATE ON public.contest_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 18. CONTEST_RESULTS TABLE ========================

CREATE TABLE public.contest_results (
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

CREATE INDEX idx_results_contest ON public.contest_results(contest_id);
CREATE INDEX idx_results_contest_rank ON public.contest_results(contest_id, rank);

CREATE TRIGGER trg_results_updated
  BEFORE UPDATE ON public.contest_results
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 19. SUBSCRIPTIONS TABLE ========================

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_code text NOT NULL,
  plan_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  amount int NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pending',
  order_id text,
  payment_id text,
  razorpay_signature text,
  start_date timestamptz,
  end_date timestamptz,
  cancellation_reason text,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT subscriptions_status_check CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  CONSTRAINT subscriptions_payment_status_check CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'))
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_payment_status ON public.subscriptions(payment_status);
CREATE INDEX idx_subscriptions_order_id ON public.subscriptions(order_id) WHERE order_id IS NOT NULL;

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 20. PURCHASES TABLE ========================

CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id text,
  amount int NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  order_id text,
  payment_id text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT purchases_status_check CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

CREATE INDEX idx_purchases_user ON public.purchases(user_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);

CREATE TRIGGER trg_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 21. PAYMENT_EVENTS TABLE ========================

CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_payment_events_user ON public.payment_events(user_id);
CREATE INDEX idx_payment_events_type ON public.payment_events(event_type);
CREATE INDEX idx_payment_events_created ON public.payment_events(created_at DESC);

-- ======================== 22. USER_SHEETS TABLE ========================

CREATE TABLE public.user_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sheet_id text NOT NULL,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_count int NOT NULL DEFAULT 0,
  total_count int NOT NULL DEFAULT 0,
  last_problem_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (user_id, sheet_id)
);

CREATE INDEX idx_user_sheets_user ON public.user_sheets(user_id);
CREATE INDEX idx_user_sheets_sheet ON public.user_sheets(sheet_id);

CREATE TRIGGER trg_user_sheets_updated_at
  BEFORE UPDATE ON public.user_sheets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 23. GROUP_CHALLENGES TABLE ========================

CREATE TABLE public.group_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  challenge_type text NOT NULL,
  target_count int NOT NULL,
  topic text,
  rating_min int,
  rating_max int,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT group_challenges_dates CHECK (end_date >= start_date),
  CONSTRAINT group_challenges_target_positive CHECK (target_count > 0),
  CONSTRAINT group_challenges_status_check CHECK (status IN ('active', 'completed', 'expired', 'cancelled'))
);

CREATE INDEX idx_group_challenges_group ON public.group_challenges(group_id);
CREATE INDEX idx_group_challenges_status ON public.group_challenges(status);
CREATE INDEX idx_group_challenges_dates ON public.group_challenges(start_date, end_date);

CREATE TRIGGER trg_group_challenges_updated_at
  BEFORE UPDATE ON public.group_challenges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 24. GROUP_CHALLENGE_PROGRESS TABLE ========================

CREATE TABLE public.group_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.group_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_count int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  last_updated timestamptz DEFAULT timezone('utc', now()),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (challenge_id, user_id),
  CONSTRAINT group_challenge_progress_count_nonneg CHECK (current_count >= 0)
);

CREATE INDEX idx_group_challenge_progress_challenge ON public.group_challenge_progress(challenge_id);
CREATE INDEX idx_group_challenge_progress_user ON public.group_challenge_progress(user_id);

CREATE TRIGGER trg_group_challenge_progress_updated_at
  BEFORE UPDATE ON public.group_challenge_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 25. LEARNING_PATHS TABLE ========================

CREATE TABLE public.learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  difficulty_range_min int DEFAULT 800,
  difficulty_range_max int DEFAULT 1600,
  level_number int NOT NULL,
  topics text[],
  estimated_problems int DEFAULT 20,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_learning_paths_level ON public.learning_paths(level_number);
CREATE INDEX idx_learning_paths_difficulty ON public.learning_paths(difficulty_range_min, difficulty_range_max);
CREATE INDEX idx_learning_paths_active ON public.learning_paths(is_active) WHERE is_active = true;

CREATE TRIGGER trg_learning_paths_updated_at
  BEFORE UPDATE ON public.learning_paths
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 26. USER_LEARNING_PATH_PROGRESS TABLE ========================

CREATE TABLE public.user_learning_path_progress (
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

CREATE INDEX idx_user_learning_path_progress_user_id ON public.user_learning_path_progress(user_id);
CREATE INDEX idx_user_learning_path_progress_path_id ON public.user_learning_path_progress(learning_path_id);
CREATE INDEX idx_user_learning_path_progress_status ON public.user_learning_path_progress(status);

CREATE TRIGGER trg_user_learning_path_progress_updated_at
  BEFORE UPDATE ON public.user_learning_path_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 27. PROBLEM_ATTEMPTS TABLE ========================

CREATE TABLE public.problem_attempts (
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

CREATE UNIQUE INDEX uq_problem_attempts_user_problem_attempt ON public.problem_attempts(user_id, problem_id, attempt_number);
CREATE INDEX idx_problem_attempts_user_id ON public.problem_attempts(user_id);
CREATE INDEX idx_problem_attempts_problem_id ON public.problem_attempts(problem_id);
CREATE INDEX idx_problem_attempts_status ON public.problem_attempts(status);
CREATE INDEX idx_problem_attempts_created_at ON public.problem_attempts(created_at);

CREATE TRIGGER trg_problem_attempts_updated_at
  BEFORE UPDATE ON public.problem_attempts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 28. USER_TOPIC_MASTERY TABLE ========================

CREATE TABLE public.user_topic_mastery (
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

CREATE INDEX idx_user_topic_mastery_user_id ON public.user_topic_mastery(user_id);
CREATE INDEX idx_user_topic_mastery_topic ON public.user_topic_mastery(topic);
CREATE INDEX idx_user_topic_mastery_success_rate ON public.user_topic_mastery(success_rate);

CREATE TRIGGER trg_user_topic_mastery_updated_at
  BEFORE UPDATE ON public.user_topic_mastery
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 29. USER_SKILL_PROFILES TABLE ========================

CREATE TABLE public.user_skill_profiles (
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

CREATE INDEX idx_user_skill_profiles_user_id ON public.user_skill_profiles(user_id);
CREATE INDEX idx_user_skill_profiles_skill_level ON public.user_skill_profiles(current_skill_level);

CREATE TRIGGER trg_user_skill_profiles_updated_at
  BEFORE UPDATE ON public.user_skill_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 30. PROBLEM_RECOMMENDATIONS TABLE ========================

CREATE TABLE public.problem_recommendations (
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

CREATE INDEX idx_problem_recommendations_user_id ON public.problem_recommendations(user_id);
CREATE INDEX idx_problem_recommendations_status ON public.problem_recommendations(status);
CREATE INDEX idx_problem_recommendations_expires ON public.problem_recommendations(expires_at);
CREATE INDEX idx_problem_recommendations_priority ON public.problem_recommendations(user_id, priority_score DESC);

CREATE TRIGGER trg_problem_recommendations_updated_at
  BEFORE UPDATE ON public.problem_recommendations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 31. SPACED_REPETITION_REVIEWS TABLE ========================

CREATE TABLE public.spaced_repetition_reviews (
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

CREATE INDEX idx_spaced_repetition_reviews_user_id ON public.spaced_repetition_reviews(user_id);
CREATE INDEX idx_spaced_repetition_reviews_next_review ON public.spaced_repetition_reviews(next_review_at);
CREATE INDEX idx_spaced_repetition_reviews_status ON public.spaced_repetition_reviews(status);

CREATE TRIGGER trg_spaced_repetition_reviews_updated_at
  BEFORE UPDATE ON public.spaced_repetition_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 32. ADAPTIVE_ITEMS TABLE ========================

CREATE TABLE public.adaptive_items (
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

CREATE INDEX idx_adaptive_items_user ON public.adaptive_items(user_id);
CREATE INDEX idx_adaptive_items_type ON public.adaptive_items(item_type);

CREATE TRIGGER trg_adaptive_items_updated_at
  BEFORE UPDATE ON public.adaptive_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All tables created successfully!';
  RAISE NOTICE 'Next step: Run the RLS policies, functions, and seed data scripts.';
END $$;
