-- Enhanced Contest Creation Schema
-- Run this in your Supabase SQL Editor

-- First, create the basic contests table if it doesn't exist
create table if not exists public.contests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  status text not null default 'draft' check (status in ('draft','running','ended','cancelled')),
  host_user_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz,
  max_participants integer check (max_participants > 0),
  allow_late_join boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add missing columns if they don't exist (for existing tables)
do $$
begin
  -- Add description column if it doesn't exist
  if not exists (select 1 from information_schema.columns 
                 where table_name = 'contests' and column_name = 'description') then
    alter table public.contests add column description text;
  end if;
  
  -- Add max_participants column if it doesn't exist
  if not exists (select 1 from information_schema.columns 
                 where table_name = 'contests' and column_name = 'max_participants') then
    alter table public.contests add column max_participants integer check (max_participants > 0);
  end if;
  
  -- Add allow_late_join column if it doesn't exist
  if not exists (select 1 from information_schema.columns 
                 where table_name = 'contests' and column_name = 'allow_late_join') then
    alter table public.contests add column allow_late_join boolean not null default true;
  end if;
  
  -- Add updated_at column if it doesn't exist
  if not exists (select 1 from information_schema.columns 
                 where table_name = 'contests' and column_name = 'updated_at') then
    alter table public.contests add column updated_at timestamptz not null default now();
  end if;
end $$;

-- Update the status check constraint to include 'cancelled'
alter table public.contests drop constraint if exists contests_status_check;
alter table public.contests add constraint contests_status_check 
  check (status in ('draft','running','ended','cancelled'));

-- Update the visibility check constraint to include 'public'
alter table public.contests drop constraint if exists contests_visibility_check;
alter table public.contests add constraint contests_visibility_check 
  check (visibility in ('private', 'public'));

-- Create or replace the updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_contests_updated_at on public.contests;
create trigger update_contests_updated_at
  before update on public.contests
  for each row execute function update_updated_at_column();

-- Enable RLS
alter table public.contests enable row level security;

-- Drop existing policies and recreate them
drop policy if exists "Users can view contests they host or participate in" on public.contests;
drop policy if exists "Users can create contests" on public.contests;
drop policy if exists "Users can update contests they host" on public.contests;
drop policy if exists "Users can delete contests they host" on public.contests;

-- Create comprehensive RLS policies
create policy "Users can view contests they host or participate in"
  on public.contests for select
  using (
    host_user_id = auth.uid() or 
    visibility = 'public' or
    id in (
      select contest_id from public.contest_participants 
      where user_id = auth.uid()
    )
  );

create policy "Users can create contests"
  on public.contests for insert
  with check (host_user_id = auth.uid());

create policy "Users can update contests they host"
  on public.contests for update
  using (host_user_id = auth.uid())
  with check (host_user_id = auth.uid());

create policy "Users can delete contests they host"
  on public.contests for delete
  using (host_user_id = auth.uid());

-- Create contest_participants table if it doesn't exist
create table if not exists public.contest_participants (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  handle_snapshot text,
  joined_at timestamptz not null default now(),
  unique (contest_id, user_id)
);

-- Enable RLS for contest_participants
alter table public.contest_participants enable row level security;

-- Create policies for contest_participants
create policy "Users can view participants of contests they host or participate in"
  on public.contest_participants for select
  using (
    user_id = auth.uid() or
    contest_id in (
      select id from public.contests where host_user_id = auth.uid()
    )
  );

create policy "Users can join contests"
  on public.contest_participants for insert
  with check (user_id = auth.uid());

create policy "Users can leave contests or hosts can remove participants"
  on public.contest_participants for delete
  using (
    user_id = auth.uid() or
    contest_id in (
      select id from public.contests where host_user_id = auth.uid()
    )
  );

-- Create useful indexes
create index if not exists idx_contests_host_user_id on public.contests(host_user_id);
create index if not exists idx_contests_status on public.contests(status);
create index if not exists idx_contests_starts_at on public.contests(starts_at);
create index if not exists idx_contest_participants_contest_id on public.contest_participants(contest_id);
create index if not exists idx_contest_participants_user_id on public.contest_participants(user_id);

-- Success message
select 'Contest schema setup completed successfully!' as result;