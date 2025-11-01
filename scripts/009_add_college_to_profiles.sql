-- add college_id column if it was missing in older environments
alter table if exists public.profiles
  add column if not exists college_id uuid;

-- ensure foreign key exists (handled for fresh installs via 005_create_colleges)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'college_id'
  ) and not exists (
    select 1
    from information_schema.table_constraints
    where constraint_type = 'FOREIGN KEY'
      and table_schema = 'public'
      and table_name = 'profiles'
      and constraint_name = 'profiles_college_id_fkey'
  ) and to_regclass('public.colleges') is not null then
    alter table public.profiles
      add constraint profiles_college_id_fkey
      foreign key (college_id) references public.colleges(id) on delete set null;
  end if;
end $$;

-- create helper to enforce college membership rules without invalid CHECK constraints
do $$
begin
  if not exists (
    select 1
    from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'enforce_college_membership'
  ) then
    execute $$
      create function public.enforce_college_membership()
      returns trigger
      language plpgsql
      as $$
      declare
        v_group_type text;
        v_group_college uuid;
        v_user_college uuid;
      begin
        select g.type, g.college_id
        into v_group_type, v_group_college
        from public.groups g
        where g.id = new.group_id;

        if v_group_type in ('college','icpc') then
          select p.college_id
          into v_user_college
          from public.profiles p
          where p.id = new.user_id;

          if v_group_college is null then
            raise exception 'Group % is missing college_id when required', new.group_id;
          end if;

          if v_user_college is distinct from v_group_college then
            raise exception 'User % must belong to college % to join group %', new.user_id, v_group_college, new.group_id;
          end if;
        end if;

        return new;
      end;
      $$;
    $$;
  end if;
end $$;

drop trigger if exists trg_group_memberships_college_check on public.group_memberships;
create trigger trg_group_memberships_college_check
before insert or update on public.group_memberships
for each row execute function public.enforce_college_membership();

-- supportive indexes (general ones already exist; ensure college_id indexed)
create index if not exists idx_profiles_college_id on public.profiles(college_id);
