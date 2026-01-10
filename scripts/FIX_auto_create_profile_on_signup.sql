-- Fix: Auto-create profile when new user signs up via OAuth
-- This creates a trigger on auth.users to automatically create a profile row

-- First, create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists (safe to run multiple times)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to run after a new user is inserted
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Also ensure the function can insert into profiles
GRANT INSERT ON public.profiles TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Auto-create profile trigger installed successfully!';
  RAISE NOTICE 'New users will now automatically get a profile row created.';
END $$;
