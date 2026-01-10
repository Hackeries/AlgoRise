import {
  createNotificationService,
  NotificationData,
} from '@/lib/notification-service';
import RealTimeNotificationManager from '@/lib/realtime-notifications';

// Client-side notification utilities
export class NotificationManager {
  private static instance: NotificationManager;
  private rtManager: RealTimeNotificationManager;

  private constructor() {
    this.rtManager = RealTimeNotificationManager.getInstance();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Send notification to specific user(s)
  async sendNotification(
    userIds: string | string[],
    notification: NotificationData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const targetUserIds = Array.isArray(userIds) ? userIds : [userIds];

      // Send via API
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: targetUserIds[0], // For single user
          ...notification,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();

      // Send real-time notification
      if (targetUserIds.length === 1) {
        await this.rtManager.sendToUser(targetUserIds[0], result.notification);
      } else {
        await this.rtManager.sendToUsers(targetUserIds, result.notification);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Helper methods for common notification types
  async notifyContestStarting(
    contestId: string,
    contestName: string,
    startTime: string
  ) {
    const notificationService = await createNotificationService();
    return await notificationService.notifyContestStarting(
      contestId,
      contestName,
      startTime
    );
  }

  async notifyGroupInvite(
    userId: string,
    groupId: string,
    groupName: string,
    inviterName: string
  ) {
    const notificationService = await createNotificationService();
    return await notificationService.notifyGroupInvite(
      userId,
      groupId,
      groupName,
      inviterName
    );
  }

  async notifyAchievement(
    userId: string,
    achievementType: string,
    achievementData: Record<string, any>
  ) {
    const notificationService = await createNotificationService();
    return await notificationService.notifyAchievement(
      userId,
      achievementType,
      achievementData
    );
  }

  // Broadcast system announcement
  async broadcastSystemAnnouncement(title: string, message: string) {
    const notificationService = await createNotificationService();
    const result = await notificationService.notifySystemAnnouncement(
      title,
      message
    );

    if (result.success) {
      // Also broadcast via real-time
      await this.rtManager.broadcast({
        type: 'system_announcement',
        title,
        message,
      });
    }

    return result;
  }
}

// Utility functions for formatting notifications
export const NotificationUtils = {
  formatTimeAgo: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  },

  getPriorityColor: (priority: number): string => {
    switch (priority) {
      case 5:
        return 'text-red-600'; // Critical
      case 4:
        return 'text-orange-600'; // High
      case 3:
        return 'text-yellow-600'; // Medium
      case 2:
        return 'text-blue-600'; // Low
      default:
        return 'text-gray-600'; // Normal
    }
  },

  getPriorityIcon: (priority: number): string => {
    switch (priority) {
      case 5:
        return '🚨'; // Critical
      case 4:
        return '⚠️'; // High
      case 3:
        return '📢'; // Medium
      case 2:
        return 'ℹ️'; // Low
      default:
        return '💬'; // Normal
    }
  },

  getTypeIcon: (type: string): string => {
    switch (type) {
      case 'contest_starting':
        return '🏁';
      case 'contest_ended':
        return '🏆';
      case 'group_invite':
        return '👥';
      case 'group_message':
        return '💬';
      case 'achievement':
        return '🎉';
      case 'system_announcement':
        return '📢';
      case 'friend_request':
        return '👋';
      case 'mention':
        return '@';
      default:
        return '📧';
    }
  },

  truncateMessage: (message: string, maxLength: number = 100): string => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + '...';
  },

  groupNotificationsByDate: (notifications: any[]): Record<string, any[]> => {
    const groups: Record<string, any[]> = {};

    notifications.forEach(notification => {
      const date = new Date(notification.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString();
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  },
};

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();
