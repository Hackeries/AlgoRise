-- AlgoRise Database Setup Script
-- Run this script in your Supabase SQL Editor to set up all required tables

-- ==================== CORE TABLES ====================

-- Create profiles table for user profile data
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  profile_image_url text,
  show_profile_image boolean default true,
  
  -- Updated to use 'status' field with 'student' or 'working' values
  status text check (status in ('student', 'working')),
  
  -- Added degree_type field for students
  degree_type text, -- 'btech', 'mtech', 'bsc', 'msc', 'bca', 'mca', 'mba', 'phd', 'other'
  
  -- Working professional fields
  -- Changed company to company_id to reference companies table
  company_id uuid references public.companies(id) on delete set null,
  custom_company text, -- For "Other" option or custom company names
  
  -- Student fields - college_id references colleges table
  college_id uuid references public.colleges(id) on delete set null,
  year text, -- '1', '2', '3', '4', '5' for year of study
  
  -- Common fields
  preferred_language text,
  programming_languages text[], -- Array of languages
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
drop policy if exists "select own profile" on public.profiles;
create policy "select own profile"
on public.profiles
for select
using ( auth.uid() = user_id );

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile"
on public.profiles
for insert
with check ( auth.uid() = user_id );

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
on public.profiles
for update
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

-- Create indexes
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_college_id on public.profiles(college_id);
create index if not exists idx_profiles_company_id on public.profiles(company_id);
create index if not exists idx_profiles_status on public.profiles(status);

-- Add updated_at trigger function if it doesn't exist
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at trigger
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- ==================== STREAKS ====================

create table if not exists public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_day date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

alter table public.streaks enable row level security;

do $$ begin
  create policy "streaks_select_own" on public.streaks
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "streaks_upsert_own" on public.streaks
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "streaks_update_own" on public.streaks
    for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create index if not exists idx_streaks_user_id on public.streaks(user_id);

-- ==================== CF HANDLES ====================

create table if not exists public.cf_handles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  handle text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id),
  unique (handle)
);

alter table public.cf_handles enable row level security;

do $$ begin
  create policy "cf_handles_select_own" on public.cf_handles
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "cf_handles_upsert_own" on public.cf_handles
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "cf_handles_update_own" on public.cf_handles
    for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create index if not exists idx_cf_handles_user_id on public.cf_handles(user_id);
create index if not exists idx_cf_handles_handle on public.cf_handles(handle);

-- ==================== CF SNAPSHOTS ====================

create table if not exists public.cf_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  handle text not null,
  last_rating int,
  last_contest text,
  rating_delta int,
  fetched_at timestamptz not null default now()
);

alter table public.cf_snapshots enable row level security;

do $$ begin
  create policy "cf_snapshots_select_own" on public.cf_snapshots
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "cf_snapshots_upsert_own" on public.cf_snapshots
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "cf_snapshots_update_own" on public.cf_snapshots
    for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ==================== ADAPTIVE ITEMS ====================

create table if not exists public.adaptive_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  problem_title text not null,
  problem_url text not null,
  rating int,
  tags text[],
  repetitions int not null default 0,
  ease real not null default 2.5,
  interval_days real not null default 1,
  next_due_at timestamptz not null default now(),
  last_outcome text check (last_outcome in ('again', 'hard', 'good', 'easy')),
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, problem_id)
);

alter table public.adaptive_items enable row level security;

do $$ begin
  create policy "adaptive_items_select_own" on public.adaptive_items
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "adaptive_items_upsert_own" on public.adaptive_items
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "adaptive_items_update_own" on public.adaptive_items
    for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create index if not exists idx_adaptive_items_user_id on public.adaptive_items(user_id);
create index if not exists idx_adaptive_items_next_due on public.adaptive_items(next_due_at);
create index if not exists idx_adaptive_items_problem_id on public.adaptive_items(problem_id);

-- ==================== COLLEGES ====================

create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text,
  country text default 'India',
  created_at timestamptz not null default now()
);

alter table public.colleges enable row level security;

