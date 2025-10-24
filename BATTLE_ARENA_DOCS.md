# Code Battle Arena Documentation

## Overview

The Code Battle Arena is a real-time competitive programming platform that allows users to compete in coding duels against each other. It features a complete battle system with matchmaking, real-time notifications, code execution, ELO rating system, and spectator mode.

## Features

### 1. Battle Matchmaking
- **Queue System**: Users can join matchmaking queues for different battle formats
- **Rating-Based Matching**: Players are matched with opponents of similar skill levels
- **Multiple Formats**: Support for Best of 1, Best of 3, and Best of 5 battles

### 2. Real-Time Battles
- **Live Coding**: Compete in real-time coding challenges
- **Multiple Rounds**: Battles consist of multiple rounds until one player wins
- **Time Limits**: Each round has a time limit for submissions

### 3. Code Execution
- **Multi-Language Support**: Supports C++, C, Java, Python, and JavaScript
- **Execution Engine**: Integrated code execution with time and memory limits
- **Real-Time Judging**: Instant feedback on code submissions

### 4. ELO Rating System
- **K=32 Factor**: Standard ELO rating calculation with K=32 factor
- **Rating Updates**: Automatic rating updates after each battle
- **Leaderboard**: Global leaderboard showing top players

### 5. Spectator Mode
- **Public Battles**: Hosts can make battles public for spectators
- **Live Viewing**: Spectators can watch battles in real-time
- **Chat Integration**: Spectators can participate in battle chat

### 6. Battle Chat
- **Real-Time Messaging**: In-battle chat for participants and spectators
- **Message History**: Persistent chat history during battles
- **User Notifications**: Real-time message notifications

### 7. Mobile Optimization
- **Responsive Design**: Fully responsive UI for all device sizes
- **Touch-Friendly**: Optimized for touch interactions
- **Performance**: Optimized for mobile performance

## Technical Architecture

### Database Schema

The battle arena uses five main tables:

1. **battles**: Stores battle metadata and status
2. **battle_participants**: Tracks battle participants and ratings
3. **battle_rounds**: Manages individual battle rounds
4. **battle_submissions**: Stores code submissions and results
5. **battle_ratings**: Maintains player ELO ratings
6. **battle_spectators**: Tracks battle spectators
7. **battle_chat**: Stores battle chat messages

### Services

#### BattleMatchmakingService
Handles player matchmaking and queue management.

#### BattleService
Manages battle lifecycle, round creation, and submission processing.

#### CodeExecutionService
Interfaces with code execution engines for judging submissions.

#### BattleChatService
Manages battle chat functionality and message distribution.

#### RealTimeNotificationManager
Handles real-time notifications using Server-Sent Events (SSE).

### API Endpoints

#### Battle Management
- `GET /api/battles` - Get user's battles
- `POST /api/battles` - Create/join battles
- `GET /api/battles/[id]` - Get battle details
- `POST /api/battles/[id]` - Start a battle
- `POST /api/battles/[id]/submit` - Submit solution

#### Chat
- `GET /api/battles/[id]/chat` - Get chat messages
- `POST /api/battles/[id]/chat` - Send chat message

## Implementation Details

### ELO Rating System
The battle arena implements a standard ELO rating system with a K-factor of 32. Ratings are updated after each battle based on the outcome and the rating difference between players.

### Real-Time Features
Real-time updates are implemented using:
1. **Supabase Realtime**: Database changes are broadcast to connected clients
2. **Server-Sent Events (SSE)**: Persistent connections for notifications
3. **WebSocket-like functionality**: Custom implementation using ReadableStreams

### Code Execution
The code execution system is designed to be modular and can integrate with various judging engines. Currently, it includes a simulation layer for development and testing.

### Performance Optimizations
- **Asynchronous Processing**: Non-blocking operations for better responsiveness
- **Connection Management**: Efficient handling of real-time connections
- **Batch Notifications**: Grouped notifications to reduce overhead
- **Memory Management**: Regular cleanup of stale connections and data

## Mobile Responsiveness
The battle arena is fully responsive with:
- **Adaptive Layouts**: Grid and flexbox layouts that adapt to screen size
- **Touch Optimizations**: Larger touch targets and gesture support
- **Performance Considerations**: Optimized for mobile network conditions

## Testing
The battle arena includes comprehensive testing for:
- **Rating Calculations**: ELO rating system validation
- **Battle Logic**: Round management and battle completion
- **API Endpoints**: Request/response validation
- **UI Components**: Component rendering and interactions

## Future Enhancements
- **Advanced Matchmaking**: More sophisticated matching algorithms
- **Tournament Mode**: Bracket-style competitions
- **Replay System**: Battle replay functionality
- **Advanced Analytics**: Detailed battle statistics and insights
- **Custom Problems**: User-generated battle problems