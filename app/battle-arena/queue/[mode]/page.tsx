'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { createClient } from '@/lib/supabase/client';
import { useQueueRealtime } from '@/hooks/use-battle-realtime';

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

  const { queueUpdate, isConnected } = useQueueRealtime(mode, !!queueId);

  useEffect(() => {
    if (queueUpdate?.type === 'match_found' && queueUpdate.battleId) {
      setBattleId(queueUpdate.battleId);
      setStatus('matched');
      setTimeout(() => {
        router.push(`/battle-arena/room/${queueUpdate.battleId}`);
      }, 2000);
    }
  }, [queueUpdate, router]);

  // Queue timeout after 2 minutes
  useEffect(() => {
    const timeoutTimer = setTimeout(() => {
      if (status === 'queuing') {
        setStatus('timeout');
      }
    }, 120000);

    return () => clearTimeout(timeoutTimer);
  }, [status]);

  // Queue timer
  useEffect(() => {
    const timer = setInterval(() => {
      setQueueTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Join queue on mount
  useEffect(() => {
    const joinQueue = async () => {
      try {
        const response = await fetch('/api/arena/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode }),
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
      const supabase = createClient();
      const { data: battle, error } = await supabase
        .from('battles')
        .insert({
          mode: mode,
          status: 'active',
        })
        .select()
        .single();

      if (!error && battle) {
        router.push(`/battle-arena/room/${battle.id}`);
      } else {
        setErrorMessage('Failed to create bot match. Please try again.');
      }
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
    <main className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='w-full max-w-md p-8'>
        {status === 'queuing' && (
          <div className='text-center space-y-4'>
            <Spinner className='mx-auto' />
            <h2 className='text-2xl font-bold'>Finding Opponent...</h2>
            <p className='text-muted-foreground'>
              Queue time: {formatTime(queueTime)}
            </p>
            <p className='text-xs text-muted-foreground'>
              {isConnected ? 'Connected' : 'Connecting...'}
            </p>
            <Button variant='outline' onClick={handleLeaveQueue}>
              Leave Queue
            </Button>
          </div>
        )}

        {status === 'matched' && (
          <div className='text-center space-y-4'>
            <div className='text-4xl'>🎉</div>
            <h2 className='text-2xl font-bold'>Match Found!</h2>
            <p className='text-muted-foreground'>
              Redirecting to battle room...
            </p>
          </div>
        )}

        {status === 'timeout' && (
          <div className='text-center space-y-4'>
            <div className='text-4xl'>⏱️</div>
            <h2 className='text-2xl font-bold'>No Opponent Found</h2>
            <p className='text-muted-foreground'>
              Would you like to practice with a bot or rejoin the queue?
            </p>
            <div className='flex gap-2'>
              <Button onClick={handlePlayBot} className='flex-1'>
                Play vs Bot
              </Button>
              <Button
                variant='outline'
                onClick={handleRejoinQueue}
                className='flex-1 bg-transparent'
              >
                Rejoin Queue
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className='text-center space-y-4'>
            <div className='text-4xl'>❌</div>
            <h2 className='text-2xl font-bold'>Queue Error</h2>
            <p className='text-muted-foreground'>
              {errorMessage || 'Unable to join queue. Please try again.'}
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        )}
      </Card>
    </main>
  );
}