do $$ begin
  create policy "colleges_select_all" on public.colleges
    for select using (true);
exception when duplicate_object then null; end $$;

create index if not exists idx_colleges_name on public.colleges(name);

-- ==================== GROUPS ====================

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.groups enable row level security;

do $$ begin
  create policy "groups_select_all" on public.groups
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "groups_insert_own" on public.groups
    for insert with check (auth.uid() = created_by);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "groups_update_own" on public.groups
    for update using (created_by = auth.uid());
exception when duplicate_object then null; end $$;

create index if not exists idx_groups_created_by on public.groups(created_by);

-- ==================== GROUP MEMBERSHIPS ====================

create table if not exists public.group_memberships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'moderator', 'member')),
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

alter table public.group_memberships enable row level security;

do $$ begin
  create policy "group_memberships_select_all" on public.group_memberships
    for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "group_memberships_insert_own" on public.group_memberships
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "group_memberships_delete_own" on public.group_memberships
    for delete using (user_id = auth.uid());
exception when duplicate_object then null; end $$;

create index if not exists idx_group_memberships_group_id on public.group_memberships(group_id);
create index if not exists idx_group_memberships_user_id on public.group_memberships(user_id);

-- ==================== CONTESTS ====================

-- Drop existing tables if they exist (clean slate)
drop table if exists public.contest_submissions cascade;
drop table if exists public.contest_results cascade;
drop table if exists public.contest_problems cascade;
drop table if exists public.contest_participants cascade;
drop table if exists public.contests cascade;

-- Create contests table with consistent schema
create table public.contests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  visibility text not null default 'private' check (visibility in ('private','public')),
  status text not null default 'draft' check (status in ('draft','running','ended','upcoming')),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz,
  ends_at timestamptz,
  max_participants int,
  allow_late_join boolean not null default true,
  contest_mode text not null default 'practice' check (contest_mode in ('practice','icpc')),
  duration_minutes int,
  problem_count int not null default 5,
  rating_min int not null default 800,
  rating_max int not null default 1600,
  created_at timestamptz not null default now()
);

create table public.contest_participants (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  handle_snapshot text,
  joined_at timestamptz not null default now(),
  unique (contest_id, user_id)
);

create table public.contest_problems (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  problem_id text not null,
  title text not null,
  points int not null default 1,
  contest_id_cf int,
  index_cf text,
  rating int
);

create table public.contest_submissions (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  status text not null check (status in ('solved','failed')),
  penalty_s int not null default 0,
  submitted_at timestamptz not null default now()
);

create table public.contest_results (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rank int not null,
  score int not null,
  penalty_s int not null,
  rating_delta int not null,
  computed_at timestamptz not null default now(),
  unique (contest_id, user_id)
);

-- Enable RLS
alter table public.contests enable row level security;
alter table public.contest_participants enable row level security;
alter table public.contest_problems enable row level security;
alter table public.contest_submissions enable row level security;
alter table public.contest_results enable row level security;

-- SIMPLIFIED RLS POLICIES WITHOUT ANY RECURSION

-- Contests: Simple direct policies
create policy "Anyone can view public contests" on public.contests
  for select using (visibility = 'public');

create policy "Users can view contests they host" on public.contests
  for select using (host_user_id = auth.uid());

create policy "Users can view contests they participate in" on public.contests
  for select using (
    exists (
      select 1 from public.contest_participants 
      where contest_participants.contest_id = id 
        and contest_participants.user_id = auth.uid()
    )
  );

create policy "Users can create contests" on public.contests
  for insert with check (auth.uid() is not null);

create policy "Users can update their own contests" on public.contests
  for update using (host_user_id = auth.uid());

-- Contest participants
create policy "Anyone can view participants" on public.contest_participants
  for select using (true);

create policy "Users can join contests" on public.contest_participants
  for insert with check (auth.uid() is not null);

-- Contest problems
create policy "Anyone can view contest problems" on public.contest_problems
  for select using (true);

