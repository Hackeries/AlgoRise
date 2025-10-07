-- enable required extension
create extension if not exists pg_trgm;

-- create colleges table (India focus)
create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null default 'India',
  created_at timestamptz not null default now()
);

-- enable RLS
alter table public.colleges enable row level security;

-- allow public read access
do $$ begin
  create policy "colleges_select_all" on public.colleges
    for select using (true);
exception when duplicate_object then null; end $$;

-- indexes
create index if not exists idx_colleges_country on public.colleges(country);
create index if not exists idx_colleges_name_trgm on public.colleges using gin (name gin_trgm_ops);
