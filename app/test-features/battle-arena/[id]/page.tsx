// Battle room page for active battles

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { RealTimeNotificationManager } from '@/lib/realtime-notifications';
import {
  Sword,
  Users,
  Trophy,
  Clock,
  Zap,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  Code,
  Terminal,
  Crown,
  Timer,
} from 'lucide-react';

export default function BattleRoomPage({ params }: { params: { id: string } }) {
  const battleId = params.id;
  const [battle, setBattle] = useState<any>(null);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [userRole, setUserRole] = useState<'host' | 'guest' | 'spectator'>(
    'spectator'
  );
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [opponentStatus, setOpponentStatus] = useState('waiting'); // waiting, coding, submitted
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch battle details and set up real-time listeners
  useEffect(() => {
    fetchBattleDetails();
    setupRealTimeListeners();

    // Clean up
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [battleId]);

  const fetchBattleDetails = async () => {
    try {
      const response = await fetch(`/api/battles/${battleId}`);
      const result = await response.json();

      if (result.battle) {
        setBattle(result.battle);

        // Find current round
        const rounds = result.battle.battle_rounds || [];
        const current =
          rounds.find((r: any) => !r.ended_at) || rounds[rounds.length - 1];
        setCurrentRound(current);

        // Set timer if round is active
        if (current && !current.ended_at) {
          const duration = current.duration_seconds || 3600;
          setTimeLeft(duration);

          // Start timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error fetching battle details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load battle details',
        variant: 'destructive',
      });
    }
  };

  const setupRealTimeListeners = () => {
    // In a real implementation, you would set up Supabase real-time listeners
    // or use the RealTimeNotificationManager to receive updates
    console.log('Setting up real-time listeners for battle:', battleId);
  };

  const startBattle = async () => {
    try {
      const response = await fetch(`/api/battles/${battleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Battle Started',
          description: 'The battle has begun! Good luck!',
        });
        fetchBattleDetails();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error starting battle:', error);
      toast({
        title: 'Error',
        description: 'Failed to start battle',
        variant: 'destructive',
      });
    }
  };

  const submitSolution = async () => {
    if (!currentRound || !code.trim()) {
      toast({
        title: 'Error',
        description: 'Please write some code before submitting',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/battles/${battleId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roundId: currentRound.id,
          codeText: code,
          language,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Solution Submitted',
          description: 'Your solution has been submitted for judging.',
        });
        setCode('');
        setOpponentStatus('submitted');
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit solution',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getParticipant = (userId: string) => {
    return battle?.battle_participants?.find((p: any) => p.user_id === userId);
  };

  const getOpponent = () => {
    return null; // Simplified for now
  };

  const getUserParticipant = () => {
    return null; // Simplified for now
  };

  const opponent = getOpponent();
  const userParticipant = getUserParticipant();

  if (!battle) {
    return (
      <div className='container py-8 flex items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='container py-8'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <Sword className='h-6 w-6 text-blue-500' />
            Battle Arena
          </h1>
          <p className='text-muted-foreground'>
            {battle.format.replace('_', ' ').toUpperCase()} Battle
          </p>
        </div>

        <div className='mt-4 md:mt-0 flex items-center gap-4'>
          <Badge
            variant={
              battle.status === 'completed'
                ? 'default'
                : battle.status === 'in_progress'
                ? 'secondary'
                : 'outline'
            }
          >
            {battle.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Left column - Participants and info */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center'>
                    H
                  </div>
                  <div>
                    <div className='font-medium'>Host Player</div>
                    <div className='text-sm text-muted-foreground'>
                      Rating:{' '}
                      {getParticipant(battle.host_user_id)?.rating_before ||
                        1200}
                    </div>
                  </div>
                </div>
                {battle.winner_user_id === battle.host_user_id && (
                  <Crown className='h-5 w-5 text-yellow-500' />
                )}
              </div>

              <div className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='bg-secondary text-secondary-foreground rounded-full w-8 h-8 flex items-center justify-center'>
                    G
                  </div>
                  <div>
                    <div className='font-medium'>Guest Player</div>
                    <div className='text-sm text-muted-foreground'>
                      Rating:{' '}
                      {getParticipant(battle.guest_user_id)?.rating_before ||
                        1200}
                    </div>
                  </div>
                </div>
                {battle.winner_user_id === battle.guest_user_id && (
                  <Crown className='h-5 w-5 text-yellow-500' />
                )}
              </div>
            </CardContent>
          </Card>

          {currentRound && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Zap className='h-5 w-5' />
                  Current Round
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span>Round:</span>
                  <Badge>{currentRound.round_number}</Badge>
                </div>

                <div className='flex items-center justify-between'>
                  <span>Problem:</span>
                  <span className='font-medium'>{currentRound.title}</span>
                </div>

                <div className='flex items-center justify-between'>
                  <span>Rating:</span>
                  <Badge variant='secondary'>{currentRound.rating}</Badge>
                </div>

                <Separator />

                <div className='flex items-center justify-between'>
                  <span>Time Left:</span>
                  <div className='flex items-center gap-2'>
                    <Timer className='h-4 w-4' />
                    <span
                      className={`font-mono ${
                        timeLeft < 300 ? 'text-red-500' : ''
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Center column - Code editor */}
        <div className='lg:col-span-2 space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Code className='h-5 w-5' />
                Code Editor
              </CardTitle>
              <CardDescription>
                Write and submit your solution for the current problem
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h3 className='font-medium'>
                    {currentRound?.title || 'Problem Title'}
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Rating: {currentRound?.rating || 1200}
                  </p>
                </div>

                <div className='flex items-center gap-2'>
                  <Label htmlFor='language'>Language:</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className='w-32'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='cpp'>C++</SelectItem>
                      <SelectItem value='c'>C</SelectItem>
                      <SelectItem value='java'>Java</SelectItem>
                      <SelectItem value='python'>Python</SelectItem>
                      <SelectItem value='javascript'>JavaScript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder={`// Write your ${language} solution here\n// Implement the solution for ${
                  currentRound?.title || 'the problem'
                }\n\n`}
                className='min-h-[400px] font-mono'
                disabled={battle.status !== 'in_progress' || isSubmitting}
              />

              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  {opponentStatus === 'submitted' && (
                    <Badge
                      variant='secondary'
                      className='flex items-center gap-1'
                    >
                      <CheckCircle className='h-3 w-3' />
                      Opponent Submitted
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={submitSolution}
                  disabled={
                    battle.status !== 'in_progress' ||
                    isSubmitting ||
                    !code.trim() ||
                    !!currentRound?.winner_user_id
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Terminal className='h-4 w-4 mr-2' />
                      Submit Solution
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Submission status */}
          {currentRound?.winner_user_id && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  {currentRound.winner_user_id === 'user' ? (
                    <>
                      <CheckCircle className='h-5 w-5 text-green-500' />
                      Round Won!
                    </>
                  ) : (
                    <>
                      <XCircle className='h-5 w-5 text-red-500' />
                      Round Lost
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {currentRound.winner_user_id === 'user'
                    ? 'Congratulations! You won this round.'
                    : 'Your opponent won this round.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
