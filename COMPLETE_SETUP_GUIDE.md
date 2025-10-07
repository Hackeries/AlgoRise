# Complete Setup Guide for AlgoRise

## 1. SQL Scripts Execution Sequence

Run these scripts in **Supabase SQL Editor** in this exact order:

### Step 1: Core Tables
\`\`\`sql
-- Run these first (they have no dependencies)
1. scripts/001_create_streaks.sql
2. scripts/002_create_cf_snapshots.sql
3. scripts/003_create_adaptive_items.sql
4. scripts/004_create_cf_handles.sql
\`\`\`

### Step 2: Reference Data Tables
\`\`\`sql
-- These create lookup tables for colleges and companies
5. scripts/005_create_colleges.sql
6. scripts/010_create_companies_table.sql
\`\`\`

### Step 3: Seed Reference Data
\`\`\`sql
-- These populate the lookup tables with data
7. scripts/007_seed_colleges.sql
8. scripts/011_seed_companies.sql
\`\`\`

### Step 4: User Profile Tables
\`\`\`sql
-- This depends on colleges and companies tables
9. scripts/001_create_profiles_table.sql
\`\`\`

### Step 5: Group and Contest Tables
\`\`\`sql
-- These can be run after profiles
10. scripts/006_create_groups_and_memberships.sql
11. scripts/008_create_contests.sql
12. scripts/012_update_contests_schema.sql
\`\`\`

### Step 6: Additional Features
\`\`\`sql
-- Run these last
13. scripts/009_add_college_to_profiles.sql (if not already in profiles table)
\`\`\`

**Important Notes:**
- Run each script one at a time
- Wait for each script to complete successfully before running the next
- If you get an error about a table already existing, skip that script
- Check the Supabase logs for any errors

---

## 2. Login Redirect Issue

**Current Problem:** Manual login redirects to `/train` instead of checking CF verification first.

**Solution:** The middleware already checks CF verification, but we need to ensure it runs for all authenticated routes.

---

## 3. Train Page Improvements

**Current Issues:**
- Uses mock/hardcoded data
- Not engaging enough
- Needs real-time data integration

**Planned Improvements:**
- Real-time CF data fetching
- Personalized problem recommendations
- Interactive progress tracking
- Live streak counter
- Recent submissions feed
- Performance analytics

---

## 4. Dashboard Page Improvements

**Current Issues:**
- Landing page is static
- No real user data integration

**Planned Improvements:**
- Real-time user statistics
- Interactive charts and graphs
- Recent activity feed
- Upcoming contests
- Friend leaderboards

---

## 5. Sidebar and Header Improvements

**Current State:**
- Sidebar: Fixed left sidebar with collapsible functionality
- Header: Search bar, notifications, user menu

**Planned Improvements:**
- Better visual hierarchy
- Real-time notification badges
- Improved search with better results
- User profile quick stats in sidebar
- Better mobile responsiveness

---

## Current Architecture

### Navigation Components:
1. **`components/sidebar-layout.tsx`** - Main sidebar with menu items
2. **`components/header.tsx`** - Top header with search and user menu
3. **`components/site-nav.tsx`** - Alternative navigation (not currently used)

### Data Flow:
- Auth: `lib/auth/context.tsx` → `useAuth()` hook
- CF Verification: `lib/context/cf-verification.tsx` → `useCFVerification()` hook
- Middleware: `lib/supabase/middleware.ts` → Checks auth and CF verification

---

## Next Steps

1. ✅ Run all SQL scripts in order
2. ⏳ Fix login redirect to check CF verification
3. ⏳ Redesign train page with real data
4. ⏳ Improve dashboard page
5. ⏳ Enhance sidebar and header
