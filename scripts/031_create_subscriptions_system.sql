-- ============================================================================
-- SUBSCRIPTIONS SYSTEM FOR ALGORISE (Idempotent, RLS-hardened)
-- ----------------------------------------------------------------------------
-- What this migration does:
-- - Adds subscription fields to profiles (with checks + indexes)
-- - Creates subscriptions + payment_events tables (audit + idempotency)
-- - Adds RLS (owner access for subscriptions, admin-only for events)
-- - Adds safe updated_at trigger function and attaches to subscriptions
-- - Provides management functions:
--     * activate_subscription(user_id, subscription_id, plan_code, end_date?)
--     * expire_subscriptions()  -- cron-friendly
--     * get_user_subscription(user_id)  -- unified reader
--   Note: Functions handle profiles that use either "id" or "user_id" PK.
-- - Creates subscription_analytics view
-- - Adds linkage columns to purchases
-- ============================================================================
create extension if not exists pgcrypto;

-- 0) Helper: safe updated_at trigger function (UTC)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- 1) Ensure required tables exist
do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Table public.profiles does not exist';
  end if;
  if to_regclass('public.purchases') is null then
    raise notice 'Table public.purchases does not exist (link columns will be skipped).';
  end if;
end$$;

-- 2) Profiles: add subscription fields + checks + indexes (idempotent)
alter table public.profiles
  add column if not exists subscription_plan   text not null default 'free',
  add column if not exists subscription_status text not null default 'active',
  add column if not exists subscription_start  timestamptz,
  add column if not exists subscription_end    timestamptz;

-- Recreate plan/status checks
alter table public.profiles drop constraint if exists valid_subscription_plan;
alter table public.profiles add constraint valid_subscription_plan
  check (subscription_plan in ('free', 'entry-gate', 'core-builder', 'algorithmic-ascend', 'competitive-forge', 'master-craft'));

alter table public.profiles drop constraint if exists valid_subscription_status;
alter table public.profiles add constraint valid_subscription_status
  check (subscription_status in ('active', 'expired', 'cancelled'));

-- Helpful indexes
create index if not exists idx_profiles_subscription_plan on public.profiles(subscription_plan);
create index if not exists idx_profiles_subscription_status on public.profiles(subscription_status);
create index if not exists idx_profiles_subscription_end on public.profiles(subscription_end);

-- 3) Subscriptions: audit and history
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
  status text not null default 'pending',         -- pending | active | expired | cancelled | refunded
  payment_status text not null default 'pending', -- pending | completed | failed

  -- Metadata
  metadata jsonb, -- Additional data like discount codes, campaign info, etc.

  -- Audit timestamps (UTC)
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  -- Constraints
  constraint valid_subscription_status_subs check (status in ('pending', 'active', 'expired', 'cancelled', 'refunded')),
  constraint valid_payment_status_subs check (payment_status in ('pending', 'completed', 'failed'))
);

-- Helpful indexes
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_order_id on public.subscriptions(order_id);
create index if not exists idx_subscriptions_payment_id on public.subscriptions(payment_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_subscriptions_end_date on public.subscriptions(end_date);
create index if not exists idx_subscriptions_created_at on public.subscriptions(created_at desc);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- RLS policies (owner read; owner or service_role insert/update if needed)
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
on public.subscriptions
for select
using (
  auth.role() = 'service_role'
  or auth.uid() = user_id
);

drop policy if exists "subscriptions_insert_owner_or_service" on public.subscriptions;
create policy "subscriptions_insert_owner_or_service"
on public.subscriptions
for insert
with check (
  auth.role() = 'service_role'
  or auth.uid() = user_id
);

drop policy if exists "subscriptions_update_owner_or_service" on public.subscriptions;
create policy "subscriptions_update_owner_or_service"
on public.subscriptions
for update
using (
  auth.role() = 'service_role'
  or auth.uid() = user_id
)
with check (
  auth.role() = 'service_role'
  or auth.uid() = user_id
);

-- updated_at trigger
drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- 4) payment_events: webhook events + idempotency
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
  created_at timestamptz not null default timezone('utc', now())
);

-- Indexes
create index if not exists idx_payment_events_event_id on public.payment_events(event_id);
create index if not exists idx_payment_events_order_id on public.payment_events(order_id);
create index if not exists idx_payment_events_processed on public.payment_events(processed);
create index if not exists idx_payment_events_created_at on public.payment_events(created_at desc);

-- RLS (admin-only)
alter table public.payment_events enable row level security;

drop policy if exists "payment_events_admin_bypass" on public.payment_events;
create policy "payment_events_admin_bypass" on public.payment_events
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- 5) Management functions (security definer, search_path pinned)

