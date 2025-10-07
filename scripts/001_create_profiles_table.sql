-- Create profiles table for user profile data
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text,
  profile_image_url text,
  show_profile_image boolean default true,
  
  -- Updated to use 'status' field with 'student' or 'working' values
  status text check (status in ('student', 'working')),
  
  -- Added degree_type field for students
  degree_type text, -- 'btech', 'mtech', 'bsc', 'msc', 'bca', 'mca', 'mba', 'phd', 'other'
  
  -- Working professional fields
  -- Changed company to company_id to reference companies table
  company_id uuid references public.companies(id) on delete set null,
  custom_company text, -- For "Other" option or custom company names
  
  -- Student fields - college_id references colleges table
  college_id uuid references public.colleges(id) on delete set null,
  year text, -- '1', '2', '3', '4', '5' for year of study
  
  -- Common fields
  preferred_language text,
  programming_languages text[], -- Array of languages
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
drop policy if exists "select own profile" on public.profiles;
create policy "select own profile"
on public.profiles
for select
using ( auth.uid() = user_id );

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile"
on public.profiles
for insert
with check ( auth.uid() = user_id );

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
on public.profiles
for update
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

-- Create indexes
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_college_id on public.profiles(college_id);
create index if not exists idx_profiles_company_id on public.profiles(company_id);
create index if not exists idx_profiles_status on public.profiles(status);

-- Add updated_at trigger function if it doesn't exist
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add updated_at trigger
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();
