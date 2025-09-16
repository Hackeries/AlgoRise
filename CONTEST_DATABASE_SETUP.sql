-- ===================================
-- CONTEST DATABASE SETUP FOR SUPABASE
-- ===================================
-- Run this SQL in your Supabase SQL Editor to create the contests table
-- and set up proper Row Level Security policies.

-- Create the contests table
CREATE TABLE IF NOT EXISTS public.contests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    max_participants INTEGER,
    allow_late_join BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean setup)
DROP POLICY IF EXISTS "Anyone can view contests" ON public.contests;
DROP POLICY IF EXISTS "Authenticated users can create contests" ON public.contests;
DROP POLICY IF EXISTS "Users can update their own contests" ON public.contests;
DROP POLICY IF EXISTS "Users can delete their own contests" ON public.contests;

-- Create policies for contests
CREATE POLICY "Anyone can view contests" ON public.contests
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create contests" ON public.contests
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own contests" ON public.contests
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own contests" ON public.contests
    FOR DELETE USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contests_start_time ON public.contests(start_time);
CREATE INDEX IF NOT EXISTS idx_contests_created_by ON public.contests(created_by);
CREATE INDEX IF NOT EXISTS idx_contests_end_time ON public.contests(end_time);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_contests_updated_at ON public.contests;
CREATE TRIGGER update_contests_updated_at 
    BEFORE UPDATE ON public.contests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a test contest to verify the setup (optional)
-- You can remove this after testing
INSERT INTO public.contests (
    name, 
    description, 
    start_time, 
    end_time, 
    duration_minutes, 
    max_participants, 
    allow_late_join
) VALUES (
    'Test Contest',
    'This is a test contest to verify the database setup',
    NOW() + INTERVAL '1 hour',
    NOW() + INTERVAL '3 hours',
    120,
    50,
    true
) ON CONFLICT DO NOTHING;

-- Verify the table was created successfully
SELECT 'Contests table created successfully!' as message;
SELECT COUNT(*) as contest_count FROM public.contests;