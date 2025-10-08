'use client';

import { useEffect, useRef } from 'react';
import { mutate } from 'swr';

type RealtimeConfig = {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
};

export function useRealtimeUpdates(
  key: string | null,
  config: RealtimeConfig = {}
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!key) return;

    const {
      refreshInterval = 30000,
      revalidateOnFocus = true,
      revalidateOnReconnect = true,
    } = config;

    // Set up polling for real-time updates
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        mutate(key);
      }, refreshInterval);
    }

    // Handle focus events for immediate updates
    const handleFocus = () => {
      if (revalidateOnFocus) {
        mutate(key);
      }
    };

    // Handle reconnection events
    const handleOnline = () => {
      if (revalidateOnReconnect) {
        mutate(key);
      }
    };

    if (revalidateOnFocus) {
      window.addEventListener('focus', handleFocus);
    }

    if (revalidateOnReconnect) {
      window.addEventListener('online', handleOnline);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [key, config]); // Updated to use the entire config object as a dependency
}

// Hook for cross-tab synchronization using localStorage events
export function useCrossTabSync(key: string, callback: () => void) {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        callback();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, callback]);
}