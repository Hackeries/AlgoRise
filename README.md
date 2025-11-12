# AlgoRise

AlgoRise is a competitive programming platform designed to help students and working professionals enhance their algorithmic problem-solving skills.

## Features

- **Authentication & Profile Management**
  - Email signup with verification
  - OAuth login (GitHub and Google)
  - Codeforces handle verification
  - Comprehensive profile management
  
- **Problem Practice**
  - Curated problem sets
  - Adaptive learning paths
  - Progress tracking
  
- **Contests**
  - Create and participate in contests
  - ICPC and practice modes
  - Real-time leaderboards

- **Battle Arena** ⚔️ **NEW**
  - Real-time 1v1 and 3v3 competitive coding matches
  - ELO-based ranking system
  - Quick matches and ranked modes
  - Anti-cheat and plagiarism detection
  - Live scoreboards and match analytics
  - See [BATTLE_ARENA_DOCS.md](BATTLE_ARENA_DOCS.md) for details

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Redis (for rate limiting and caching)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Hackeries/AlgoRise.git
cd AlgoRise
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- Supabase URL and keys
- OAuth client IDs and secrets (configure in Supabase Dashboard)
- Redis URL
- Other configuration

4. Set up the database:
   - Run `SUPABASE_SETUP.sql` in your Supabase SQL Editor
   - Run migration scripts from `scripts/` directory in numerical order

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see your application.

## Authentication Setup

### OAuth Providers (GitHub and Google)

1. **GitHub OAuth**:
   - Go to GitHub Settings > Developer Settings > OAuth Apps
   - Create a new OAuth App
   - Set callback URL to `<YOUR_SUPABASE_URL>/auth/v1/callback`
   - Copy Client ID and Secret to Supabase Dashboard > Authentication > Providers

2. **Google OAuth**:
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Set authorized redirect URI to `<YOUR_SUPABASE_URL>/auth/v1/callback`
   - Copy Client ID and Secret to Supabase Dashboard > Authentication > Providers

3. **Email Verification**:
   - Configure email templates in Supabase Dashboard > Authentication > Email Templates
   - Customize the "Confirm signup" template as needed

## Database Schema

The database schema is defined in:
- `SUPABASE_SETUP.sql` - Main schema setup
- `scripts/` - Migration scripts for schema updates (run in numerical order)

Key tables:
- `profiles` - User profile information
- `cf_handles` - Codeforces handle verification
- `contests` - Contest data
- `groups` - Study groups
- And more...

## Development

### Project Structure

```
├── app/                    # Next.js app directory (routes and pages)
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── profile/           # Profile pages
│   └── ...
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   ├── auth/             # Authentication components
│   ├── profile/          # Profile components
│   └── ...
├── lib/                   # Utility libraries
│   ├── supabase/         # Supabase clients
│   ├── security/         # Security utilities (validation, rate limiting)
│   ├── error/            # Error handling and logging
│   ├── profile/          # Profile utilities
│   └── ...
├── scripts/               # Database migration scripts
└── public/               # Static assets
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

## Security Features

- **Rate Limiting**: API endpoints are protected with rate limiting to prevent abuse
- **Input Validation**: All API inputs are validated using Zod schemas
- **Structured Logging**: Authentication and profile events are logged for security monitoring
- **CSRF Protection**: Built-in with Next.js
- **Secure Sessions**: JWT-based sessions via Supabase Auth

## Feature Flags

Some features can be toggled using environment variables:

```bash
# Enable/disable Codeforces verification UI
NEXT_PUBLIC_CF_VERIFICATION_ENABLED=true
```

## Contributing

We welcome contributions! Please see [contributing.md](contributing.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Create an issue on [GitHub Issues](https://github.com/Hackeries/AlgoRise/issues)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication via [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
