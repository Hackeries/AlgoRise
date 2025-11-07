-- =========================================
-- contest_submission_files (improved, idempotent)
-- =========================================
-- Enhancements:
-- - UTC timestamps (uploaded_at, updated_at) + trigger
-- - Guardrails (non-blank problem_id, optional file_name check)
-- - Stronger RLS:
--     - Owner can always read their own files
--     - Host can read anytime
--     - Anyone can read after contest ends (as requested)
--     - Insert: participant (self) or host
--     - Update/Delete: owner or host; service_role bypass
-- - Helpful indexes for common queries
-- =========================================

create extension if not exists pgcrypto; -- gen_random_uuid()

-- Table
create table if not exists public.contest_submission_files (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  file_name text,
  language text,
  code_text text, -- store uploaded code inline (sufficient for practice)
  uploaded_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),

  constraint csf_problem_id_not_blank check (length(trim(problem_id)) > 0),
  constraint csf_file_name_not_blank_or_null check (file_name is null or length(trim(file_name)) > 0)
);

comment on table public.contest_submission_files is 'User code uploads per contest problem (practice/ICPC).';

-- If table pre-existed without updated_at, add it
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='contest_submission_files' and column_name='updated_at'
  ) then
    alter table public.contest_submission_files
      add column updated_at timestamptz not null default timezone('utc', now());
  end if;
end$$;

-- Shared timestamp trigger
create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_csf_updated_at on public.contest_submission_files;
create trigger trg_csf_updated_at
before update on public.contest_submission_files
for each row execute function public.set_timestamp();

-- RLS
alter table public.contest_submission_files enable row level security;

-- Reset policies
drop policy if exists "files_select" on public.contest_submission_files;
drop policy if exists "files_insert" on public.contest_submission_files;
drop policy if exists "files_update_owner_or_host" on public.contest_submission_files;
drop policy if exists "files_delete_owner_or_host" on public.contest_submission_files;
drop policy if exists "files_admin_bypass" on public.contest_submission_files;

-- Read policy:
-- - Owner can read anytime
-- - Host can read anytime
-- - Anyone can read after contest ends (as originally requested)
create policy "files_select" on public.contest_submission_files
for select
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.contests c
    where c.id = contest_id
      and c.host_user_id = auth.uid()
  )
  or exists (
    select 1
    from public.contests c
    where c.id = contest_id
      and timezone('utc', now()) >= coalesce(c.ends_at, c.starts_at)
  )
);

-- Insert policy:
-- - A user may upload their own file if they are a participant
-- - Host may upload (e.g., administrative operations)
create policy "files_insert" on public.contest_submission_files
for insert
with check (
  (
    user_id = auth.uid()
    and exists (
      select 1
      from public.contest_participants cp
      where cp.contest_id = contest_id
        and cp.user_id = auth.uid()
    )
  )
  or exists (
    select 1
    from public.contests c
    where c.id = contest_id
      and c.host_user_id = auth.uid()
  )
);

-- Update policy: owner or host
create policy "files_update_owner_or_host" on public.contest_submission_files
for update
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.contests c
    where c.id = contest_id and c.host_user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1 from public.contests c
    where c.id = contest_id and c.host_user_id = auth.uid()
  )
);

-- Delete policy: owner or host
create policy "files_delete_owner_or_host" on public.contest_submission_files
for delete
using (
  auth.uid() = user_id
  or exists (
    select 1 from public.contests c
    where c.id = contest_id and c.host_user_id = auth.uid()
  )
);

-- Optional service_role bypass
create policy "files_admin_bypass" on public.contest_submission_files
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Indexes
create index if not exists idx_files_contest_user on public.contest_submission_files (contest_id, user_id);
create index if not exists idx_files_contest_user_problem on public.contest_submission_files (contest_id, user_id, problem_id);
create index if not exists idx_files_contest_uploaded_at on public.contest_submission_files (contest_id, uploaded_at desc);