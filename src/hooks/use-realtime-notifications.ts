import { useState, useEffect, useCallback, useRef } from 'react';
import { Notification } from './use-notifications';

export interface RealTimeNotificationHookReturn {
  isConnected: boolean;
  connectionError: string | null;
  latestNotification: Notification | null;
  connectionStats: {
    activeUsers: number;
    totalConnections: number;
  } | null;
  connect: () => void;
  disconnect: () => void;
}

export function useRealTimeNotifications(
  onNotification?: (notification: Notification) => void,
  onUnreadCountUpdate?: (count: number) => void
): RealTimeNotificationHookReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [latestNotification, setLatestNotification] =
    useState<Notification | null>(null);
  const [connectionStats, setConnectionStats] = useState<{
    activeUsers: number;
    totalConnections: number;
  } | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    // Don't connect if already connected
    if (
      eventSourceRef.current &&
      eventSourceRef.current.readyState === EventSource.OPEN
    ) {
      return;
    }

    setConnectionError(null);

    try {
      const eventSource = new EventSource('/api/notifications/sse');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('Connected to real-time notifications');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = event => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'connected':
              console.log('SSE connection established:', data.message);
              if (data.stats) {
                setConnectionStats(data.stats);
              }
              break;

            case 'heartbeat':
              // Keep connection alive
              break;

            case 'notification':
              const notification = data.notification;
              setLatestNotification(notification);
              onNotification?.(notification);
              break;

            case 'unread_count_update':
              onUnreadCountUpdate?.(data.unreadCount);
              break;

            case 'system_notification':
              // Handle system-wide notifications
              const systemNotification = data.notification;
              setLatestNotification(systemNotification);
              onNotification?.(systemNotification);
              break;

            case 'contest_update':
              // Handle contest updates
              console.log('Contest update received:', data);
              break;

            case 'group_message':
              // Handle group message notifications
              console.log('Group message notification:', data);
              break;

            default:
              console.log('Unknown notification type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = error => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        setConnectionError('Connection error occurred');

        // Implement exponential backoff for reconnection
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
          reconnectAttempts.current++;

          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
            }
            connect();
          }, delay);
        } else {
          setConnectionError('Failed to connect after multiple attempts');
        }
      };
    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      setConnectionError('Failed to establish connection');
    }
  }, [onNotification, onUnreadCountUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    setConnectionError(null);
    reconnectAttempts.current = 0;
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Handle browser visibility changes (reconnect when tab becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected) {
        console.log('Tab became visible, attempting to reconnect...');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, connect]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Browser came online, attempting to reconnect...');
      connect();
    };

    const handleOffline = () => {
      console.log('Browser went offline');
      setIsConnected(false);
      setConnectionError('No internet connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connect]);

  return {
    isConnected,
    connectionError,
    latestNotification,
    connectionStats,
    connect,
    disconnect,
  };
}
