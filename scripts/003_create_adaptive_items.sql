-- =========================================
-- ADAPTIVE ITEMS (Spaced Repetition) - Recommended
-- Idempotent migration with RLS, indexes, UTC timestamps,
-- tag normalization, and optional helper.
-- =========================================

-- ---------- ENUMS ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'adaptive_outcome') then
    create type adaptive_outcome as enum ('solved','failed','skipped');
  end if;
end$$;

-- ---------- TABLE ----------
create table if not exists public.adaptive_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  rating integer not null,
  tags text[] not null default '{}',
  repetitions integer not null default 0,
  ease numeric(4,2) not null default 2.50,
  interval_days integer not null default 0,
  next_due_at timestamptz not null default timezone('utc', now()),
  last_outcome adaptive_outcome,
  problem_title text,
  problem_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, problem_id),

  -- Guardrails
  constraint adaptive_rating_bounds check (rating between 0 and 5000),
  constraint adaptive_reps_nonnegative check (repetitions >= 0),
  constraint adaptive_interval_nonnegative check (interval_days >= 0),
  constraint adaptive_ease_bounds check (ease between 1.30 and 3.00),
  constraint adaptive_problem_url_valid
    check (problem_url is null or problem_url ~* '^https?://')
);

comment on table public.adaptive_items is 'Per-user adaptive practice queue (spaced repetition) keyed by (user_id, problem_id).';
comment on column public.adaptive_items.tags is 'Normalized, lowercase, deduplicated tags used for filtering.';
comment on column public.adaptive_items.ease is 'SM-2 style ease factor (typ. 1.30..3.00).';
comment on column public.adaptive_items.next_due_at is 'UTC timestamp when the item becomes due.';

-- ---------- INDEXES ----------
create index if not exists idx_adapt_user           on public.adaptive_items(user_id);
create index if not exists idx_adapt_due_at         on public.adaptive_items(next_due_at);
create index if not exists idx_adapt_user_due       on public.adaptive_items(user_id, next_due_at);
create index if not exists idx_adapt_user_rating    on public.adaptive_items(user_id, rating);
create index if not exists idx_adapt_tags           on public.adaptive_items using gin(tags);

-- NOTE: Do NOT make a partial index with "next_due_at <= now()" (non-immutable predicate).
-- Planner cannot keep it current as time advances.

-- ---------- SHARED UPDATED_AT TRIGGER FUNCTION ----------
-- Define once, harmless to re-run.
create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

-- ---------- TAG NORMALIZATION TRIGGER ----------
-- Lowercase, trim, drop empties, deduplicate.
create or replace function public.normalize_adaptive_tags()
returns trigger
language plpgsql
as $$
declare
  v text;
  out_tags text[] := '{}';
begin
  if new.tags is null then
    new.tags := '{}';
    return new;
  end if;

  foreach v in array new.tags loop
    v := btrim(lower(v));
    if v <> '' then
      -- Append only if not already present
      if not (out_tags @> array[v]) then
        out_tags := array_append(out_tags, v);
      end if;
    end if;
  end loop;

  new.tags := out_tags;
  return new;
end;
$$;

-- Recreate triggers idempotently
drop trigger if exists trg_adaptive_items_updated on public.adaptive_items;
create trigger trg_adaptive_items_updated
before update on public.adaptive_items
for each row
execute function public.set_timestamp();

drop trigger if exists trg_adaptive_items_tags_norm_ins on public.adaptive_items;
create trigger trg_adaptive_items_tags_norm_ins
before insert on public.adaptive_items
for each row
execute function public.normalize_adaptive_tags();

drop trigger if exists trg_adaptive_items_tags_norm_upd on public.adaptive_items;
create trigger trg_adaptive_items_tags_norm_upd
before update of tags on public.adaptive_items
for each row
execute function public.normalize_adaptive_tags();

-- ---------- ROW LEVEL SECURITY ----------
alter table public.adaptive_items enable row level security;

-- Reset policies (idempotent)
drop policy if exists "adaptive_items_select"        on public.adaptive_items;
drop policy if exists "adaptive_items_insert"        on public.adaptive_items;
drop policy if exists "adaptive_items_update"        on public.adaptive_items;
drop policy if exists "adaptive_items_delete"        on public.adaptive_items;
drop policy if exists "adaptive_items_admin_access"  on public.adaptive_items;

-- Owner-only access
create policy "adaptive_items_select"
  on public.adaptive_items
  for select
  using (user_id = auth.uid());

create policy "adaptive_items_insert"
  on public.adaptive_items
  for insert
  with check (user_id = auth.uid());

create policy "adaptive_items_update"
  on public.adaptive_items
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Deleting items is optional; enable if you want users to prune their queue
create policy "adaptive_items_delete"
  on public.adaptive_items
  for delete
  using (user_id = auth.uid());

-- Optional: service role bypass
create policy "adaptive_items_admin_access"
  on public.adaptive_items
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ---------- OPTIONAL HELPER: get due items with tag filter ----------
-- Returns due items for a user, optionally requiring that item.tags contains all of p_tags.
-- Security INVOKER (default) so RLS still applies.
create or replace function public.get_adaptive_due_items(
  p_user_id uuid,
  p_tags text[] default null,
  p_limit int default 50
)
returns setof public.adaptive_items
language sql
stable
as $$
  select *
  from public.adaptive_items
  where user_id = p_user_id
    and next_due_at <= timezone('utc', now())
    and (p_tags is null or tags @> p_tags)
  order by next_due_at asc, rating desc
  limit greatest(1, p_limit)
$$;

-- Grants (best-effort; ignore if roles do not exist)
do $$
begin
  begin
    grant execute on function public.get_adaptive_due_items(uuid, text[], int) to authenticated;
  exception when undefined_object then null;
  end;
end$$;