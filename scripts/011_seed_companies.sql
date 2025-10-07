-- Seed popular tech companies for working professionals
-- Uses WHERE NOT EXISTS to avoid duplicates on re-runs

-- FAANG and Big Tech
insert into public.companies (name)
select 'Google' where not exists (select 1 from public.companies where lower(name) = lower('Google'));

insert into public.companies (name)
select 'Meta' where not exists (select 1 from public.companies where lower(name) = lower('Meta'));

insert into public.companies (name)
select 'Amazon' where not exists (select 1 from public.companies where lower(name) = lower('Amazon'));

insert into public.companies (name)
select 'Apple' where not exists (select 1 from public.companies where lower(name) = lower('Apple'));

insert into public.companies (name)
select 'Microsoft' where not exists (select 1 from public.companies where lower(name) = lower('Microsoft'));

insert into public.companies (name)
select 'Netflix' where not exists (select 1 from public.companies where lower(name) = lower('Netflix'));

-- Other Major Tech Companies
insert into public.companies (name)
select 'Adobe' where not exists (select 1 from public.companies where lower(name) = lower('Adobe'));

insert into public.companies (name)
select 'Salesforce' where not exists (select 1 from public.companies where lower(name) = lower('Salesforce'));

insert into public.companies (name)
select 'Oracle' where not exists (select 1 from public.companies where lower(name) = lower('Oracle'));

insert into public.companies (name)
select 'IBM' where not exists (select 1 from public.companies where lower(name) = lower('IBM'));

insert into public.companies (name)
select 'Intel' where not exists (select 1 from public.companies where lower(name) = lower('Intel'));

insert into public.companies (name)
select 'NVIDIA' where not exists (select 1 from public.companies where lower(name) = lower('NVIDIA'));

insert into public.companies (name)
select 'Qualcomm' where not exists (select 1 from public.companies where lower(name) = lower('Qualcomm'));

insert into public.companies (name)
select 'Cisco' where not exists (select 1 from public.companies where lower(name) = lower('Cisco'));

insert into public.companies (name)
select 'VMware' where not exists (select 1 from public.companies where lower(name) = lower('VMware'));

-- Indian IT Services
insert into public.companies (name)
select 'Tata Consultancy Services' where not exists (select 1 from public.companies where lower(name) = lower('Tata Consultancy Services'));

insert into public.companies (name)
select 'Infosys' where not exists (select 1 from public.companies where lower(name) = lower('Infosys'));

insert into public.companies (name)
select 'Wipro' where not exists (select 1 from public.companies where lower(name) = lower('Wipro'));

insert into public.companies (name)
select 'HCL Technologies' where not exists (select 1 from public.companies where lower(name) = lower('HCL Technologies'));

insert into public.companies (name)
select 'Tech Mahindra' where not exists (select 1 from public.companies where lower(name) = lower('Tech Mahindra'));

insert into public.companies (name)
select 'Cognizant' where not exists (select 1 from public.companies where lower(name) = lower('Cognizant'));

insert into public.companies (name)
select 'Capgemini' where not exists (select 1 from public.companies where lower(name) = lower('Capgemini'));

insert into public.companies (name)
select 'Accenture' where not exists (select 1 from public.companies where lower(name) = lower('Accenture'));

-- Indian Product Companies
insert into public.companies (name)
select 'Flipkart' where not exists (select 1 from public.companies where lower(name) = lower('Flipkart'));

insert into public.companies (name)
select 'Paytm' where not exists (select 1 from public.companies where lower(name) = lower('Paytm'));

insert into public.companies (name)
select 'Zomato' where not exists (select 1 from public.companies where lower(name) = lower('Zomato'));

insert into public.companies (name)
select 'Swiggy' where not exists (select 1 from public.companies where lower(name) = lower('Swiggy'));

insert into public.companies (name)
select 'Ola' where not exists (select 1 from public.companies where lower(name) = lower('Ola'));

insert into public.companies (name)
select 'PhonePe' where not exists (select 1 from public.companies where lower(name) = lower('PhonePe'));

insert into public.companies (name)
select 'CRED' where not exists (select 1 from public.companies where lower(name) = lower('CRED'));

insert into public.companies (name)
select 'Razorpay' where not exists (select 1 from public.companies where lower(name) = lower('Razorpay'));

insert into public.companies (name)
select 'Freshworks' where not exists (select 1 from public.companies where lower(name) = lower('Freshworks'));

