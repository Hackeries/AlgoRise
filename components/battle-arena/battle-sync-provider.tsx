'use client';

/**
 * PART 5: BATTLE SYNCHRONIZATION CONTEXT
 * 
 * Centralized state management for all real-time battle features:
 * - Connection status and reconnection
 * - Event broadcasting and receiving
 * - Presence tracking
 * - Race condition prevention
 * - UI state for disconnection banners
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  useBattleSynchronization,
  type BattleEvent,
  type PresenceState,
  type ConnectionState,
} from '@/hooks/use-battle-synchronization';
import {
  submitWithServerTimestamp,
  updateSubmissionVerdict,
  broadcastAuthoritativeVerdict,
  type SubmissionRecord,
} from '@/lib/battle/race-condition-prevention';
import { ReconnectingBanner, OpponentDisconnectedBanner, ReconnectionSuccessToast } from './connection-status-banner';

// ============================================================================
// CONTEXT TYPE DEFINITIONS
// ============================================================================

interface BattleSyncContextType {
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;
  isReconnecting: boolean;

  // Opponent state
  opponentPresence: PresenceState | null;
  isOpponentOnline: boolean;
  opponentDisconnectedDuration: number;

  // Events
  events: BattleEvent[];
  latestEvent: BattleEvent | null;

  // Actions
  broadcastSubmission: (problemId: string, code: string, language: string) => Promise<void>;
  broadcastTyping: (problemId: string) => Promise<void>;
  broadcastProblemChange: (problemId: string) => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  updatePresence: (status: PresenceState['status'], currentProblem?: string) => Promise<void>;
  reconnect: () => void;

  // Submission with race condition prevention
  submitCode: (
    problemId: string,
    code: string,
    language: string
  ) => Promise<SubmissionRecord>;
  updateVerdict: (
    submissionId: string,
    verdict: SubmissionRecord['verdict'],
    executionTime: number,
    memory: number,
    testCasesPassed: number,
    totalTestCases: number
  ) => Promise<void>;

  // UI state
  showReconnectingBanner: boolean;
  showOpponentDisconnectedBanner: boolean;
  showReconnectionSuccessToast: boolean;
  dismissReconnectionToast: () => void;
}

const BattleSyncContext = createContext<BattleSyncContextType | null>(null);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface BattleSyncProviderProps {
  battleId: string;
  userId: string;
  opponentName: string;
  teamId?: string;
  children: React.ReactNode;
  onBattleEnd?: (result: any) => void;
  onClaimVictory?: () => void;
  onRestartBattle?: () => void;
}

export function BattleSyncProvider({
  battleId,
  userId,
  opponentName,
  teamId,
  children,
  onBattleEnd,
  onClaimVictory,
  onRestartBattle,
}: BattleSyncProviderProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [opponentDisconnectedDuration, setOpponentDisconnectedDuration] = useState(0);
  const [showReconnectionSuccessToast, setShowReconnectionSuccessToast] = useState(false);
  const [wasDisconnected, setWasDisconnected] = useState(false);

  // ============================================================================
  // BATTLE SYNCHRONIZATION HOOK
  // ============================================================================

  const {
    connectionState,
    isConnected,
    isReconnecting,
    events,
    latestEvent,
    presenceState,
    opponentPresence,
    isOpponentOnline,
    broadcastSubmission: baseBroadcastSubmission,
    broadcastTyping,
    broadcastProblemChange,
    sendChatMessage,
    updatePresence,
    reconnect,
  } = useBattleSynchronization({
    battleId,
    userId,
    teamId,
    enabled: true,
    onOpponentDisconnect: () => {
      console.log('Opponent disconnected');
    },
    onOpponentReconnect: () => {
      console.log('Opponent reconnected');
      setOpponentDisconnectedDuration(0);
    },
    onBattleEnd,
  });

  // ============================================================================
  // TRACK OPPONENT DISCONNECTION DURATION
  // ============================================================================

  useEffect(() => {
    if (!isOpponentOnline) {
      const interval = setInterval(() => {
        setOpponentDisconnectedDuration((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setOpponentDisconnectedDuration(0);
    }
  }, [isOpponentOnline]);

  // ============================================================================
  // SHOW SUCCESS TOAST ON RECONNECTION
  // ============================================================================

  useEffect(() => {
    if (wasDisconnected && isConnected) {
      setShowReconnectionSuccessToast(true);
      setWasDisconnected(false);
    }

    if (!isConnected) {
      setWasDisconnected(true);
    }
  }, [isConnected, wasDisconnected]);

  // ============================================================================
  // SUBMISSION WITH RACE CONDITION PREVENTION
  // ============================================================================

  const submitCode = useCallback(
    async (problemId: string, code: string, language: string) => {
      // 1. Submit to server and get authoritative timestamp
      const submission = await submitWithServerTimestamp(
        battleId,
        userId,
        problemId,
        code,
        language
      );

      // 2. Broadcast to other players (ephemeral event)
      await baseBroadcastSubmission(problemId, code, language);

      // 3. Return submission record with server timestamp
      return submission;
    },
    [battleId, userId, baseBroadcastSubmission]
  );

  const updateVerdict = useCallback(
    async (
      submissionId: string,
      verdict: SubmissionRecord['verdict'],
      executionTime: number,
      memory: number,
      testCasesPassed: number,
      totalTestCases: number
    ) => {
      // 1. Update verdict in database with server timestamp
      const submission = await updateSubmissionVerdict(
        submissionId,
        verdict,
        executionTime,
        memory,
        testCasesPassed,
        totalTestCases
      );

      // 2. Broadcast authoritative verdict to all clients
      await broadcastAuthoritativeVerdict(battleId, submission);
    },
    [battleId]
  );

  // ============================================================================
  // UI STATE
  // ============================================================================

  const showReconnectingBanner =
    connectionState.status === 'reconnecting' ||
    connectionState.status === 'disconnected';

  const showOpponentDisconnectedBanner =
    !isOpponentOnline && opponentDisconnectedDuration > 5;

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: BattleSyncContextType = {
    connectionState,
    isConnected,
    isReconnecting,
    opponentPresence,
    isOpponentOnline,
    opponentDisconnectedDuration,
    events,
    latestEvent,
    broadcastSubmission: baseBroadcastSubmission,
    broadcastTyping,
    broadcastProblemChange,
    sendChatMessage,
    updatePresence,
    reconnect,
    submitCode,
    updateVerdict,
    showReconnectingBanner,
    showOpponentDisconnectedBanner,
    showReconnectionSuccessToast,
    dismissReconnectionToast: () => setShowReconnectionSuccessToast(false),
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <BattleSyncContext.Provider value={value}>
      {/* Reconnecting Banner */}
      <ReconnectingBanner
        connectionState={connectionState}
        onManualReconnect={reconnect}
        onClaimVictory={onClaimVictory}
        onRestartBattle={onRestartBattle}
      />

      {/* Opponent Disconnected Banner */}
      <OpponentDisconnectedBanner
        opponentName={opponentName}
        isDisconnected={showOpponentDisconnectedBanner}
        disconnectedDuration={opponentDisconnectedDuration}
        onPauseBattle={() => {
          console.log('Pause battle');
        }}
        onContinue={() => {
          console.log('Continue anyway');
        }}
      />

      {/* Reconnection Success Toast */}
      <ReconnectionSuccessToast
        show={showReconnectionSuccessToast}
        onDismiss={() => setShowReconnectionSuccessToast(false)}
      />

      {children}
    </BattleSyncContext.Provider>
  );
}

