create table if not exists public.contest_submission_files (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  file_name text,
  language text,
  code_text text, -- store uploaded code inline (sufficient for practice)
  uploaded_at timestamptz not null default now()
);

alter table public.contest_submission_files enable row level security;

drop policy if exists "files_select" on public.contest_submission_files;
drop policy if exists "files_insert" on public.contest_submission_files;

create policy "files_select" on public.contest_submission_files
  for select using (
    -- anyone can view after contest ends; while live, only owner can view
    exists (
      select 1 from public.contests c
      where c.id = contest_id
        and now() >= coalesce(c.ends_at, c.starts_at)
    ) or auth.uid() = user_id
  );

create policy "files_insert" on public.contest_submission_files
  for insert with check (auth.uid() is not null);

create index if not exists idx_files_contest_user on public.contest_submission_files (contest_id, user_id);
