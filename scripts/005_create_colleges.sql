-- create colleges table (India focus), indexes, and permissive select policy
create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null default 'India',
  created_at timestamptz not null default now()
);

alter table public.colleges enable row level security;

-- Public read access for listing/searching colleges
do $$ begin
  create policy "colleges_select_all" on public.colleges
    for select using (true);
exception when duplicate_object then null; end $$;

-- Helpful indexes
create index if not exists idx_colleges_country on public.colleges(country);
create index if not exists idx_colleges_name_trgm on public.colleges using gin (name gin_trgm_ops);
