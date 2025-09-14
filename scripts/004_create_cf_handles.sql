-- Tables
create table if not exists public.cf_handles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  handle text not null,
  verified boolean not null default false,
  verification_token text,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- Triggers for updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_cf_handles_updated_at on public.cf_handles;
create trigger trg_cf_handles_updated_at
before update on public.cf_handles
for each row execute procedure public.set_updated_at();

-- RLS
alter table public.cf_handles enable row level security;

-- Policy: users can select their own row
drop policy if exists "select own cf handle" on public.cf_handles;
create policy "select own cf handle"
on public.cf_handles
for select
using ( auth.uid() = user_id );

-- Policy: users can insert their own row
drop policy if exists "insert own cf handle" on public.cf_handles;
create policy "insert own cf handle"
on public.cf_handles
for insert
with check ( auth.uid() = user_id );

-- Policy: users can update their own row
drop policy if exists "update own cf handle" on public.cf_handles;
create policy "update own cf handle"
on public.cf_handles
for update
using ( auth.uid() = user_id )
with check ( auth.uid() = user_id );

-- Helpful index
create index if not exists idx_cf_handles_user_id on public.cf_handles(user_id);
