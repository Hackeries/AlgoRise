# AlgoRise Battle Arena - Complete Implementation Guide

## 🎯 Overview

The Battle Arena is a real-time competitive programming platform that supports:
- **Quick 1v1 Duels**: Fast matches without rating changes
- **Ranked 1v1**: ELO-based competitive matches
- **3v3 Team Battles**: Coordinated team competitions
- **Private Rooms & Tournaments**: Custom matches with spectator support

## 📋 Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [Backend Services](#backend-services)
4. [WebSocket Communication](#websocket-communication)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Deployment](#deployment)
8. [Security & Anti-Cheat](#security--anti-cheat)
9. [Monitoring & Observability](#monitoring--observability)
10. [Development Guide](#development-guide)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Web Servers (Stateless)               │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │  REST APIs    │  │  WebSocket     │  │  Static Assets   │   │
│  └───────────────┘  └────────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │                    │                      │
         ▼                    ▼                      ▼
┌──────────────┐    ┌──────────────┐      ┌──────────────┐
│   Redis      │    │  Game Server │      │  PostgreSQL  │
│  (Cache &    │◄──►│  (Match      │◄────►│  (Persistent │
│   Queue)     │    │   State)     │      │   Storage)   │
└──────────────┘    └──────────────┘      └──────────────┘
         │                    │
         ▼                    ▼
┌──────────────┐    ┌──────────────┐
│  Bull Queue  │    │  Matchmaking │
│  Workers     │    │  Service     │
└──────────────┘    └──────────────┘
         │
         ▼
┌──────────────┐
│  Judge0 /    │
│  Code Exec   │
└──────────────┘
```

### Tech Stack

**Frontend:**
- Next.js 15 (React 19)
- Tailwind CSS
- Monaco Editor
- WebSocket Client (Socket.IO or native)

**Backend:**
- Node.js (TypeScript)
- Next.js API Routes
- Bull (Redis-based job queue)
- WebSocket Server

**Data Layer:**
- PostgreSQL (Supabase)
- Redis (ioredis)

**Infrastructure:**
- Kubernetes
- Docker
- Nginx Ingress
- Let's Encrypt (cert-manager)

**Monitoring:**
- Prometheus
- Grafana
- ELK Stack / Cloud Logging

---

## Database Schema

### Core Tables

#### `matches`
Stores all match information.

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  mode VARCHAR(20) NOT NULL,  -- 'quick_1v1', 'ranked_1v1', '3v3_team', 'private_room', 'tournament'
  status VARCHAR(20) NOT NULL, -- 'waiting', 'countdown', 'in_progress', 'finished', 'cancelled'
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 1800,
  problem_ids JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `match_players`
Links players to matches with their scores and results.

```sql
CREATE TABLE match_players (
  id UUID PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES matches(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  team VARCHAR(10),  -- 'team_a' or 'team_b' for 3v3
  score INTEGER DEFAULT 0,
  full_solves INTEGER DEFAULT 0,
  partial_solves INTEGER DEFAULT 0,
  result VARCHAR(20),  -- 'win', 'loss', 'draw', 'abandoned'
  rating_before INTEGER,
  rating_after INTEGER,
  rating_change INTEGER,
  metadata JSONB DEFAULT '{}',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `battle_submissions`
Code submissions during matches.

```sql
CREATE TABLE battle_submissions (
  id UUID PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES matches(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  problem_id VARCHAR(50) NOT NULL,
  language VARCHAR(20) NOT NULL,
  code TEXT NOT NULL,
  status VARCHAR(30) NOT NULL,
  tests_passed INTEGER DEFAULT 0,
  tests_total INTEGER DEFAULT 0,
  runtime_ms INTEGER,
  memory_kb INTEGER,
  score INTEGER DEFAULT 0,
  code_fingerprint TEXT,
  ast_hash TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);
```

#### `player_ratings`
ELO rating system.

```sql
CREATE TABLE player_ratings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
  rating_1v1 INTEGER DEFAULT 1200,
  rating_3v3 INTEGER DEFAULT 1200,
  volatility DECIMAL(5,2) DEFAULT 32.0,
  matches_played_1v1 INTEGER DEFAULT 0,
  matches_played_3v3 INTEGER DEFAULT 0,
  wins_1v1 INTEGER DEFAULT 0,
  wins_3v3 INTEGER DEFAULT 0,
  losses_1v1 INTEGER DEFAULT 0,
  losses_3v3 INTEGER DEFAULT 0,
  peak_rating_1v1 INTEGER DEFAULT 1200,
  peak_rating_3v3 INTEGER DEFAULT 1200,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

See `scripts/040_create_battle_arena_schema.sql` for complete schema.

---

## Backend Services

### 1. Matchmaking Service
**File:** `lib/battle-arena/matchmaking-service.ts`

Responsible for:
- Adding/removing players from queue
- Finding suitable opponents based on rating
- Creating matches when pairs/teams are found
- Rating range expansion over time

**Key Methods:**
- `joinQueue(entry: QueueEntry)`
- `leaveQueue(userId: string, mode: string)`
- `findMatches(mode: string): Promise<MatchmakingResult[]>`

### 2. Game Server
**File:** `lib/battle-arena/game-server.ts`

Manages:
- Match lifecycle (countdown → start → end)
- Real-time score updates
- Player state synchronization
- Timer management

**Key Methods:**
- `initializeRoom(matchId: string)`
- `startCountdown(matchId: string, broadcastFn)`
- `startMatch(matchId: string, broadcastFn)`
- `handleSubmission(...)`
- `endMatch(matchId: string, broadcastFn)`

### 3. ELO Rating System
**File:** `lib/battle-arena/elo-rating.ts`

Implements:
- ELO calculation for 1v1 and 3v3
- Dynamic K-factor based on volatility
- Rating history tracking
- Tier classification

**Key Methods:**
- `calculate1v1Rating(player1Id, player2Id, winner)`
- `calculate3v3Rating(teamAIds, teamBIds, winningTeam)`
- `saveRatingUpdates(updates, mode, matchId)`

### 4. Submission Queue
**File:** `lib/battle-arena/submission-queue.ts`

Handles:
- Async code execution via Bull queue
- Job prioritization
- Retry logic for failed executions
- Queue statistics

**Key Methods:**
- `addSubmission(job: SubmissionJob)`
- `processSubmission(data: SubmissionJob)`

### 5. Anti-Cheat System
**File:** `lib/battle-arena/anti-cheat.ts`

Detects:
- Code plagiarism via AST comparison
- Unrealistic solve speeds
- Rating-performance mismatches
- Behavioral anomalies

**Key Methods:**
- `checkPlagiarism(submissionId, code, language, matchId, problemId)`
- `checkBehavioralAnomalies(userId, matchId, ...)`
- `generateCodeFingerprint(code)`

---

## WebSocket Communication

### Event Specifications
**File:** `lib/battle-arena/websocket-events.ts`

All events follow this structure:
```typescript
interface BaseEvent {
  eventId: string;      // For idempotence
  timestamp: number;    // Unix timestamp
  roomId: string;       // Match ID
}
```

### Event Types

**Connection Events:**
- `JOIN_ROOM`: Player joins match room
- `LEAVE_ROOM`: Player leaves match room
- `ROOM_STATE`: Full state broadcast

**Match Lifecycle:**
- `MATCH_STARTING`: Match found, players assigned
- `MATCH_COUNTDOWN`: Countdown timer
- `MATCH_START`: Match begins
- `MATCH_END`: Match finishes with final scores

**Submissions:**
- `SUBMIT_CODE`: Player submits code
- `SUBMISSION_QUEUED`: Submission in queue
- `SUBMISSION_EXECUTING`: Execution started
- `SUBMISSION_RESULT`: Execution complete

**Scoring:**
- `SCORE_UPDATE`: Individual score change
- `PLAYER_UPDATE`: Player state change
- `TEAM_SCORE_UPDATE`: Team score change (3v3)

### WebSocket Namespace
Each match has its own namespace: `/match/:roomId`

---

## API Endpoints

### Matchmaking

**POST** `/api/battle-arena/matchmaking/join`
```json
{
  "mode": "quick_1v1" | "ranked_1v1" | "3v3_team",
  "metadata": { /* optional */ }
}
```

**POST** `/api/battle-arena/matchmaking/leave`
```json
{
  "mode": "quick_1v1" | "ranked_1v1" | "3v3_team"
}
```

**GET** `/api/battle-arena/matchmaking/status?mode=quick_1v1`
Returns queue status and average wait time.

### Match Management

**GET** `/api/battle-arena/match?matchId=xxx`
Returns current match state.

### Submissions

**POST** `/api/battle-arena/submit`
```json
{
  "matchId": "uuid",
  "problemId": "CF_1234A",
  "code": "...",
  "language": "cpp"
}
```

### Leaderboards

**GET** `/api/battle-arena/leaderboard?mode=1v1&timeframe=all_time&limit=100`
Returns ranked leaderboard.

---

## Frontend Components

### Battle Arena Lobby
**File:** `components/battle-arena/lobby.tsx`

Features:
- Mode selection (Quick 1v1, Ranked 1v1, 3v3)
- Queue status display
- Join/leave matchmaking
- Real-time queue updates

### Live Match Interface
(To be implemented)

Features:
- Split-pane layout (problem | editor | console)
- Monaco code editor
- Real-time scoreboard
- Countdown timer
- Submission history

### Post-Match Analytics
(To be implemented)

Features:
- Final scores and rankings
- ELO changes
- Submission comparison
- Performance metrics
- Replay viewer

---

## Deployment

### Kubernetes

1. **Apply configuration:**
```bash
cd k8s
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml  # Configure secrets first
kubectl apply -f redis.yaml
kubectl apply -f web-deployment.yaml
kubectl apply -f submission-worker.yaml
kubectl apply -f matchmaking-worker.yaml
kubectl apply -f ingress.yaml
```

2. **Verify deployment:**
```bash
kubectl get pods -n algorise-battle-arena
kubectl get services -n algorise-battle-arena
kubectl get ingress -n algorise-battle-arena
```

3. **Scale as needed:**
```bash
kubectl scale deployment algorise-web --replicas=5 -n algorise-battle-arena
kubectl scale deployment submission-worker --replicas=10 -n algorise-battle-arena
```

### Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `JUDGE0_API_KEY`
- `JUDGE0_URL`

---

## Security & Anti-Cheat

### Code Execution Sandboxing
- No network access
- Limited file I/O
- CPU/memory quotas
- Time limits enforced

### Plagiarism Detection
1. **AST-based comparison**: Structural code analysis
2. **Token similarity**: Lexical matching
3. **Fingerprinting**: Normalized code hashing
4. **Cross-match checking**: Compare with all submissions

### Behavioral Analysis
- Solve speed vs rating correlation
- Performance consistency checks
- Language switching detection
- Copy-paste pattern recognition

### Flagged Cases
- Stored in `plagiarism_logs` table
- Manual review interface
- Moderator actions logged
- Automated alerts for critical severity

---

## Monitoring & Observability

### Metrics to Track

**Queue Metrics:**
- Average wait time
- Queue depth
- Match success rate

**Execution Metrics:**
- Job processing time
- Failure rate
- Judge0 response time

**Match Metrics:**
- Active matches
- Average match duration
- Submission rate

**User Metrics:**
- Concurrent users
- Rating distribution
- Win/loss ratios

### Prometheus Endpoints
Add metrics export at `/api/metrics`:
```typescript
// Example metrics
- battle_arena_active_matches
- battle_arena_queue_depth{mode="1v1"}
- battle_arena_submission_duration_seconds
- battle_arena_match_duration_seconds
```

### Alerts
- Queue depth > 50 for > 5 minutes
- Judge execution lag > 10 seconds
- High error rate (>5%)
- Suspicious activity spikes

---

## Development Guide

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

3. **Run database migrations:**
```bash
# Run in Supabase SQL Editor
psql -f scripts/040_create_battle_arena_schema.sql
```

4. **Start development server:**
```bash
npm run dev
```

### Testing Locally

1. **Start Redis:**
```bash
docker run -d -p 6379:6379 redis:7-alpine
```

2. **Access Battle Arena:**
Navigate to `http://localhost:3000/battle-arena/lobby`

### Adding New Features

1. Update database schema in `scripts/`
2. Add TypeScript types in `lib/battle-arena/`
3. Implement backend service logic
4. Create API route in `app/api/battle-arena/`
5. Build frontend component in `components/battle-arena/`
6. Add tests
7. Update documentation

---

## Future Enhancements

- [ ] WebSocket server implementation (Socket.IO)
- [ ] Live match interface with Monaco editor
- [ ] Spectator mode
- [ ] Replay viewer
- [ ] Tournament bracket system
- [ ] Team management UI
- [ ] Advanced analytics dashboard
- [ ] Proctoring for high-stakes tournaments
- [ ] Mobile app support
- [ ] Integration with external platforms (Codeforces, LeetCode)

---

## License

MIT License - See LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: https://github.com/Hackeries/AlgoRise/issues
- Documentation: This file

---

**Built with ❤️ for the competitive programming community**
