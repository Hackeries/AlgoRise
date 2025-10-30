'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock,
  Trophy,
  Code,
  Users,
  Target,
  Flame,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeEditor from './code-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BattleRoomProps {
  battleId: string;
  userId: string;
}

interface Battle {
  id: string;
  status: string;
  format: string;
  host_user_id: string;
  guest_user_id: string;
  current_round: number;
  winner_user_id?: string;
  started_at?: string;
  ended_at?: string;
}

interface Round {
  id: string;
  round_number: number;
  problem_id: string;
  title: string;
  rating: number;
  contest_id_cf?: number;
  index_cf?: string;
  winner_user_id?: string;
  started_at?: string;
  ended_at?: string;
}

interface Submission {
  id: string;
  user_id: string;
  status: string;
  execution_time_ms?: number;
  memory_kb?: number;
  submitted_at: string;
}

export default function BattleRoom({ battleId, userId }: BattleRoomProps) {
  const [battle, setBattle] = useState<Battle | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  // Load battle data
  useEffect(() => {
    loadBattleData();
    
    // Set up real-time subscriptions
    const channel = supabase
      .channel(`battle:${battleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battles',
          filter: `id=eq.${battleId}`
        },
        (payload) => {
          console.log('Battle updated:', payload);
          loadBattleData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_rounds',
          filter: `battle_id=eq.${battleId}`
        },
        (payload) => {
          console.log('Round updated:', payload);
          loadBattleData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'battle_submissions',
          filter: `battle_id=eq.${battleId}`
        },
        (payload) => {
          console.log('Submission updated:', payload);
          loadSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [battleId]);

  // Timer effect
  useEffect(() => {
    if (!currentRound || !currentRound.started_at || currentRound.ended_at) {
      return;
    }

    const interval = setInterval(() => {
      const startTime = new Date(currentRound.started_at!).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const maxTime = 1800; // 30 minutes max per round
      const remaining = Math.max(0, maxTime - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        toast({
          title: 'Time\'s up!',
          description: 'Round time limit reached',
          variant: 'destructive'
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRound]);

  const loadBattleData = async () => {
    try {
      const { data, error } = await supabase
        .from('battles')
        .select(`
          *,
          battle_rounds(*)
        `)
        .eq('id', battleId)
        .single();

      if (error) {
        console.error('Error loading battle:', error);
        toast({
          title: 'Error',
          description: 'Failed to load battle data',
          variant: 'destructive'
        });
        return;
      }

      setBattle(data);
      
      // Find current round
      if (data.battle_rounds && data.battle_rounds.length > 0) {
        const activeRound = data.battle_rounds.find(
          (r: Round) => !r.ended_at
        ) || data.battle_rounds[data.battle_rounds.length - 1];
        setCurrentRound(activeRound);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading battle data:', error);
      setIsLoading(false);
    }
  };

  const loadSubmissions = async () => {
    if (!currentRound) return;

    try {
      const { data, error } = await supabase
        .from('battle_submissions')
        .select('*')
        .eq('round_id', currentRound.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error loading submissions:', error);
        return;
      }

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const handleSubmitCode = async (code: string, language: string) => {
    if (!currentRound) {
      toast({
        title: 'No active round',
        description: 'Cannot submit code at this time',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(`/api/battles/${battleId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roundId: currentRound.id,
          code,
          language
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Submitted!',
          description: 'Your solution is being judged...'
        });
        loadSubmissions();
      } else {
        toast({
          title: 'Submission failed',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit code',
        variant: 'destructive'
      });
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solved':
        return 'bg-green-500';
      case 'failed':
      case 'wrong_answer':
        return 'bg-red-500';
      case 'pending':
      case 'compiling':
      case 'running':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!battle || !currentRound) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950">
        <Trophy className="w-16 h-16 text-slate-500 mb-4" />
        <p className="text-slate-400">Battle not found or no active round</p>
        <Button 
          onClick={() => router.push('/battle-arena')}
          className="mt-4"
        >
          Back to Arena
        </Button>
      </div>
    );
  }

  const opponentId = battle.host_user_id === userId 
    ? battle.guest_user_id 
    : battle.host_user_id;

  const userSubmissions = submissions.filter(s => s.user_id === userId);
  const opponentSubmissions = submissions.filter(s => s.user_id === opponentId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-4">
      <div className="max-w-[1800px] mx-auto">
        {/* Battle Header */}
        <Card className="mb-4 bg-slate-900/50 border-slate-700 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <CardTitle className="text-2xl">
                    Battle Arena - Round {currentRound.round_number}
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-blue-400 border-blue-500">
                  {battle.format.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-xs text-slate-400">Time Remaining</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Battle View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel - Problem & Info */}
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg">Problem</CardTitle>
                <Badge className={`${currentRound.rating < 1200 ? 'bg-green-500' : currentRound.rating < 1600 ? 'bg-cyan-500' : currentRound.rating < 2000 ? 'bg-blue-500' : 'bg-purple-500'}`}>
                  {currentRound.rating}
                </Badge>
              </div>
              <CardDescription className="text-xl font-semibold text-slate-100">
                {currentRound.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentRound.contest_id_cf && currentRound.index_cf && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(
                    `https://codeforces.com/problemset/problem/${currentRound.contest_id_cf}/${currentRound.index_cf}`,
                    '_blank'
                  )}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Problem on Codeforces
                </Button>
              )}

              <Separator />

              {/* Scoreboard */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Scoreboard
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
                    <span>You</span>
                    <div className="flex items-center gap-2">
                      {userSubmissions.length > 0 && (
                        <Badge className={getStatusColor(userSubmissions[0].status)}>
                          {userSubmissions[0].status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
                    <span>Opponent</span>
                    <div className="flex items-center gap-2">
                      {opponentSubmissions.length > 0 && (
                        <Badge className={getStatusColor(opponentSubmissions[0].status)}>
                          {opponentSubmissions[0].status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Submissions */}
              <div>
                <h3 className="font-semibold mb-3">Your Submissions</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {userSubmissions.length === 0 ? (
                    <p className="text-sm text-slate-400">No submissions yet</p>
                  ) : (
                    userSubmissions.map((sub) => (
                      <div key={sub.id} className="p-2 bg-slate-800 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusColor(sub.status)} variant="outline">
                            {sub.status}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {new Date(sub.submitted_at).toLocaleTimeString()}
                          </span>
                        </div>
                        {sub.execution_time_ms && (
                          <div className="text-xs text-slate-400 mt-1">
                            {sub.execution_time_ms}ms | {sub.memory_kb}KB
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Center Panel - Code Editor */}
          <div className="lg:col-span-2">
            <CodeEditor
              battleId={battleId}
              roundId={currentRound.id}
              onSubmit={handleSubmitCode}
              showSubmitButton={!currentRound.ended_at}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
