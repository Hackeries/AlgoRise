import { useNotifications } from './use-notifications';
import { useRealTimeNotifications } from './use-realtime-notifications';
import { useSearch } from './use-search';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface NavbarHookReturn {
  // Notifications
  notifications: ReturnType<typeof useNotifications>['notifications'];
  unreadCount: number;
  notificationsLoading: boolean;
  notificationError: string | null;
  fetchNotifications: ReturnType<typeof useNotifications>['fetchNotifications'];
  markAsRead: ReturnType<typeof useNotifications>['markAsRead'];
  markAllAsRead: ReturnType<typeof useNotifications>['markAllAsRead'];

  // Real-time
  isConnected: boolean;
  connectionError: string | null;

  // Search
  searchResults: ReturnType<typeof useSearch>['results'];
  searchSuggestions: ReturnType<typeof useSearch>['suggestions'];
  searchLoading: boolean;
  searchError: string | null;
  searchQuery: string;
  search: ReturnType<typeof useSearch>['search'];
  getSuggestions: ReturnType<typeof useSearch>['getSuggestions'];
  clearSearch: ReturnType<typeof useSearch>['clearResults'];

  // Combined functionality
  showNotificationToast: boolean;
  toggleNotificationToast: (show: boolean) => void;
}

export function useNavbar(): NavbarHookReturn {
  const { toast } = useToast();
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  // Initialize hooks
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationError,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
  } = useNotifications();

  const {
    results: searchResults,
    suggestions: searchSuggestions,
    loading: searchLoading,
    error: searchError,
    query: searchQuery,
    search,
    getSuggestions,
    clearResults: clearSearch,
  } = useSearch();

  // Handle new notifications from real-time connection
  const handleNewNotification = useCallback(
    (notification: any) => {
      // Show toast for high-priority notifications
      if (notification.priority >= 3) {
        toast({
          title: notification.title,
          description: notification.message,
          duration: 5000,
        });
      }

      // Refresh notifications list
      fetchNotifications();
    },
    [toast, fetchNotifications]
  );

  // Handle unread count updates
  const handleUnreadCountUpdate = useCallback(
    (count: number) => {
      // The useNotifications hook will handle the state update
      // This is just for any additional side effects
      if (count > unreadCount) {
        setShowNotificationToast(true);
      }
    },
    [unreadCount]
  );

  const { isConnected, connectionError, latestNotification } =
    useRealTimeNotifications(handleNewNotification, handleUnreadCountUpdate);

  // Show connection status in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Real-time connection status:',
        isConnected ? 'Connected' : 'Disconnected'
      );
      if (connectionError) {
        console.error('Real-time connection error:', connectionError);
      }
    }
  }, [isConnected, connectionError]);

  // Auto-refresh unread count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  const toggleNotificationToast = useCallback((show: boolean) => {
    setShowNotificationToast(show);
  }, []);

  return {
    // Notifications
    notifications,
    unreadCount,
    notificationsLoading,
    notificationError,
    fetchNotifications,
    markAsRead,
    markAllAsRead,

    // Real-time
    isConnected,
    connectionError,

    // Search
    searchResults,
    searchSuggestions,
    searchLoading,
    searchError,
    searchQuery,
    search,
    getSuggestions,
    clearSearch,

    // Combined functionality
    showNotificationToast,
    toggleNotificationToast,
  };
}
