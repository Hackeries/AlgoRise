-- Comprehensive seed data for Indian colleges and universities
-- Idempotent: uses ON CONFLICT on (lower(name), lower(country)) to avoid duplicates across re-runs.

with seeds(name, country) as (
  values
    -- IITs
    ('Indian Institute of Technology Bombay', 'India'),
    ('Indian Institute of Technology Delhi', 'India'),
    ('Indian Institute of Technology Madras', 'India'),
    ('Indian Institute of Technology Kanpur', 'India'),
    ('Indian Institute of Technology Kharagpur', 'India'),
    ('Indian Institute of Technology Roorkee', 'India'),
    ('Indian Institute of Technology Guwahati', 'India'),
    ('Indian Institute of Technology Hyderabad', 'India'),
    ('Indian Institute of Technology Indore', 'India'),
    ('Indian Institute of Technology Bhubaneswar', 'India'),
    ('Indian Institute of Technology Gandhinagar', 'India'),
    ('Indian Institute of Technology Patna', 'India'),
    ('Indian Institute of Technology Ropar', 'India'),
    ('Indian Institute of Technology Mandi', 'India'),
    ('Indian Institute of Technology Jodhpur', 'India'),
    ('Indian Institute of Technology (BHU) Varanasi', 'India'),
    ('Indian Institute of Technology Palakkad', 'India'),
    ('Indian Institute of Technology Tirupati', 'India'),
    ('Indian Institute of Technology Dhanbad', 'India'),
    ('Indian Institute of Technology Bhilai', 'India'),
    ('Indian Institute of Technology Goa', 'India'),
    ('Indian Institute of Technology Jammu', 'India'),
    ('Indian Institute of Technology Dharwad', 'India'),

    -- NITs
    ('National Institute of Technology Tiruchirappalli', 'India'),
    ('National Institute of Technology Karnataka Surathkal', 'India'),
    ('National Institute of Technology Rourkela', 'India'),
    ('National Institute of Technology Warangal', 'India'),
    ('National Institute of Technology Calicut', 'India'),
    ('National Institute of Technology Durgapur', 'India'),
    ('National Institute of Technology Jamshedpur', 'India'),
    ('National Institute of Technology Kurukshetra', 'India'),
    ('National Institute of Technology Silchar', 'India'),
    ('National Institute of Technology Hamirpur', 'India'),
    ('National Institute of Technology Jalandhar', 'India'),
    ('National Institute of Technology Raipur', 'India'),
    ('National Institute of Technology Agartala', 'India'),
    ('National Institute of Technology Patna', 'India'),
    ('National Institute of Technology Srinagar', 'India'),

    -- IIITs
    ('International Institute of Information Technology Hyderabad', 'India'),
    ('International Institute of Information Technology Bangalore', 'India'),
    ('Indian Institute of Information Technology Allahabad', 'India'),
    ('Indian Institute of Information Technology Gwalior', 'India'),
    ('Indian Institute of Information Technology Jabalpur', 'India'),
    ('Indian Institute of Information Technology Kota', 'India'),
    ('Indian Institute of Information Technology Vadodara', 'India'),

    -- IIMs
    ('Indian Institute of Management Ahmedabad', 'India'),
    ('Indian Institute of Management Bangalore', 'India'),
    ('Indian Institute of Management Calcutta', 'India'),
    ('Indian Institute of Management Lucknow', 'India'),
    ('Indian Institute of Management Indore', 'India'),
    ('Indian Institute of Management Kozhikode', 'India'),

    -- BITS
    ('Birla Institute of Technology and Science Pilani', 'India'),
    ('Birla Institute of Technology and Science Goa', 'India'),
    ('Birla Institute of Technology and Science Hyderabad', 'India'),

    -- Delhi (and nearby) institutions
    ('Delhi Technological University', 'India'),
    ('Netaji Subhas University of Technology', 'India'),
    ('Indraprastha Institute of Information Technology Delhi', 'India'),

    -- Other premier institutions
    ('Vellore Institute of Technology', 'India'),
    ('Manipal Institute of Technology', 'India'),
    ('SRM Institute of Science and Technology', 'India'),
    ('Amity University', 'India'),
    ('Jadavpur University', 'India'),
    ('Anna University', 'India'),
    ('Pune Institute of Computer Technology', 'India'),
    ('College of Engineering Pune', 'India'),
    ('PSG College of Technology', 'India'),
    ('Thapar Institute of Engineering and Technology', 'India'),
    ('PES University', 'India'),
    ('BMS College of Engineering', 'India'),
    ('RV College of Engineering', 'India'),
    ('Ramaiah Institute of Technology', 'India'),
    ('Dayananda Sagar College of Engineering', 'India'),
    ('Netaji Subhas Institute of Technology', 'India'),
    ('Jamia Millia Islamia', 'India'),
    ('Aligarh Muslim University', 'India'),
    ('Banaras Hindu University', 'India'),
    ('University of Hyderabad', 'India'),
    ('Jawaharlal Nehru University', 'India'),

    -- State universities
    ('Osmania University', 'India'),
    ('Andhra University', 'India'),
    ('Savitribai Phule Pune University', 'India'),
    ('Mumbai University', 'India'),
    ('Calcutta University', 'India'),
    ('Madras University', 'India'),

    -- Other option
    ('Other (Please specify)', 'India')
)
insert into public.colleges (name, country)
select trim(name), trim(country)
from seeds
on conflict (lower(name), lower(country)) do nothing;