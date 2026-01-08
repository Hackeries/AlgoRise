'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username?: string;
  solved: number;
  penalty: number;
  score?: number;
}

interface UseContestRealtimeOptions {
  contestId: string;
  onLeaderboardUpdate?: (leaderboard: LeaderboardEntry[]) => void;
  onSubmissionUpdate?: (submission: {
    user_id: string;
    problem_id: string;
    status: string;
  }) => void;
  enabled?: boolean;
}

export function useContestRealtime({
  contestId,
  onLeaderboardUpdate,
  onSubmissionUpdate,
  enabled = true,
}: UseContestRealtimeOptions) {
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/contests/${contestId}/leaderboard?limit=50`
      );
      if (response.ok) {
        const data = await response.json();
        onLeaderboardUpdate?.(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }, [contestId, onLeaderboardUpdate]);

  useEffect(() => {
    if (!enabled || !contestId) return;

    const channel = supabase
      .channel(`contest:${contestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contest_submissions',
          filter: `contest_id=eq.${contestId}`,
        },
        payload => {
          const newSubmission = payload.new as {
            user_id: string;
            problem_id: string;
            status: string;
          };
          onSubmissionUpdate?.(newSubmission);
          fetchLeaderboard();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contest_participants',
          filter: `contest_id=eq.${contestId}`,
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe(status => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [contestId, enabled, supabase, onSubmissionUpdate, fetchLeaderboard]);

  return {
    isConnected,
    refetchLeaderboard: fetchLeaderboard,
  };
}
