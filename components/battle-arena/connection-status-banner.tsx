'use client';

/**
 * PART 5: CONNECTION STATUS UI COMPONENTS
 * 
 * Visual indicators for:
 * - Reconnecting state with exponential backoff timer
 * - Opponent disconnected warning
 * - Connection quality indicators
 * - Options after extended disconnection (5+ minutes)
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  WifiOff,
  Wifi,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trophy,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ConnectionState } from '@/hooks/use-battle-synchronization';

// ============================================================================
// RECONNECTING BANNER
// ============================================================================

interface ReconnectingBannerProps {
  connectionState: ConnectionState;
  onManualReconnect?: () => void;
  onClaimVictory?: () => void;
  onRestartBattle?: () => void;
}

export function ReconnectingBanner({
  connectionState,
  onManualReconnect,
  onClaimVictory,
  onRestartBattle,
}: ReconnectingBannerProps) {
  const [timeDisconnected, setTimeDisconnected] = useState(0);
  const isReconnecting = connectionState.status === 'reconnecting';
  const isDisconnected = connectionState.status === 'disconnected';
  const showBanner = isReconnecting || isDisconnected;

  useEffect(() => {
    if (!showBanner) {
      setTimeDisconnected(0);
      return;
    }

    const interval = setInterval(() => {
      setTimeDisconnected((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [showBanner]);

  // Check if we've been disconnected for more than 5 minutes
  const hasBeenDisconnectedTooLong = timeDisconnected > 5 * 60;

  // Calculate progress for next reconnection attempt
  const reconnectProgress =
    (timeDisconnected % (connectionState.reconnectDelay / 1000)) /
    (connectionState.reconnectDelay / 1000);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <Alert
            className={`rounded-none border-x-0 border-t-0 ${
              hasBeenDisconnectedTooLong
                ? 'bg-red-950/90 border-red-500/50'
                : 'bg-orange-950/90 border-orange-500/50'
            } backdrop-blur-lg`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <motion.div
                  animate={{ rotate: isReconnecting ? 360 : 0 }}
                  transition={{
                    duration: 2,
                    repeat: isReconnecting ? Infinity : 0,
                    ease: 'linear',
                  }}
                >
                  {isReconnecting ? (
                    <RefreshCw className="h-5 w-5 text-orange-400" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-red-400" />
                  )}
                </motion.div>

                <div className="flex-1">
                  <AlertTitle className="text-white font-semibold mb-1">
                    {hasBeenDisconnectedTooLong
                      ? 'Connection Lost for Extended Period'
                      : isReconnecting
                      ? 'Reconnecting...'
                      : 'Connection Lost'}
                  </AlertTitle>
                  <AlertDescription className="text-slate-300 text-sm">
                    {hasBeenDisconnectedTooLong ? (
                      <>
                        You've been disconnected for over 5 minutes. What would you like
                        to do?
                      </>
                    ) : (
                      <>
                        Attempting to reconnect{' '}
                        <span className="font-mono text-orange-300">
                          (attempt {connectionState.reconnectAttempts})
                        </span>
                        {' • '}
                        <span className="text-slate-400">
                          Next retry in{' '}
                          {Math.ceil(
                            connectionState.reconnectDelay / 1000 -
                              (timeDisconnected %
                                (connectionState.reconnectDelay / 1000))
                          )}
                          s
                        </span>
                      </>
                    )}
                  </AlertDescription>

                  {!hasBeenDisconnectedTooLong && (
                    <div className="mt-2 w-full max-w-md">
                      <Progress
                        value={reconnectProgress * 100}
                        className="h-1 bg-slate-700"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasBeenDisconnectedTooLong ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRestartBattle}
                      className="border-orange-500/50 text-orange-300 hover:bg-orange-500/10"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restart Battle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onClaimVictory}
                      className="border-green-500/50 text-green-300 hover:bg-green-500/10"
                    >
                      <Trophy className="h-4 w-4 mr-2" />
                      Claim Victory
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onManualReconnect}
                    className="border-orange-500/50 text-orange-300 hover:bg-orange-500/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Now
                  </Button>
                )}
              </div>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// OPPONENT DISCONNECTED WARNING
// ============================================================================

interface OpponentDisconnectedBannerProps {
  opponentName: string;
  isDisconnected: boolean;
  disconnectedDuration: number; // seconds
  onPauseBattle?: () => void;
  onContinue?: () => void;
}

export function OpponentDisconnectedBanner({
  opponentName,
  isDisconnected,
  disconnectedDuration,
  onPauseBattle,
  onContinue,
}: OpponentDisconnectedBannerProps) {
  return (
    <AnimatePresence>
      {isDisconnected && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
        >
          <Alert className="bg-yellow-950/90 border-yellow-500/50 backdrop-blur-lg shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </motion.div>

                <div>
                  <AlertTitle className="text-white font-semibold mb-1">
                    Opponent Disconnected
                  </AlertTitle>
                  <AlertDescription className="text-slate-300 text-sm">
                    <span className="font-semibold text-yellow-300">
                      {opponentName}
                    </span>{' '}
                    has disconnected. Battle is paused.{' '}
                    <span className="text-slate-400">
                      ({Math.floor(disconnectedDuration / 60)}:
                      {String(disconnectedDuration % 60).padStart(2, '0')} elapsed)
                    </span>
                  </AlertDescription>
                </div>
              </div>

              {disconnectedDuration > 60 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onContinue}
                    className="border-green-500/50 text-green-300 hover:bg-green-500/10"
                  >
                    Continue Anyway
                  </Button>
                </div>
              )}
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// CONNECTION QUALITY INDICATOR (SMALL BADGE)
// ============================================================================

interface ConnectionQualityIndicatorProps {
  connectionState: ConnectionState;
  className?: string;
}

export function ConnectionQualityIndicator({
  connectionState,
  className = '',
}: ConnectionQualityIndicatorProps) {
  const getStatusConfig = () => {
    switch (connectionState.status) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Connected',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          pulse: false,
        };
      case 'connecting':
        return {
          icon: RefreshCw,
          text: 'Connecting...',
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          pulse: true,
        };
      case 'reconnecting':
        return {
          icon: RefreshCw,
          text: 'Reconnecting...',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          pulse: true,
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          text: 'Disconnected',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          pulse: true,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <motion.div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.borderColor} ${className}`}
      animate={config.pulse ? { opacity: [1, 0.6, 1] } : {}}
      transition={config.pulse ? { duration: 2, repeat: Infinity } : {}}
    >
      <motion.div
        animate={config.pulse ? { rotate: 360 } : {}}
        transition={
          config.pulse
            ? { duration: 2, repeat: Infinity, ease: 'linear' }
            : {}
        }
      >
        <Icon className={`h-3 w-3 ${config.color}`} />
      </motion.div>
      <span className={`text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
      {connectionState.status === 'reconnecting' && (
        <span className="text-xs text-slate-400">
          ({connectionState.reconnectAttempts})
        </span>
      )}
    </motion.div>
  );
}

// ============================================================================
// SUCCESSFUL RECONNECTION TOAST
// ============================================================================

interface ReconnectionSuccessToastProps {
  show: boolean;
  onDismiss: () => void;
}

export function ReconnectionSuccessToast({
  show,
  onDismiss,
}: ReconnectionSuccessToastProps) {
  useEffect(() => {
    if (show) {
      const timeout = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timeout);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed top-20 right-4 z-50"
        >
          <Alert className="bg-green-950/90 border-green-500/50 backdrop-blur-lg shadow-2xl">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertTitle className="text-white font-semibold">
              Reconnected!
            </AlertTitle>
            <AlertDescription className="text-slate-300 text-sm">
              Connection restored. Battle continues.
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="absolute top-2 right-2 h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
