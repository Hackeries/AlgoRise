'use client';

/**
 * PART 5: REAL-TIME SYNCHRONIZATION SYSTEM
 * 
 * Comprehensive hook for managing all real-time aspects of battle arena:
 * - Broadcast for ephemeral events (submissions, typing, time ticks, chat)
 * - Postgres Changes for persistent data (submission records, problem status, battle end)
 * - Presence for online status tracking (who's in battle, disconnected, etc.)
 * - Reconnection handling with exponential backoff
 * - Race condition prevention with server timestamps
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type BattleEventType = 
  | 'submission_started'     // Opponent started a submission
  | 'submission_verdict'     // Final verdict from Judge0
  | 'typing_indicator'       // Show opponent is typing
  | 'time_tick'              // Broadcast every second
  | 'chat_message'           // Team chat in 3v3
  | 'problem_changed'        // Opponent switched problems
  | 'battle_ended';          // Battle finished

export interface BattleEvent {
  type: BattleEventType;
  userId: string;
  timestamp: string; // ISO string from server (source of truth)
  data: any;
}

export interface SubmissionEvent {
  userId: string;
  problemId: string;
  code: string;
  language: string;
  submittedAt: string; // Server timestamp
}

export interface VerdictEvent {
  userId: string;
  problemId: string;
  verdict: 'AC' | 'WA' | 'TLE' | 'RE' | 'CE' | 'MLE';
  executionTime: number;
  memory: number;
  testCasesPassed: number;
  totalTestCases: number;
  submittedAt: string; // Server timestamp (source of truth)
  judgedAt: string;    // When Judge0 returned verdict
}

export interface PresenceState {
  userId: string;
  status: 'active' | 'idle' | 'disconnected';
  currentProblem?: string;
  lastSeenAt: string;
}

export interface ConnectionState {
  status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
  lastConnected?: Date;
  reconnectAttempts: number;
  reconnectDelay: number; // milliseconds
}

// ============================================================================
// RECONNECTION CONFIGURATION
// ============================================================================

const RECONNECTION_CONFIG = {
  initialDelay: 2000,      // Start with 2 seconds
  maxDelay: 30000,         // Max 30 seconds
  maxAttempts: Infinity,   // Keep trying
  backoffMultiplier: 2,    // Exponential: 2s, 4s, 8s, 16s, 30s...
  giveUpAfter: 5 * 60 * 1000, // Give up after 5 minutes
};

// ============================================================================
// MAIN HOOK: useBattleSynchronization
// ============================================================================

interface UseBattleSynchronizationOptions {
  battleId: string;
  userId: string;
  teamId?: string; // For 3v3 mode
  enabled?: boolean;
  onOpponentDisconnect?: () => void;
  onOpponentReconnect?: () => void;
  onBattleEnd?: (result: any) => void;
}

export function useBattleSynchronization({
  battleId,
  userId,
  teamId,
  enabled = true,
  onOpponentDisconnect,
  onOpponentReconnect,
  onBattleEnd,
}: UseBattleSynchronizationOptions) {
  
  // ============================================================================
  // STATE
  // ============================================================================
  
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    reconnectAttempts: 0,
    reconnectDelay: RECONNECTION_CONFIG.initialDelay,
  });
  
  const [events, setEvents] = useState<BattleEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<BattleEvent | null>(null);
  const [presenceState, setPresenceState] = useState<Record<string, PresenceState>>({});
  const [opponentPresence, setOpponentPresence] = useState<PresenceState | null>(null);
  
  // Refs for channel management
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const disconnectStartTimeRef = useRef<Date | null>(null);
  const supabaseRef = useRef(createClient());

  // ============================================================================
  // RECONNECTION LOGIC WITH EXPONENTIAL BACKOFF
  // ============================================================================
  
  const calculateReconnectDelay = useCallback((attempt: number): number => {
    const delay = Math.min(
      RECONNECTION_CONFIG.initialDelay * Math.pow(RECONNECTION_CONFIG.backoffMultiplier, attempt),
      RECONNECTION_CONFIG.maxDelay
    );
    return delay;
  }, []);

  const shouldGiveUp = useCallback((): boolean => {
    if (!disconnectStartTimeRef.current) return false;
    const elapsed = Date.now() - disconnectStartTimeRef.current.getTime();
    return elapsed > RECONNECTION_CONFIG.giveUpAfter;
  }, []);

  // ============================================================================
  // PRESENCE TRACKING
  // ============================================================================
  
  const updatePresence = useCallback(async (status: PresenceState['status'], currentProblem?: string) => {
    if (!channelRef.current) return;

    const presenceData: PresenceState = {
      userId,
      status,
      currentProblem,
      lastSeenAt: new Date().toISOString(),
    };

    await channelRef.current.track(presenceData);
  }, [userId]);

  // ============================================================================
  // BROADCAST FUNCTIONS
  // ============================================================================
  
  const broadcastEvent = useCallback(async (type: BattleEventType, data: any) => {
    if (!channelRef.current || connectionState.status !== 'connected') {
      console.warn('Cannot broadcast: not connected');
      return;
    }

    const event: BattleEvent = {
      type,
      userId,
      timestamp: new Date().toISOString(), // Client timestamp, server will override
      data,
    };

    await channelRef.current.send({
      type: 'broadcast',
      event: type,
      payload: event,
    });
  }, [userId, connectionState.status]);

  const broadcastSubmission = useCallback(async (
    problemId: string,
    code: string,
    language: string
  ) => {
    await broadcastEvent('submission_started', {
      problemId,
      code,
      language,
    });
  }, [broadcastEvent]);

  const broadcastTyping = useCallback(async (problemId: string) => {
    await broadcastEvent('typing_indicator', {
      problemId,
    });
  }, [broadcastEvent]);

  const broadcastProblemChange = useCallback(async (problemId: string) => {
    await broadcastEvent('problem_changed', {
      problemId,
    });
    await updatePresence('active', problemId);
  }, [broadcastEvent, updatePresence]);

  const sendChatMessage = useCallback(async (message: string) => {
    await broadcastEvent('chat_message', {
      message,
      teamId,
    });
  }, [broadcastEvent, teamId]);

  // ============================================================================
  // CHANNEL SETUP AND SUBSCRIPTION
  // ============================================================================
  
  const setupChannel = useCallback(() => {
    const supabase = supabaseRef.current;
    
    // Create channel for this battle
    const channel = supabase.channel(`battle:${battleId}`, {
      config: {
        presence: {
          key: userId,
        },
        broadcast: {
          self: false, // Don't receive own broadcasts
        },
      },
    });

    // ============================================================================
    // BROADCAST LISTENERS (Ephemeral Events)
    // ============================================================================
    
    channel.on('broadcast', { event: 'submission_started' }, ({ payload }) => {
      const event = payload as BattleEvent;
      setLatestEvent(event);
      setEvents(prev => [...prev, event]);
    });

    channel.on('broadcast', { event: 'submission_verdict' }, ({ payload }) => {
      const event = payload as BattleEvent;
      setLatestEvent(event);
      setEvents(prev => [...prev, event]);
    });

    channel.on('broadcast', { event: 'typing_indicator' }, ({ payload }) => {
      const event = payload as BattleEvent;
      setLatestEvent(event);
    });

    channel.on('broadcast', { event: 'time_tick' }, ({ payload }) => {
      const event = payload as BattleEvent;
      setLatestEvent(event);
    });

    channel.on('broadcast', { event: 'chat_message' }, ({ payload }) => {
      const event = payload as BattleEvent;
      setLatestEvent(event);
      setEvents(prev => [...prev, event]);
    });

    channel.on('broadcast', { event: 'problem_changed' }, ({ payload }) => {
      const event = payload as BattleEvent;
      setLatestEvent(event);
    });

    channel.on('broadcast', { event: 'battle_ended' }, ({ payload }) => {
      const event = payload as BattleEvent;
      setLatestEvent(event);
      setEvents(prev => [...prev, event]);
      onBattleEnd?.(event.data);
    });

    // ============================================================================
    // PRESENCE LISTENERS (Who's Online)
    // ============================================================================
    
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState() as RealtimePresenceState<PresenceState>;
      const presenceMap: Record<string, PresenceState> = {};
      
      Object.entries(state).forEach(([key, presences]) => {
        if (presences && presences.length > 0) {
          presenceMap[key] = presences[0] as PresenceState;
        }
      });
      
      setPresenceState(presenceMap);
      
      // Find opponent (anyone who isn't current user)
      const opponent = Object.values(presenceMap).find(p => p.userId !== userId);
      
      if (opponent) {
        setOpponentPresence(opponent);
        
        // Check if opponent reconnected
        if (opponentPresence?.status === 'disconnected' && opponent.status === 'active') {
          onOpponentReconnect?.();
        }
      }
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
      
      // Check if opponent left
      const leftUser = leftPresences[0] as PresenceState;
      if (leftUser && leftUser.userId !== userId) {
        setOpponentPresence(prev => 
          prev ? { ...prev, status: 'disconnected' } : null
        );
        onOpponentDisconnect?.();
      }
    });

    // ============================================================================
    // POSTGRES CHANGES LISTENERS (Persistent Data)
    // ============================================================================
    
    // Listen for new submissions being recorded
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'battle_submissions',
        filter: `battle_id=eq.${battleId}`,
      },
      (payload) => {
        console.log('New submission recorded:', payload);
        // This is the authoritative source after server validates
      }
    );

    // Listen for problem status changes
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'battle_problems',
        filter: `battle_id=eq.${battleId}`,
      },
      (payload) => {
        console.log('Problem status changed:', payload);
      }
    );

    // Listen for battle end event
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'battles',
        filter: `id=eq.${battleId}`,
      },
      (payload) => {
        console.log('Battle updated:', payload);
        const newRecord = payload.new as any;
        if (newRecord.status === 'completed') {
          onBattleEnd?.(newRecord);
        }
      }
    );

    // ============================================================================
    // SUBSCRIBE TO CHANNEL
    // ============================================================================
    
    channel.subscribe(async (status) => {
      console.log('Channel status:', status);
      
      if (status === 'SUBSCRIBED') {
        setConnectionState({
          status: 'connected',
          lastConnected: new Date(),
          reconnectAttempts: 0,
          reconnectDelay: RECONNECTION_CONFIG.initialDelay,
        });
        
        // Track initial presence
        await updatePresence('active');
        
        // Reset disconnect timer
        disconnectStartTimeRef.current = null;
      } else if (status === 'CHANNEL_ERROR') {
        setConnectionState(prev => ({
          ...prev,
          status: 'disconnected',
        }));
        
        if (!disconnectStartTimeRef.current) {
          disconnectStartTimeRef.current = new Date();
        }
      }
    });

    channelRef.current = channel;
    
    return channel;
  }, [battleId, userId, onBattleEnd, onOpponentDisconnect, onOpponentReconnect, updatePresence, opponentPresence]);

  // ============================================================================
  // AUTO-RECONNECTION WITH EXPONENTIAL BACKOFF
  // ============================================================================
  
  const attemptReconnect = useCallback(() => {
    if (!enabled) return;
    
    if (shouldGiveUp()) {
      console.error('Giving up reconnection after 5 minutes');
      setConnectionState(prev => ({
        ...prev,
        status: 'disconnected',
      }));
      return;
    }

    setConnectionState(prev => {
      const newAttempt = prev.reconnectAttempts + 1;
      const newDelay = calculateReconnectDelay(newAttempt);
      
      return {
        status: 'reconnecting',
        reconnectAttempts: newAttempt,
        reconnectDelay: newDelay,
      };
    });

    // Cleanup old channel
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }

    // Try to reconnect
    const delay = calculateReconnectDelay(connectionState.reconnectAttempts);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`Reconnecting... (attempt ${connectionState.reconnectAttempts + 1})`);
      setupChannel();
    }, delay);
    
  }, [enabled, shouldGiveUp, calculateReconnectDelay, connectionState.reconnectAttempts, setupChannel]);

  // ============================================================================
  // MAIN EFFECT: SETUP AND CLEANUP
  // ============================================================================
  
  useEffect(() => {
    if (!enabled || !battleId || !userId) return;

    setupChannel();

    // Monitor connection status
    const checkConnection = setInterval(() => {
      if (channelRef.current?.state === 'joined') {
        // Connected
      } else if (connectionState.status === 'connected') {
        // Was connected, now lost connection
        setConnectionState(prev => ({
          ...prev,
          status: 'disconnected',
        }));
        
        if (!disconnectStartTimeRef.current) {
          disconnectStartTimeRef.current = new Date();
        }
        
        // Attempt reconnection
        attemptReconnect();
      }
    }, 3000); // Check every 3 seconds

    // Cleanup
    return () => {
      clearInterval(checkConnection);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (channelRef.current) {
        // Update presence to disconnected before leaving
        updatePresence('disconnected').then(() => {
          channelRef.current?.unsubscribe();
          channelRef.current = null;
        });
      }
    };
  }, [enabled, battleId, userId, setupChannel, attemptReconnect, updatePresence, connectionState.status]);

  // ============================================================================
  // RETURN API
  // ============================================================================
  
  return {
    // Connection state
    connectionState,
    isConnected: connectionState.status === 'connected',
    isReconnecting: connectionState.status === 'reconnecting',
    
    // Events
    events,
    latestEvent,
    
    // Presence
    presenceState,
    opponentPresence,
    isOpponentOnline: opponentPresence?.status === 'active',
    
    // Actions
    broadcastSubmission,
    broadcastTyping,
    broadcastProblemChange,
    sendChatMessage,
    updatePresence,
    
    // Manual reconnection
    reconnect: attemptReconnect,
  };
}

// ============================================================================
// HELPER HOOK: Time Tick Broadcaster
// ============================================================================

export function useBattleTimeTicker(battleId: string, enabled: boolean = true) {
  const supabase = createClient();
  
  useEffect(() => {
    if (!enabled) return;
    
    const channel = supabase.channel(`battle:${battleId}`);
    
    const interval = setInterval(() => {
      channel.send({
        type: 'broadcast',
        event: 'time_tick',
        payload: {
          type: 'time_tick',
          timestamp: new Date().toISOString(),
        },
      });
    }, 1000); // Every second
    
    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [battleId, enabled, supabase]);
}
