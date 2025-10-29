# Battle Arena API Documentation

This document provides documentation for the Battle Arena API endpoints that were created or enhanced as part of the upgrade.

## Base URL

All endpoints are relative to: `/api/battles`

## Authentication

All endpoints require authentication via Supabase session. Users must be logged in to access these endpoints.

## Battle Management

### Get User's Battles

**GET** `/api/battles`

Retrieve a list of battles for the authenticated user.

**Response:**
```json
{
  "battles": [
    {
      "id": "battle_123",
      "host_user_id": "user_1",
      "guest_user_id": "user_2",
      "status": "completed",
      "format": "best_of_3",
      "created_at": "2023-05-15T10:30:00Z",
      "started_at": "2023-05-15T10:31:00Z",
      "ended_at": "2023-05-15T10:45:00Z",
      "winner_user_id": "user_1",
      "battle_participants": [...],
      "battle_rounds": [...]
    }
  ]
}
```

### Join Matchmaking Queue

**POST** `/api/battles`

Join the matchmaking queue for a new battle.

**Request Body:**
```json
{
  "action": "join_queue",
  "format": "best_of_3" // Optional, defaults to "best_of_3"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Joined queue successfully",
  "battleId": "battle_123" // If matched immediately
}
```

### Create Private Battle

**POST** `/api/battles`

Create a private battle with a specific opponent.

**Request Body:**
```json
{
  "action": "create_private",
  "guestUserId": "user_2",
  "format": "best_of_3", // Optional
  "isPublic": false // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Private battle created",
  "battleId": "battle_123"
}
```

### Spectator Management

**POST** `/api/battles`

Join or leave spectator mode for a battle.

**Request Body (Join):**
```json
{
  "action": "spectate",
  "battleId": "battle_123"
}
```

**Request Body (Leave):**
```json
{
  "action": "unspectate",
  "battleId": "battle_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined as spectator" // or "Successfully left spectator mode"
}
```

### Set Battle Visibility

**POST** `/api/battles`

Set whether a battle is public or private.

**Request Body:**
```json
{
  "action": "set_visibility",
  "battleId": "battle_123",
  "isPublic": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Battle is now public"
}
```

## Battle Details

### Get Battle Details

**GET** `/api/battles/[id]`

Retrieve detailed information about a specific battle.

**Response:**
```json
{
  "battle": {
    "id": "battle_123",
    "host_user_id": "user_1",
    "guest_user_id": "user_2",
    "status": "in_progress",
    "format": "best_of_3",
    "created_at": "2023-05-15T10:30:00Z",
    "started_at": "2023-05-15T10:31:00Z",
    "battle_participants": [...],
    "battle_rounds": [...],
    "battle_submissions": [...]
  }
}
```

### Start Battle

**POST** `/api/battles/[id]`

Start a battle (host only).

**Request Body:**
```json
{
  "action": "start"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Battle started successfully"
}
```

### Spectator Actions

**POST** `/api/battles/[id]`

Join or leave spectator mode for a specific battle.

**Request Body (Join):**
```json
{
  "action": "spectate"
}
```

**Request Body (Leave):**
```json
{
  "action": "unspectate"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined as spectator" // or "Successfully left spectator mode"
}
```

## Battle Submission

### Submit Solution

**POST** `/api/battles/[id]/submit`

Submit a solution for a battle round.

**Request Body:**
```json
{
  "roundId": "round_123",
  "codeText": "// Solution code here",
  "language": "cpp" // Optional, defaults to "cpp"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Solution submitted successfully",
  "submissionId": "submission_123"
}
```

## Tournament Management

### Get Tournaments

**GET** `/api/tournaments`

Retrieve a list of available tournaments.

**Response:**
```json
{
  "tournaments": [
    {
      "id": "tournament_123",
      "name": "Weekly ICPC Challenge",
      "description": "Weekly competitive programming tournament",
      "status": "registration",
      "start_date": "2023-05-20T10:00:00Z",
      "end_date": "2023-05-27T10:00:00Z",
      "max_participants": 64,
      "current_participants": 42,
      "entry_fee": 0,
      "prize_pool": 1000,
      "format": "single_elimination"
    }
  ]
}
```

### Join Tournament

**POST** `/api/tournaments/[id]/join`

Join a tournament.

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered for tournament"
}
```

### Get Tournament Details

**GET** `/api/tournaments/[id]`

Retrieve detailed information about a specific tournament.

**Response:**
```json
{
  "tournament": {
    "id": "tournament_123",
    "name": "Weekly ICPC Challenge",
    "description": "Weekly competitive programming tournament",
    "status": "in_progress",
    "start_date": "2023-05-20T10:00:00Z",
    "end_date": "2023-05-27T10:00:00Z",
    "max_participants": 64,
    "current_participants": 64,
    "entry_fee": 0,
    "prize_pool": 1000,
    "format": "single_elimination",
    "participants": [...],
    "matches": [...]
  }
}
```

## Replay System

### Get Replays

**GET** `/api/replays`

Retrieve a list of available battle replays.

**Response:**
```json
{
  "replays": [
    {
      "id": "replay_123",
      "battle_id": "battle_123",
      "title": "Alice Johnson vs Bob Smith",
      "date": "2023-05-15T10:30:00Z",
      "duration": 900,
      "players": ["Alice Johnson", "Bob Smith"],
      "winner": "Alice Johnson",
      "is_public": true
    }
  ]
}
```

### Get Replay Details

**GET** `/api/replays/[id]`

Retrieve detailed information about a specific replay.

**Response:**
```json
{
  "replay": {
    "id": "replay_123",
    "battle_id": "battle_123",
    "title": "Alice Johnson vs Bob Smith",
    "date": "2023-05-15T10:30:00Z",
    "duration": 900,
    "players": [
      {
        "id": "user_1",
        "name": "Alice Johnson",
        "rating": 1850
      },
      {
        "id": "user_2",
        "name": "Bob Smith",
        "rating": 1780
      }
    ],
    "problems": [...],
    "events": [...]
  }
}
```

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied"
}
```

**404 Not Found:**
```json
{
  "error": "Battle not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

All endpoints are subject to rate limiting to prevent abuse:
- 100 requests per minute per user
- 1000 requests per hour per user

Exceeding these limits will result in a 429 Too Many Requests response.

## WebSockets

Real-time updates are provided via WebSockets through the Supabase real-time service. Clients should subscribe to relevant channels to receive live updates about battles, tournaments, and other events.

## Version History

- v1.0.0 (2023-05-15): Initial release with core battle functionality
- v1.1.0 (2023-05-20): Added tournament and replay system
- v1.2.0 (2023-05-25): Added AI-based matchmaking and spectator mode

## Support

For API support, please contact the development team or refer to the main documentation.