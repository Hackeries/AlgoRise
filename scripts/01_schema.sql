-- ============================================================================
-- ALGORISE DATABASE SCHEMA
-- ============================================================================
-- Script 1 of 4: Creates all tables, types, indexes, and triggers
-- 
-- IMPORTANT: Run this on a fresh Supabase project or after backing up data
-- ============================================================================

-- ======================== EXTENSIONS ========================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ======================== DROP EXISTING (for clean setup) ========================
-- Only uncomment these if you want to completely reset
-- DO $$ 
-- DECLARE r RECORD;
-- BEGIN
--     FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'pg_%') LOOP
--         EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
--     END LOOP;
-- END $$;

-- ======================== ENUM TYPES ========================
DO $$ BEGIN
    CREATE TYPE profile_status AS ENUM ('student', 'working');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE degree_type_enum AS ENUM ('high_school', 'associate', 'bachelor', 'master', 'doctorate', 'bootcamp', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE group_type AS ENUM ('college', 'friends');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE group_role AS ENUM ('member', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE contest_visibility AS ENUM ('private', 'public');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE contest_status AS ENUM ('draft', 'upcoming', 'running', 'ended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE contest_mode AS ENUM ('practice', 'icpc');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('solved', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ======================== UTILITY FUNCTIONS ========================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := timezone('utc', now());
    RETURN NEW;
END;
$$;

-- ======================== 1. COLLEGES ========================
CREATE TABLE IF NOT EXISTS public.colleges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    country text NOT NULL DEFAULT 'India',
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT colleges_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_colleges_name_country ON public.colleges (lower(name), lower(country));
CREATE INDEX IF NOT EXISTS idx_colleges_name_trgm ON public.colleges USING gin (name gin_trgm_ops);

DROP TRIGGER IF EXISTS trg_colleges_updated_at ON public.colleges;
CREATE TRIGGER trg_colleges_updated_at BEFORE UPDATE ON public.colleges
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 2. COMPANIES ========================
CREATE TABLE IF NOT EXISTS public.companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT companies_name_not_blank CHECK (length(trim(name)) > 0)
);

DROP TRIGGER IF EXISTS trg_companies_updated_at ON public.companies;
CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 3. PROFILES ========================
CREATE TABLE IF NOT EXISTS public.profiles (
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
    CONSTRAINT valid_subscription_plan CHECK (subscription_plan IN ('free', 'entry-gate', 'core-builder', 'algorithmic-ascend', 'competitive-forge', 'master-craft')),
    CONSTRAINT valid_subscription_status CHECK (subscription_status IN ('active', 'expired', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_college_id ON public.profiles(college_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 4. STREAKS ========================
CREATE TABLE IF NOT EXISTS public.streaks (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak integer NOT NULL DEFAULT 0,
    last_active_day date,
    longest_streak integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT streaks_nonnegative CHECK (current_streak >= 0 AND longest_streak >= 0)
);

DROP TRIGGER IF EXISTS trg_streaks_updated_at ON public.streaks;
CREATE TRIGGER trg_streaks_updated_at BEFORE UPDATE ON public.streaks
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 5. CF_HANDLES ========================
CREATE TABLE IF NOT EXISTS public.cf_handles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    handle text NOT NULL,
    verified boolean NOT NULL DEFAULT false,
    verification_token text,
    verification_problem_id text,
    expires_at timestamptz,
    last_sync_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT cf_handles_handle_not_blank CHECK (length(trim(handle)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_cf_handles_user_id ON public.cf_handles(user_id);
CREATE INDEX IF NOT EXISTS idx_cf_handles_verified ON public.cf_handles(verified) WHERE verified;

DROP TRIGGER IF EXISTS trg_cf_handles_updated_at ON public.cf_handles;
CREATE TRIGGER trg_cf_handles_updated_at BEFORE UPDATE ON public.cf_handles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 6. CF_SNAPSHOTS ========================
CREATE TABLE IF NOT EXISTS public.cf_snapshots (
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

CREATE INDEX IF NOT EXISTS idx_cf_snapshots_user ON public.cf_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_cf_snapshots_fetched_at ON public.cf_snapshots(fetched_at DESC);

DROP TRIGGER IF EXISTS trg_cf_snapshots_updated_at ON public.cf_snapshots;
CREATE TRIGGER trg_cf_snapshots_updated_at BEFORE UPDATE ON public.cf_snapshots
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 7. GROUPS ========================
CREATE TABLE IF NOT EXISTS public.groups (
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
    CONSTRAINT groups_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_groups_type ON public.groups(type);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON public.groups(invite_code) WHERE invite_code IS NOT NULL;

DROP TRIGGER IF EXISTS trg_groups_updated_at ON public.groups;
CREATE TRIGGER trg_groups_updated_at BEFORE UPDATE ON public.groups
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 8. GROUP_MEMBERSHIPS ========================
CREATE TABLE IF NOT EXISTS public.group_memberships (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role group_role NOT NULL DEFAULT 'member',
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_gm_group ON public.group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_gm_user ON public.group_memberships(user_id);

DROP TRIGGER IF EXISTS trg_gm_updated_at ON public.group_memberships;
CREATE TRIGGER trg_gm_updated_at BEFORE UPDATE ON public.group_memberships
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 9. GROUP_INVITATIONS ========================
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
    CONSTRAINT gi_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_gi_invitee ON public.group_invitations(invitee_id);

DROP TRIGGER IF EXISTS trg_gi_updated_at ON public.group_invitations;
CREATE TRIGGER trg_gi_updated_at BEFORE UPDATE ON public.group_invitations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 10. PROBLEMS ========================
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
    solved_count integer DEFAULT 0,
    attempt_count integer DEFAULT 0,
    source_url text,
    author text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now()),
    CONSTRAINT problems_platform_check CHECK (platform IN ('codeforces', 'atcoder', 'leetcode', 'codechef', 'usaco', 'cses', 'custom'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_problems_platform_external ON public.problems(platform, external_id);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON public.problems(difficulty_rating);
CREATE INDEX IF NOT EXISTS idx_problems_active ON public.problems(is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_problems_updated_at ON public.problems;
CREATE TRIGGER trg_problems_updated_at BEFORE UPDATE ON public.problems
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 11. PROBLEM_HINTS ========================
CREATE TABLE IF NOT EXISTS public.problem_hints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id uuid NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    level integer NOT NULL,
    hint_type text NOT NULL,
    content text NOT NULL,
    created_at timestamptz DEFAULT timezone('utc', now()),
    updated_at timestamptz DEFAULT timezone('utc', now()),
    UNIQUE (problem_id, level)
);

DROP TRIGGER IF EXISTS trg_problem_hints_updated_at ON public.problem_hints;
CREATE TRIGGER trg_problem_hints_updated_at BEFORE UPDATE ON public.problem_hints
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 12. PROBLEM_HISTORY ========================
CREATE TABLE IF NOT EXISTS public.problem_history (
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

CREATE INDEX IF NOT EXISTS idx_problem_history_user ON public.problem_history(user_id);

-- ======================== 13. USER_PROBLEMS ========================
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
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (user_id, problem_id, platform),
    CONSTRAINT user_problems_status_check CHECK (status IN ('unsolved', 'attempting', 'solved', 'reviewed'))
);

CREATE INDEX IF NOT EXISTS idx_user_problems_user ON public.user_problems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_problems_status ON public.user_problems(status);

DROP TRIGGER IF EXISTS trg_user_problems_updated_at ON public.user_problems;
CREATE TRIGGER trg_user_problems_updated_at BEFORE UPDATE ON public.user_problems
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 14. CONTESTS ========================
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
    CONSTRAINT contests_time_window CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at)
);

CREATE INDEX IF NOT EXISTS idx_contests_host ON public.contests(host_user_id);
CREATE INDEX IF NOT EXISTS idx_contests_visibility ON public.contests(visibility);
CREATE INDEX IF NOT EXISTS idx_contests_status ON public.contests(status);

DROP TRIGGER IF EXISTS trg_contests_updated_at ON public.contests;
CREATE TRIGGER trg_contests_updated_at BEFORE UPDATE ON public.contests
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 15. CONTEST_PARTICIPANTS ========================
CREATE TABLE IF NOT EXISTS public.contest_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id uuid NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    handle_snapshot text,
    joined_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (contest_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cp_contest ON public.contest_participants(contest_id);
CREATE INDEX IF NOT EXISTS idx_cp_user ON public.contest_participants(user_id);

DROP TRIGGER IF EXISTS trg_cp_updated_at ON public.contest_participants;
CREATE TRIGGER trg_cp_updated_at BEFORE UPDATE ON public.contest_participants
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 16. CONTEST_PROBLEMS ========================
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
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_contest_problem ON public.contest_problems(contest_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_contest_problems_contest ON public.contest_problems(contest_id);

DROP TRIGGER IF EXISTS trg_contest_problems_updated_at ON public.contest_problems;
CREATE TRIGGER trg_contest_problems_updated_at BEFORE UPDATE ON public.contest_problems
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 17. CONTEST_SUBMISSIONS ========================
CREATE TABLE IF NOT EXISTS public.contest_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id uuid NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_id text NOT NULL,
    status submission_status NOT NULL,
    penalty_s int NOT NULL DEFAULT 0,
    submitted_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_cs_contest_user ON public.contest_submissions(contest_id, user_id);

DROP TRIGGER IF EXISTS trg_cs_updated_at ON public.contest_submissions;
CREATE TRIGGER trg_cs_updated_at BEFORE UPDATE ON public.contest_submissions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 18. CONTEST_RESULTS ========================
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
    UNIQUE (contest_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_cr_contest ON public.contest_results(contest_id);

DROP TRIGGER IF EXISTS trg_cr_updated_at ON public.contest_results;
CREATE TRIGGER trg_cr_updated_at BEFORE UPDATE ON public.contest_results
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 19. SUBSCRIPTIONS ========================
CREATE TABLE IF NOT EXISTS public.subscriptions (
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
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 20. PURCHASES ========================
CREATE TABLE IF NOT EXISTS public.purchases (
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
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases(user_id);

DROP TRIGGER IF EXISTS trg_purchases_updated_at ON public.purchases;
CREATE TRIGGER trg_purchases_updated_at BEFORE UPDATE ON public.purchases
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 21. PAYMENT_EVENTS ========================
CREATE TABLE IF NOT EXISTS public.payment_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type text NOT NULL,
    event_id text,
    payload jsonb,
    processed boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_payment_events_type ON public.payment_events(event_type);

-- ======================== 22. USER_SHEETS ========================
CREATE TABLE IF NOT EXISTS public.user_sheets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sheet_id text NOT NULL,
    name text NOT NULL,
    description text,
    problems jsonb DEFAULT '[]'::jsonb,
    progress jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (user_id, sheet_id)
);

CREATE INDEX IF NOT EXISTS idx_user_sheets_user ON public.user_sheets(user_id);

DROP TRIGGER IF EXISTS trg_user_sheets_updated_at ON public.user_sheets;
CREATE TRIGGER trg_user_sheets_updated_at BEFORE UPDATE ON public.user_sheets
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 23. GROUP_CHALLENGES ========================
CREATE TABLE IF NOT EXISTS public.group_challenges (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    problem_ids text[],
    starts_at timestamptz,
    ends_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_gc_group ON public.group_challenges(group_id);

DROP TRIGGER IF EXISTS trg_gc_updated_at ON public.group_challenges;
CREATE TRIGGER trg_gc_updated_at BEFORE UPDATE ON public.group_challenges
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 24. GROUP_CHALLENGE_PROGRESS ========================
CREATE TABLE IF NOT EXISTS public.group_challenge_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id uuid NOT NULL REFERENCES public.group_challenges(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    problems_solved text[],
    score int DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (challenge_id, user_id)
);

DROP TRIGGER IF EXISTS trg_gcp_updated_at ON public.group_challenge_progress;
CREATE TRIGGER trg_gcp_updated_at BEFORE UPDATE ON public.group_challenge_progress
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 25. LEARNING_PATHS ========================
CREATE TABLE IF NOT EXISTS public.learning_paths (
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

CREATE INDEX IF NOT EXISTS idx_learning_paths_level ON public.learning_paths(level_number);

DROP TRIGGER IF EXISTS trg_learning_paths_updated_at ON public.learning_paths;
CREATE TRIGGER trg_learning_paths_updated_at BEFORE UPDATE ON public.learning_paths
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 26. USER_LEARNING_PATH_PROGRESS ========================
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
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (user_id, learning_path_id)
);

CREATE INDEX IF NOT EXISTS idx_ulpp_user ON public.user_learning_path_progress(user_id);

DROP TRIGGER IF EXISTS trg_ulpp_updated_at ON public.user_learning_path_progress;
CREATE TRIGGER trg_ulpp_updated_at BEFORE UPDATE ON public.user_learning_path_progress
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 27. PROBLEM_ATTEMPTS ========================
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
    language text,
    started_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_pa_user ON public.problem_attempts(user_id);

DROP TRIGGER IF EXISTS trg_pa_updated_at ON public.problem_attempts;
CREATE TRIGGER trg_pa_updated_at BEFORE UPDATE ON public.problem_attempts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 28. USER_TOPIC_MASTERY ========================
CREATE TABLE IF NOT EXISTS public.user_topic_mastery (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic text NOT NULL,
    problems_attempted int NOT NULL DEFAULT 0,
    problems_solved int NOT NULL DEFAULT 0,
    success_rate real NOT NULL DEFAULT 0.0,
    avg_solve_time_seconds int,
    current_level int DEFAULT 800,
    mastery_level text DEFAULT 'beginner',
    last_practiced_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (user_id, topic)
);

CREATE INDEX IF NOT EXISTS idx_utm_user ON public.user_topic_mastery(user_id);

DROP TRIGGER IF EXISTS trg_utm_updated_at ON public.user_topic_mastery;
CREATE TRIGGER trg_utm_updated_at BEFORE UPDATE ON public.user_topic_mastery
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 29. USER_SKILL_PROFILES ========================
CREATE TABLE IF NOT EXISTS public.user_skill_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    current_skill_level int NOT NULL DEFAULT 800,
    problems_per_week real DEFAULT 0.0,
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

CREATE INDEX IF NOT EXISTS idx_usp_user ON public.user_skill_profiles(user_id);

DROP TRIGGER IF EXISTS trg_usp_updated_at ON public.user_skill_profiles;
CREATE TRIGGER trg_usp_updated_at BEFORE UPDATE ON public.user_skill_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 30. PROBLEM_RECOMMENDATIONS ========================
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
    expires_at timestamptz NOT NULL DEFAULT (timezone('utc', now()) + interval '7 days'),
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_pr_user ON public.problem_recommendations(user_id);

DROP TRIGGER IF EXISTS trg_pr_updated_at ON public.problem_recommendations;
CREATE TRIGGER trg_pr_updated_at BEFORE UPDATE ON public.problem_recommendations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 31. SPACED_REPETITION_REVIEWS ========================
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
    status text NOT NULL DEFAULT 'active',
    first_failed_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE (user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_srr_user ON public.spaced_repetition_reviews(user_id);

DROP TRIGGER IF EXISTS trg_srr_updated_at ON public.spaced_repetition_reviews;
CREATE TRIGGER trg_srr_updated_at BEFORE UPDATE ON public.spaced_repetition_reviews
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== 32. ADAPTIVE_ITEMS ========================
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

CREATE INDEX IF NOT EXISTS idx_ai_user ON public.adaptive_items(user_id);

DROP TRIGGER IF EXISTS trg_ai_updated_at ON public.adaptive_items;
CREATE TRIGGER trg_ai_updated_at BEFORE UPDATE ON public.adaptive_items
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ======================== SUCCESS ========================
DO $$ BEGIN
    RAISE NOTICE '✅ Schema created successfully!';
    RAISE NOTICE 'Next: Run 02_rls_policies.sql';
END $$;
