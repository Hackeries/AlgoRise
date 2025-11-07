-- ==================== ADAPTIVE LEARNING ENGINE ====================
-- Idempotent, UTC-normalized, RLS-hardened with triggers and guardrails
-- - Adds/ensures tables, constraints, RLS, and indexes for adaptive learning
-- - Adds updated_at columns + triggers where relevant
-- - Improves seed for learning_paths with unique constraint to avoid duplicates
-- ==================================================================

create extension if not exists pgcrypto;

-- ---------- Shared updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- ==================== USER LEARNING METRICS ====================

create table if not exists public.problem_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  problem_title text not null,
  problem_url text,
  rating int,
  tags text[],

  -- Attempt tracking
  attempt_number int not null default 1,
  status text not null check (status in ('attempted', 'solved', 'failed', 'timed_out')),

  -- Performance metrics
  time_spent_seconds int,
  hints_used int default 0,
  test_cases_passed int default 0,
  total_test_cases int default 0,

  -- Code submission
  language text,
  code_length int,

  -- Timestamps
  started_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz,

  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- helpful uniqueness to avoid duplicate counters for same attempt per problem
create unique index if not exists uq_problem_attempts_user_problem_attempt
  on public.problem_attempts(user_id, problem_id, attempt_number);

alter table public.problem_attempts enable row level security;

drop policy if exists "problem_attempts_select_own" on public.problem_attempts;
create policy "problem_attempts_select_own" on public.problem_attempts
  for select using (auth.role() = 'service_role' or auth.uid() = user_id);

drop policy if exists "problem_attempts_insert_own" on public.problem_attempts;
create policy "problem_attempts_insert_own" on public.problem_attempts
  for insert with check (auth.role() = 'service_role' or auth.uid() = user_id);

drop policy if exists "problem_attempts_update_own" on public.problem_attempts;
create policy "problem_attempts_update_own" on public.problem_attempts
  for update
  using (auth.role() = 'service_role' or auth.uid() = user_id)
  with check (auth.role() = 'service_role' or auth.uid() = user_id);

create index if not exists idx_problem_attempts_user_id on public.problem_attempts(user_id);
create index if not exists idx_problem_attempts_problem_id on public.problem_attempts(problem_id);
create index if not exists idx_problem_attempts_status on public.problem_attempts(status);
create index if not exists idx_problem_attempts_created_at on public.problem_attempts(created_at);

drop trigger if exists trg_problem_attempts_updated_at on public.problem_attempts;
create trigger trg_problem_attempts_updated_at
before update on public.problem_attempts
for each row execute function public.set_updated_at();

-- ==================== USER TOPIC MASTERY ====================

create table if not exists public.user_topic_mastery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,

  -- Mastery metrics
  problems_attempted int not null default 0,
  problems_solved int not null default 0,
  success_rate real not null default 0.0,

  -- Average metrics
  avg_solve_time_seconds int,
  avg_attempts_per_problem real default 1.0,

  -- Rating progression
  min_rating_solved int,
  max_rating_solved int,
  current_level int default 800, -- inferred difficulty level for this topic

  -- Mastery classification
  mastery_level text check (mastery_level in ('beginner', 'learning', 'proficient', 'master', 'expert')) default 'beginner',

  -- Timestamps
  last_practiced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  unique (user_id, topic)
);

alter table public.user_topic_mastery enable row level security;

drop policy if exists "user_topic_mastery_select_own" on public.user_topic_mastery;
create policy "user_topic_mastery_select_own" on public.user_topic_mastery
  for select using (auth.role() = 'service_role' or auth.uid() = user_id);

drop policy if exists "user_topic_mastery_upsert_own" on public.user_topic_mastery;
create policy "user_topic_mastery_upsert_own" on public.user_topic_mastery
  for insert with check (auth.role() = 'service_role' or auth.uid() = user_id);

drop policy if exists "user_topic_mastery_update_own" on public.user_topic_mastery;
create policy "user_topic_mastery_update_own" on public.user_topic_mastery
  for update
  using (auth.role() = 'service_role' or auth.uid() = user_id)
  with check (auth.role() = 'service_role' or auth.uid() = user_id);

create index if not exists idx_user_topic_mastery_user_id on public.user_topic_mastery(user_id);
create index if not exists idx_user_topic_mastery_topic on public.user_topic_mastery(topic);
create index if not exists idx_user_topic_mastery_success_rate on public.user_topic_mastery(success_rate);

drop trigger if exists trg_user_topic_mastery_updated_at on public.user_topic_mastery;
create trigger trg_user_topic_mastery_updated_at
before update on public.user_topic_mastery
for each row execute function public.set_updated_at();

-- ==================== USER SKILL PROFILE ====================

