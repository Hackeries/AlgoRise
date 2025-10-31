-- Battle Arena enhancements: team battles, matchmaking queue, and extended ratings

-- =========================
-- Battles table extensions
-- =========================

-- Add support for battle modes (1v1 / 3v3)
alter table public.battles
  add column if not exists mode text;

update public.battles
  set mode = '1v1'
  where mode is null;

do $$
begin
  alter table public.battles
    drop constraint if exists battles_mode_check;
  alter table public.battles
    add constraint battles_mode_check
    check (mode in ('1v1', '3v3'));
exception when duplicate_object then null;
end $$;

alter table public.battles
  alter column mode set default '1v1';

do $$
begin
  alter table public.battles
    alter column mode set not null;
exception when others then null;
end $$;

-- Broaden status enum to cover queued battles
do $$
begin
  alter table public.battles
    drop constraint if exists battles_status_check;
  alter table public.battles
    add constraint battles_status_check
    check (status in ('waiting', 'in_progress', 'completed', 'cancelled', 'pending', 'active'));
exception when duplicate_object then null;
end $$;

-- Additional metadata columns consumed by arena APIs
alter table public.battles
  add column if not exists problem_set_id uuid references public.contests(id) on delete set null,
  add column if not exists start_at timestamptz,
  add column if not exists end_at timestamptz,
  add column if not exists winner_id uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz default now();

update public.battles
  set start_at = coalesce(start_at, started_at),
      end_at   = coalesce(end_at, ended_at),
      winner_id = coalesce(winner_id, winner_user_id)
  where start_at is null or end_at is null or winner_id is null;

create index if not exists idx_battles_mode_status on public.battles(mode, status);
create index if not exists idx_battles_created_at_desc on public.battles(created_at desc);

-- =========================
-- Battle ratings extensions
-- =========================

alter table public.battle_ratings
  add column if not exists entity_id uuid,
  add column if not exists entity_type text,
  add column if not exists mode text,
  add column if not exists elo int,
  add column if not exists draws int default 0,
  add column if not exists updated_at timestamptz default now();

update public.battle_ratings
  set entity_id = coalesce(entity_id, user_id),
      entity_type = coalesce(entity_type, 'user'),
      mode = coalesce(mode, '1v1'),
      elo = coalesce(elo, rating)
  where entity_id is null or entity_type is null or mode is null or elo is null;

do $$
begin
  alter table public.battle_ratings
    drop constraint if exists battle_ratings_entity_type_check;
  alter table public.battle_ratings
    add constraint battle_ratings_entity_type_check
    check (entity_type in ('user', 'team'));
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.battle_ratings
    drop constraint if exists battle_ratings_mode_check;
  alter table public.battle_ratings
    add constraint battle_ratings_mode_check
    check (mode in ('1v1', '3v3'));
exception when duplicate_object then null;
end $$;

create unique index if not exists idx_battle_ratings_entity_mode
  on public.battle_ratings(entity_id, entity_type, mode);

create index if not exists idx_battle_ratings_entity_type
  on public.battle_ratings(entity_type);

create index if not exists idx_battle_ratings_mode
  on public.battle_ratings(mode);

-- =========================
-- Team battles
-- =========================

create table if not exists public.battle_teams (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  team_name text not null,
  score int default 0,
  penalty_time int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.battle_team_players (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.battle_teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('captain', 'member')),
  created_at timestamptz default now(),
  unique (team_id, user_id)
);

create index if not exists idx_battle_teams_battle_id on public.battle_teams(battle_id);
create index if not exists idx_battle_team_players_team_id on public.battle_team_players(team_id);
create index if not exists idx_battle_team_players_user_id on public.battle_team_players(user_id);

alter table public.battle_teams enable row level security;
alter table public.battle_team_players enable row level security;

drop policy if exists "battle_teams_select_all" on public.battle_teams;
create policy "battle_teams_select_all" on public.battle_teams
  for select using (true);

drop policy if exists "battle_teams_insert_own" on public.battle_teams;
create policy "battle_teams_insert_own" on public.battle_teams
  for insert with check (auth.uid() is not null);

drop policy if exists "battle_team_players_select_all" on public.battle_team_players;
create policy "battle_team_players_select_all" on public.battle_team_players
  for select using (true);

drop policy if exists "battle_team_players_insert_own" on public.battle_team_players;
create policy "battle_team_players_insert_own" on public.battle_team_players
  for insert with check (auth.uid() is not null);

-- =========================
-- Battle submissions extensions
-- =========================

alter table public.battle_submissions
  add column if not exists team_id uuid references public.battle_teams(id) on delete set null,
  add column if not exists verdict text,
  add column if not exists penalty int default 0,
  add column if not exists code text;

do $$
begin
  alter table public.battle_submissions
    drop constraint if exists battle_submissions_verdict_check;
  alter table public.battle_submissions
    add constraint battle_submissions_verdict_check
    check (verdict is null or verdict in ('AC', 'WA', 'TLE', 'MLE', 'RE', 'CE', 'pending'));
