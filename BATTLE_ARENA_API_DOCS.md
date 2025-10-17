# Code Battle Arena API Documentation

## Overview

This document provides detailed information about the Code Battle Arena API endpoints, request/response formats, and authentication requirements.

## Authentication

All API endpoints require authentication through Supabase Auth. Requests must include a valid session token.

## Base URL

```
/api/battles
```

## Battle Management Endpoints

### Get User's Battles

**GET** `/api/battles`

Retrieve a list of battles for the authenticated user.

**Response:**
```json
{
  "battles": [
    {
      "id": "uuid",
      "name": "string",
      "format": "best_of_1|best_of_3|best_of_5",
      "status": "waiting|in_progress|completed|cancelled",
      "host_user_id": "uuid",
      "guest_user_id": "uuid",
      "winner_user_id": "uuid",
      "is_public": "boolean",
      "created_at": "timestamp",
      "started_at": "timestamp",
      "ended_at": "timestamp",
      "battle_participants": [...],
      "battle_rounds": [...]
    }
  ]
}
```

### Create/Join Battles

**POST** `/api/battles`

Create a new battle or join the matchmaking queue.

**Request Body:**
```json
{
  "action": "join_queue|create_private|spectate|set_visibility",
  "format": "best_of_1|best_of_3|best_of_5", // for join_queue and create_private
  "guestUserId": "uuid", // for create_private
  "battleId": "uuid", // for spectate and set_visibility
  "isPublic": "boolean" // for create_private and set_visibility
}
```

**Response:**
```json
{
  "success": "boolean",
  "message": "string",
  "battleId": "uuid" // when applicable
}
```

### Get Battle Details

**GET** `/api/battles/[id]`

Retrieve detailed information about a specific battle.

**Response:**
```json
{
  "battle": {
    "id": "uuid",
    "name": "string",
    "format": "best_of_1|best_of_3|best_of_5",
    "status": "waiting|in_progress|completed|cancelled",
    "host_user_id": "uuid",
    "guest_user_id": "uuid",
    "winner_user_id": "uuid",
    "is_public": "boolean",
    "created_at": "timestamp",
    "started_at": "timestamp",
    "ended_at": "timestamp",
    "battle_participants": [
      {
        "id": "uuid",
        "battle_id": "uuid",
        "user_id": "uuid",
        "rating_before": "integer",
        "rating_after": "integer",
        "rating_delta": "integer",
        "is_host": "boolean",
        "joined_at": "timestamp"
      }
    ],
    "battle_rounds": [
      {
        "id": "uuid",
        "battle_id": "uuid",
        "round_number": "integer",
        "problem_id": "string",
        "title": "string",
        "rating": "integer",
        "winner_user_id": "uuid",
        "started_at": "timestamp",
        "ended_at": "timestamp"
      }
    ],
    "battle_submissions": [
      {
        "id": "uuid",
        "battle_id": "uuid",
        "round_id": "uuid",
        "user_id": "uuid",
        "problem_id": "string",
        "status": "pending|solved|failed|compiling|running|internal_error",
        "language": "string",
        "code_text": "string",
        "submitted_at": "timestamp",
        "execution_time_ms": "integer",
        "memory_kb": "integer",
        "stdout": "string",
        "stderr": "string",
        "compile_output": "string"
      }
    ]
  }
}
```

### Start Battle

**POST** `/api/battles/[id]`

Start a battle (host only).

**Response:**
```json
{
  "success": "boolean",
  "message": "string"
}
```

### Submit Solution

**POST** `/api/battles/[id]/submit`

Submit a solution for a battle round.

**Request Body:**
```json
{
  "roundId": "uuid",
  "codeText": "string",
  "language": "cpp|c|java|python|javascript"
}
```

**Response:**
```json
{
  "success": "boolean",
  "message": "string",
  "submissionId": "uuid"
}
```

## Chat Endpoints

### Get Chat Messages

**GET** `/api/battles/[id]/chat`

Retrieve chat messages for a battle.

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "battle_id": "uuid",
      "user_id": "uuid",
      "message": "string",
      "created_at": "timestamp",
      "users": {
        "email": "string"
      }
    }
  ]
}
```

### Send Chat Message

**POST** `/api/battles/[id]/chat`

Send a chat message to a battle.

**Request Body:**
```json
{
  "message": "string",
  "action": "send|delete",
  "messageId": "uuid" // for delete action
}
```

**Response:**
```json
{
  "success": "boolean",
  "message": "string"
}
```

## Error Responses

All endpoints may return the following error responses:

**401 Unauthorized**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden**
```json
{
  "error": "Access denied"
}
```

**404 Not Found**
```json
{
  "error": "Battle not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per minute per user
- 10 requests per second per user

Exceeding these limits will result in a 429 Too Many Requests response.

## WebSockets/Real-time Updates

The battle arena uses Server-Sent Events (SSE) for real-time updates:

**Endpoint:** `/api/notifications/sse`

**Events:**
- `battle_started`: Battle has started
- `battle_round_started`: New round has started
- `battle_submission_received`: Solution submitted
- `battle_submission_judged`: Submission judged
- `battle_round_ended`: Round completed
- `battle_ended`: Battle completed
- `battle_spectator_joined`: New spectator joined
- `battle_chat_message`: New chat message
- `battle_updated`: Battle status updated

**Example Event:**
```json
{
  "type": "battle_started",
  "battleId": "uuid",
  "message": "Battle started! First round beginning now."
}
```