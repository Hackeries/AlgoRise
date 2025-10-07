do $$
begin
  create policy "colleges_insert_authenticated"
  on public.colleges
  for insert
  to authenticated
  with check (true);
exception
  when duplicate_object then null;
end $$;
