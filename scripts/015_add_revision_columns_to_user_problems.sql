-- Safe-guarded migration: add marked_for_revision and revision_marked_at if missing

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_problems'
      and column_name = 'marked_for_revision'
  ) then
    alter table public.user_problems
      add column marked_for_revision boolean default false;
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_problems'
      and column_name = 'revision_marked_at'
  ) then
    alter table public.user_problems
      add column revision_marked_at timestamptz;
  end if;
end $$;

-- Optional indexes to speed up revision queries
create index if not exists idx_user_problems_revision
  on public.user_problems (user_id, marked_for_revision);
