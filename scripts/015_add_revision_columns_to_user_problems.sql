-- =========================================
-- Add revision flags to user_problems (safe, idempotent)
-- - Adds marked_for_revision (boolean not null default false)
-- - Adds revision_marked_at (timestamptz)
-- - Backfills existing rows
-- - Trigger sets revision_marked_at on first transition to true
-- - Helpful indexes for common queries
-- =========================================

-- 1) Columns (add if missing)
do $$
begin
  -- marked_for_revision
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_problems'
      and column_name = 'marked_for_revision'
  ) then
    execute $sql$
      alter table public.user_problems
        add column marked_for_revision boolean default false
    $sql$;
  end if;

  -- revision_marked_at
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_problems'
      and column_name = 'revision_marked_at'
  ) then
    execute $sql$
      alter table public.user_problems
        add column revision_marked_at timestamptz
    $sql$;
  end if;
end
$$;

-- 2) Normalize nulls and enforce NOT NULL on marked_for_revision
update public.user_problems
   set marked_for_revision = false
 where marked_for_revision is null;

alter table public.user_problems
  alter column marked_for_revision set default false,
  alter column marked_for_revision set not null;

-- 3) Backfill revision_marked_at for already-marked rows
update public.user_problems
   set revision_marked_at = timezone('utc', now())
 where marked_for_revision = true
   and revision_marked_at is null;

-- 4) Trigger to set revision_marked_at when flag flips to true
create or replace function public.set_revision_mark_timestamp()
returns trigger
language plpgsql
as $$
begin
  -- If newly marked for revision and timestamp not provided, stamp it
  if coalesce(old.marked_for_revision, false) = false
     and new.marked_for_revision = true
     and new.revision_marked_at is null then
    new.revision_marked_at := timezone('utc', now());
  end if;

  -- Keep revision_marked_at as-is when unmarking to preserve history.
  -- If you prefer clearing on unmark, uncomment:
  -- if coalesce(old.marked_for_revision, false) = true
  --    and new.marked_for_revision = false then
  --   new.revision_marked_at := null;
  -- end if;

  return new;
end;
$$;

drop trigger if exists trg_user_problems_revision_ts on public.user_problems;
create trigger trg_user_problems_revision_ts
before insert or update of marked_for_revision, revision_marked_at on public.user_problems
for each row
execute function public.set_revision_mark_timestamp();

-- 5) Helpful indexes
-- For quick filtering by user and flag
create index if not exists idx_user_problems_revision
  on public.user_problems (user_id, marked_for_revision);

-- For listing a user's marked-for-revision items by most recently marked
create index if not exists idx_user_problems_revision_recent
  on public.user_problems (user_id, revision_marked_at desc)
  where marked_for_revision;