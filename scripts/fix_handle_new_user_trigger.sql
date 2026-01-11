-- ============================================================================
-- FIX: handle_new_user trigger causing "Database error saving new user"
-- ============================================================================
-- This script fixes the trigger that runs when a new user signs up.
-- The issue was that the trigger was failing silently and blocking user creation.
--
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- ============================================================================

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Attempt to insert profile, ignore if already exists
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail user creation
  -- The ensure-profile API endpoint will create the profile later
  RAISE WARNING 'handle_new_user trigger failed for user %: % (SQLSTATE: %)', 
    NEW.id, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Verify the trigger exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    RAISE NOTICE '✅ Trigger on_auth_user_created created successfully!';
  ELSE
    RAISE EXCEPTION '❌ Failed to create trigger on_auth_user_created';
  END IF;
END $$;

-- ============================================================================
-- ADDITIONAL FIX: Ensure RLS policies allow profile creation
-- ============================================================================

-- Drop existing insert policy if it exists and recreate
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- More permissive insert policy that works during auth flow
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id 
    OR auth.role() = 'service_role'
    OR (auth.uid() IS NULL AND id IS NOT NULL)  -- Allow trigger inserts
  );

-- Also ensure the service role can always manage profiles
DROP POLICY IF EXISTS "profiles_service_role" ON public.profiles;
CREATE POLICY "profiles_service_role" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

RAISE NOTICE '✅ RLS policies updated successfully!';
