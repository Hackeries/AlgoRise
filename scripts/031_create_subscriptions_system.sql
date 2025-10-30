-- ============================================================================
-- SUBSCRIPTIONS SYSTEM FOR ALGORISE
-- ============================================================================
-- This migration creates a robust subscription management system for AlgoRise
-- with support for multiple plan tiers, subscription history, and audit trails.
-- ============================================================================

-- 1. Add subscription fields to profiles table
-- ============================================================================
-- Add columns for current subscription status
alter table public.profiles
  add column if not exists subscription_plan text not null default 'free',
  add column if not exists subscription_status text not null default 'active',
  add column if not exists subscription_start timestamptz,
  add column if not exists subscription_end timestamptz;

-- Add check constraint for valid plan types
alter table public.profiles
  drop constraint if exists valid_subscription_plan;
alter table public.profiles
  add constraint valid_subscription_plan
  check (subscription_plan in ('free', 'entry-gate', 'core-builder', 'algorithmic-ascend', 'competitive-forge', 'master-craft'));

-- Add check constraint for valid subscription status
alter table public.profiles
  drop constraint if exists valid_subscription_status;
alter table public.profiles
  add constraint valid_subscription_status
  check (subscription_status in ('active', 'expired', 'cancelled'));

-- Create index for subscription queries
create index if not exists idx_profiles_subscription_plan on public.profiles(subscription_plan);
create index if not exists idx_profiles_subscription_status on public.profiles(subscription_status);
create index if not exists idx_profiles_subscription_end on public.profiles(subscription_end);

-- 2. Create subscriptions table for audit trail and history
-- ============================================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Subscription details
  plan_name text not null,
  plan_code text not null, -- 'entry-gate', 'core-builder', etc.
  
  -- Payment details
  amount integer not null, -- in paise (smallest currency unit)
  currency text not null default 'INR',
  
  -- Razorpay details
  order_id text unique not null,
  payment_id text,
  signature text,
  
  -- Subscription period
  start_date timestamptz not null,
  end_date timestamptz, -- null for lifetime access plans
  
  -- Status tracking
  status text not null default 'pending', -- pending | active | expired | cancelled | refunded
  payment_status text not null default 'pending', -- pending | completed | failed
  
  -- Metadata
  metadata jsonb, -- Additional data like discount codes, campaign info, etc.
  
  -- Audit timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint valid_subscription_status check (status in ('pending', 'active', 'expired', 'cancelled', 'refunded')),
  constraint valid_payment_status check (payment_status in ('pending', 'completed', 'failed'))
);

-- Create indexes for efficient queries
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_order_id on public.subscriptions(order_id);
create index if not exists idx_subscriptions_payment_id on public.subscriptions(payment_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscriptions_end_date on public.subscriptions(end_date);
create index if not exists idx_subscriptions_created_at on public.subscriptions(created_at desc);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- RLS Policies for subscriptions
drop policy if exists "Users can view own subscriptions" on public.subscriptions;
create policy "Users can view own subscriptions"
on public.subscriptions
for select
using ( auth.uid() = user_id );

-- Add updated_at trigger for subscriptions
drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute procedure public.set_updated_at();

-- 3. Create payment_events table for webhook events and idempotency
-- ============================================================================
create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  
  -- Event identification
  event_id text unique not null, -- Razorpay event ID for idempotency
  event_type text not null,
  
  -- Related entities
  order_id text,
  payment_id text,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  
  -- Event data
  payload jsonb not null,
  
  -- Processing status
  processed boolean not null default false,
  processed_at timestamptz,
  error_message text,
  
  -- Audit
  created_at timestamptz not null default now()
);

-- Create indexes
create index if not exists idx_payment_events_event_id on public.payment_events(event_id);
create index if not exists idx_payment_events_order_id on public.payment_events(order_id);
create index if not exists idx_payment_events_processed on public.payment_events(processed);
create index if not exists idx_payment_events_created_at on public.payment_events(created_at desc);

-- Enable RLS (admin only access)
alter table public.payment_events enable row level security;

-- 4. Create functions for subscription management
-- ============================================================================

-- Function to activate a subscription
create or replace function public.activate_subscription(
  p_user_id uuid,
  p_subscription_id uuid,
  p_plan_code text,
  p_end_date timestamptz default null
)
returns boolean as $$
begin
  -- Update subscription record
  update public.subscriptions
  set 
    status = 'active',
    payment_status = 'completed',
    updated_at = now()
  where id = p_subscription_id and user_id = p_user_id;
  
  -- Update user profile
  update public.profiles
  set 
    subscription_plan = p_plan_code,
    subscription_status = 'active',
    subscription_start = now(),
    subscription_end = p_end_date,
    updated_at = now()
  where user_id = p_user_id;
  
  return true;
exception
  when others then
    return false;
end;
$$ language plpgsql security definer;

-- Function to expire subscriptions (for cron job)
create or replace function public.expire_subscriptions()
returns void as $$
begin
  -- Update expired subscriptions
  update public.subscriptions
  set 
    status = 'expired',
    updated_at = now()
  where 
    status = 'active'
    and end_date is not null
    and end_date < now();
  
  -- Update user profiles
  update public.profiles
  set 
    subscription_status = 'expired',
    updated_at = now()
  where 
    subscription_status = 'active'
    and subscription_end is not null
    and subscription_end < now();
end;
$$ language plpgsql security definer;

-- Function to get user's active subscription
create or replace function public.get_user_subscription(p_user_id uuid)
returns table (
  plan_code text,
  plan_name text,
  status text,
  start_date timestamptz,
  end_date timestamptz,
  is_lifetime boolean
) as $$
begin
  return query
  select 
    p.subscription_plan,
    s.plan_name,
    p.subscription_status,
    p.subscription_start,
    p.subscription_end,
    (p.subscription_end is null) as is_lifetime
  from public.profiles p
  left join public.subscriptions s on s.user_id = p.user_id and s.status = 'active'
  where p.user_id = p_user_id
  limit 1;
end;
$$ language plpgsql security definer;

-- 5. Create view for subscription analytics (optional)
-- ============================================================================
create or replace view public.subscription_analytics as
select 
  plan_code,
  count(*) as total_subscriptions,
  count(*) filter (where status = 'active') as active_subscriptions,
  count(*) filter (where status = 'expired') as expired_subscriptions,
  sum(amount) filter (where payment_status = 'completed') as total_revenue,
  avg(amount) filter (where payment_status = 'completed') as average_revenue
from public.subscriptions
group by plan_code;

-- 6. Update purchases table to link with subscriptions
-- ============================================================================
alter table public.purchases
  add column if not exists subscription_id uuid references public.subscriptions(id) on delete set null,
  add column if not exists plan_code text;

create index if not exists idx_purchases_subscription_id on public.purchases(subscription_id);
create index if not exists idx_purchases_plan_code on public.purchases(plan_code);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Note: To manually expire subscriptions, run:
-- select public.expire_subscriptions();

-- To check a user's subscription:
-- select * from public.get_user_subscription('user-uuid-here');
