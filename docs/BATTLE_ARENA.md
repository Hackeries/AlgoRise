# Battle Arena - Technical Documentation

## Overview

Battle Arena is a competitive programming feature for AlgoRise that enables real-time 1v1 and 3v3 problem-solving battles with ELO ratings, tiers, and progression tracking.

## Architecture

### Database Schema

The Battle Arena system uses the following PostgreSQL tables in Supabase:

#### `arena_ratings`
Tracks player ELO ratings and statistics.
- **Primary Key**: `user_id`
- **Key Fields**:
  - `elo_1v1`, `elo_3v3`: ELO ratings (default: 1200)
  - `tier_1v1`, `tier_3v3`: Current tier (bronze, silver, gold, platinum, diamond, master)
  - `matches_played_*`, `matches_won_*`: Match statistics
  - `current_win_streak`, `best_win_streak`: Streak tracking
  - `titles`: Array of earned titles (JSONB)

#### `arena_matches`
Stores match information.
- **Key Fields**:
  - `match_type`: '1v1' or '3v3'
  - `mode`: 'ranked' or 'unranked'
  - `state`: 'waiting', 'live', 'finished', 'cancelled'
  - `player1_id`, `player2_id`: For 1v1 matches
  - `team1_id`, `team2_id`: For 3v3 matches
  - `problem_ids`: Array of problem IDs (JSONB)
  - `fog_of_progress`: Boolean flag
  - `final_scores`, `elo_changes`: Results (JSONB)

#### `arena_players`
Tracks player state within matches.
- **Key Fields**:
  - `match_id`, `user_id`: Composite key
  - `current_problem_id`: Currently working problem
  - `problems_solved`, `problems_attempted`: Arrays (JSONB)
  - `activity_status`: 'idle', 'attempting', 'close', 'solved'
  - `locked_problem_id`: For 3v3 team lock system
  - `score`, `penalties`, `solve_times`: Performance metrics
  - `suspicious_events`: Anti-cheat tracking (JSONB)

#### `arena_events`
Event log for real-time updates and replay.
- **Key Fields**:
  - `match_id`, `user_id`: References
  - `event_type`: 'lock', 'solve', 'attempt', 'streak', 'momentum', 'state_change', 'suspicious'
  - `event_data`: Event payload (JSONB)

#### `arena_teams`
Team composition for 3v3 battles.
- **Key Fields**:
  - `player1_id`, `player2_id`, `player3_id`: Team members
  - `average_elo`: Team rating

#### `arena_match_history`
Archived match results.
- **Key Fields**:
  - `user_id`, `match_id`: References
  - `placement`: Final rank (1st, 2nd)
  - `elo_before`, `elo_after`, `elo_change`: Rating changes
  - Performance metrics

#### `arena_daily_limits`
Track free user match limits.
- **Key Fields**:
  - `user_id`, `match_date`: Composite unique
  - `matches_played`, `matches_limit`: Daily tracking

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- **Public Read**: Ratings, matches, teams (for leaderboard and match discovery)
- **User Read**: Own match history, events, player data
- **System Write**: Matchmaking and game systems update tables via Edge Functions
- **User Write**: Limited to own player updates

### Helper Functions

#### `get_tier_from_elo(elo INTEGER) → VARCHAR(20)`
Maps ELO rating to tier name.

#### `can_play_ranked_match(p_user_id UUID) → BOOLEAN`
Checks if user has Pro subscription for ranked play.

#### `check_daily_match_limit(p_user_id UUID) → BOOLEAN`
Validates if user can play another match (free users: 3/day).

## ELO System

### Rating Calculation

Uses standard ELO formula with K-factor adjustment:

```typescript
// Expected win probability
E = 1 / (1 + 10^((opponent_elo - player_elo) / 400))

// Rating change
ΔR = K × (S - E)
// Where S = 1 (win), 0 (loss), 0.5 (draw)
```

### K-Factor

Dynamic based on experience:
- **New players** (< 10 matches): K = 32 (rapid adjustment)
- **Intermediate** (10-30 matches): K = 24
- **Experienced** (30+ matches): K = 16 (stable)

### Tier Thresholds

| Tier | ELO Range |
|------|-----------|
| Bronze | 0 - 999 |
| Silver | 1000 - 1199 |
| Gold | 1200 - 1399 |
| Platinum | 1400 - 1599 |
| Diamond | 1600 - 1799 |
| Master | 1800+ |

### Matchmaking Range

