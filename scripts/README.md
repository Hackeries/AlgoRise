# AlgoRise Database Scripts

Production-ready SQL scripts for setting up the AlgoRise database in Supabase.

## 📋 Scripts Overview

| Order | File | Description |
|-------|------|-------------|
| 1 | `01_schema.sql` | Creates all tables, types, indexes, and triggers |
| 2 | `02_rls_policies.sql` | Enables RLS and creates security policies |
| 3 | `03_functions_and_triggers.sql` | Creates database functions and auth triggers |
| 4 | `04_seed_data.sql` | Adds initial data (optional) |

## 🚀 Quick Setup

### For a Fresh Database

Run these scripts **in order** in the Supabase SQL Editor:

```bash
1. 01_schema.sql
2. 02_rls_policies.sql  
3. 03_functions_and_triggers.sql
4. 04_seed_data.sql (optional)
```

### For an Existing Database with Auth Issues

If you're getting "Database error saving new user" during sign-up, run this in SQL Editor:

```sql
-- Fix the auth trigger
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
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
```

## ⚠️ Important Notes

### Auth Trigger

The `handle_new_user()` function is **critical** for OAuth sign-up to work:

- It runs automatically when a user signs up via Google/GitHub OAuth
- If it fails, the entire sign-up fails with "Database error saving new user"
- The function uses `SECURITY DEFINER` to bypass RLS
- It **never throws errors** - it catches exceptions and returns NEW anyway
- If the trigger fails silently, the API endpoint `/api/auth/ensure-profile` will create the profile

### Row Level Security (RLS)

All tables have RLS enabled. Key policies:

- **profiles**: Users can only access their own profile
- **contests**: Public contests visible to all, private contests only to participants
- **service_role**: Has full access to all tables (used by API routes)

### Environment Variables

Make sure these are set in your production environment (Vercel):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Required for API routes!
```

## 🔧 Troubleshooting

### "Database error saving new user"

1. Go to Supabase Dashboard → SQL Editor
2. Run the fix from the "For an Existing Database" section above
3. Try signing in again

### "Contest Not Found" for existing contests

This usually means RLS is blocking access. Check:

1. Is `SUPABASE_SERVICE_ROLE_KEY` set in production?
2. Is the contest visibility set to "public"?
3. Run script `02_rls_policies.sql` again to ensure policies exist

### Policies already exist error

If you see "policy X already exists", the script uses `DROP POLICY IF EXISTS` before creating. If you still see errors, the old policies may have different names. Run:

```sql
-- List all policies on a table
SELECT policyname FROM pg_policies WHERE tablename = 'contests';

-- Drop a specific policy
DROP POLICY IF EXISTS "old_policy_name" ON public.contests;
```

## 📁 File Structure

```
scripts/
├── 01_schema.sql              # Tables, types, indexes
├── 02_rls_policies.sql        # Row Level Security
├── 03_functions_and_triggers.sql  # Functions, auth trigger
├── 04_seed_data.sql           # Initial data (optional)
└── README.md                  # This file
```