// ============================================================================
// HOOK TO USE CONTEXT
// ============================================================================

export function useBattleSync() {
  const context = useContext(BattleSyncContext);

  if (!context) {
    throw new Error('useBattleSync must be used within BattleSyncProvider');
  }

  return context;
}

// ============================================================================
// INDIVIDUAL FEATURE HOOKS (Optional, for convenience)
// ============================================================================

/**
 * Hook to listen for specific event types
 */
export function useBattleEvent(eventType: BattleEvent['type'], callback: (event: BattleEvent) => void) {
  const { latestEvent } = useBattleSync();

  useEffect(() => {
    if (latestEvent && latestEvent.type === eventType) {
      callback(latestEvent);
    }
  }, [latestEvent, eventType, callback]);
}

/**
 * Hook to get opponent's current activity
 */
export function useOpponentActivity() {
  const { opponentPresence, latestEvent } = useBattleSync();

  const [activity, setActivity] = useState<{
    status: string;
    problem?: string;
    lastAction?: string;
    timestamp?: string;
  }>({
    status: 'unknown',
  });

  useEffect(() => {
    if (!opponentPresence) {
      setActivity({ status: 'offline' });
      return;
    }

    setActivity({
      status: opponentPresence.status,
      problem: opponentPresence.currentProblem,
      lastAction: latestEvent?.type,
      timestamp: opponentPresence.lastSeenAt,
    });
  }, [opponentPresence, latestEvent]);

  return activity;
}

/**
 * Hook for typing indicators
 */
export function useTypingIndicator(problemId: string) {
  const { broadcastTyping, latestEvent } = useBattleSync();
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Broadcast that user is typing
  const startTyping = useCallback(() => {
    broadcastTyping(problemId);
  }, [broadcastTyping, problemId]);

  // Listen for opponent typing
  useEffect(() => {
    if (
      latestEvent?.type === 'typing_indicator' &&
      latestEvent.data.problemId === problemId
    ) {
      setIsOpponentTyping(true);

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Stop showing typing indicator after 3 seconds
      const timeout = setTimeout(() => {
        setIsOpponentTyping(false);
      }, 3000);

      setTypingTimeout(timeout);
    }
  }, [latestEvent, problemId, typingTimeout]);

  return {
    isOpponentTyping,
    startTyping,
  };
}
