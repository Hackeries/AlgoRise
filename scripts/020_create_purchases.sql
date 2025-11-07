-- =========================================
-- purchases: one-time sheet purchases (Razorpay)
-- FIX / IMPROVED MIGRATION (handles pre-existing table without metadata column)
-- =========================================
-- Safe operations:
-- 1. Ensure enum purchase_status exists.
-- 2. Create table if missing, else alter existing:
--    - Add columns (metadata, updated_at) if absent.
--    - Convert legacy status TEXT -> purchase_status enum.
-- 3. Add / verify constraints & indexes idempotently.
-- 4. Create RLS policies (reset).
-- 5. Provide helper functions (mark paid / failed / refunded) guarded for column existence.
-- =========================================

create extension if not exists pgcrypto;

-- ---------- ENUM ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'purchase_status') then
    create type purchase_status as enum ('created','paid','failed','refunded');
  end if;
end$$;

-- ---------- TABLE (create if absent) ----------
do $$
begin
  if to_regclass('public.purchases') is null then
    create table public.purchases (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references auth.users(id) on delete cascade,
      sheet_code text,
      amount integer not null,
      currency text not null default 'INR',
      order_id text not null,
      payment_id text,
      signature text,
      status purchase_status not null default 'created',
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default timezone('utc', now()),
      updated_at timestamptz not null default timezone('utc', now()),
      constraint purchases_amount_positive check (amount > 0),
      constraint purchases_currency_iso3 check (length(currency) = 3),
      constraint purchases_sheet_code_not_blank check (sheet_code is null or length(trim(sheet_code)) > 0),
      constraint purchases_order_id_not_blank check (length(trim(order_id)) > 0),
      constraint purchases_payment_id_not_blank check (payment_id is null or length(trim(payment_id)) > 0),
      constraint purchases_signature_not_blank check (signature is null or length(trim(signature)) > 0),
      constraint purchases_order_id_unique unique (order_id)
    );
  end if;
end$$;

-- ---------- ADD MISSING COLUMNS ----------
do $$
begin
  -- metadata
  if exists (select 1 from pg_class where oid='public.purchases'::regclass)
     and not exists (
       select 1 from information_schema.columns
       where table_schema='public' and table_name='purchases' and column_name='metadata'
     ) then
    alter table public.purchases
      add column metadata jsonb not null default '{}'::jsonb;
  end if;

  -- updated_at
  if exists (select 1 from pg_class where oid='public.purchases'::regclass)
     and not exists (
       select 1 from information_schema.columns
       where table_schema='public' and table_name='purchases' and column_name='updated_at'
     ) then
    alter table public.purchases
      add column updated_at timestamptz not null default timezone('utc', now());
  end if;
end$$;

-- Backfill metadata if null (legacy rows)
update public.purchases set metadata='{}'::jsonb where metadata is null;

-- ---------- CONVERT LEGACY status TEXT -> ENUM ----------
do $$
declare
  v_is_enum boolean;
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='purchases' and column_name='status'
  ) then
    select (udt_name='purchase_status') into v_is_enum
    from information_schema.columns
    where table_schema='public' and table_name='purchases' and column_name='status';

    if not v_is_enum then
      -- sanitize unexpected values
      update public.purchases
         set status = 'created'
       where status is null or lower(status) not in ('created','paid','failed','refunded');

      alter table public.purchases
        alter column status drop default;

      alter table public.purchases
        alter column status type purchase_status
        using lower(status)::purchase_status;

      alter table public.purchases
        alter column status set default 'created',
        alter column status set not null;
    end if;
  else
    -- Column missing (unlikely): add fresh enum column
    alter table public.purchases
      add column status purchase_status not null default 'created';
  end if;
end$$;

-- ---------- (Re)Add Constraints If Missing ----------
do $$
begin
  if not exists (select 1 from pg_constraint where conname='purchases_amount_positive') then
    alter table public.purchases add constraint purchases_amount_positive check (amount > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname='purchases_currency_iso3') then
    alter table public.purchases add constraint purchases_currency_iso3 check (length(currency)=3);
  end if;
  if not exists (select 1 from pg_constraint where conname='purchases_order_id_unique') then
    alter table public.purchases add constraint purchases_order_id_unique unique (order_id);
  end if;
end$$;

-- ---------- COMMENTS ----------
comment on table public.purchases is 'One-time purchases (Razorpay) for sheet access.';
comment on column public.purchases.metadata is 'Gateway/webhook payloads and audit info.';

-- ---------- TIMESTAMP TRIGGER ----------
create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_purchases_updated_at on public.purchases;
create trigger trg_purchases_updated_at
before update on public.purchases
for each row execute function public.set_timestamp();

