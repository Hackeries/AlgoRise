-- ============================================================================
-- SUBSCRIPTION SYSTEM HARDENING & PRO ANALYTICS
-- ----------------------------------------------------------------------------
-- Enhances the subscription system with:
-- 1. subscription_tier and pro_expires_at aliases for clarity
-- 2. RLS policies for upsolve_queue and analytics with subscription checks
-- 3. Pro-only analytics tables (weak tags, mastery, fail-decay)
-- 4. Efficient indices for subscription-based queries
-- ============================================================================

-- 1) Ensure profiles has subscription fields and add helpful indices
do $$
begin
  -- Verify profiles table exists
  if to_regclass('public.profiles') is null then
    raise exception 'Table public.profiles does not exist';
  end if;
end$$;

-- Add indices for efficient subscription queries
create index if not exists idx_profiles_subscription_active on public.profiles(subscription_status) 
  where subscription_status = 'active';
create index if not exists idx_profiles_pro_check on public.profiles(subscription_plan, subscription_end) 
  where subscription_plan != 'free';

-- Create helper function to check if user has active Pro subscription
create or replace function public.has_active_pro_subscription(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_status text;
  v_end timestamptz;
begin
  select subscription_plan, subscription_status, subscription_end
  into v_plan, v_status, v_end
  from public.profiles
  where id = p_user_id;
  
  -- Free plan never has Pro access
  if v_plan = 'free' or v_plan is null then
    return false;
  end if;
  
  -- Must have active status
  if v_status != 'active' then
    return false;
  end if;
  
  -- Check expiry (null means lifetime access)
  if v_end is not null and v_end < timezone('utc', now()) then
    return false;
  end if;
  
  return true;
end;
$$;

comment on function public.has_active_pro_subscription is 
  'Returns true if user has an active Pro subscription (not free, active status, not expired)';

-- 2) Harden upsolve_queue RLS with subscription checks
alter table public.upsolve_queue enable row level security;

-- Drop existing policies
drop policy if exists "upsolve_select_own" on public.upsolve_queue;
drop policy if exists "upsolve_insert_own" on public.upsolve_queue;
drop policy if exists "upsolve_update_own" on public.upsolve_queue;
drop policy if exists "upsolve_delete_own" on public.upsolve_queue;

-- Pro-only access policies
create policy "upsolve_select_own"
on public.upsolve_queue
for select
using (
  auth.uid() = user_id 
  and public.has_active_pro_subscription(auth.uid())
);

create policy "upsolve_insert_own"
on public.upsolve_queue
for insert
with check (
  auth.uid() = user_id 
  and public.has_active_pro_subscription(auth.uid())
);

create policy "upsolve_update_own"
on public.upsolve_queue
for update
using (
  auth.uid() = user_id 
  and public.has_active_pro_subscription(auth.uid())
)
with check (
  auth.uid() = user_id 
  and public.has_active_pro_subscription(auth.uid())
);

create policy "upsolve_delete_own"
on public.upsolve_queue
for delete
using (
  auth.uid() = user_id 
  and public.has_active_pro_subscription(auth.uid())
);

-- Service role bypass
create policy "upsolve_service_role"
on public.upsolve_queue
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- 3) Pro Analytics Tables

-- Weak Tag Analysis (identify weakest performing tags)
create table if not exists public.weak_tag_analysis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tag_name text not null,
  problems_attempted integer not null default 0,
  problems_solved integer not null default 0,
  success_rate decimal(5,2) not null default 0,
  avg_time_seconds integer,
  last_attempted timestamptz,
  weakness_score decimal(5,2) not null default 0, -- Lower is weaker
  recommendations text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(user_id, tag_name)
);

create index if not exists idx_weak_tag_user on public.weak_tag_analysis(user_id);
create index if not exists idx_weak_tag_score on public.weak_tag_analysis(user_id, weakness_score);
create index if not exists idx_weak_tag_updated on public.weak_tag_analysis(updated_at desc);

alter table public.weak_tag_analysis enable row level security;

create policy "weak_tag_pro_only"
on public.weak_tag_analysis
for all
using (
  auth.uid() = user_id 
  and public.has_active_pro_subscription(auth.uid())
)
with check (
  auth.uid() = user_id 
  and public.has_active_pro_subscription(auth.uid())
);

-- Mastery Tracking (detailed per-tag performance trends)
create table if not exists public.tag_mastery_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tag_name text not null,
  mastery_score decimal(5,2) not null default 0, -- 0-100
  trend text check (trend in ('improving', 'stable', 'declining')),
  streak_days integer not null default 0,
  total_problems integer not null default 0,
  problems_last_7d integer not null default 0,
  problems_last_30d integer not null default 0,
  avg_difficulty decimal(3,1), -- 1-5 scale
  last_practiced timestamptz,
  milestones jsonb default '[]', -- Array of achievement milestones
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(user_id, tag_name)
);

create index if not exists idx_mastery_user on public.tag_mastery_tracking(user_id);
create index if not exists idx_mastery_score on public.tag_mastery_tracking(user_id, mastery_score desc);
create index if not exists idx_mastery_trend on public.tag_mastery_tracking(user_id, trend);
create index if not exists idx_mastery_last_practiced on public.tag_mastery_tracking(last_practiced desc);

