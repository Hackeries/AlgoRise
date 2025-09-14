-- Create contests schema with strict RLS and helpful indexes

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

create table if not exists public.contest_participants (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  handle_snapshot text,
  joined_at timestamptz not null default now(),
  unique (contest_id, user_id)
);

create table if not exists public.contest_problems (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  problem_id text not null,
  title text not null,
  points int not null default 1
);

create table if not exists public.contest_submissions (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  status text not null check (status in ('solved','failed')),
  penalty_s int not null default 0,
  submitted_at timestamptz not null default now()
);

create table if not exists public.contest_results (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rank int not null,
  score int not null,
  penalty_s int not null,
  rating_delta int not null,
  computed_at timestamptz not null default now(),
  unique (contest_id, user_id)
);

alter table public.contests enable row level security;
alter table public.contest_participants enable row level security;
alter table public.contest_problems enable row level security;
alter table public.contest_submissions enable row level security;
alter table public.contest_results enable row level security;

-- RLS: contests are visible to host or participants
do $$ begin
  create policy "contests_select_host_or_participant" on public.contests
    for select using (
      host_user_id = auth.uid()
      or exists (select 1 from public.contest_participants p where p.contest_id = id and p.user_id = auth.uid())
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "contests_insert_host" on public.contests
    for insert with check (host_user_id = auth.uid());
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "contests_update_host" on public.contests
    for update using (host_user_id = auth.uid()) with check (host_user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- participants
do $$ begin
  create policy "participants_select_self" on public.contest_participants
    for select using (user_id = auth.uid() or exists (select 1 from public.contests c where c.id = contest_id and c.host_user_id = auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "participants_insert_self" on public.contest_participants
    for insert with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- problems: readable by host/participants; insert by host
do $$ begin
  create policy "problems_select" on public.contest_problems
    for select using (
      exists (select 1 from public.contests c where c.id = contest_id and (c.host_user_id = auth.uid()
        or exists (select 1 from public.contest_participants p where p.contest_id = c.id and p.user_id = auth.uid())))
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "problems_insert_host" on public.contest_problems
    for insert with check (
      exists (select 1 from public.contests c where c.id = contest_id and c.host_user_id = auth.uid())
    );
exception when duplicate_object then null; end $$;

-- submissions: readable by host/participants; insert by participant (self)
do $$ begin
  create policy "submissions_select" on public.contest_submissions
    for select using (
      exists (select 1 from public.contests c where c.id = contest_id and (c.host_user_id = auth.uid()
        or exists (select 1 from public.contest_participants p where p.contest_id = c.id and p.user_id = auth.uid())))
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "submissions_insert_self" on public.contest_submissions
    for insert with check (user_id = auth.uid());
exception when duplicate_object then null; end $$;

-- results: readable by host/participants; insert/update by host (rating calc)
do $$ begin
  create policy "results_select" on public.contest_results
    for select using (
      exists (select 1 from public.contests c where c.id = contest_id and (c.host_user_id = auth.uid()
        or exists (select 1 from public.contest_participants p where p.contest_id = c.id and p.user_id = auth.uid())))
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "results_upsert_host" on public.contest_results
    for insert with check (
      exists (select 1 from public.contests c where c.id = contest_id and c.host_user_id = auth.uid())
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "results_update_host" on public.contest_results
    for update using (
      exists (select 1 from public.contests c where c.id = contest_id and c.host_user_id = auth.uid())
    ) with check (
      exists (select 1 from public.contests c where c.id = contest_id and c.host_user_id = auth.uid())
    );
exception when duplicate_object then null; end $$;

-- indexes
create index if not exists idx_contests_host on public.contests(host_user_id);
create index if not exists idx_participants_user on public.contest_participants(user_id);
create index if not exists idx_participants_contest on public.contest_participants(contest_id);
create index if not exists idx_submissions_contest on public.contest_submissions(contest_id);
create index if not exists idx_results_contest on public.contest_results(contest_id);
