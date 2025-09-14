# Database Setup Guide

## Issue Fixed: "Failed to store verification" Error

The error "Could not find the table 'public.cf_handles' in the schema cache" occurs because the required database tables haven't been created yet.

## Solution

1. **Open your Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the "SQL Editor" section

2. **Run the Setup Script**
   - Copy the entire contents of `SUPABASE_SETUP.sql` 
   - Paste it into the Supabase SQL Editor
   - Click "Run" to execute the script

3. **Verify the Fix**
   - After running the script, the CF OAuth verification should work
   - Test the endpoint: `http://localhost:3000/api/cf/oauth/start?handle=jiangly`

## What was Fixed

The OAuth endpoints were failing because:
1. ❌ The `cf_handles` table didn't exist in the database
2. ✅ **Fixed**: Created the `cf_handles` table with proper schema
3. ✅ **Fixed**: Removed the non-existent `verification_method` column from the insert queries
4. ✅ **Fixed**: Added proper Row Level Security (RLS) policies

## Required Tables Created

- `public.streaks` - User streak tracking  
- `public.cf_handles` - Codeforces handle verification (CRITICAL for OAuth)
- `public.cf_snapshots` - Codeforces user data snapshots

## Next Steps

After running the setup script, your Codeforces verification should work properly. The endpoints will now be able to store verification data without errors.