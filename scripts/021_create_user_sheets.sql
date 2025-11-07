-- =========================================
-- user_sheets: tracks sheet entitlements per user
-- Improved & idempotent
-- =========================================
-- Enhancements:
-- 1. UTC timestamps (created_at, plus optional updated_at).
-- 2. Guardrails: non-blank sheet_code, normalized (trim + lower or upper).
-- 3. Optional reference table (sheets_catalog) for controlled sheet codes.
-- 4. RLS policies (user can view/insert own; service_role full manage).
-- 5. Helper functions to grant/revoke entitlement, including from purchases.
-- 6. Indexes for fast lookup and potential future queries.
-- 7. Idempotent: safe to re-run.
-- =========================================

create extension if not exists pgcrypto;

-- ---------- OPTIONAL: canonical catalog of sheets (only if you want to constrain sheet_code)
-- If you already manage sheet codes elsewhere, you can skip this block.
create table if not exists public.sheets_catalog (
  sheet_code text primary key,
  name text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.sheets_catalog is 'Catalog of available sheet codes (optional).';

-- ---------- USER_SHEETS TABLE ----------
create table if not exists public.user_sheets (
  user_id uuid not null references auth.users(id) on delete cascade,
  sheet_code text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, sheet_code),

  constraint user_sheets_sheet_code_not_blank check (length(trim(sheet_code)) > 0)
  -- If you want to enforce that sheet_code exists in catalog:
  -- , constraint user_sheets_sheet_code_fk foreign key (sheet_code) references public.sheets_catalog(sheet_code)
);

comment on table public.user_sheets is 'Per-user entitlements to sheets/resources.';
comment on column public.user_sheets.sheet_code is 'Normalized sheet code granted to the user.';

-- ---------- NORMALIZATION (UPPERCASE, TRIM) ----------
create or replace function public.normalize_sheet_code(p text)
returns text
language sql
immutable
as $$
  select nullif(upper(btrim(coalesce(p,''))), '')
$$;

create or replace function public.normalize_user_sheet()
returns trigger
language plpgsql
as $$
begin
  new.sheet_code := public.normalize_sheet_code(new.sheet_code);
  return new;
end;
$$;

drop trigger if exists trg_user_sheets_normalize on public.user_sheets;
create trigger trg_user_sheets_normalize
before insert or update of sheet_code on public.user_sheets
for each row execute function public.normalize_user_sheet();

-- ---------- UPDATED_AT TRIGGER ----------
create or replace function public.set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_user_sheets_updated_at on public.user_sheets;
create trigger trg_user_sheets_updated_at
before update on public.user_sheets
for each row execute function public.set_timestamp();

-- ---------- INDEXES ----------
-- Lookup by user and sheet
create index if not exists idx_user_sheets_user on public.user_sheets(user_id);
create index if not exists idx_user_sheets_sheet on public.user_sheets(sheet_code);
create index if not exists idx_user_sheets_user_created on public.user_sheets(user_id, created_at desc);

-- ---------- ROW LEVEL SECURITY ----------
alter table public.user_sheets enable row level security;

-- Reset policies
drop policy if exists "user_sheets_select_own" on public.user_sheets;
drop policy if exists "user_sheets_insert_own" on public.user_sheets;
drop policy if exists "user_sheets_delete_own" on public.user_sheets;
drop policy if exists "user_sheets_admin_manage" on public.user_sheets;

-- Read: user sees own entitlements; service_role sees all
create policy "user_sheets_select_own"
  on public.user_sheets
  for select
  using (auth.uid() = user_id or auth.role() = 'service_role');

-- Insert: user grants to themselves (e.g., via verified purchase) OR service_role
create policy "user_sheets_insert_own"
  on public.user_sheets
  for insert
  with check (auth.uid() = user_id or auth.role() = 'service_role');

-- Delete: user can revoke their own entitlements (optional). If you want only admin revoke, restrict this.
create policy "user_sheets_delete_own"
  on public.user_sheets
  for delete
  using (auth.uid() = user_id or auth.role() = 'service_role');

-- Explicit admin bypass
create policy "user_sheets_admin_manage"
  on public.user_sheets
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ---------- HELPER FUNCTIONS ----------
-- Grant entitlement (idempotent)
create or replace function public.grant_sheet_to_user(
  p_user_id uuid,
  p_sheet_code text
)
returns public.user_sheets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.user_sheets%rowtype;
begin
  if p_user_id is null or p_sheet_code is null then
    raise exception 'user_id and sheet_code required';
  end if;

  -- Authorization: self or service_role
  if auth.role() <> 'service_role' and auth.uid() <> p_user_id then
    raise exception 'insufficient_privilege';
  end if;

  insert into public.user_sheets (user_id, sheet_code)
  values (p_user_id, public.normalize_sheet_code(p_sheet_code))
  on conflict (user_id, sheet_code) do update
    set updated_at = timezone('utc', now())
  returning * into v_row;

  return v_row;
end;
$$;

-- Revoke entitlement
create or replace function public.revoke_sheet_from_user(
  p_user_id uuid,
  p_sheet_code text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' and auth.uid() <> p_user_id then
    raise exception 'insufficient_privilege';
  end if;

  delete from public.user_sheets
  where user_id = p_user_id
    and sheet_code = public.normalize_sheet_code(p_sheet_code);

  return found;
end;
$$;

-- Grant from a paid purchase (ensures purchase exists & status=paid)
create or replace function public.grant_sheet_from_purchase(
  p_user_id uuid,
  p_order_id text
)
returns public.user_sheets
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase public.purchases%rowtype;
  v_sheet_code text;
  v_row public.user_sheets%rowtype;
begin
  if auth.role() <> 'service_role' and auth.uid() <> p_user_id then
    raise exception 'insufficient_privilege';
  end if;

  select * into v_purchase
  from public.purchases
  where user_id = p_user_id
    and order_id = p_order_id;

  if not found then
    raise exception 'purchase not found for order_id=%', p_order_id;
  end if;

  if v_purchase.status <> 'paid' then
    raise exception 'purchase % not paid (status=%)', p_order_id, v_purchase.status;
  end if;

  if v_purchase.sheet_code is null then
    raise exception 'purchase % has no sheet_code', p_order_id;
  end if;

  v_sheet_code := public.normalize_sheet_code(v_purchase.sheet_code);

  insert into public.user_sheets (user_id, sheet_code)
  values (p_user_id, v_sheet_code)
  on conflict (user_id, sheet_code) do update
    set updated_at = timezone('utc', now())
  returning * into v_row;

  return v_row;
end;
$$;

-- ---------- GRANTS (best-effort) ----------
do $$
begin
  begin
    grant execute on function public.grant_sheet_to_user(uuid, text) to authenticated;
    grant execute on function public.revoke_sheet_from_user(uuid, text) to authenticated;
    grant execute on function public.grant_sheet_from_purchase(uuid, text) to authenticated;
    grant execute on function public.grant_sheet_to_user(uuid, text) to service_role;
    grant execute on function public.revoke_sheet_from_user(uuid, text) to service_role;
    grant execute on function public.grant_sheet_from_purchase(uuid, text) to service_role;
  exception when undefined_object then null;
  end;
end$$;

-- =========================================
-- USAGE EXAMPLES
-- select grant_sheet_to_user(auth.uid(), 'dsa_sheet');
-- select revoke_sheet_from_user(auth.uid(), 'dsa_sheet');
-- select grant_sheet_from_purchase(auth.uid(), 'order_ABC123');
-- =========================================