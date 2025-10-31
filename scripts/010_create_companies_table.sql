-- Create companies table for working professionals
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- ensure profiles.company_id references companies once table is present
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'company_id'
  ) and not exists (
    select 1
    from information_schema.table_constraints
    where constraint_name = 'profiles_company_id_fkey'
      and table_schema = 'public'
      and table_name = 'profiles'
  ) then
    alter table public.profiles
      add constraint profiles_company_id_fkey
      foreign key (company_id) references public.companies(id) on delete set null;
  end if;
end $$;

alter table public.companies enable row level security;

-- Public read access for listing/searching companies
do $$ begin
  create policy "companies_select_all" on public.companies
    for select using (true);
exception when duplicate_object then null; end $$;

-- Authenticated users can insert companies
do $$ begin
  create policy "companies_insert_authenticated" on public.companies
    for insert with check (auth.uid() is not null);
exception when duplicate_object then null; end $$;

-- Helpful indexes
create index if not exists idx_companies_name on public.companies(name);
create index if not exists idx_companies_name_trgm on public.companies using gin (name gin_trgm_ops);
