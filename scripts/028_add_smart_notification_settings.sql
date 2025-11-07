-- =========================================
-- notification_settings: add smart notification columns (idempotent)
-- - Adds email_/push_ columns for:
--     - daily_problem_reminder
--     - rating_change
--     - friend_joined_contest
-- - Backfills NULLs to true
-- - Sets NOT NULL + DEFAULT true going forward
-- - Adds explanatory comments
-- =========================================

-- 0) Safety: ensure table exists
do $$
begin
  if to_regclass('public.notification_settings') is null then
    raise exception 'Table public.notification_settings does not exist';
  end if;
end$$;

-- 1) Add columns if missing (default true)
alter table public.notification_settings
  add column if not exists email_daily_problem_reminder       boolean default true,
  add column if not exists push_daily_problem_reminder        boolean default true,
  add column if not exists email_rating_change                boolean default true,
  add column if not exists push_rating_change                 boolean default true,
  add column if not exists email_friend_joined_contest        boolean default true,
  add column if not exists push_friend_joined_contest         boolean default true;

-- 2) Backfill any NULLs to true (covers legacy rows/older migrations)
update public.notification_settings
   set email_daily_problem_reminder = coalesce(email_daily_problem_reminder, true),
       push_daily_problem_reminder  = coalesce(push_daily_problem_reminder, true),
       email_rating_change          = coalesce(email_rating_change, true),
       push_rating_change           = coalesce(push_rating_change, true),
       email_friend_joined_contest  = coalesce(email_friend_joined_contest, true),
       push_friend_joined_contest   = coalesce(push_friend_joined_contest, true)
 where (email_daily_problem_reminder is null)
    or (push_daily_problem_reminder  is null)
    or (email_rating_change          is null)
    or (push_rating_change           is null)
    or (email_friend_joined_contest  is null)
    or (push_friend_joined_contest   is null);

-- 3) Enforce NOT NULL + DEFAULT true for future writes
alter table public.notification_settings
  alter column email_daily_problem_reminder set not null,
  alter column email_daily_problem_reminder set default true,
  alter column push_daily_problem_reminder  set not null,
  alter column push_daily_problem_reminder  set default true,
  alter column email_rating_change          set not null,
  alter column email_rating_change          set default true,
  alter column push_rating_change           set not null,
  alter column push_rating_change           set default true,
  alter column email_friend_joined_contest  set not null,
  alter column email_friend_joined_contest  set default true,
  alter column push_friend_joined_contest   set not null,
  alter column push_friend_joined_contest   set default true;

-- 4) Documentation comments
comment on column public.notification_settings.email_daily_problem_reminder is
  'Whether to send email notifications for daily problem reminders (default: true)';

comment on column public.notification_settings.push_daily_problem_reminder is
  'Whether to send push notifications for daily problem reminders (default: true)';

comment on column public.notification_settings.email_rating_change is
  'Whether to send email notifications for Codeforces rating changes (default: true)';

comment on column public.notification_settings.push_rating_change is
  'Whether to send push notifications for Codeforces rating changes (default: true)';

comment on column public.notification_settings.email_friend_joined_contest is
  'Whether to send email notifications when friends join contests (default: true)';

comment on column public.notification_settings.push_friend_joined_contest is
  'Whether to send push notifications when friends join contests (default: true)';