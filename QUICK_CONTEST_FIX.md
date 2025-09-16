# Quick Contest Creation Fix

## 🚀 Immediate Fix (Works with basic schema)

Copy and paste this SQL into your Supabase SQL Editor:
**Link: https://supabase.com/dashboard/project/onyxqbacbtztcmruoquo/sql**

```sql
-- Basic contest table (if it doesn't exist)
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

## ✅ After running the SQL:

1. Go back to http://localhost:3000/contests
2. Click "Create Contest"
3. Fill out the enhanced form
4. Click "Create Contest"

The basic fields (name, start time, end time) will work immediately!

## 🔧 For Full Feature Support (Optional)

If you want all the new features (description, max participants, etc.), add these columns:

```sql
-- Add enhanced columns
alter table public.contests add column if not exists description text;
alter table public.contests add column if not exists max_participants integer check (max_participants > 0);
alter table public.contests add column if not exists allow_late_join boolean not null default true;
```

## 🧪 Test Your Setup:

1. **Basic Test**: Create a contest with just name and start time
2. **Enhanced Test**: Try using description and participant limits
3. **Validation Test**: Try creating with invalid data (past date, etc.)

Your contest creation should now work perfectly! 🎉