create table if not exists public.user_skill_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Current skill level (inferred from recent performance)
  current_skill_level int not null default 800,

  -- Learning velocity (problems per week)
  problems_per_week real default 0.0,

  -- Average solve time (in seconds)
  avg_solve_time_seconds int,

  -- Improvement tracking
  skill_level_7d_ago int,
  skill_level_30d_ago int,
  improvement_rate real default 0.0, -- positive = improving, negative = declining

  -- Activity metrics
  total_problems_attempted int not null default 0,
  total_problems_solved int not null default 0,
  overall_success_rate real default 0.0,

  -- Streaks
  current_streak int default 0,
  longest_streak int default 0,

  -- Weak/strong areas (top 5 each)
  weak_topics text[],
  strong_topics text[],

  -- Timestamps
  last_activity_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  unique (user_id)
);

alter table public.user_skill_profiles enable row level security;

drop policy if exists "user_skill_profiles_select_own" on public.user_skill_profiles;
create policy "user_skill_profiles_select_own" on public.user_skill_profiles
  for select using (auth.role() = 'service_role' or auth.uid() = user_id);

drop policy if exists "user_skill_profiles_upsert_own" on public.user_skill_profiles;
create policy "user_skill_profiles_upsert_own" on public.user_skill_profiles
  for insert with check (auth.role() = 'service_role' or auth.uid() = user_id);

drop policy if exists "user_skill_profiles_update_own" on public.user_skill_profiles;
create policy "user_skill_profiles_update_own" on public.user_skill_profiles
  for update
  using (auth.role() = 'service_role' or auth.uid() = user_id)
  with check (auth.role() = 'service_role' or auth.uid() = user_id);

create index if not exists idx_user_skill_profiles_user_id on public.user_skill_profiles(user_id);

drop trigger if exists trg_user_skill_profiles_updated_at on public.user_skill_profiles;
create trigger trg_user_skill_profiles_updated_at
before update on public.user_skill_profiles
for each row execute function public.set_updated_at();

-- ==================== PROBLEM RECOMMENDATIONS ====================

create table if not exists public.problem_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  problem_title text not null,
  problem_url text,
  rating int not null,
  tags text[],

  -- Recommendation metadata
  recommendation_reason text not null,
  recommended_difficulty int not null,
  priority_score real not null default 0.5, -- 0-1, higher = more recommended

  -- Categories
  category text check (category in ('skill_level', 'weak_topic', 'exploratory', 'spaced_repetition')),

  -- Status
  status text not null default 'pending' check (status in ('pending', 'viewed', 'started', 'completed', 'skipped')),

  -- Timestamps
  viewed_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  expires_at timestamptz not null default (timezone('utc', now()) + interval '7 days'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  unique (user_id, problem_id)
);

-- Guardrail: ensure 0..1 priority_score
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'problem_recommendations_priority_range') then
    alter table public.problem_recommendations
      add constraint problem_recommendations_priority_range
      check (priority_score >= 0.0 and priority_score <= 1.0);
  end if;
end$$;

alter table public.problem_recommendations enable row level security;

drop policy if exists "problem_recommendations_select_own" on public.problem_recommendations;
create policy "problem_recommendations_select_own" on public.problem_recommendations
  for select using (auth.role() = 'service_role' or auth.uid() = user_id);

drop policy if exists "problem_recommendations_insert_own" on public.problem_recommendations;
create policy "problem_recommendations_insert_own" on public.problem_recommendations
  for insert with check (auth.role() = 'service_role' or auth.uid() = user_id);

drop policy if exists "problem_recommendations_update_own" on public.problem_recommendations;
create policy "problem_recommendations_update_own" on public.problem_recommendations
  for update
  using (auth.role() = 'service_role' or auth.uid() = user_id)
  with check (auth.role() = 'service_role' or auth.uid() = user_id);

create index if not exists idx_problem_recommendations_user_id on public.problem_recommendations(user_id);
create index if not exists idx_problem_recommendations_status on public.problem_recommendations(status);
create index if not exists idx_problem_recommendations_priority on public.problem_recommendations(priority_score desc);
create index if not exists idx_problem_recommendations_expires on public.problem_recommendations(expires_at);

drop trigger if exists trg_problem_recommendations_updated_at on public.problem_recommendations;
create trigger trg_problem_recommendations_updated_at
before update on public.problem_recommendations
for each row execute function public.set_updated_at();

-- ==================== LEARNING PATHS ====================

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  difficulty_range_min int not null,
  difficulty_range_max int not null,
  level_number int not null,

  -- Path structure
  prerequisites text[], -- Array of prerequisite learning_path IDs (string identifiers or codes)
  topics text[] not null,
  estimated_problems int not null,

  -- Metadata
  is_active boolean default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- add uniqueness to avoid duplicate seed rows
do $$
begin
  if not exists (select 1 from pg_constraint where conname='learning_paths_unique_name') then
    alter table public.learning_paths add constraint learning_paths_unique_name unique (name);
  end if;
