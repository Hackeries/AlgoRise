# AlgoRise - Competitive Programming Platform

A comprehensive platform for competitive programming practice, analytics, and community features.

## 🚨 IMPORTANT: Database Setup Required

**Before running the application**, you must set up the database:

1. **Open Supabase Dashboard** → SQL Editor
2. **Execute** the contents of `SUPABASE_SETUP.sql`
3. **Verify** tables are created successfully

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## 📋 Key Features

- **Codeforces Integration** - OAuth verification and API sync
- **Adaptive Learning** - Personalized problem recommendations
- **Progress Analytics** - Detailed performance tracking
- **Group Competitions** - Team contests and leaderboards
- **Streak Tracking** - Daily practice motivation
- **Smart Notifications** - Timely alerts for daily problems, contests, rating changes, and friend activity
- **Code Battle Arena** - Real-time 1v1 competitive coding duels
- **Problem Generator** - Unlimited practice problems with custom test cases

## 🔧 Tech Stack

- **Framework**: Next.js 15.5.2
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 📚 Documentation

- **`CLIENT_HANDOVER.md`** - Complete handover documentation
- **`DEPLOYMENT_CHECKLIST.md`** - Pre-launch checklist
- **`DATABASE_SETUP_GUIDE.md`** - Database configuration guide
- **`SMART_NOTIFICATIONS.md`** - Smart notifications implementation guide
- **`CODE_BATTLE_ARENA.md`** - Code Battle Arena implementation guide
- **`PROBLEM_GENERATOR.md`** - Problem Generator & Custom Test Cases implementation guide

## 🐛 Issues Fixed

- ✅ "Failed to store verification" error resolved
- ✅ Database schema properly configured
- ✅ CF OAuth endpoints working correctly
- ✅ Authentication flows secured