# Database Setup Required

## Issue: Contest Creation Failed

The contest creation is failing because the required database tables don't exist in your Supabase database yet.

## Error Details:
- **Code**: PGRST205
- **Message**: "Could not find the table 'public.contests' in the schema cache"
- **Solution**: Run the SQL scripts to create the required tables

## Quick Fix Steps:

### 1. Go to Supabase SQL Editor
Open: https://supabase.com/dashboard/project/onyxqbacbtztcmruoquo/sql

### 2. Run the Database Scripts (in order)
Run these SQL files in your Supabase SQL editor:

#### Required for Basic Functionality:
```sql
-- 1. Run scripts/001_create_streaks.sql
-- 2. Run scripts/002_create_cf_snapshots.sql  
-- 3. Run scripts/003_create_adaptive_items.sql
-- 4. Run scripts/004_create_cf_handles.sql
-- 5. Run scripts/005_create_colleges.sql
-- 6. Run scripts/006_create_groups_and_memberships.sql
-- 7. Run scripts/007_seed_colleges.sql
-- 8. Run scripts/008_create_contests.sql ← This one fixes the contest error
```

### 3. Test Contest Creation
After running the scripts:
1. Go back to http://localhost:3000/contests
2. Try creating a contest again
3. It should work now!

## Alternative: Quick Contest Table Creation

If you just want to fix the contest feature quickly, copy and paste this SQL into your Supabase SQL editor:

```sql
-- Create contests table
create table if not exists public.contests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  visibility text not null default 'private' check (visibility in ('private')),
  status text not null default 'draft' check (status in ('draft','running','ended')),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.contests enable row level security;

-- Create policies
create policy "Users can view contests they host or participate in"
  on public.contests for select
  using (host_user_id = auth.uid());

create policy "Users can create contests"
  on public.contests for insert
  with check (host_user_id = auth.uid());

create policy "Users can update contests they host"
  on public.contests for update
  using (host_user_id = auth.uid());

create policy "Users can delete contests they host"
  on public.contests for delete
  using (host_user_id = auth.uid());
```

After running this SQL, contest creation should work immediately!