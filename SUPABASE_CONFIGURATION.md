# Supabase Configuration Guide

## Your Supabase Project Details
- **Project Reference**: `onyxqbacbtztcmruoquo`
- **Project URL**: `https://onyxqbacbtztcmruoquo.supabase.co`
- **Region**: `ap-southeast-1` (Asia Pacific - Singapore)

## Required API Keys

To complete your Supabase setup, you need to get these values from your Supabase dashboard:

### 1. Get Your API Keys
1. Go to: https://supabase.com/dashboard/project/onyxqbacbtztcmruoquo/settings/api
2. Copy the following values:
   - **anon/public key** → Replace `[YOUR-ANON-KEY-HERE]` in `.env.local`
   - **service_role key** (if needed for admin operations)

### 2. Get Your Database Password
1. Go to: https://supabase.com/dashboard/project/onyxqbacbtztcmruoquo/settings/database
2. Copy your database password → Replace `[YOUR-PASSWORD]` in connection strings

## Connection Information

### For Next.js Client (Browser)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://onyxqbacbtztcmruoquo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY-HERE]
```

### For Server-Side/API Routes (if needed)
```bash
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```

### For Direct Database Access (if needed)
```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.onyxqbacbtztcmruoquo.supabase.co:5432/postgres
```

## Quick Setup Steps

1. **Update .env.local**: Replace the placeholder values with your actual keys
2. **Restart your development server**: `npm run dev`
3. **Test authentication**: Try signing up/logging in
4. **Run database migrations**: If you have SQL scripts in the `scripts/` folder

## Database Setup

Your project includes several SQL scripts:
- `scripts/001_create_streaks.sql`
- `scripts/002_create_cf_snapshots.sql`
- `scripts/003_create_adaptive_items.sql`
- `scripts/004_create_cf_handles.sql`
- `scripts/005_create_colleges.sql`
- `scripts/006_create_groups_and_memberships.sql`
- `scripts/007_seed_colleges.sql`
- `scripts/008_create_contests.sql`

Run these in order in your Supabase SQL editor.

## Testing

After configuration:
1. Visit http://localhost:3000/auth/sign-up
2. Try creating an account
3. Check if data appears in your Supabase database tables

## Troubleshooting

- If you get "Invalid API key" → Check your anon key
- If you get "Database connection failed" → Check your password
- If tables don't exist → Run the SQL scripts in order