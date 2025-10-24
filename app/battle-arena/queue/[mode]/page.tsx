'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useQueueRealtime } from '@/hooks/use-battle-realtime';
import { motion } from 'framer-motion';
import { Clock, Zap, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

export default async function QueuePage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;

  return <QueuePageClient mode={mode as '1v1' | '3v3'} />;
}

function QueuePageClient({ mode }: { mode: '1v1' | '3v3' }) {
  const router = useRouter();
  const [status, setStatus] = useState<
    'queuing' | 'matched' | 'error' | 'timeout'
  >('queuing');
  const [queueTime, setQueueTime] = useState(0);
  const [battleId, setBattleId] = useState<string | null>(null);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [estimatedWait, setEstimatedWait] = useState<number | null>(null);
  const [canPlayBot, setCanPlayBot] = useState(false);

  const { queueUpdate, isConnected } = useQueueRealtime(mode, !!queueId);

  useEffect(() => {
    if (queueUpdate?.type === 'queue_size' && typeof queueUpdate.queueSize === 'number') {
      const estimate = Math.max(5, 5 + Math.floor(queueUpdate.queueSize / 5) * 2);
      setEstimatedWait(estimate);
      // If only me (1) or empty (0), allow Play vs Bot
      setCanPlayBot((queueUpdate.queueSize || 0) <= 1);
    }
  }, [queueUpdate]);

  useEffect(() => {
    if (queueUpdate?.type === 'match_found' && queueUpdate.battleId) {
      setBattleId(queueUpdate.battleId);
      setStatus('matched');
      setTimeout(() => {
        router.push(`/battle-arena/room/${queueUpdate.battleId}`);
      }, 2000);
    }
  }, [queueUpdate, router]);

  useEffect(() => {
    const timeoutTimer = setTimeout(() => {
      if (status === 'queuing') {
        setStatus('timeout');
      }
    }, 60000);

    return () => clearTimeout(timeoutTimer);
  }, [status]);

  useEffect(() => {
    const timer = setInterval(() => {
      setQueueTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const joinQueue = async () => {
      try {
        const response = await fetch('/api/arena/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode, teamId: new URLSearchParams(window.location.search).get('teamId') }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 409) {
            setErrorMessage(
              "You're already in the queue. Please wait for a match or leave the queue first."
            );
          } else if (response.status === 401) {
            setErrorMessage('Please sign in to join the queue.');
          } else {
            setErrorMessage(
              data.error || 'Unable to join queue. Please try again.'
            );
          }
          setStatus('error');
          return;
        }

        setQueueId(data.queueId);

        if (data.match) {
          setBattleId(data.match.battleId);
          setStatus('matched');
          setTimeout(() => {
            router.push(`/battle-arena/room/${data.match.battleId}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Queue error:', error);
        setErrorMessage(
          'Connection error. Please check your internet and try again.'
        );
        setStatus('error');
      }
    };

    joinQueue();
  }, [mode, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const floatVariants = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut' as const,
      },
    },
  };

  const handleLeaveQueue = async () => {
    try {
      await fetch('/api/arena/queue', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      router.back();
    } catch (error) {
      console.error('Error leaving queue:', error);
      setErrorMessage('Failed to leave queue. Please try again.');
    }
  };

  const handlePlayBot = async () => {
    try {
      const response = await fetch('/api/arena/bot-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Bot match failed');
      router.push(`/battle-arena/room/${data.battleId}`);
    } catch (error) {
      console.error('Bot match error:', error);
      setErrorMessage('Failed to create bot match. Please try again.');
    }
  };

  const handleRejoinQueue = async () => {
    setStatus('queuing');
    setQueueTime(0);
    setErrorMessage('');

    try {
      const response = await fetch('/api/arena/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.error || 'Failed to rejoin queue. Please try again.'
        );
        setStatus('error');
        return;
      }

      setQueueId(data.queueId);

      if (data.match) {
        setBattleId(data.match.battleId);
        setStatus('matched');
        setTimeout(() => {
          router.push(`/battle-arena/room/${data.match.battleId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Rejoin queue error:', error);
      setErrorMessage('Connection error. Please try again.');
      setStatus('error');
    }
  };

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden'>
      <motion.div
        className='absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl'
        animate={{ x: [0, 30, 0], y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className='absolute bottom-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl'
        animate={{ x: [0, -30, 0], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md relative z-10'
      >
        <Card className='p-8 bg-gradient-to-br from-slate-900/80 to-blue-900/80 border border-blue-500/30 backdrop-blur-sm shadow-2xl shadow-blue-500/20'>
          {status === 'queuing' && (
            <motion.div
              className='text-center space-y-6'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className='flex justify-center'
                variants={floatVariants}
                animate='float'
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'linear',
                  }}
                  className='relative'
                >
                  <div className='w-20 h-20 rounded-full border-4 border-blue-500/30 border-t-blue-400 border-r-cyan-400' />
                  <motion.div
                    className='absolute inset-0 rounded-full border-4 border-transparent border-b-purple-400'
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'linear',
                    }}
                  />
                </motion.div>
              </motion.div>

              <div>
                <motion.h2
                  className='text-3xl md:text-4xl font-bold text-white mb-2'
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  {mode === '1v1'
                    ? 'Finding Opponent...'
                    : 'Assembling Teams...'}
                </motion.h2>
                <p className='text-blue-200 text-base md:text-lg'>
                  {mode === '1v1'
                    ? 'Searching for a worthy challenger in the arena'
                    : 'Gathering the best players for your team'}
                </p>
              </div>

              <motion.div
                className='flex items-center justify-center gap-3 text-3xl font-mono font-bold'
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'linear',
                  }}
                >
                  <Clock className='w-8 h-8 text-cyan-400' />
                </motion.div>
                <span className='bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>
                  {formatTime(queueTime)}
                </span>
              </motion.div>

              <div className='grid grid-cols-2 gap-3'>
                <motion.div
                  className='p-4 bg-blue-900/30 rounded-lg border border-blue-500/20 backdrop-blur-sm'
                  whileHover={{ scale: 1.05, borderColor: 'rgb(96, 165, 250)' }}
                >
                  <div className='flex items-center gap-2 mb-2'>
                    <Zap className='w-4 h-4 text-yellow-400' />
                    <p className='text-xs text-blue-300/70'>Est. Wait</p>
                  </div>
                  <p className='font-semibold text-white text-lg'>
                    {estimatedWait !== null ? `${estimatedWait}s` : '—'}
                  </p>
                </motion.div>
                <motion.div
                  className='p-4 bg-purple-900/30 rounded-lg border border-purple-500/20 backdrop-blur-sm'
                  whileHover={{ scale: 1.05, borderColor: 'rgb(168, 85, 247)' }}
                >
                  <div className='flex items-center gap-2 mb-2'>
                    <Users className='w-4 h-4 text-pink-400' />
                    <p className='text-xs text-purple-300/70'>In Queue</p>
                  </div>
                  <p className='font-semibold text-white text-lg'>
                    {queueUpdate?.type === 'queue_size' && typeof queueUpdate.queueSize === 'number' ? queueUpdate.queueSize : '—'}
                  </p>
                </motion.div>
              </div>

              {canPlayBot && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button
                    onClick={handlePlayBot}
                    className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-300'
                  >
                    Play vs Bot
                  </Button>
                </motion.div>
              )}

              <motion.div
                className='p-3 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg border border-blue-500/20 backdrop-blur-sm'
                animate={{
                  borderColor: isConnected
                    ? 'rgb(34, 197, 94)'
                    : 'rgb(239, 68, 68)',
                }}
              >
                <p className='text-xs text-blue-300 flex items-center justify-center gap-2'>
                  <motion.div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-400' : 'bg-red-400'
                    }`}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                  {isConnected ? 'Connected to Arena' : 'Connecting...'}
                </p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant='outline'
                  onClick={handleLeaveQueue}
                  className='w-full border-red-500/50 text-red-300 hover:bg-red-900/20 hover:border-red-400 transition-all duration-300 bg-transparent'
                >
                  Leave Queue
                </Button>
              </motion.div>
            </motion.div>
          )}

          {status === 'matched' && (
            <motion.div
              className='text-center space-y-6'
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
                className='text-6xl'
              >
                ⚡
              </motion.div>

              <div>
                <motion.h2
                  className='text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-2'
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 0.5,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                >
                  Match Found!
                </motion.h2>
                <p className='text-blue-200'>Preparing battle arena...</p>
              </div>

              <div className='space-y-2'>
                <motion.div
                  className='h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 rounded-full'
                  animate={{ scaleX: [0, 1] }}
                  transition={{ duration: 2 }}
                />
                <p className='text-xs text-blue-300/70'>
                  Redirecting in 2 seconds...
                </p>
              </div>

              <motion.div
                className='p-4 bg-gradient-to-br from-green-900/30 to-cyan-900/30 rounded-lg border border-green-500/20'
                animate={{
                  borderColor: [
                    'rgb(34, 197, 94)',
                    'rgb(34, 211, 238)',
                    'rgb(34, 197, 94)',
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <div className='flex items-center justify-center gap-2 text-green-300'>
                  <CheckCircle2 className='w-5 h-5' />
                  <span className='font-semibold'>Opponent ready</span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {status === 'timeout' && (
            <motion.div
              className='text-center space-y-4'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                className='text-5xl'
              >
                ⏱️
              </motion.div>
              <div>
                <h2 className='text-2xl font-bold text-white mb-1'>
                  No Opponent Found
                </h2>
                <p className='text-blue-200 text-sm'>
                  Would you like to practice with a bot or rejoin the queue?
                </p>
              </div>
              <div className='flex gap-3 pt-4'>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1'
                >
                  <Button
                    onClick={handlePlayBot}
                    className='w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all duration-300'
                  >
                    Play vs Bot
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1'
                >
                  <Button
                    variant='outline'
                    onClick={handleRejoinQueue}
                    className='w-full border-blue-500/50 text-blue-300 hover:bg-blue-900/20 hover:border-blue-400 transition-all duration-300 bg-transparent'
                  >
                    Rejoin Queue
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              className='text-center space-y-4'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                className='text-5xl'
              >
                ⚠️
              </motion.div>
              <div>
                <h2 className='text-2xl font-bold text-white mb-1'>
                  Queue Error
                </h2>
                <div className='flex items-start gap-2 p-3 bg-red-900/30 rounded-lg border border-red-500/20 mb-4'>
                  <AlertCircle className='w-5 h-5 text-red-400 flex-shrink-0 mt-0.5' />
                  <p className='text-red-300 text-sm text-left'>
                    {errorMessage || 'Unable to join queue. Please try again.'}
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => router.back()}
                  className='w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold transition-all duration-300'
                >
                  Go Back
                </Button>
              </motion.div>
            </motion.div>
          )}
        </Card>
      </motion.div>
    </main>
  );
}