end$$;

alter table public.learning_paths enable row level security;

drop policy if exists "learning_paths_select_all" on public.learning_paths;
create policy "learning_paths_select_all" on public.learning_paths
  for select using (auth.role() = 'service_role' or is_active = true);

create index if not exists idx_learning_paths_level on public.learning_paths(level_number);
create index if not exists idx_learning_paths_difficulty on public.learning_paths(difficulty_range_min, difficulty_range_max);

drop trigger if exists trg_learning_paths_updated_at on public.learning_paths;
create trigger trg_learning_paths_updated_at
before update on public.learning_paths
for each row execute function public.set_updated_at();

-- ==================== USER LEARNING PATH PROGRESS ====================

create table if not exists public.user_learning_path_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,

  -- Progress tracking
  problems_completed int not null default 0,
  total_problems int not null,
  completion_percentage real not null default 0.0,

  -- Status
  status text not null default 'in_progress' check (status in ('not_started', 'in_progress', 'completed', 'paused')),

  -- Timestamps
  started_at timestamptz default timezone('utc', now()),
  completed_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  unique (user_id, learning_path_id)
);

alter table public.user_learning_path_progress enable row level security;

drop policy if exists "user_learning_path_progress_select_own" on public.user_learning_path_progress;
create policy "user_learning_path_progress_select_own" on public.user_learning_path_progress
  for select using (auth.role() = 'service_role' or auth.uid() = user_id);

drop policy if exists "user_learning_path_progress_upsert_own" on public.user_learning_path_progress;
create policy "user_learning_path_progress_upsert_own" on public.user_learning_path_progress
  for insert with check (auth.role() = 'service_role' or auth.uid() = user_id);

drop policy if exists "user_learning_path_progress_update_own" on public.user_learning_path_progress;
create policy "user_learning_path_progress_update_own" on public.user_learning_path_progress
  for update
  using (auth.role() = 'service_role' or auth.uid() = user_id)
  with check (auth.role() = 'service_role' or auth.uid() = user_id);

create index if not exists idx_user_learning_path_progress_user_id on public.user_learning_path_progress(user_id);
create index if not exists idx_user_learning_path_progress_path_id on public.user_learning_path_progress(learning_path_id);
create index if not exists idx_user_learning_path_progress_status on public.user_learning_path_progress(status);

drop trigger if exists trg_user_learning_path_progress_updated_at on public.user_learning_path_progress;
create trigger trg_user_learning_path_progress_updated_at
before update on public.user_learning_path_progress
for each row execute function public.set_updated_at();

-- ==================== SPACED REPETITION REVIEWS ====================

create table if not exists public.spaced_repetition_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  problem_title text not null,
  problem_url text,
  rating int,
  tags text[],

  -- Repetition tracking
  review_count int not null default 0,
  last_review_outcome text check (last_review_outcome in ('failed', 'partial', 'success')),

  -- Scheduling (based on SM-2 algorithm)
  ease_factor real not null default 2.5,
  interval_days real not null default 1.0,
  next_review_at timestamptz not null default timezone('utc', now()),

  -- Review history
  review_dates timestamptz[],
  review_outcomes text[], -- Array of 'failed', 'partial', 'success'

  -- Status
  status text not null default 'active' check (status in ('active', 'mastered', 'archived')),

  -- Timestamps
  first_failed_at timestamptz not null default timezone('utc', now()),
  last_reviewed_at timestamptz,
  mastered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  unique (user_id, problem_id)
);

-- Guardrails for SM-2 parameters
do $$
begin
  if not exists (select 1 from pg_constraint where conname='srr_ease_factor_bounds') then
    alter table public.spaced_repetition_reviews
      add constraint srr_ease_factor_bounds check (ease_factor >= 1.3 and ease_factor <= 3.5);
  end if;
  if not exists (select 1 from pg_constraint where conname='srr_interval_days_nonneg') then
    alter table public.spaced_repetition_reviews
      add constraint srr_interval_days_nonneg check (interval_days >= 0);
  end if;
end$$;

alter table public.spaced_repetition_reviews enable row level security;

drop policy if exists "spaced_repetition_reviews_select_own" on public.spaced_repetition_reviews;
create policy "spaced_repetition_reviews_select_own" on public.spaced_repetition_reviews
  for select using (auth.role() = 'service_role' or auth.uid() = user_id);

drop policy if exists "spaced_repetition_reviews_upsert_own" on public.spaced_repetition_reviews;
create policy "spaced_repetition_reviews_upsert_own" on public.spaced_repetition_reviews
  for insert with check (auth.role() = 'service_role' or auth.uid() = user_id);

