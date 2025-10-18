-- Create a table for tracking gamification stats
create table if not exists public.user_gamification (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_xp int default 0,
  current_streak int default 0,
  total_badges int default 0,
  level int default 1,
  updated_at timestamptz default now()
);

-- Trigger: auto-update XP, level, badges when a problem is solved
create or replace function update_xp_on_solve()
returns trigger as $$
begin
  if new.solved = true then
    update user_gamification
    set 
      total_xp = total_xp + 10,
      total_badges = floor(total_xp / 50),
      level = floor(total_xp / 100) + 1,
      updated_at = now()
    where user_id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger on problem table
create trigger on_problem_solved
after insert or update on public.user_problems
for each row
execute function update_xp_on_solve();