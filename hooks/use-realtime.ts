'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRealtime<T>(
  channel: string,
  event: string,
  onData: (data: T) => void,
  enabled = true
) {
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();

    subscriptionRef.current = supabase
      .channel(channel)
      .on('broadcast', { event }, (payload: { payload: T }) => {
        onData(payload.payload);
      })
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [channel, event, onData, enabled]);
}

export function useBroadcast(channel: string) {
  const supabase = createClient();

  const broadcast = useCallback(
    async (event: string, data: Record<string, any>) => {
      await supabase.channel(channel).send({
        type: 'broadcast',
        event,
        payload: data,
      });
    },
    [channel, supabase]
  );

  return broadcast;
}
