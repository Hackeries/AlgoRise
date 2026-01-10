import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read_at?: string;
  created_at: string;
  priority: number;
  group_id?: string;
  contest_id?: string;
  related_user_id?: string;
}

export interface NotificationHookReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (
    page?: number,
    filters?: NotificationFilters
  ) => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

export interface NotificationFilters {
  type?: string;
  unreadOnly?: boolean;
  since?: string;
  limit?: number;
}

export function useNotifications(): NotificationHookReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchNotifications = useCallback(
    async (page = 1, filters: NotificationFilters = {}) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: (filters.limit || 20).toString(),
          ...(filters.type && { type: filters.type }),
          ...(filters.unreadOnly && { unread: 'true' }),
          ...(filters.since && { since: filters.since }),
        });

        const response = await fetch(`/api/notifications?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();

        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }

        setUnreadCount(data.unreadCount);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch notifications'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notificationIds.includes(notif.id)
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to mark notifications as read'
      );
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAll: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to mark all notifications as read'
      );
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to refresh unread count');
      }

      const data = await response.json();
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to refresh unread count:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
  };
}
