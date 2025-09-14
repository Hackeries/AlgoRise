-- seed a starter set of Indian colleges for onboarding. Uses WHERE NOT EXISTS to avoid duplicates.
insert into public.colleges (name, country)
select 'Indian Institute of Technology Bombay', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Bombay'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Delhi', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Delhi'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Madras', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Madras'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Kanpur', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Kanpur'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Kharagpur', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Kharagpur'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Roorkee', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Roorkee'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Guwahati', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Guwahati'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Hyderabad', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Hyderabad'));

insert into public.colleges (name, country)
select 'International Institute of Information Technology Hyderabad', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('International Institute of Information Technology Hyderabad'));

insert into public.colleges (name, country)
select 'National Institute of Technology Tiruchirappalli', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Tiruchirappalli'));
