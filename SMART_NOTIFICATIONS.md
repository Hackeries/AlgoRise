# Smart Notifications & Alerts Implementation

## Overview

This document describes the implementation of the Smart Notifications & Alerts feature for AlgoRise. The feature provides timely alerts to users for:

1. Daily problem reminders
2. Upcoming contests
3. Codeforces rating changes
4. Friends joining contests

## Architecture

### Components

1. **Notification Service** - Core service for creating and managing notifications
2. **Cron Jobs** - Scheduled tasks that trigger notifications at specific intervals
3. **Real-time Manager** - Handles real-time notification delivery using Server-Sent Events
4. **Settings UI** - Allows users to configure notification preferences
5. **API Endpoints** - Provides interfaces for managing notifications and settings

### Notification Types

The system supports the following notification types:

- `daily_problem_reminder` - Reminds users to solve their daily problem
- `contest_starting` - Notifies users of upcoming contests
- `rating_change` - Alerts users of Codeforces rating changes
- `friend_joined_contest` - Informs users when friends join contests
- `group_invite` - Group invitations
- `achievement` - Achievement unlocks
- `system_announcement` - Platform announcements

## Implementation Details

### 1. Cron Job System

Located in `lib/cron/`, the system includes:

- `notification-cron.ts` - Functions for sending different types of notifications
- `scheduler.ts` - Runs notification checks at specified intervals:
  - Daily problem reminders: Every 15 minutes
  - Upcoming contests: Every 30 minutes
  - Rating changes: Every 60 minutes
  - Friend joins: Every 10 minutes

### 2. Notification Service Extensions

The notification service in `lib/notification-service.ts` has been extended to support new notification types:

- Added new notification types to the `NotificationData` interface
- Extended the service with functions for each notification type

### 3. API Endpoints

#### Trigger Endpoint
- **POST** `/api/notifications/trigger` - Manually trigger smart notifications for testing
- Supports types: `daily_problem_reminder`, `upcoming_contest`, `rating_change`, `friend_joined`, `all`

#### Settings Endpoint
- **GET** `/api/notifications/settings` - Retrieve user notification preferences
- **PUT** `/api/notifications/settings` - Update user notification preferences

### 4. Notification Preferences

Users can configure their notification preferences through the settings UI:

- Email notifications for each notification type
- Push notifications for each notification type
- Notification digest frequency (none, daily, weekly)
- Quiet hours (start and end times)
- Timezone settings

## Database Schema

The system uses the existing `notifications` table with the following relevant columns:

- `user_id` - The recipient user
- `type` - The notification type
- `title` - Notification title
- `message` - Notification message
- `data` - Additional JSON data
- `priority` - Notification priority (1-5)
- `read_at` - When the notification was read
- `created_at` - When the notification was created

A `notification_settings` table stores user preferences:

- `user_id` - The user
- Email and push notification preferences for each type
- `digest_frequency` - How often to receive notification digests
- `quiet_hours_start` - Start of quiet hours
- `quiet_hours_end` - End of quiet hours
- `timezone` - User's timezone

## Real-time Delivery

The system uses Server-Sent Events (SSE) for real-time notification delivery:

- Clients connect to `/api/notifications/sse` to receive real-time updates
- The `RealTimeNotificationManager` class manages connections and sends notifications
- Heartbeats are sent periodically to maintain connections

## Benefits

1. **Improved User Engagement** - Keeps users motivated and engaged with regular reminders
2. **Better Contest Participation** - Helps users track contests and practice regularly
3. **Enhanced Platform Interactivity** - Increases overall platform interactivity through timely alerts
4. **Personalized Experience** - Configurable preferences allow users to customize their notification experience

## Testing

The system includes API endpoints for testing notifications:

- POST `/api/notifications/trigger` with different types to manually trigger notifications
- Test pages in `/test-features/notifications` to verify system behavior

## Future Enhancements

1. **Email Delivery** - Integrate with email service for email notifications
2. **Mobile Push** - Implement mobile push notifications
3. **Advanced Filtering** - More granular notification filtering options
4. **Analytics** - Track notification effectiveness and user engagement