create policy "Hosts can add problems" on public.contest_problems
  for insert with check (
    exists (
      select 1 from public.contests 
      where contests.id = contest_id 
        and contests.host_user_id = auth.uid()
    )
  );

-- Contest submissions
create policy "Anyone can view submissions" on public.contest_submissions
  for select using (true);

create policy "Users can create submissions" on public.contest_submissions
  for insert with check (auth.uid() is not null);

-- Contest results
create policy "Anyone can view results" on public.contest_results
  for select using (true);

create policy "Hosts can manage results" on public.contest_results
  for all using (
    exists (
      select 1 from public.contests 
      where contests.id = contest_id 
        and contests.host_user_id = auth.uid()
    )
  );

-- Indexes
create index if not exists idx_contests_host on public.contests(host_user_id);
create index if not exists idx_contests_visibility on public.contests(visibility);
create index if not exists idx_contests_status on public.contests(status);
create index if not exists idx_participants_user on public.contest_participants(user_id);
create index if not exists idx_participants_contest on public.contest_participants(contest_id);
create index if not exists idx_problems_contest on public.contest_problems(contest_id);
create index if not exists idx_submissions_contest_user on public.contest_submissions(contest_id, user_id);
create index if not exists idx_results_contest on public.contest_results(contest_id);

-- ==================== COMPANIES ====================

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  created_at timestamptz not null default now()
);

alter table public.companies enable row level security;

do $$ begin
  create policy "companies_select_all" on public.companies
    for select using (true);
exception when duplicate_object then null; end $$;

create index if not exists idx_companies_name on public.companies(name);

-- ==================== USER PROBLEMS ====================

create table if not exists public.user_problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  problem_title text not null,
  problem_url text not null,
  status text not null check (status in ('todo', 'solving', 'solved', 'skipped')),
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  tags text[],
  notes text,
  revision_count int not null default 0,
  last_revision_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, problem_id)
);

alter table public.user_problems enable row level security;

do $$ begin
  create policy "user_problems_select_own" on public.user_problems
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "user_problems_upsert_own" on public.user_problems
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "user_problems_update_own" on public.user_problems
    for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create index if not exists idx_user_problems_user_id on public.user_problems(user_id);
create index if not exists idx_user_problems_problem_id on public.user_problems(problem_id);
create index if not exists idx_user_problems_status on public.user_problems(status);

-- ==================== CONTEST SUBMISSION FILES ====================

create table if not exists public.contest_submission_files (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  file_name text not null,
  language text not null,
  code_text text not null,
  created_at timestamptz not null default now()
);

alter table public.contest_submission_files enable row level security;

do $$ begin
  create policy "contest_submission_files_select_own" on public.contest_submission_files
    for select using (
      user_id = auth.uid() or
      exists (
        select 1 from public.contest_participants cp
        where cp.contest_id = contest_id and cp.user_id = auth.uid()
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "contest_submission_files_insert_own" on public.contest_submission_files
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create index if not exists idx_contest_submission_files_contest on public.contest_submission_files(contest_id);
create index if not exists idx_contest_submission_files_user on public.contest_submission_files(user_id);

-- ==================== PURCHASES ====================

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  razorpay_order_id text not null,
  razorpay_payment_id text,
  amount int not null,
  currency text not null default 'INR',
  status text not null check (status in ('created', 'attempted', 'paid')),
  product_type text not null,
  product_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

do $$ begin
  create policy "purchases_select_own" on public.purchases
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create index if not exists idx_purchases_user_id on public.purchases(user_id);
create index if not exists idx_purchases_razorpay_order_id on public.purchases(razorpay_order_id);

-- ==================== USER SHEETS ====================

create table if not exists public.user_sheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sheet_code text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, sheet_code)
);

alter table public.user_sheets enable row level security;

do $$ begin
  create policy "user_sheets_select_own" on public.user_sheets
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "user_sheets_upsert_own" on public.user_sheets
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

create index if not exists idx_user_sheets_user_id on public.user_sheets(user_id);

-- ==================== NOTIFICATIONS ====================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

