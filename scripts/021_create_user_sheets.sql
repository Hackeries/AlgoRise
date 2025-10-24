create table if not exists public.user_sheets (
  user_id uuid not null references auth.users(id) on delete cascade,
  sheet_code text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, sheet_code)
);
