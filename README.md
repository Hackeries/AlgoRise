# AlgoRise - Competitive Programming Platform

AlgoRise is a modern competitive programming platform built with Next.js 15, TypeScript, and Supabase. It provides a comprehensive environment for practicing, competing, and improving algorithmic problem-solving skills.

## Features

### 🏟️ Battle Arena (1v1 & 3v3)
Our flagship feature has been completely upgraded with:
- **Redis-based matchmaking** for instant and fair matching
- **AI-powered opponent selection** based on player preferences and performance
- **ICPC-style interface** with real-time scoreboard and split-view battle room
- **15s accept/decline system** to prevent stuck matches
- **Spectator mode** to watch live battles
- **Replay system** to review past battles
- **Tournament brackets** for organized competitions
- **Responsive design** that works on all devices

### 📚 Practice Problems
- Thousands of problems from Codeforces and other sources
- Adaptive difficulty system that adjusts to your skill level
- Detailed editorials and solution explanations
- Code execution and testing environment

### 🏆 Contests & Leaderboards
- Weekly and monthly contests
- Global and friend-based leaderboards
- Performance analytics and insights
- Rating system based on ELO algorithm

### 👥 Community Features
- Friend system and messaging
- Discussion forums for problems
- Code sharing and collaboration
- Achievement system and badges

### 🎯 Personalized Learning
- Custom practice sheets based on your weak areas
- Progress tracking and goal setting
- Performance analytics and insights
- Recommended problems based on your history

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Database, Auth, Real-time, Storage)
- **Infrastructure**: Redis for matchmaking, Vercel for deployment
- **Code Execution**: Judge0 API for code compilation and execution

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- Redis instance

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/AlgoRise.git
cd AlgoRise
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update the `.env.local` file with your configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
REDIS_URL=your_redis_url
JUDGE0_API_KEY=your_judge0_api_key
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
app/                    # Next.js 15 app directory
├── api/               # API routes
├── battle-arena/      # Battle Arena feature
│   ├── room/          # Battle room pages
│   ├── tournaments/   # Tournament pages
│   ├── replays/       # Replay system
│   └── page.tsx       # Battle Arena lobby
├── contests/          # Contest pages
├── problems/          # Problem pages
├── profile/           # User profile pages
└── ...
components/            # React components
├── battle-arena/      # Battle Arena components
├── ui/                # Reusable UI components
└── ...
lib/                   # Business logic and utilities
├── battle-matchmaking.ts  # Redis-based matchmaking
├── battle-service.ts      # Battle management
├── battle-arena/          # Battle Arena utilities
└── ...
```

## Battle Arena Upgrade

The Battle Arena has been completely rebuilt as part of our "Full Upgrade & Fix" initiative. Key improvements include:

1. **Backend Enhancements**:
   - Redis-based matchmaking for better performance
   - Proper +200/-100 rating range matching
   - 15s accept/decline system before match starts
   - Fixed problemset logic and ELO updates (ignore bot matches)
   - Async Bot AI for fallback practice battles
   - AI-based matchmaking using player preferences and performance history

2. **Frontend Improvements**:
   - Fresh UI for lobby, queue, and results screens with ICPC styling
   - Better animations and ICPC-style scoreboard
   - Split-view battle room (problems + editor + verdicts)
   - Clean, responsive design with mobile support

3. **Additional Features**:
   - Tournament brackets with elimination formats
   - Spectator mode for live battle viewing
   - Replay system for reviewing past battles
   - Enhanced mobile responsiveness

For detailed information about the upgrade, see [BATTLE_ARENA_UPGRADE_SUMMARY.md](BATTLE_ARENA_UPGRADE_SUMMARY.md)

## API Documentation

For information about the Battle Arena API endpoints, see [BATTLE_ARENA_API_DOCS.md](BATTLE_ARENA_API_DOCS.md)

## Contributing

We welcome contributions to AlgoRise! Please see our [contributing guidelines](contributing.md) for more information.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For support or inquiries, please open an issue on GitHub or contact the development team.

## Acknowledgments

- Thanks to Codeforces for problem sources
- Thanks to Judge0 for code execution API
- Thanks to all contributors who have helped build this platform