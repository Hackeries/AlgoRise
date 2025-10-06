-- Notifications Database Schema for AlgoRise
-- Run this in your Supabase SQL Editor to set up the notifications system

-- 1. Create notification_types enum
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'contest_starting',
        'contest_ended', 
        'group_invite',
        'group_message',
        'contest_registration',
        'achievement',
        'system_announcement',
        'friend_request',
        'mention'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- For organizing notifications
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE,
    related_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- For expiration
    expires_at TIMESTAMPTZ,
    
    -- For priority (higher numbers = higher priority)
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON public.notifications(priority DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON public.notifications(expires_at) WHERE expires_at IS NOT NULL;

-- 4. Create composite index for efficient unread queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_priority ON public.notifications(user_id, priority DESC, created_at DESC) WHERE read_at IS NULL;

-- 5. Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- 6. Add updated_at trigger
DROP TRIGGER IF EXISTS trg_notifications_updated_at ON public.notifications;
CREATE TRIGGER trg_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for notifications
DROP POLICY IF EXISTS "users_can_view_own_notifications" ON public.notifications;
CREATE POLICY "users_can_view_own_notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_can_update_own_notifications" ON public.notifications;
CREATE POLICY "users_can_update_own_notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- System can insert notifications for any user (handled by service account)
DROP POLICY IF EXISTS "system_can_insert_notifications" ON public.notifications;
CREATE POLICY "system_can_insert_notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (true);

-- 9. Create notification_settings table for user preferences
CREATE TABLE IF NOT EXISTS public.notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Email notification preferences
    email_contest_starting BOOLEAN DEFAULT true,
    email_group_invites BOOLEAN DEFAULT true,
    email_achievements BOOLEAN DEFAULT true,
    email_system_announcements BOOLEAN DEFAULT true,
    
    -- Push notification preferences
    push_contest_starting BOOLEAN DEFAULT true,
    push_group_invites BOOLEAN DEFAULT true,
    push_achievements BOOLEAN DEFAULT true,
    push_system_announcements BOOLEAN DEFAULT false,
    
    -- General settings
    digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('none', 'daily', 'weekly')),
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    timezone TEXT DEFAULT 'UTC',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- 10. Create indexes and policies for notification_settings
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON public.notification_settings(user_id);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_can_manage_own_notification_settings" ON public.notification_settings;
CREATE POLICY "users_can_manage_own_notification_settings"
    ON public.notification_settings
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 11. Add updated_at trigger for notification_settings
DROP TRIGGER IF EXISTS trg_notification_settings_updated_at ON public.notification_settings;
CREATE TRIGGER trg_notification_settings_updated_at
    BEFORE UPDATE ON public.notification_settings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 12. Create function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    count_result INTEGER;
BEGIN
    -- Verify the caller is requesting their own count
    IF auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    SELECT COUNT(*)::INTEGER INTO count_result
    FROM public.notifications
    WHERE user_id = target_user_id
      AND read_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW());
    
    RETURN COALESCE(count_result, 0);
END;
$$;

-- 13. Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    -- Verify the caller is updating their own notifications
    IF auth.uid() != target_user_id THEN
        RAISE EXCEPTION 'Access denied';
    END IF;
    
    UPDATE public.notifications
    SET read_at = NOW()
    WHERE user_id = target_user_id
      AND read_at IS NULL;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$;

-- 14. Create function to clean up expired notifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.notifications
    WHERE expires_at IS NOT NULL
      AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- 15. Create default notification settings for new users
CREATE OR REPLACE FUNCTION public.create_default_notification_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.notification_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- 16. Create trigger to auto-create notification settings for new users
DROP TRIGGER IF EXISTS trg_create_default_notification_settings ON auth.users;
CREATE TRIGGER trg_create_default_notification_settings
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_default_notification_settings();

-- 17. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notification_settings TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read TO authenticated;

-- Done! Your notifications system is now ready.
-- The schema supports:
-- - Different notification types with proper categorization
-- - User notification preferences and settings
-- - Efficient querying with proper indexes
-- - Real-time capabilities with RLS policies
-- - Automatic cleanup of expired notifications
-- - Unread count tracking
-- - Bulk mark as read functionality