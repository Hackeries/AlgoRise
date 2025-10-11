-- Purchases: track one-time sheet purchases via Razorpay
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sheet_code text,
  amount integer not null, -- in paise
  currency text not null default 'INR',
  order_id text unique not null,
  payment_id text,
  signature text,
  status text not null default 'created', -- created | paid | failed
  created_at timestamptz not null default now()
);

-- Helpful index
create index if not exists idx_purchases_user on public.purchases(user_id);
