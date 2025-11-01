create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid generated always as (id) stored,
  name text,
  profile_image_url text,
  show_profile_image boolean not null default true,

  -- Employment / student metadata
  status text,
  degree_type text,
  company_id uuid,
  custom_company text,
  college_id uuid,
  year text,

  -- Preferences
  preferred_language text,
  programming_languages text[],

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_status_check
    check (status is null or status in ('student', 'working')),
  unique (user_id)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
drop policy if exists "select own profile" on public.profiles;
create policy "select own profile"
on public.profiles
for select
using ( auth.uid() = id );

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile"
on public.profiles
for insert
with check ( auth.uid() = id );

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
on public.profiles
for update
using ( auth.uid() = id )
with check ( auth.uid() = id );

-- Create indexes
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_college_id on public.profiles(college_id);
create index if not exists idx_profiles_company_id on public.profiles(company_id);
create index if not exists idx_profiles_status on public.profiles(status);

-- Add updated_at trigger function if it doesn't exist
do $$
begin
  if not exists (
    select 1 from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'set_updated_at'
      and prorettype = 'pg_trigger'::regtype
  ) then
    execute $$
      create function public.set_updated_at()
      returns trigger
      language plpgsql
      as $$
      begin
        new.updated_at := now();
        return new;
      end;
      $$;
    $$;
  end if;
end$$;

-- Add updated_at trigger
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();
