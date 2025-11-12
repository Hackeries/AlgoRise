import { createClient } from '@/lib/supabase/server';

export interface NotificationData {
  type:
    | 'contest_starting'
    | 'contest_ended'
    | 'group_invite'
    | 'group_message'
    | 'contest_registration'
    | 'achievement'
    | 'system_announcement'
    | 'friend_request'
    | 'mention'
    | 'daily_problem_reminder'
    | 'rating_change'
    | 'friend_joined_contest';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: number;
  expiresAt?: string;
  groupId?: string;
  contestId?: string;
  relatedUserId?: string;
}

export class NotificationService {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  // Create a single notification
  async createNotification(userId: string, notification: NotificationData) {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data || {},
          priority: notification.priority || 1,
          expires_at: notification.expiresAt,
          group_id: notification.groupId,
          contest_id: notification.contestId,
          related_user_id: notification.relatedUserId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return { success: false, error };
      }

      return { success: true, notification: data };
    } catch (error) {
      console.error('Error in createNotification:', error);
      return { success: false, error };
    }
  }

  // Create notifications for multiple users
  async createBulkNotifications(
    userIds: string[],
    notification: NotificationData
  ) {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        priority: notification.priority || 1,
        expires_at: notification.expiresAt,
        group_id: notification.groupId,
        contest_id: notification.contestId,
        related_user_id: notification.relatedUserId,
      }));

      const { data, error } = await this.supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) {
        console.error('Error creating bulk notifications:', error);
        return { success: false, error };
      }

      return { success: true, notifications: data };
    } catch (error) {
      console.error('Error in createBulkNotifications:', error);
      return { success: false, error };
    }
  }

  // Contest-related notifications
  async notifyContestStarting(
    contestId: string,
    contestName: string,
    startTime: string
  ) {
    try {
      // Get all users who are members of groups that have this contest
      const { data: groupMembers, error } = await this.supabase
        .from('contests')
        .select(
          `
          groups!inner(
            group_memberships!inner(
              user_id
            )
          )
        `
        )
        .eq('id', contestId);

      if (error || !groupMembers?.length) {
        console.error('Error fetching contest group members:', error);
        return { success: false, error };
      }

      interface GroupMembership {
        user_id: string;
      }
      interface GroupRow {
        group_memberships?: GroupMembership[];
      }
      interface ContestWithGroups {
        groups?: GroupRow;
      }

      const userIds: string[] = ((groupMembers as ContestWithGroups[]) || [])
        .flatMap(contest => contest.groups?.group_memberships || [])
        .map((membership: GroupMembership) => membership.user_id)
        .filter(
          (id: string, index: number, arr: string[]) =>
            arr.indexOf(id) === index
        ); // Remove duplicates

      if (userIds.length === 0) {
        return { success: true, message: 'No users to notify' };
      }

      const notification: NotificationData = {
        type: 'contest_starting',
        title: 'Contest Starting Soon!',
        message: `${contestName} is starting at ${new Date(startTime).toLocaleString()}`,
        data: { contestId, contestName, startTime },
        priority: 3,
        contestId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expire in 24 hours
      };

      return await this.createBulkNotifications(userIds, notification);
    } catch (error) {
      console.error('Error in notifyContestStarting:', error);
      return { success: false, error };
    }
  }

  async notifyContestEnded(contestId: string, contestName: string) {
    try {
      // Get all participants of the contest
      const { data: participants, error } = await this.supabase
        .from('contest_submissions')
        .select('user_id')
        .eq('contest_id', contestId)
        .group('user_id');

      if (error || !participants?.length) {
        console.error('Error fetching contest participants:', error);
        return { success: false, error };
      }

      interface ContestParticipant {
        user_id: string;
      }

      const userIds: string[] = (participants as ContestParticipant[]).map(
        (p: ContestParticipant) => p.user_id
      );

      const notification: NotificationData = {
        type: 'contest_ended',
        title: 'Contest Results Available!',
        message: `${contestName} has ended. Check out the results and leaderboard!`,
        data: { contestId, contestName },
        priority: 2,
        contestId,
      };

      return await this.createBulkNotifications(userIds, notification);
    } catch (error) {
      console.error('Error in notifyContestEnded:', error);
      return { success: false, error };
    }
  }

  // Group-related notifications
  async notifyGroupInvite(
    invitedUserId: string,
    groupId: string,
    groupName: string,
    inviterName: string
  ) {
    const notification: NotificationData = {
      type: 'group_invite',
      title: 'Group Invitation',
      message: `${inviterName} invited you to join ${groupName}`,
      data: { groupId, groupName, inviterName },
      priority: 3,
      groupId,
    };

    return await this.createNotification(invitedUserId, notification);
  }

  async notifyGroupMessage(
    groupId: string,
    messageContent: string,
    senderName: string,
    senderId: string
  ) {
    try {
      // Get all group members except the sender
      const { data: members, error } = await this.supabase
        .from('group_memberships')
        .select('user_id, groups(name)')
        .eq('group_id', groupId)
        .neq('user_id', senderId);

      if (error || !members?.length) {
        console.error('Error fetching group members:', error);
        return { success: false, error };
      }

      const userIds: string[] = (
        members as { user_id: string; groups?: { name?: string } }[]
      ).map(member => member.user_id);
      const groupName = members[0]?.groups?.name || 'Group';

      const notification: NotificationData = {
        type: 'group_message',
        title: `New message in ${groupName}`,
        message: `${senderName}: ${messageContent.length > 100 ? messageContent.substring(0, 100) + '...' : messageContent}`,
        data: { groupId, groupName, senderName, senderId },
        priority: 2,
        groupId,
        relatedUserId: senderId,
      };

      return await this.createBulkNotifications(userIds, notification);
    } catch (error) {
      console.error('Error in notifyGroupMessage:', error);
      return { success: false, error };
    }
  }

  // Achievement notifications
  async notifyAchievement(
    userId: string,
    achievementType: string,
    achievementData: Record<string, any>
  ) {
    const achievementMessages: Record<string, string> = {
      first_problem: 'Congratulations on solving your first problem!',
      streak_milestone: `Amazing! You've reached a ${achievementData.days}-day solving streak!`,
      rating_milestone: `Well done! You've reached ${achievementData.rating} rating!`,
      contest_winner: `🏆 Congratulations on winning ${achievementData.contestName}!`,
      problem_count: `Great job! You've solved ${achievementData.count} problems!`,
    };

    const notification: NotificationData = {
      type: 'achievement',
      title: 'Achievement Unlocked! 🎉',
      message:
        achievementMessages[achievementType] ||
        "You've unlocked a new achievement!",
      data: { achievementType, ...achievementData },
      priority: 4,
    };

    return await this.createNotification(userId, notification);
  }

  // System notifications
  async notifySystemAnnouncement(
    title: string,
    message: string,
    targetUserIds?: string[]
  ) {
    const notification: NotificationData = {
      type: 'system_announcement',
      title,
      message,
      priority: 5,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expire in 7 days
    };

    if (targetUserIds && targetUserIds.length > 0) {
      return await this.createBulkNotifications(targetUserIds, notification);
    } else {
      // Send to all users (admin functionality)
      const { data: users, error } = await this.supabase
        .from('profiles')
        .select('id');

      if (error || !users?.length) {
        console.error(
          'Error fetching all users for system announcement:',
          error
        );
        return { success: false, error };
      }

      const userIds = users.map((user: { id: string }) => user.id);
      return await this.createBulkNotifications(userIds, notification);
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      const { data } = await this.supabase.rpc('cleanup_expired_notifications');

      return { success: true, deletedCount: data || 0 };
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      return { success: false, error };
    }
  }
}

