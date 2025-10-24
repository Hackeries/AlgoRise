alter table if exists public.profiles
  add column if not exists leetcode_handle text,
  add column if not exists codechef_handle text,
  add column if not exists atcoder_handle text,
  add column if not exists gfg_handle text;

-- Optional simple length checks
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_leetcode_len') then
    alter table public.profiles add constraint profiles_leetcode_len check (char_length(leetcode_handle) <= 64);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_codechef_len') then
    alter table public.profiles add constraint profiles_codechef_len check (char_length(codechef_handle) <= 64);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_atcoder_len') then
    alter table public.profiles add constraint profiles_atcoder_len check (char_length(atcoder_handle) <= 64);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_gfg_len') then
    alter table public.profiles add constraint profiles_gfg_len check (char_length(gfg_handle) <= 64);
  end if;
end $$;
