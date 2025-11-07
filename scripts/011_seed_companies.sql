-- Seed popular tech companies for working professionals
-- Idempotent: avoids duplicates (case-insensitive) on re-runs without relying on constraints.

with seeds(name) as (
  values
    -- FAANG and Big Tech
    ('Google'),
    ('Meta'),
    ('Amazon'),
    ('Apple'),
    ('Microsoft'),
    ('Netflix'),

    -- Other Major Tech Companies
    ('Adobe'),
    ('Salesforce'),
    ('Oracle'),
    ('IBM'),
    ('Intel'),
    ('NVIDIA'),
    ('Qualcomm'),
    ('Cisco'),
    ('VMware'),

    -- Indian IT Services
    ('Tata Consultancy Services'),
    ('Infosys'),
    ('Wipro'),
    ('HCL Technologies'),
    ('Tech Mahindra'),
    ('Cognizant'),
    ('Capgemini'),
    ('Accenture'),

    -- Indian Product Companies
    ('Flipkart'),
    ('Paytm'),
    ('Zomato'),
    ('Swiggy'),
    ('Ola'),
    ('PhonePe'),
    ('CRED'),
    ('Razorpay'),
    ('Freshworks'),
    ('Zoho'),
    ('InMobi'),
    ('MakeMyTrip'),
    ('Nykaa'),
    ('Meesho'),
    ('ShareChat'),
    ('Dream11'),

    -- Fintech
    ('Goldman Sachs'),
    ('Morgan Stanley'),
    ('JP Morgan'),
    ('Visa'),
    ('Mastercard'),

    -- E-commerce
    ('Shopify'),
    ('eBay'),
    ('Walmart'),

    -- Social Media & Communication
    ('Twitter'),
    ('LinkedIn'),
    ('Snap'),
    ('Uber'),
    ('Airbnb'),
    ('Spotify'),

    -- Gaming
    ('Electronic Arts'),
    ('Activision Blizzard'),
    ('Unity Technologies'),

    -- Consulting
    ('Deloitte'),
    ('PwC'),
    ('EY'),
    ('KPMG'),
    ('McKinsey & Company'),
    ('Boston Consulting Group'),
    ('Bain & Company'),

    -- Other option
    ('Other (Please specify)')
)
insert into public.companies (name)
select s.name
from seeds s
left join public.companies c
  on lower(c.name) = lower(s.name)
where c.id is null;