// Helper function to create notification service instance
export async function createNotificationService() {
  const supabase = await createClient();
  return new NotificationService(supabase);
}

// Export notification templates for consistency
export const NotificationTemplates = {
  contestStarting: (contestName: string, startTime: string) => ({
    title: 'Contest Starting Soon!',
    message: `${contestName} is starting at ${new Date(startTime).toLocaleString()}`,
  }),

  contestEnded: (contestName: string) => ({
    title: 'Contest Results Available!',
    message: `${contestName} has ended. Check out the results and leaderboard!`,
  }),

  groupInvite: (groupName: string, inviterName: string) => ({
    title: 'Group Invitation',
    message: `${inviterName} invited you to join ${groupName}`,
  }),

  groupMessage: (
    groupName: string,
    senderName: string,
    messagePreview: string
  ) => ({
    title: `New message in ${groupName}`,
    message: `${senderName}: ${messagePreview}`,
  }),

  achievement: (type: string, data: any) => {
    const messages: Record<string, string> = {
      first_problem: 'Congratulations on solving your first problem!',
      streak_milestone: `Amazing! You've reached a ${data.days}-day solving streak!`,
      rating_milestone: `Well done! You've reached ${data.rating} rating!`,
      contest_winner: `🏆 Congratulations on winning ${data.contestName}!`,
      problem_count: `Great job! You've solved ${data.count} problems!`,
    };

    return {
      title: 'Achievement Unlocked! 🎉',
      message: messages[type] || "You've unlocked a new achievement!",
    };
  },
};
