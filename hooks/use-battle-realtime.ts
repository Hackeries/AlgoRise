'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface QueueUpdate {
  type: 'queue_size' | 'match_found' | 'timeout';
  queueSize?: number;
  opponent?: {
    userId: string;
    handle: string;
    rating: number;
  };
  battleId?: string;
}

interface BattleUpdate {
  type: 'submission' | 'verdict' | 'scoreboard_update' | 'problem_solved';
  submission?: {
    userId: string;
    problemId: string;
    verdict: string;
    timestamp: string;
  };
  scoreboard?: Array<{
    teamId: string;
    teamName: string;
    score: number;
    penaltyTime: number;
  }>;
}

interface TeamChatMessage {
  userId: string;
  handle: string;
  message: string;
  timestamp: string;
}

/**
 * Hook for subscribing to queue updates
 */
export function useQueueRealtime(mode: '1v1' | '3v3', enabled = true) {
  const [queueUpdate, setQueueUpdate] = useState<QueueUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel: RealtimeChannel = supabase.channel(`queue:${mode}`);

    channel
      // Legacy/general queue updates
      .on(
        'broadcast',
        { event: 'queue_update' },
        (payload: { payload: QueueUpdate }) => {
          setQueueUpdate(payload.payload);
        }
      )
      // Explicit queue size updates from server
      .on(
        'broadcast',
        { event: 'queue_size' },
        (payload: { payload: QueueUpdate }) => {
          setQueueUpdate(payload.payload);
        }
      )
      // Match found event from server
      .on(
        'broadcast',
        { event: 'match_found' },
        (payload: { payload: QueueUpdate }) => {
          setQueueUpdate(payload.payload);
        }
      )
      .subscribe(status => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      channel.unsubscribe();
    };
  }, [mode, enabled]);

  return { queueUpdate, isConnected };
}

/**
 * Hook for subscribing to battle room updates
 */
export function useBattleRealtime(
  battleId: string,
  enabled = true,
  teamId?: string
) {
  const [battleUpdate, setBattleUpdate] = useState<BattleUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestCode, setLatestCode] = useState<{ content: string; language: string; userId?: string } | null>(null);

  useEffect(() => {
    if (!enabled || !battleId) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel: RealtimeChannel = supabase.channel(`battle:${battleId}`);
    const teamChannel: RealtimeChannel | null = teamId
      ? supabase.channel(`battle:${battleId}:team:${teamId}`)
      : null;

    channel
      // General battle updates envelope
      .on(
        'broadcast',
        { event: 'battle_update' },
        (payload: { payload: BattleUpdate }) => {
          setBattleUpdate(payload.payload);
        }
      )
      // Direct submission events (server may emit this)
      .on(
        'broadcast',
        { event: 'submission' },
        (payload: {
          payload: {
            submission: BattleUpdate['submission'];
            verdict?: string;
            penalty?: number;
          };
        }) => {
          setBattleUpdate({
            type: 'submission',
            submission: payload.payload.submission as any,
          });
        }
      )
      // Code sync updates
      .on(
        'broadcast',
        { event: 'code_update' },
        (payload: { payload: { content: string; language: string; userId?: string } }) => {
          setLatestCode(payload.payload);
        }
      )
      .subscribe(status => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    if (teamChannel) {
      teamChannel
        .on(
          'broadcast',
          { event: 'code_update' },
          (payload: { payload: { content: string; language: string; userId?: string } }) => {
            setLatestCode(payload.payload);
          }
        )
        .subscribe();
    }

    return () => {
      channel.unsubscribe();
      if (teamChannel) teamChannel.unsubscribe();
    };
  }, [battleId, enabled, teamId]);

  return { battleUpdate, isConnected, latestCode };
}

/**
 * Hook for team chat in 3v3 battles
 */
export function useTeamChat(battleId: string, teamId: string, enabled = true) {
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !battleId || !teamId) return;

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel: RealtimeChannel = supabase.channel(
      `battle:${battleId}:team:${teamId}`
    );

    channel
      .on(
        'broadcast',
        { event: 'chat_message' },
        (payload: { payload: TeamChatMessage }) => {
          setMessages(prev => [...prev, payload.payload]);
        }
      )
      .subscribe(status => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      channel.unsubscribe();
    };
  }, [battleId, teamId, enabled]);

  const sendMessage = useCallback(
    async (message: string) => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('codeforces_handle')
        .eq('id', user.id)
        .single();

      const channel = supabase.channel(`battle:${battleId}:team:${teamId}`);
      await (channel.send as any)('broadcast', {
        event: 'chat_message',
        payload: {
          userId: user.id,
          handle: profile?.codeforces_handle || 'Unknown',
          message,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [battleId, teamId]
  );

  return { messages, isConnected, sendMessage };
}

/**
 * Broadcast queue update
 */
export async function broadcastQueueUpdate(
  mode: '1v1' | '3v3',
  update: QueueUpdate
) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const channel = supabase.channel(`queue:${mode}`);
  await (channel.send as any)('broadcast', {
    event: 'queue_update',
    payload: update,
  });
}

/**
 * Broadcast battle update
 */
export async function broadcastBattleUpdate(
  battleId: string,
  update: BattleUpdate
) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const channel = supabase.channel(`battle:${battleId}`);
  await (channel.send as any)('broadcast', {
    event: 'battle_update',
    payload: update,
  });
}

/**
 * Broadcast live code changes for collaborative editing
 */
export async function broadcastCodeUpdate(
  battleId: string,
  content: string,
  language: string,
  teamId?: string
) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const channel = supabase.channel(
    teamId ? `battle:${battleId}:team:${teamId}` : `battle:${battleId}`
  );
  await (channel.send as any)('broadcast', {
    event: 'code_update',
    payload: { content, language },
  });
}