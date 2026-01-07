# AlgoRise

**The thinking trainer for competitive programmers**

Most CP platforms give you problems. AlgoRise teaches you how to think.

---

## Why AlgoRise Exists

Every competitive programmer faces the same wall. You solve 500 problems but your rating stays stuck. You read editorials but forget the patterns next week. You practice randomly hoping something clicks.

AlgoRise exists because we faced this wall ourselves. We built what we wished existed when we were grinding from Newbie to Candidate Master.

This is not another problem sheet. This is not another analytics dashboard. This is a system that understands how competitive programmers actually improve.

---

## The Core Problem We Solve

**Rating plateaus happen because practice is random and feedback is delayed.**

You solve problems without knowing if they are actually helping you grow. You repeat patterns you already know. You avoid patterns that scare you. You forget solutions you worked hard to understand.

AlgoRise fixes this with three principles:

1. **Adaptive difficulty** that keeps you in the learning zone not the comfort zone
2. **Spaced repetition** that makes patterns stick permanently
3. **Weakness targeting** that forces growth in areas you naturally avoid

---

## How It Works

### For Complete Beginners
Start with structured C++ fundamentals. No assumptions about prior knowledge. Progress through basics before touching competitive problems. Build confidence before facing Codeforces.

### For Intermediate Coders (800-1400)
Stop solving random problems. Get problems matched to your exact skill level. Track which topics cause you to fail. Attack weaknesses systematically instead of grinding strengths.

### For Advanced Coders (1400-1900)
Focus on pattern recognition speed. Practice contest simulation. Train decision making under time pressure. Build the mental stamina needed for Candidate Master.

---

## Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | Next.js 15 + React 19 | App router with server components for performance |
| Styling | Tailwind CSS 4 | Utility first with custom design tokens |
| UI Components | shadcn/ui + Radix | Accessible composable components |
| State | React Context + SWR | Simple patterns for simple state needs |
| Backend | Next.js API Routes | Serverless functions that scale automatically |
| Database | Supabase (PostgreSQL) | Managed Postgres with RLS for security |
| Cache | Redis (ioredis) | Rate limiting and session caching |
| Auth | Supabase Auth | OAuth and email with JWT sessions |
| Payments | Razorpay | Indian market payment processing |
| Deployment | Vercel / Docker | Edge network or self hosted options |
| Analytics | Vercel Analytics | Privacy respecting usage metrics |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Landing    │  │   Practice   │  │   Analytics  │           │
│  │   Pages      │  │   Sessions   │  │   Dashboard  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Auth API   │  │  Adaptive    │  │  Codeforces  │           │
│  │   Routes     │  │  Sheet API   │  │  Integration │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Service Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Spaced     │  │   Problem    │  │   User       │           │
│  │   Repetition │  │   Sourcing   │  │   Profiles   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Supabase   │  │    Redis     │  │  Codeforces  │           │
│  │   Postgres   │  │    Cache     │  │  Public API  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
AlgoRise/
├── app/                    # Next.js app router pages
│   ├── api/               # API route handlers
│   │   ├── adaptive-sheet/   # Spaced repetition endpoints
│   │   ├── cf/               # Codeforces integration
│   │   ├── profile/          # User profile management
│   │   └── ...
│   ├── auth/              # Authentication pages
│   ├── adaptive-sheet/    # Practice session UI
│   ├── analytics/         # Progress tracking UI
│   ├── contests/          # Contest information
│   ├── paths/             # Learning path UI
│   └── ...
├── components/            # React components
│   ├── ui/               # Base UI primitives (shadcn)
│   ├── practice/         # Practice session components
│   ├── analytics/        # Charts and metrics
│   ├── auth/             # Auth forms and flows
│   └── ...
├── lib/                   # Shared utilities
│   ├── supabase/         # Database clients
│   ├── security/         # Rate limiting and validation
│   ├── sr.ts             # Spaced repetition algorithm
│   ├── codeforces-api.ts # CF API integration
│   └── ...
├── hooks/                 # Custom React hooks
├── scripts/               # Database migration SQL
├── types/                 # TypeScript definitions
└── supabase/             # Supabase configuration
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm or npm
- Supabase account (free tier works)
- Redis instance (optional for local development)

### Installation

```bash
# clone the repository
git clone https://github.com/Hackeries/AlgoRise.git
cd AlgoRise

# install dependencies
pnpm install

# copy environment file
cp .env.example .env.local

# configure your environment variables in .env.local
```

### Environment Configuration

Edit `.env.local` with your credentials:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional for full functionality
REDIS_URL=redis://localhost:6379
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

### Database Setup

Run the SQL migration scripts in order:

```bash
# in your Supabase SQL editor run scripts from scripts/ folder
# start with 001_create_profiles_table.sql
# continue through all numbered scripts
```

### Development

```bash
# start development server
pnpm dev

# open http://localhost:3000
```

### Production Build

```bash
# build for production
pnpm build

# start production server
pnpm start
```

### Docker Deployment

```bash
# build docker image
docker build -t algorise .

# run container
docker run -p 3000:3000 --env-file .env.local algorise
```

---

## Core Features

### Adaptive Practice Engine
Problems selected based on your current skill level. Difficulty adjusts as you improve. Uses SM-2 spaced repetition algorithm to schedule reviews.

### Codeforces Integration
Verify your CF handle. Sync your submission history. Get personalized recommendations based on your actual performance.

### Learning Paths
Structured progression from basics to advanced topics. Track completion across multiple paths. Resume where you left off.

### Group Competitions
Form study groups with friends. Challenge each other on problem sets. Climb group leaderboards together.

### Progress Analytics
Visualize improvement over time. Identify weak topics automatically. Track streaks and consistency.

---

## Roadmap

### Phase 1 (Current)
- [x] Adaptive practice with spaced repetition
- [x] Codeforces handle verification
- [x] Learning paths with progress tracking
- [x] Basic analytics dashboard
- [x] Group creation and management

### Phase 2 (Next)
- [ ] Contest simulation mode
- [ ] AI powered hint system
- [ ] Problem difficulty prediction
- [ ] Mobile responsive improvements
- [ ] AtCoder integration

### Phase 3 (Future)
- [ ] Virtual contests with rankings
- [ ] Collaborative problem solving
- [ ] Custom problem set creation
- [ ] API for third party integrations
- [ ] Multi language support

---

## Contributing

We welcome contributions. See [contributing.md](contributing.md) for guidelines.

Key areas where we need help:
- Frontend accessibility improvements
- Test coverage expansion
- Documentation improvements
- Performance optimizations
- Bug fixes and issue resolution

---

## Security

- All API endpoints use rate limiting
- Input validation via Zod schemas
- Row Level Security on all database tables
- JWT based authentication via Supabase
- No secrets stored in client code

Report security issues to algo.rise2025@gmail.com

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Team

Built by competitive programmers for competitive programmers.

- [Aviral Joshi](https://www.linkedin.com/in/aviral-joshi15/) - Creator

---

## Links

- **Website**: https://www.myalgorise.in
- **GitHub**: https://github.com/Hackeries/AlgoRise
- **Email**: algo.rise2025@gmail.com
