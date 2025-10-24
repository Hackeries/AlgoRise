# Code Battle Arena Documentation

## Overview

The Code Battle Arena is a real-time competitive coding feature that allows users to engage in 1v1 duels. This feature adds a gamified, interactive element to the platform, making practice more engaging and fun.

## Features Implemented

### Core Features
- **Real-time Matchmaking**: ELO-based opponent matching
- **Multiple Battle Formats**: Best of 1/3/5 rounds
- **Live Code Submission**: Real-time submission and evaluation
- **Rating System**: Separate ELO rating for battles

### Technical Implementation
- **Database**: PostgreSQL tables for battles, rounds, ratings
- **Real-time Updates**: Supabase real-time subscriptions
- **Matchmaking Algorithm**: Rating-based queue system
- **Code Execution**: Integration with existing judge system

## Database Schema

The feature uses the following tables:

### battles
Stores information about each battle:
- `id`: UUID (Primary Key)
- `name`: Text
- `format`: Text (best_of_1, best_of_3, best_of_5)
- `status`: Text (waiting, in_progress, completed, cancelled)
- `host_user_id`: UUID (Foreign Key to auth.users)
- `guest_user_id`: UUID (Foreign Key to auth.users, nullable)
- `winner_user_id`: UUID (Foreign Key to auth.users, nullable)
- `current_round`: Integer
- `max_rating_diff`: Integer
- `created_at`: Timestamp
- `started_at`: Timestamp
- `ended_at`: Timestamp

### battle_participants
Tracks participants in battles:
- `id`: UUID (Primary Key)
- `battle_id`: UUID (Foreign Key to battles)
- `user_id`: UUID (Foreign Key to auth.users)
- `handle_snapshot`: Text
- `rating_before`: Integer
- `rating_after`: Integer
- `rating_delta`: Integer
- `is_host`: Boolean
- `joined_at`: Timestamp
- `left_at`: Timestamp

### battle_rounds
Stores information about each round in a battle:
- `id`: UUID (Primary Key)
- `battle_id`: UUID (Foreign Key to battles)
- `round_number`: Integer
- `problem_id`: Text
- `title`: Text
- `contest_id_cf`: Integer
- `index_cf`: Text
- `rating`: Integer
- `winner_user_id`: UUID (Foreign Key to auth.users, nullable)
- `started_at`: Timestamp
- `ended_at`: Timestamp
- `duration_seconds`: Integer

### battle_submissions
Tracks code submissions for battle rounds:
- `id`: UUID (Primary Key)
- `battle_id`: UUID (Foreign Key to battles)
- `round_id`: UUID (Foreign Key to battle_rounds)
- `user_id`: UUID (Foreign Key to auth.users)
- `problem_id`: Text
- `status`: Text (pending, solved, failed, compiling, running)
- `language`: Text
- `code_text`: Text
- `submitted_at`: Timestamp
- `execution_time_ms`: Integer
- `memory_kb`: Integer

### battle_ratings
Stores ELO ratings for users in battles:
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `rating`: Integer (default 1200)
- `battles_count`: Integer
- `wins`: Integer
- `losses`: Integer
- `last_updated`: Timestamp

## API Endpoints

### Battles
- `GET /api/battles`: Get user's battles
- `POST /api/battles`: Create a new battle or join matchmaking queue
  - `action`: "join_queue" or "create_private"
  - `format`: "best_of_1", "best_of_3", or "best_of_5"
  - `guestUserId`: Required for private battles

### Battle Actions
- `POST /api/battles/[id]/join`: Join a battle
- `POST /api/battles/[id]/submit`: Submit solution for a round
- `GET /api/battles/[id]`: Get battle details
- `POST /api/battles/[id]`: Start a battle (host only)

## Services

### BattleMatchmakingService
Handles matchmaking logic:
- `joinQueue()`: Add user to matchmaking queue
- `leaveQueue()`: Remove user from queue
- `getUserRating()`: Get user's battle rating

### BattleService
Manages battle lifecycle:
- `startBattle()`: Start a battle
- `submitSolution()`: Handle solution submission
- `getBattle()`: Get battle details

## Real-time Features

The system uses Supabase real-time subscriptions for:
- Matchmaking notifications
- Battle start notifications
- Round start/end notifications
- Submission status updates
- Battle completion notifications

## ELO Rating System

The feature implements a standard ELO rating system:
- New users start with a rating of 1200
- K-factor of 32 for rating adjustments
- Rating changes based on battle outcomes
- Maximum rating difference for matchmaking (default 400)

## UI Components

### Battle Arena Page
Main page for accessing battle features:
- Queue joining interface
- Private battle creation
- Battle history

### Battle Room Page
Interface for active battles:
- Participant information
- Current round details
- Code editor
- Submission controls
- Timer display

## Future Enhancements

### Spectator Mode
- Allow users to watch ongoing battles
- Chat functionality for spectators

### Battle Chat
- In-game communication between players
- Emojis and quick messages

### Leaderboard
- Overall battle rankings
- Weekly/monthly leaderboards
- Achievement system

### Mobile Responsiveness
- Optimized mobile interface
- Touch-friendly controls

### Performance Optimization
- Caching strategies
- Database query optimization
- Code splitting

## Implementation Status

### Completed
- [x] Database schema design
- [x] API endpoints
- [x] Battle matchmaking service
- [x] Battle service
- [x] Main battle arena page
- [x] Battle room page

### In Progress
- [ ] Real-time notifications integration
- [ ] Code execution integration
- [ ] ELO rating calculations
- [ ] Testing

### Pending
- [ ] Spectator mode
- [ ] Battle chat
- [ ] Leaderboard
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] Documentation