drop policy if exists "spaced_repetition_reviews_update_own" on public.spaced_repetition_reviews;
create policy "spaced_repetition_reviews_update_own" on public.spaced_repetition_reviews
  for update
  using (auth.role() = 'service_role' or auth.uid() = user_id)
  with check (auth.role() = 'service_role' or auth.uid() = user_id);

create index if not exists idx_spaced_repetition_reviews_user_id on public.spaced_repetition_reviews(user_id);
create index if not exists idx_spaced_repetition_reviews_next_review on public.spaced_repetition_reviews(next_review_at);
create index if not exists idx_spaced_repetition_reviews_status on public.spaced_repetition_reviews(status);

drop trigger if exists trg_spaced_repetition_reviews_updated_at on public.spaced_repetition_reviews;
create trigger trg_spaced_repetition_reviews_updated_at
before update on public.spaced_repetition_reviews
for each row execute function public.set_updated_at();

-- ==================== SEED LEARNING PATHS (idempotent) ====================

insert into public.learning_paths (name, description, difficulty_range_min, difficulty_range_max, level_number, topics, estimated_problems)
values
  ('Level 1: Basics', 'Master the fundamentals of programming and problem solving', 800, 1000, 1, ARRAY['implementation', 'math', 'brute-force', 'greedy'], 15),
  ('Level 2: Data Structures', 'Learn essential data structures', 1000, 1200, 2, ARRAY['data-structures', 'sorting', 'binary-search', 'two-pointers'], 15),
  ('Level 3: Algorithm Fundamentals', 'Core algorithmic techniques', 1200, 1400, 3, ARRAY['greedy', 'dp', 'graphs', 'dfs-and-similar'], 15),
  ('Level 4: Advanced Algorithms', 'Complex algorithmic patterns', 1400, 1600, 4, ARRAY['dp', 'graphs', 'trees', 'dsu'], 15),
  ('Level 5: Problem Solving Mastery', 'Master advanced problem solving', 1600, 1900, 5, ARRAY['dp', 'graphs', 'trees', 'strings', 'segment-trees'], 20),
  ('Level 6: Expert Challenges', 'Expert level problems', 1900, 2400, 6, ARRAY['dp', 'graphs', 'strings', 'number-theory', 'geometry'], 20)
on conflict (name) do nothing;

-- ==================== HELPER FUNCTIONS & TRIGGERS ====================

-- Function to update user skill profile after problem attempt
create or replace function public.update_user_skill_profile()
returns trigger
language plpgsql
as $$
begin
  -- Update or insert skill profile atomically
  insert into public.user_skill_profiles (user_id, last_activity_at, total_problems_attempted, created_at, updated_at)
  values (new.user_id, timezone('utc', now()), 1, timezone('utc', now()), timezone('utc', now()))
  on conflict (user_id) do update set
    total_problems_attempted = public.user_skill_profiles.total_problems_attempted + 1,
    total_problems_solved = case when new.status = 'solved'
      then public.user_skill_profiles.total_problems_solved + 1
      else public.user_skill_profiles.total_problems_solved end,
    last_activity_at = timezone('utc', now()),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

-- Create trigger
drop trigger if exists trigger_update_skill_profile on public.problem_attempts;
create trigger trigger_update_skill_profile
  after insert on public.problem_attempts
  for each row execute function public.update_user_skill_profile();

-- Function to update topic mastery after problem attempt
create or replace function public.update_topic_mastery()
returns trigger
language plpgsql
as $$
declare
  tag text;
begin
  -- Update mastery for each tag
  if new.tags is not null then
    foreach tag in array new.tags
    loop
      continue when tag is null or btrim(tag) = '';
      insert into public.user_topic_mastery
        (user_id, topic, problems_attempted, problems_solved, last_practiced_at, created_at, updated_at)
      values
        (new.user_id, tag, 1, case when new.status = 'solved' then 1 else 0 end, timezone('utc', now()), timezone('utc', now()), timezone('utc', now()))
      on conflict (user_id, topic) do update set
        problems_attempted = public.user_topic_mastery.problems_attempted + 1,
        problems_solved = case when new.status = 'solved'
          then public.user_topic_mastery.problems_solved + 1
          else public.user_topic_mastery.problems_solved end,
        success_rate = case
          when public.user_topic_mastery.problems_attempted + 1 > 0 then
            (public.user_topic_mastery.problems_solved + case when new.status = 'solved' then 1 else 0 end)::real /
            (public.user_topic_mastery.problems_attempted + 1)::real
          else 0.0 end,
        last_practiced_at = timezone('utc', now()),
        updated_at = timezone('utc', now());
    end loop;
  end if;

  return new;
end;
$$;

-- Create trigger
drop trigger if exists trigger_update_topic_mastery on public.problem_attempts;
create trigger trigger_update_topic_mastery
  after insert on public.problem_attempts
  for each row execute function public.update_topic_mastery();