ELO range widens based on tier and experience:
- **Bronze-Gold**: ±200 ELO
- **Platinum**: ±250 ELO
- **Diamond**: ±300 ELO
- **Master**: ±400 ELO
- **New players** (< 5 matches): 1.5× range

## API Endpoints

### POST `/api/arena/matchmaking`

Start matchmaking for a match.

**Request Body:**
```json
{
  "matchType": "1v1" | "3v3",
  "mode": "ranked" | "unranked"
}
```

**Response:**
```json
{
  "success": true,
  "matchId": "uuid",
  "message": "Match found!" | "Waiting for opponent...",
  "estimatedWaitTime": 30
}
```

**Error Responses:**
- `401`: Unauthorized
- `403`: Requires Pro subscription or daily limit reached
- `500`: Server error

### GET `/api/arena/leaderboard`

Fetch arena leaderboard.

**Query Parameters:**
- `matchType`: "1v1" | "3v3" (default: "1v1")
- `limit`: number (default: 100)
- `offset`: number (default: 0)

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "uuid",
      "username": "string",
      "avatar": "url",
      "elo": 1500,
      "tier": "gold",
      "matchesPlayed": 50,
      "winRate": "62.0",
      "currentStreak": 3,
      "titles": ["Speed Demon"]
    }
  ],
  "matchType": "1v1",
  "total": 100
}
```

### GET `/api/arena/history`

Get user's match history.

**Query Parameters:**
- `limit`: number (default: 10)
- `offset`: number (default: 0)

**Response:**
```json
{
  "history": [
    {
      "match_id": "uuid",
      "match_type": "1v1",
      "mode": "ranked",
      "placement": 1,
      "score": 300,
      "problems_solved": 3,
      "elo_change": 24,
      "match_finished_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10
}
```

## Components

### `<ArenaLobby />`

Main entry point for Battle Arena.

**Props:**
- `userId`: string
- `userRating`: ArenaRating | null
- `dailyLimit`: ArenaDailyLimit | null
- `isPro`: boolean

**Features:**
- Match type selection (1v1, 3v3)
- Mode selection (ranked, unranked)
- Player stats display
- Pro/Free tier messaging
- Daily limit tracking

### `<ArenaLeaderboard />`

Displays top players.

**Features:**
- Match type tabs
- Top 50 players by default
- Rank, ELO, tier, win rate display
- Title badges
- Top 3 highlighting

### `<ResultScreen />`

Post-match results and breakdown.

**Props:**
- `result`: MatchResult
- `onContinue`: () => void

**Features:**
- Victory/defeat display
- ELO change visualization
- New tier promotion
- Title earned notification
- Problem-by-problem breakdown
- Performance stats

## Game Modes

### 1v1 Mind Clash

**Ranked Mode** (Pro Only):
- Affects ELO rating
- Tier progression
- Strict matchmaking by ELO
- Title earning

**Unranked Mode** (Free + Pro):
- Practice mode
- No ELO changes
- Free users: 3 matches/day
- Looser matchmaking

### 3v3 War Room (Coming Soon)

Team-based competitive mode with:
- Problem locking system
- Team average ELO
- Collaborative scoring
- Real-time coordination

## Titles

Players can earn titles through achievements:
- **First Blood**: First solve in match
- **Speed Demon**: Very fast average solve time
- **Comeback King**: Win after being behind
- **Perfect Game**: Solve all problems
- **Streak Master**: Long win streak
- **Giant Slayer**: Beat much higher-rated opponent (300+ ELO)
- **Undefeated**: Win streak milestone
- **Consistent Champion**: High win rate over many matches

## Monetization

### Free Tier
- 3 unranked matches per day
- View leaderboard
- Basic stats

### Pro Tier
- Unlimited ranked matches
- Advanced analytics
- Priority matchmaking
- Exclusive titles
- Match history export

## Usage

1. Navigate to `/arena`
2. View your stats and select match type
3. Choose ranked (Pro) or unranked mode
4. Click "Start Match" to begin matchmaking
5. Wait for opponent or join existing match
6. Complete problems and view results
7. Check leaderboard at `/arena/leaderboard`

## Development Notes

- **Database Migration**: Run `003_battle_arena.sql` before deploying
- **Environment**: Requires Supabase setup with proper RLS
- **Dependencies**: Uses existing auth and subscription systems
- **Testing**: Test with multiple users to verify matchmaking
- **Performance**: Indexes optimized for common queries