do $$ begin
  create policy "notifications_select_own" on public.notifications
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "notifications_insert_system" on public.notifications
    for insert with check (true);
exception when duplicate_object then null; end $$;

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_created_at on public.notifications(created_at);
create index if not exists idx_notifications_read_at on public.notifications(read_at);

-- ==================== NOTIFICATION SETTINGS ====================

create table if not exists public.notification_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_daily_problem_reminder boolean not null default true,
  email_contest_starting boolean not null default true,
  email_rating_change boolean not null default true,
  email_friend_joined_contest boolean not null default true,
  email_group_invites boolean not null default true,
  email_weekly_summary boolean not null default true,
  in_app_daily_problem_reminder boolean not null default true,
  in_app_contest_starting boolean not null default true,
  in_app_rating_change boolean not null default true,
  in_app_friend_joined_contest boolean not null default true,
  in_app_group_invites boolean not null default true,
  in_app_weekly_summary boolean not null default true,
  quiet_hours_start time,
  quiet_hours_end time,
  digest_frequency text check (digest_frequency in ('immediate', 'hourly', 'daily')) default 'immediate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_settings enable row level security;

do $$ begin
  create policy "notification_settings_select_own" on public.notification_settings
    for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "notification_settings_upsert_own" on public.notification_settings
    for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "notification_settings_update_own" on public.notification_settings
    for update using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ==================== GROUP INVITATIONS ====================

create table if not exists public.group_invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  invited_by uuid not null references auth.users(id) on delete cascade,
  email text,
  user_id uuid references auth.users(id) on delete cascade,
  invite_code text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.group_invitations enable row level security;