insert into public.companies (name)
select 'Zoho' where not exists (select 1 from public.companies where lower(name) = lower('Zoho'));

insert into public.companies (name)
select 'InMobi' where not exists (select 1 from public.companies where lower(name) = lower('InMobi'));

insert into public.companies (name)
select 'MakeMyTrip' where not exists (select 1 from public.companies where lower(name) = lower('MakeMyTrip'));

insert into public.companies (name)
select 'Nykaa' where not exists (select 1 from public.companies where lower(name) = lower('Nykaa'));

insert into public.companies (name)
select 'Meesho' where not exists (select 1 from public.companies where lower(name) = lower('Meesho'));

insert into public.companies (name)
select 'ShareChat' where not exists (select 1 from public.companies where lower(name) = lower('ShareChat'));

insert into public.companies (name)
select 'Dream11' where not exists (select 1 from public.companies where lower(name) = lower('Dream11'));

-- Fintech
insert into public.companies (name)
select 'Goldman Sachs' where not exists (select 1 from public.companies where lower(name) = lower('Goldman Sachs'));

insert into public.companies (name)
select 'Morgan Stanley' where not exists (select 1 from public.companies where lower(name) = lower('Morgan Stanley'));

insert into public.companies (name)
select 'JP Morgan' where not exists (select 1 from public.companies where lower(name) = lower('JP Morgan'));

insert into public.companies (name)
select 'Visa' where not exists (select 1 from public.companies where lower(name) = lower('Visa'));

insert into public.companies (name)
select 'Mastercard' where not exists (select 1 from public.companies where lower(name) = lower('Mastercard'));

-- E-commerce
insert into public.companies (name)
select 'Shopify' where not exists (select 1 from public.companies where lower(name) = lower('Shopify'));

insert into public.companies (name)
select 'eBay' where not exists (select 1 from public.companies where lower(name) = lower('eBay'));

insert into public.companies (name)
select 'Walmart' where not exists (select 1 from public.companies where lower(name) = lower('Walmart'));

-- Social Media & Communication
insert into public.companies (name)
select 'Twitter' where not exists (select 1 from public.companies where lower(name) = lower('Twitter'));

insert into public.companies (name)
select 'LinkedIn' where not exists (select 1 from public.companies where lower(name) = lower('LinkedIn'));

insert into public.companies (name)
select 'Snap' where not exists (select 1 from public.companies where lower(name) = lower('Snap'));

insert into public.companies (name)
select 'Uber' where not exists (select 1 from public.companies where lower(name) = lower('Uber'));

insert into public.companies (name)
select 'Airbnb' where not exists (select 1 from public.companies where lower(name) = lower('Airbnb'));

insert into public.companies (name)
select 'Spotify' where not exists (select 1 from public.companies where lower(name) = lower('Spotify'));

-- Gaming
insert into public.companies (name)
select 'Electronic Arts' where not exists (select 1 from public.companies where lower(name) = lower('Electronic Arts'));

insert into public.companies (name)
select 'Activision Blizzard' where not exists (select 1 from public.companies where lower(name) = lower('Activision Blizzard'));

insert into public.companies (name)
select 'Unity Technologies' where not exists (select 1 from public.companies where lower(name) = lower('Unity Technologies'));

-- Consulting
insert into public.companies (name)
select 'Deloitte' where not exists (select 1 from public.companies where lower(name) = lower('Deloitte'));

insert into public.companies (name)
select 'PwC' where not exists (select 1 from public.companies where lower(name) = lower('PwC'));

insert into public.companies (name)
select 'EY' where not exists (select 1 from public.companies where lower(name) = lower('EY'));

insert into public.companies (name)
select 'KPMG' where not exists (select 1 from public.companies where lower(name) = lower('KPMG'));

insert into public.companies (name)
select 'McKinsey & Company' where not exists (select 1 from public.companies where lower(name) = lower('McKinsey & Company'));

insert into public.companies (name)
select 'Boston Consulting Group' where not exists (select 1 from public.companies where lower(name) = lower('Boston Consulting Group'));

insert into public.companies (name)
select 'Bain & Company' where not exists (select 1 from public.companies where lower(name) = lower('Bain & Company'));

-- Add "Other" option for custom entries
insert into public.companies (name)
select 'Other (Please specify)' where not exists (select 1 from public.companies where lower(name) = lower('Other (Please specify)'));
