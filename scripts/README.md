# AlgoRise Database Scripts

## 🚀 Quick Setup (Run in Order)

Run these scripts **in order** in your Supabase SQL Editor:

| Order | File | What it does |
|-------|------|--------------|
| **1** | `RUN_THIS_FIRST_reset_and_setup.sql` | Creates all tables with proper schema |
| **2** | `RUN_THIS_SECOND_rls_and_functions.sql` | Sets up RLS policies, functions & triggers |
| **3** | `RUN_THIS_THIRD_seed_and_indexes.sql` | Adds seed data & performance indexes |

⚠️ **WARNING**: The first script will DELETE ALL EXISTING DATA. Only run on fresh databases.

---

## 📁 Files

| File | Purpose |
|------|---------|
| `RUN_THIS_FIRST_reset_and_setup.sql` | Drops existing tables, creates all 32 tables |
| `RUN_THIS_SECOND_rls_and_functions.sql` | Row Level Security policies + helper functions + auth triggers |
| `RUN_THIS_THIRD_seed_and_indexes.sql` | Learning paths, sample problems, performance indexes |
| `005_sync_legacy_schema.sql` | **Optional**: Update existing tables without data loss |
| `FIX_contests_rls_recursion.sql` | **Optional**: Fix contest RLS recursion issues |

---

## 🔄 Updating Without Data Loss

If you already have data and just need to add missing columns:
```sql
-- Run only this file:
005_sync_legacy_schema.sql
```

---

## 📊 Tables Created

- **Core**: profiles, streaks, colleges, companies
- **Competitive**: cf_handles, cf_snapshots  
- **Problems**: problems, problem_hints, problem_history, user_problems
- **Learning**: learning_paths, problem_attempts, user_topic_mastery, etc.
- **Social**: groups, group_memberships, group_invitations, group_challenges
- **Contests**: contests, contest_participants, contest_problems, contest_submissions, contest_results
- **Commerce**: subscriptions, purchases, payment_events

---

## 🔐 Auth Triggers

The `RUN_THIS_SECOND_rls_and_functions.sql` includes:
- `handle_new_user()` function - Auto-creates profile when user signs up via OAuth
- `on_auth_user_created` trigger - Fires on new user creation

---

## ✅ Features Included

- CF verification via Compilation Error submission
- Auto profile creation on OAuth signup
- Contest RLS with proper access control
- Spaced repetition for problem reviews
- Adaptive learning system