do $$ begin
  create policy "group_invitations_select_own" on public.group_invitations
    for select using (
      user_id = auth.uid() or
      invited_by = auth.uid() or
      exists (
        select 1 from public.group_memberships gm
        where gm.group_id = group_id and gm.user_id = auth.uid() and gm.role = 'admin'
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "group_invitations_insert_own" on public.group_invitations
    for insert with check (
      exists (
        select 1 from public.group_memberships gm
        where gm.group_id = group_id and gm.user_id = auth.uid() and gm.role in ('admin', 'moderator')
      )
    );
exception when duplicate_object then null; end $$;

create index if not exists idx_group_invitations_group_id on public.group_invitations(group_id);
create index if not exists idx_group_invitations_user_id on public.group_invitations(user_id);
create index if not exists idx_group_invitations_invite_code on public.group_invitations(invite_code);

-- ==================== BATTLE ARENA ====================

-- Drop existing tables if they exist (clean slate)
drop table if exists public.battle_submissions cascade;
drop table if exists public.battle_rounds cascade;
drop table if exists public.battle_participants cascade;
drop table if exists public.battles cascade;
drop table if exists public.battle_ratings cascade;

-- Create battles table
create table public.battles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  format text not null default 'best_of_3' check (format in ('best_of_1', 'best_of_3', 'best_of_5')),
  status text not null default 'waiting' check (status in ('waiting', 'in_progress', 'completed', 'cancelled')),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  guest_user_id uuid references auth.users(id) on delete cascade,
  winner_user_id uuid references auth.users(id) on delete cascade,
  current_round int not null default 1,
  max_rating_diff int not null default 400, -- Maximum rating difference allowed for matchmaking
  created_at timestamptz not null default now(),
  started_at timestamptz,
  ended_at timestamptz
);

-- Create battle_participants table
create table public.battle_participants (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  handle_snapshot text,
  rating_before int not null default 1200,
  rating_after int,
  rating_delta int,
  is_host boolean not null default false,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  unique (battle_id, user_id)
);

-- Create battle_rounds table
create table public.battle_rounds (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  round_number int not null,
  problem_id text not null,
  title text not null,
  contest_id_cf int,
  index_cf text,
  rating int,
  winner_user_id uuid references auth.users(id) on delete cascade,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds int not null default 3600, -- 1 hour default
  unique (battle_id, round_number)
);

-- Create battle_submissions table
create table public.battle_submissions (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  round_id uuid not null references public.battle_rounds(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  status text not null check (status in ('pending', 'solved', 'failed', 'compiling', 'running')),
  language text not null default 'cpp',
  code_text text,
  submitted_at timestamptz not null default now(),
  execution_time_ms int,
  memory_kb int
);

-- Create battle_ratings table for ELO ratings
create table public.battle_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null default 1200,
  battles_count int not null default 0,
  wins int not null default 0,
  losses int not null default 0,
  last_updated timestamptz not null default now(),
  unique (user_id)
);

-- Enable RLS
alter table public.battles enable row level security;
alter table public.battle_participants enable row level security;
alter table public.battle_rounds enable row level security;
alter table public.battle_submissions enable row level security;
alter table public.battle_ratings enable row level security;

-- Drop ALL existing policies first
drop policy if exists "battles_select_policy" on public.battles;
drop policy if exists "battles_insert_policy" on public.battles;
drop policy if exists "battles_update_policy" on public.battles;
drop policy if exists "participants_select_policy" on public.battle_participants;
drop policy if exists "participants_insert_policy" on public.battle_participants;
drop policy if exists "rounds_select_policy" on public.battle_rounds;
drop policy if exists "rounds_insert_policy" on public.battle_rounds;
drop policy if exists "submissions_select_policy" on public.battle_submissions;
drop policy if exists "submissions_insert_policy" on public.battle_submissions;
drop policy if exists "ratings_select_policy" on public.battle_ratings;
drop policy if exists "ratings_upsert_policy" on public.battle_ratings;

-- RLS POLICIES

-- Battles: Simple direct policies
create policy "Anyone can view public battles" on public.battles
  for select using (true);

create policy "Users can create battles" on public.battles
  for insert with check (auth.uid() is not null);

create policy "Users can update their own battles" on public.battles
  for update using (
    host_user_id = auth.uid() or 
    guest_user_id = auth.uid() or
    exists (
      select 1 from public.battle_participants 
      where battle_participants.battle_id = id 
        and battle_participants.user_id = auth.uid()
    )
  );

-- Battle participants
create policy "Anyone can view participants" on public.battle_participants
  for select using (true);

create policy "Users can join battles" on public.battle_participants
  for insert with check (auth.uid() is not null);

-- Battle rounds
create policy "Anyone can view battle rounds" on public.battle_rounds
  for select using (true);

create policy "Hosts can manage rounds" on public.battle_rounds
  for all using (
    exists (
      select 1 from public.battles 
      where battles.id = battle_id 
        and battles.host_user_id = auth.uid()
    )
  );

-- Battle submissions
create policy "Anyone can view submissions" on public.battle_submissions
  for select using (true);

create policy "Users can create submissions" on public.battle_submissions
  for insert with check (auth.uid() is not null);

-- Battle ratings
create policy "Anyone can view ratings" on public.battle_ratings
  for select using (true);

create policy "Users can update their own ratings" on public.battle_ratings
  for update using (user_id = auth.uid());

-- Indexes
create index if not exists idx_battles_host on public.battles(host_user_id);
create index if not exists idx_battles_guest on public.battles(guest_user_id);
create index if not exists idx_battles_status on public.battles(status);
create index if not exists idx_battles_created on public.battles(created_at);
create index if not exists idx_participants_user on public.battle_participants(user_id);
create index if not exists idx_participants_battle on public.battle_participants(battle_id);
create index if not exists idx_rounds_battle on public.battle_rounds(battle_id);
create index if not exists idx_rounds_number on public.battle_rounds(round_number);
create index if not exists idx_submissions_battle on public.battle_submissions(battle_id);
create index if not exists idx_submissions_round on public.battle_submissions(round_id);
create index if not exists idx_submissions_user on public.battle_submissions(user_id);
create index if not exists idx_ratings_user on public.battle_ratings(user_id);
create index if not exists idx_ratings_rating on public.battle_ratings(rating);