exception when duplicate_object then null;
end $$;

-- Keep legacy status column populated when verdict exists
update public.battle_submissions
  set status = case verdict
    when 'AC' then 'solved'
    when 'WA' then 'failed'
    when 'TLE' then 'failed'
    when 'MLE' then 'failed'
    when 'RE' then 'failed'
    when 'CE' then 'failed'
    when 'pending' then 'pending'
    else status
  end
  where verdict is not null;

create index if not exists idx_battle_submissions_team_id on public.battle_submissions(team_id);

do $$
begin
  if not exists (
    select 1 from pg_proc where proname = 'sync_battle_submission_code'
  ) then
    create function public.sync_battle_submission_code()
    returns trigger as $$
    begin
      if new.code is not null and (new.code_text is null or new.code_text = '') then
        new.code_text := new.code;
      elsif new.code is null and new.code_text is not null and new.code_text <> '' then
        new.code := new.code_text;
      end if;
      return new;
    end;
    $$ language plpgsql;
  end if;
exception when duplicate_function then null;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'battle_submissions_sync_code_ins'
  ) then
    create trigger battle_submissions_sync_code_ins
      before insert on public.battle_submissions
      for each row
      when (new.code is not null and new.code_text is null)
      execute function public.sync_battle_submission_code();
  end if;
  if not exists (
    select 1 from pg_trigger where tgname = 'battle_submissions_sync_code_upd'
  ) then
    create trigger battle_submissions_sync_code_upd
      before update on public.battle_submissions
      for each row
      when ((new.code is distinct from old.code) or (new.code_text is distinct from old.code_text))
      execute function public.sync_battle_submission_code();
  end if;
end $$;

-- =========================
-- Battle history
-- =========================

create table if not exists public.battle_history (
  id uuid primary key default gen_random_uuid(),
  battle_id uuid not null references public.battles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  team_id uuid references public.battle_teams(id) on delete cascade,
  result text not null check (result in ('win', 'loss', 'draw')),
  elo_change int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_battle_history_battle_id on public.battle_history(battle_id);
create index if not exists idx_battle_history_user_id on public.battle_history(user_id);

alter table public.battle_history enable row level security;

drop policy if exists "battle_history_select_all" on public.battle_history;
create policy "battle_history_select_all" on public.battle_history
  for select using (true);

drop policy if exists "battle_history_insert_own" on public.battle_history;
create policy "battle_history_insert_own" on public.battle_history
  for insert with check (auth.uid() is not null);

-- =========================
-- Matchmaking queue
-- =========================

create table if not exists public.battle_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  team_id uuid references public.battle_teams(id) on delete cascade,
  mode text not null check (mode in ('1v1', '3v3')),
  status text not null default 'waiting' check (status in ('waiting', 'matched', 'accepted', 'declined')),
  current_elo int default 1500,
  joined_at timestamptz default now(),
  matched_at timestamptz
);

create unique index if not exists idx_battle_queue_user_id_mode
  on public.battle_queue(user_id, mode)
  where user_id is not null;

create unique index if not exists idx_battle_queue_team_id_mode
  on public.battle_queue(team_id, mode)
  where team_id is not null;

create index if not exists idx_battle_queue_mode_status on public.battle_queue(mode, status);
create index if not exists idx_battle_queue_user_id on public.battle_queue(user_id);
create index if not exists idx_battle_queue_team_id on public.battle_queue(team_id);

alter table public.battle_queue enable row level security;

drop policy if exists "battle_queue_select_access" on public.battle_queue;
create policy "battle_queue_select_access" on public.battle_queue
  for select using (
    auth.uid() = user_id
    or (
      team_id is not null
      and exists (
        select 1
        from public.battle_team_players btp
        where btp.team_id = public.battle_queue.team_id
          and btp.user_id = auth.uid()
      )
    )
  );

drop policy if exists "battle_queue_insert_own" on public.battle_queue;
create policy "battle_queue_insert_own" on public.battle_queue
  for insert with check (auth.uid() is not null);

drop policy if exists "battle_queue_delete_own" on public.battle_queue;
create policy "battle_queue_delete_own" on public.battle_queue
  for delete using (
    auth.uid() = user_id
    or (
      team_id is not null
      and exists (
        select 1
        from public.battle_team_players btp
        where btp.team_id = public.battle_queue.team_id
          and btp.user_id = auth.uid()
      )
    )
  );

-- =========================
-- Housekeeping
-- =========================

comment on table public.battle_teams is 'Teams participating in multiplayer battles';
comment on table public.battle_team_players is 'Membership mapping between users and battle teams';
comment on table public.battle_queue is 'Matchmaking queue for battle arena modes';
comment on table public.battle_history is 'Historical outcomes for completed battles';
