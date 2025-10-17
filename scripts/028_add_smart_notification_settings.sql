-- Add smart notification settings columns to notification_settings table
-- This migration adds columns for the new smart notification types

-- Add columns for daily problem reminder notifications
ALTER TABLE notification_settings 
ADD COLUMN IF NOT EXISTS email_daily_problem_reminder BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_daily_problem_reminder BOOLEAN DEFAULT true;

-- Add columns for rating change notifications
ALTER TABLE notification_settings 
ADD COLUMN IF NOT EXISTS email_rating_change BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_rating_change BOOLEAN DEFAULT true;

-- Add columns for friend joined contest notifications
ALTER TABLE notification_settings 
ADD COLUMN IF NOT EXISTS email_friend_joined_contest BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_friend_joined_contest BOOLEAN DEFAULT true;

-- Update existing records to set default values for new columns
UPDATE notification_settings 
SET 
  email_daily_problem_reminder = true,
  push_daily_problem_reminder = true,
  email_rating_change = true,
  push_rating_change = true,
  email_friend_joined_contest = true,
  push_friend_joined_contest = true
WHERE email_daily_problem_reminder IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN notification_settings.email_daily_problem_reminder IS 'Whether to send email notifications for daily problem reminders';
COMMENT ON COLUMN notification_settings.push_daily_problem_reminder IS 'Whether to send push notifications for daily problem reminders';
COMMENT ON COLUMN notification_settings.email_rating_change IS 'Whether to send email notifications for Codeforces rating changes';
COMMENT ON COLUMN notification_settings.push_rating_change IS 'Whether to send push notifications for Codeforces rating changes';
COMMENT ON COLUMN notification_settings.email_friend_joined_contest IS 'Whether to send email notifications when friends join contests';
COMMENT ON COLUMN notification_settings.push_friend_joined_contest IS 'Whether to send push notifications when friends join contests';