# URGENT: Database Setup Required

## The Problem
The error "Could not find the table 'public.contests' in the schema cache" means your Supabase database doesn't have the contests table yet.

## Solution Steps

### Step 1: Go to Supabase SQL Editor
**Click this link:** https://supabase.com/dashboard/project/onyxqbacbtztcmruoquo/sql

### Step 2: Copy & Paste This SQL (All at once)

```sql
-- Create contests table
CREATE TABLE public.contests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    visibility text DEFAULT 'private' NOT NULL,
    status text DEFAULT 'draft' NOT NULL,
    host_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    starts_at timestamptz,
    ends_at timestamptz,
    max_participants integer,
    allow_late_join boolean DEFAULT true,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add constraints
ALTER TABLE public.contests ADD CONSTRAINT contests_status_check 
    CHECK (status IN ('draft', 'running', 'ended', 'cancelled'));

ALTER TABLE public.contests ADD CONSTRAINT contests_visibility_check 
    CHECK (visibility IN ('private', 'public'));

ALTER TABLE public.contests ADD CONSTRAINT contests_max_participants_check 
    CHECK (max_participants > 0);

-- Enable Row Level Security
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view contests they host or participate in" ON public.contests
    FOR SELECT USING (host_user_id = auth.uid());

CREATE POLICY "Users can create contests" ON public.contests
    FOR INSERT WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "Users can update contests they host" ON public.contests
    FOR UPDATE USING (host_user_id = auth.uid()) WITH CHECK (host_user_id = auth.uid());

CREATE POLICY "Users can delete contests they host" ON public.contests
    FOR DELETE USING (host_user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_contests_host_user_id ON public.contests(host_user_id);
CREATE INDEX idx_contests_status ON public.contests(status);
CREATE INDEX idx_contests_starts_at ON public.contests(starts_at);

-- Create contest participants table
CREATE TABLE public.contest_participants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    contest_id uuid NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    handle_snapshot text,
    joined_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(contest_id, user_id)
);

-- Enable RLS for participants
ALTER TABLE public.contest_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for participants
CREATE POLICY "Users can view participants of contests they host or participate in" ON public.contest_participants
    FOR SELECT USING (
        user_id = auth.uid() OR
        contest_id IN (SELECT id FROM public.contests WHERE host_user_id = auth.uid())
    );

CREATE POLICY "Users can join contests" ON public.contest_participants
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave contests or hosts can remove participants" ON public.contest_participants
    FOR DELETE USING (
        user_id = auth.uid() OR
        contest_id IN (SELECT id FROM public.contests WHERE host_user_id = auth.uid())
    );

-- Create indexes for participants
CREATE INDEX idx_contest_participants_contest_id ON public.contest_participants(contest_id);
CREATE INDEX idx_contest_participants_user_id ON public.contest_participants(user_id);
```

### Step 3: Run the SQL
1. Paste the entire SQL above into the SQL editor
2. Click the **"Run"** button
3. You should see success messages

### Step 4: Test Contest Creation
1. Go back to: http://localhost:3000/contests
2. Click "Create Contest"
3. Fill out the form (name, date/time are required)
4. Click "Create Contest"
5. It should work now! ✅

## Verification
After running the SQL, you can verify the table exists by running:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'contests';
```

## If You Still Get Errors:
1. Make sure you're logged into the correct Supabase account
2. Check that you're in the right project (onyxqbacbtztcmruoquo)
3. Try refreshing the page and running the contest creation again

The table will be created with all the enhanced features (description, max participants, etc.)!