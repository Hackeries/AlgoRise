-- Comprehensive seed data for Indian colleges and universities
-- Uses WHERE NOT EXISTS to avoid duplicates on re-runs

-- IITs (Indian Institutes of Technology)
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
select 'Indian Institute of Technology Indore', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Indore'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Bhubaneswar', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Bhubaneswar'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Gandhinagar', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Gandhinagar'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Patna', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Patna'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Ropar', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Ropar'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Mandi', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Mandi'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Jodhpur', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Jodhpur'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology (BHU) Varanasi', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology (BHU) Varanasi'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Palakkad', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Palakkad'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Tirupati', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Tirupati'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Dhanbad', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Dhanbad'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Bhilai', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Bhilai'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Goa', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Goa'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Jammu', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Jammu'));

insert into public.colleges (name, country)
select 'Indian Institute of Technology Dharwad', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Technology Dharwad'));

-- NITs (National Institutes of Technology)
insert into public.colleges (name, country)
select 'National Institute of Technology Tiruchirappalli', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Tiruchirappalli'));

insert into public.colleges (name, country)
select 'National Institute of Technology Karnataka Surathkal', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Karnataka Surathkal'));

insert into public.colleges (name, country)
select 'National Institute of Technology Rourkela', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Rourkela'));

insert into public.colleges (name, country)
select 'National Institute of Technology Warangal', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Warangal'));

insert into public.colleges (name, country)
select 'National Institute of Technology Calicut', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Calicut'));

insert into public.colleges (name, country)
select 'National Institute of Technology Durgapur', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Durgapur'));

insert into public.colleges (name, country)
select 'National Institute of Technology Jamshedpur', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Jamshedpur'));

insert into public.colleges (name, country)
select 'National Institute of Technology Kurukshetra', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Kurukshetra'));

insert into public.colleges (name, country)
select 'National Institute of Technology Silchar', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Silchar'));

insert into public.colleges (name, country)
select 'National Institute of Technology Hamirpur', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Hamirpur'));

insert into public.colleges (name, country)
select 'National Institute of Technology Jalandhar', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Jalandhar'));

insert into public.colleges (name, country)
select 'National Institute of Technology Raipur', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Raipur'));

insert into public.colleges (name, country)
select 'National Institute of Technology Agartala', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Agartala'));

insert into public.colleges (name, country)
select 'National Institute of Technology Patna', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Patna'));

insert into public.colleges (name, country)
select 'National Institute of Technology Srinagar', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('National Institute of Technology Srinagar'));

-- IIITs (Indian Institutes of Information Technology)
insert into public.colleges (name, country)
select 'International Institute of Information Technology Hyderabad', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('International Institute of Information Technology Hyderabad'));

insert into public.colleges (name, country)
select 'International Institute of Information Technology Bangalore', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('International Institute of Information Technology Bangalore'));

insert into public.colleges (name, country)
select 'Indian Institute of Information Technology Allahabad', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Information Technology Allahabad'));

insert into public.colleges (name, country)
select 'Indian Institute of Information Technology Gwalior', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Information Technology Gwalior'));

insert into public.colleges (name, country)
select 'Indian Institute of Information Technology Jabalpur', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Information Technology Jabalpur'));

insert into public.colleges (name, country)
select 'Indian Institute of Information Technology Kota', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Information Technology Kota'));

insert into public.colleges (name, country)
select 'Indian Institute of Information Technology Vadodara', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Information Technology Vadodara'));

-- IIMs (Indian Institutes of Management)
insert into public.colleges (name, country)
select 'Indian Institute of Management Ahmedabad', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Management Ahmedabad'));

insert into public.colleges (name, country)
select 'Indian Institute of Management Bangalore', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Management Bangalore'));

insert into public.colleges (name, country)
select 'Indian Institute of Management Calcutta', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Management Calcutta'));

insert into public.colleges (name, country)
select 'Indian Institute of Management Lucknow', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Management Lucknow'));

insert into public.colleges (name, country)
select 'Indian Institute of Management Indore', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Management Indore'));

