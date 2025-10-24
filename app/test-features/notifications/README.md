# Test Smart Notifications

This directory contains test pages for the Smart Notifications feature.

## Available Tests

1. **Daily Problem Reminders** - Test the daily problem reminder notifications
2. **Upcoming Contests** - Test notifications for upcoming contests
3. **Rating Changes** - Test Codeforces rating change notifications
4. **Friend Activity** - Test notifications when friends join contests

## API Endpoints for Testing

- POST `/api/notifications/trigger` with body `{ "type": "daily_problem_reminder" }`
- POST `/api/notifications/trigger` with body `{ "type": "upcoming_contest" }`
- POST `/api/notifications/trigger` with body `{ "type": "rating_change" }`
- POST `/api/notifications/trigger` with body `{ "type": "friend_joined" }`
- POST `/api/notifications/trigger` with body `{ "type": "all" }`

## Implementation Files

- `lib/cron/notification-cron.ts` - Contains the notification logic
- `lib/cron/scheduler.ts` - Contains the scheduling logic
- `app/api/notifications/trigger/route.ts` - API endpoint for manual triggering