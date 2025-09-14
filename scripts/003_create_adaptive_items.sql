-- create adaptive_items with proper indexes, RLS, and array tag filter support
create table if not exists public.adaptive_items (
  user_id uuid not null,
  problem_id text not null,
  rating integer not null,
  tags text[] not null default '{}',
  repetitions integer not null default 0,
  ease numeric not null default 2.5,
  interval_days integer not null default 0,
  next_due_at timestamptz not null default now(),
  last_outcome text check (last_outcome in ('solved','failed','skipped')),
  problem_title text,
  problem_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, problem_id)
);

-- indexes for performance
create index if not exists idx_adapt_user on public.adaptive_items(user_id);
create index if not exists idx_adapt_due_at on public.adaptive_items(next_due_at);
create index if not exists idx_adapt_user_due on public.adaptive_items(user_id, next_due_at);
create index if not exists idx_adapt_tags on public.adaptive_items using gin(tags);

-- RLS
alter table public.adaptive_items enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'adaptive_items_select' and tablename = 'adaptive_items') then
    create policy adaptive_items_select on public.adaptive_items
      for select using (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'adaptive_items_insert' and tablename = 'adaptive_items') then
    create policy adaptive_items_insert on public.adaptive_items
      for insert with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where policyname = 'adaptive_items_update' and tablename = 'adaptive_items') then
    create policy adaptive_items_update on public.adaptive_items
      for update using (user_id = auth.uid());
  end if;
end$$;

-- trigger to maintain updated_at
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_adaptive_items_updated on public.adaptive_items;
create trigger trg_adaptive_items_updated before update on public.adaptive_items
for each row execute function public.set_updated_at();