insert into public.colleges (name, country)
select 'Indian Institute of Management Kozhikode', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indian Institute of Management Kozhikode'));

-- BITS
insert into public.colleges (name, country)
select 'Birla Institute of Technology and Science Pilani', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Birla Institute of Technology and Science Pilani'));

insert into public.colleges (name, country)
select 'Birla Institute of Technology and Science Goa', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Birla Institute of Technology and Science Goa'));

insert into public.colleges (name, country)
select 'Birla Institute of Technology and Science Hyderabad', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Birla Institute of Technology and Science Hyderabad'));

-- Delhi University Colleges
insert into public.colleges (name, country)
select 'Delhi Technological University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Delhi Technological University'));

insert into public.colleges (name, country)
select 'Netaji Subhas University of Technology', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Netaji Subhas University of Technology'));

insert into public.colleges (name, country)
select 'Indraprastha Institute of Information Technology Delhi', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Indraprastha Institute of Information Technology Delhi'));

-- Other Premier Institutions
insert into public.colleges (name, country)
select 'Vellore Institute of Technology', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Vellore Institute of Technology'));

insert into public.colleges (name, country)
select 'Manipal Institute of Technology', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Manipal Institute of Technology'));

insert into public.colleges (name, country)
select 'SRM Institute of Science and Technology', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('SRM Institute of Science and Technology'));

insert into public.colleges (name, country)
select 'Amity University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Amity University'));

insert into public.colleges (name, country)
select 'Jadavpur University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Jadavpur University'));

insert into public.colleges (name, country)
select 'Anna University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Anna University'));

insert into public.colleges (name, country)
select 'Pune Institute of Computer Technology', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Pune Institute of Computer Technology'));

insert into public.colleges (name, country)
select 'College of Engineering Pune', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('College of Engineering Pune'));

insert into public.colleges (name, country)
select 'PSG College of Technology', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('PSG College of Technology'));

insert into public.colleges (name, country)
select 'Thapar Institute of Engineering and Technology', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Thapar Institute of Engineering and Technology'));

insert into public.colleges (name, country)
select 'PES University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('PES University'));

insert into public.colleges (name, country)
select 'BMS College of Engineering', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('BMS College of Engineering'));

insert into public.colleges (name, country)
select 'RV College of Engineering', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('RV College of Engineering'));

insert into public.colleges (name, country)
select 'Ramaiah Institute of Technology', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Ramaiah Institute of Technology'));

insert into public.colleges (name, country)
select 'Dayananda Sagar College of Engineering', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Dayananda Sagar College of Engineering'));

insert into public.colleges (name, country)
select 'Netaji Subhas Institute of Technology', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Netaji Subhas Institute of Technology'));

insert into public.colleges (name, country)
select 'Jamia Millia Islamia', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Jamia Millia Islamia'));

insert into public.colleges (name, country)
select 'Aligarh Muslim University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Aligarh Muslim University'));

insert into public.colleges (name, country)
select 'Banaras Hindu University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Banaras Hindu University'));

insert into public.colleges (name, country)
select 'University of Hyderabad', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('University of Hyderabad'));

insert into public.colleges (name, country)
select 'Jawaharlal Nehru University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Jawaharlal Nehru University'));

-- State Universities
insert into public.colleges (name, country)
select 'Osmania University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Osmania University'));

insert into public.colleges (name, country)
select 'Andhra University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Andhra University'));

insert into public.colleges (name, country)
select 'Savitribai Phule Pune University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Savitribai Phule Pune University'));

insert into public.colleges (name, country)
select 'Mumbai University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Mumbai University'));

insert into public.colleges (name, country)
select 'Calcutta University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Calcutta University'));

insert into public.colleges (name, country)
select 'Madras University', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Madras University'));

-- Add "Other" option for custom entries
insert into public.colleges (name, country)
select 'Other (Please specify)', 'India'
where not exists (select 1 from public.colleges where lower(name) = lower('Other (Please specify)'));