-- ---------- INDEXES ----------
create index if not exists idx_purchases_user            on public.purchases(user_id);
create index if not exists idx_purchases_status          on public.purchases(status);
create index if not exists idx_purchases_payment_id      on public.purchases(payment_id) where payment_id is not null;
create index if not exists idx_purchases_sheet_user      on public.purchases(user_id, sheet_code);
create index if not exists idx_purchases_created_at      on public.purchases(created_at desc);

-- ---------- ROW LEVEL SECURITY ----------
alter table public.purchases enable row level security;

-- Reset policies
drop policy if exists "purchases_select_own" on public.purchases;
drop policy if exists "purchases_insert_own" on public.purchases;
drop policy if exists "purchases_update_own_created" on public.purchases;
drop policy if exists "purchases_admin_manage" on public.purchases;

create policy "purchases_select_own"
  on public.purchases
  for select
  using (auth.uid() = user_id or auth.role() = 'service_role');

create policy "purchases_insert_own"
  on public.purchases
  for insert
  with check (auth.uid() = user_id or auth.role() = 'service_role');

create policy "purchases_update_own_created"
  on public.purchases
  for update
  using (
    (auth.uid() = user_id and status = 'created')
    or auth.role() = 'service_role'
  )
  with check (
    (auth.uid() = user_id and status = 'created')
    or auth.role() = 'service_role'
  );

create policy "purchases_admin_manage"
  on public.purchases
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ---------- HELPER FUNCTIONS ----------
-- Only create/replace after metadata column guaranteed present.

create or replace function public.mark_purchase_paid(
  p_user_id uuid,
  p_order_id text,
  p_payment_id text,
  p_signature text,
  p_gateway_payload jsonb default '{}'::jsonb
)
returns public.purchases
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.purchases%rowtype;
begin
  if auth.role() <> 'service_role' and auth.uid() <> p_user_id then
    raise exception 'insufficient_privilege';
  end if;

  select * into v_row
  from public.purchases
  where order_id = p_order_id
    and user_id = p_user_id
  for update;

  if not found then
    raise exception 'purchase not found for order_id=%', p_order_id;
  end if;

  if v_row.status = 'paid' then
    return v_row; -- idempotent
  end if;
  if v_row.status = 'failed' then
    raise exception 'cannot mark failed purchase as paid';
  end if;

  -- TODO: verify Razorpay signature externally

  update public.purchases
     set payment_id = p_payment_id,
         signature = p_signature,
         status = 'paid',
         metadata = metadata || jsonb_build_object('payment', p_gateway_payload, 'paid_at', timezone('utc', now()))
   where id = v_row.id
   returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.mark_purchase_failed(
  p_user_id uuid,
  p_order_id text,
  p_reason text default null
)
returns public.purchases
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.purchases%rowtype;
begin
  if auth.role() <> 'service_role' and auth.uid() <> p_user_id then
    raise exception 'insufficient_privilege';
  end if;

  select * into v_row
  from public.purchases
  where order_id = p_order_id
    and user_id = p_user_id
  for update;

  if not found then
    raise exception 'purchase not found';
  end if;

  if v_row.status in ('failed','refunded') then
    return v_row; -- idempotent
  end if;

  update public.purchases
     set status = 'failed',
         metadata = metadata || jsonb_build_object('failed_reason', p_reason, 'failed_at', timezone('utc', now()))
   where id = v_row.id
   returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.mark_purchase_refunded(
  p_order_id text,
  p_refund_payload jsonb default '{}'::jsonb
)
returns public.purchases
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.purchases%rowtype;
begin
  if auth.role() <> 'service_role' then
    raise exception 'insufficient_privilege';
  end if;

  select * into v_row
  from public.purchases
  where order_id = p_order_id
  for update;

  if not found then
    raise exception 'purchase not found';
  end if;

  if v_row.status = 'refunded' then
    return v_row;
  end if;

  if v_row.status <> 'paid' then
    raise exception 'can only refund paid purchases';
  end if;

  update public.purchases
     set status = 'refunded',
         metadata = metadata || jsonb_build_object('refund', p_refund_payload, 'refunded_at', timezone('utc', now()))
   where id = v_row.id
   returning * into v_row;

  return v_row;
end;
$$;

-- ---------- GRANTS ----------
do $$
begin
  begin
    grant execute on function public.mark_purchase_paid(uuid, text, text, text, jsonb) to authenticated;
    grant execute on function public.mark_purchase_failed(uuid, text, text) to authenticated;
    grant execute on function public.mark_purchase_refunded(text, jsonb) to service_role;
  exception when undefined_object then null;
  end;
end$$;

-- =========================================
-- DONE
-- =========================================