alter table public.tag_mastery_tracking enable row level security;

create policy "mastery_pro_only"
on public.tag_mastery_tracking
for all
using (
  auth.uid() = user_id 
  and public.has_active_pro_subscription(auth.uid())
)
with check (
  auth.uid() = user_id 
  and public.has_active_pro_subscription(auth.uid())
);

-- Fail-Decay Analysis (based on upsolve box progression)
create table if not exists public.fail_decay_analysis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  tag_name text,
  difficulty text,
  current_box smallint not null check (current_box between 1 and 5),
  fail_count integer not null default 0,
  success_count integer not null default 0,
  decay_rate decimal(5,2), -- Rate of moving back to earlier boxes
  retention_score decimal(5,2), -- How well concepts are retained
  next_review timestamptz,
  last_attempt_result text check (last_attempt_result in ('fail', 'success')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique(user_id, problem_id)
);

create index if not exists idx_fail_decay_user on public.fail_decay_analysis(user_id);
create index if not exists idx_fail_decay_box on public.fail_decay_analysis(user_id, current_box);
create index if not exists idx_fail_decay_tag on public.fail_decay_analysis(user_id, tag_name);
create index if not exists idx_fail_decay_retention on public.fail_decay_analysis(user_id, retention_score);
create index if not exists idx_fail_decay_next_review on public.fail_decay_analysis(next_review);

alter table public.fail_decay_analysis enable row level security;

create policy "fail_decay_pro_only"
on public.fail_decay_analysis
for all
using (
  auth.uid() = user_id 
  and public.has_active_pro_subscription(auth.uid())
)
with check (
  auth.uid() = user_id 
  and public.has_active_pro_subscription(auth.uid())
);

-- 4) Update existing analytics tables with Pro RLS

-- Topic mastery (from platform_enhancement.sql)
do $$
begin
  if to_regclass('public.topic_mastery') is not null then
    -- Drop existing policies
    drop policy if exists "Users can view their own topic mastery" on public.topic_mastery;
    drop policy if exists "Users can update their own topic mastery" on public.topic_mastery;
    
    -- Add Pro-only policies
    create policy "topic_mastery_pro_select"
    on public.topic_mastery
    for select
    using (
      auth.uid() = user_id 
      and public.has_active_pro_subscription(auth.uid())
    );
    
    create policy "topic_mastery_pro_all"
    on public.topic_mastery
    for all
    using (
      auth.uid() = user_id 
      and public.has_active_pro_subscription(auth.uid())
    )
    with check (
      auth.uid() = user_id 
      and public.has_active_pro_subscription(auth.uid())
    );
  end if;
end$$;

-- 5) Add updated_at triggers
drop trigger if exists trg_weak_tag_updated on public.weak_tag_analysis;
create trigger trg_weak_tag_updated
before update on public.weak_tag_analysis
for each row execute function public.set_updated_at();

drop trigger if exists trg_mastery_updated on public.tag_mastery_tracking;
create trigger trg_mastery_updated
before update on public.tag_mastery_tracking
for each row execute function public.set_updated_at();

drop trigger if exists trg_fail_decay_updated on public.fail_decay_analysis;
create trigger trg_fail_decay_updated
before update on public.fail_decay_analysis
for each row execute function public.set_updated_at();

-- 6) Helper functions for analytics

-- Calculate weakness score based on performance
create or replace function public.calculate_weakness_score(
  p_attempted integer,
  p_solved integer,
  p_avg_time integer
)
returns decimal(5,2)
language plpgsql
immutable
as $$
declare
  v_success_rate decimal(5,2);
  v_time_penalty decimal(5,2);
  v_score decimal(5,2);
begin
  -- Avoid division by zero
  if p_attempted = 0 then
    return 0;
  end if;
  
  v_success_rate := (p_solved::decimal / p_attempted::decimal) * 100;
  
  -- Time penalty (normalize to 0-20 range, assuming max 3600 seconds)
  v_time_penalty := case 
    when p_avg_time is null then 0
    when p_avg_time > 3600 then 20
    else (p_avg_time::decimal / 3600::decimal) * 20
  end;
  
  -- Final score (lower is weaker)
  v_score := v_success_rate - v_time_penalty;
  
  return greatest(0, least(100, v_score));
end;
$$;

-- Calculate retention score based on upsolve progression
create or replace function public.calculate_retention_score(
  p_current_box integer,
  p_fail_count integer,
  p_success_count integer
)
returns decimal(5,2)
language plpgsql
immutable
as $$
declare
  v_total_attempts integer;
  v_success_rate decimal(5,2);
  v_box_bonus decimal(5,2);
  v_score decimal(5,2);
begin
  v_total_attempts := p_fail_count + p_success_count;
  
  -- Avoid division by zero
  if v_total_attempts = 0 then
    return 50; -- Neutral score
  end if;
  
  v_success_rate := (p_success_count::decimal / v_total_attempts::decimal) * 70;
  v_box_bonus := (p_current_box::decimal / 5::decimal) * 30;
  
  v_score := v_success_rate + v_box_bonus;
  
  return greatest(0, least(100, v_score));
end;
$$;

-- ============================================================================
-- END
-- ============================================================================