-- 5a) Activate a subscription (sets subscription active + updates profile)
create or replace function public.activate_subscription(
  p_user_id uuid,
  p_subscription_id uuid,
  p_plan_code text,
  p_end_date timestamptz default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profiles_has_user_id boolean;
  v_rows int;
begin
  -- Activate the subscription record
  update public.subscriptions
     set status = 'active',
         payment_status = 'completed',
         updated_at = timezone('utc', now())
   where id = p_subscription_id
     and user_id = p_user_id;
  GET DIAGNOSTICS v_rows = ROW_COUNT;

  -- Detect profiles PK column name
  select exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'profiles' and column_name = 'user_id'
  ) into v_profiles_has_user_id;

  if v_profiles_has_user_id then
    update public.profiles
       set subscription_plan = p_plan_code,
           subscription_status = 'active',
           subscription_start = timezone('utc', now()),
           subscription_end   = p_end_date,
           updated_at         = timezone('utc', now())
     where user_id = p_user_id;
  else
    -- fallback to "id" as PK
    update public.profiles
       set subscription_plan = p_plan_code,
           subscription_status = 'active',
           subscription_start = timezone('utc', now()),
           subscription_end   = p_end_date,
           updated_at         = timezone('utc', now())
     where id = p_user_id;
  end if;

  return v_rows > 0;
exception
  when others then
    return false;
end;
$$;

-- 5b) Expire subscriptions (cron-friendly)
create or replace function public.expire_subscriptions()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profiles_has_user_id boolean;
begin
  -- Mark subscriptions as expired if past end_date
  update public.subscriptions
     set status = 'expired',
         updated_at = timezone('utc', now())
   where status = 'active'
     and end_date is not null
     and end_date < timezone('utc', now());

  -- Detect profiles key
  select exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'profiles' and column_name = 'user_id'
  ) into v_profiles_has_user_id;

  -- Expire profiles with past subscription_end
  if v_profiles_has_user_id then
    update public.profiles
       set subscription_status = 'expired',
           updated_at = timezone('utc', now())
     where subscription_status = 'active'
       and subscription_end is not null
       and subscription_end < timezone('utc', now());
  else
    update public.profiles
       set subscription_status = 'expired',
           updated_at = timezone('utc', now())
     where subscription_status = 'active'
       and subscription_end is not null
       and subscription_end < timezone('utc', now());
  end if;
end;
$$;

-- 5c) Get user's active subscription (profiles-first view, with active subs join)
create or replace function public.get_user_subscription(p_user_id uuid)
returns table (
  plan_code   text,
  plan_name   text,
  status      text,
  start_date  timestamptz,
  end_date    timestamptz,
  is_lifetime boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profiles_has_user_id boolean;
  v_sql text;
begin
  select exists (
    select 1 from information_schema.columns
     where table_schema='public' and table_name='profiles' and column_name='user_id'
  ) into v_profiles_has_user_id;

  if v_profiles_has_user_id then
    v_sql := $q$
      select 
        p.subscription_plan as plan_code,
        s.plan_name,
        p.subscription_status as status,
        p.subscription_start as start_date,
        p.subscription_end as end_date,
        (p.subscription_end is null) as is_lifetime
      from public.profiles p
      left join public.subscriptions s
        on s.user_id = p.user_id and s.status = 'active'
      where p.user_id = $1
      limit 1
    $q$;
  else
    v_sql := $q$
      select 
        p.subscription_plan as plan_code,
        s.plan_name,
        p.subscription_status as status,
        p.subscription_start as start_date,
        p.subscription_end as end_date,
        (p.subscription_end is null) as is_lifetime
      from public.profiles p
      left join public.subscriptions s
        on s.user_id = p.id and s.status = 'active'
      where p.id = $1
      limit 1
    $q$;
  end if;

  return query execute v_sql using p_user_id;
end;
$$;

-- 6) Analytics view
create or replace view public.subscription_analytics as
select 
  plan_code,
  count(*) as total_subscriptions,
  count(*) filter (where status = 'active')  as active_subscriptions,
  count(*) filter (where status = 'expired') as expired_subscriptions,
  sum(amount) filter (where payment_status = 'completed')::bigint as total_revenue,
  avg(amount) filter (where payment_status = 'completed')::numeric as average_revenue
from public.subscriptions
group by plan_code;

-- 7) purchases linkage (optional if table exists)
do $$
begin
  if to_regclass('public.purchases') is not null then
    alter table public.purchases
      add column if not exists subscription_id uuid references public.subscriptions(id) on delete set null,
      add column if not exists plan_code text;
    create index if not exists idx_purchases_subscription_id on public.purchases(subscription_id);
    create index if not exists idx_purchases_plan_code on public.purchases(plan_code);
  end if;
end$$;

-- ============================================================================
-- END
-- ============================================================================

-- Examples:
-- select public.expire_subscriptions();
-- select * from public.get_user_subscription('user-uuid-here');