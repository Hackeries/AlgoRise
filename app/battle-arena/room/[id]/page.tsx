'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy } from 'lucide-react';
import { useBattleRealtime } from '@/hooks/use-battle-realtime';
import { CodeEditor } from '@/components/battle-arena/code-editor';
import { ProblemDetails } from '@/components/battle-arena/problem-details';
import { SubmissionsList } from '@/components/battle-arena/submissions-list';

interface BattleRoomData {
  battle: any;
  problems: any[];
  teams: any[];
  submissions: any[];
}

export default function BattleRoomPage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<BattleRoomData | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3600);

  const { battleUpdate, isConnected } = useBattleRealtime(params.id);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/arena/room/${params.id}`);
        const data = await response.json();
        setRoom(data);
        if (data.problems?.length > 0) {
          setSelectedProblemId(data.problems[0].id);
        }
      } catch (error) {
        console.error('Error fetching room:', error);
      }
    };

    fetchRoom();
    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
  }, [params.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (battleUpdate?.type === 'submission') {
      const fetchRoom = async () => {
        const response = await fetch(`/api/arena/room/${params.id}`);
        const data = await response.json();
        setRoom(data);
      };
      fetchRoom();
    }
  }, [battleUpdate, params.id]);

  const handleSubmit = async () => {
    if (!code || !selectedProblemId) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/arena/room/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problemId: selectedProblemId,
        }),
      });

      if (response.ok) {
        setCode('');
        // Refresh submissions
        const roomResponse = await fetch(`/api/arena/room/${params.id}`);
        const data = await roomResponse.json();
        setRoom(data);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedProblem = room?.problems?.find(p => p.id === selectedProblemId);

  if (!room) {
    return <div className='p-8 text-center'>Loading battle room...</div>;
  }

  return (
    <main className='min-h-screen bg-background'>
      {/* Top Bar */}
      <div className='border-b border-border bg-card p-4 flex items-center justify-between sticky top-0 z-10'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Clock className='w-5 h-5 text-primary' />
            <span className='font-mono text-lg font-bold'>
              {formatTime(timeRemaining)}
            </span>
          </div>
          <Badge variant='outline'>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Badge>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm'>
            Pause
          </Button>
          <Button variant='destructive' size='sm'>
            Surrender
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 h-[calc(100vh-80px)]'>
        {/* Left: Problems */}
        <div className='lg:col-span-1 flex flex-col gap-4 overflow-hidden'>
          <Card className='flex-1 p-4 overflow-y-auto'>
            <h3 className='font-bold mb-3'>Problems</h3>
            <div className='space-y-2'>
              {room.problems.map((problem, idx) => (
                <button
                  key={problem.id}
                  onClick={() => setSelectedProblemId(problem.id)}
                  className={`w-full p-3 text-left rounded-lg border transition ${
                    selectedProblemId === problem.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <p className='font-semibold'>
                    {String.fromCharCode(65 + idx)}. {problem.name}
                  </p>
                  <p className='text-xs opacity-75'>
                    Rating: {problem.rating || 'N/A'}
                  </p>
                </button>
              ))}
            </div>
          </Card>

          {/* Scoreboard */}
          <Card className='flex-1 p-4 overflow-y-auto'>
            <h3 className='font-bold mb-3 flex items-center gap-2'>
              <Trophy className='w-4 h-4' />
              Scoreboard
            </h3>
            <div className='space-y-2'>
              {room.teams.map((team: any) => (
                <div key={team.id} className='p-3 bg-muted rounded-lg'>
                  <p className='font-semibold text-sm'>{team.team_name}</p>
                  <p className='text-xs text-muted-foreground'>
                    Score: {team.score} | Penalty: {team.penalty_time}m
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Middle: Problem Details */}
        <div className='lg:col-span-1 overflow-hidden'>
          <Card className='h-full p-4 overflow-y-auto'>
            <ProblemDetails problem={selectedProblem} />
          </Card>
        </div>

        {/* Right: Editor & Submissions */}
        <div className='lg:col-span-2 flex flex-col gap-4 overflow-hidden'>
          <Card className='flex-1 p-4 flex flex-col overflow-hidden'>
            <Tabs
              defaultValue='editor'
              className='flex-1 flex flex-col overflow-hidden'
            >
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='editor'>Editor</TabsTrigger>
                <TabsTrigger value='submissions'>Submissions</TabsTrigger>
              </TabsList>

              <TabsContent value='editor' className='flex-1 overflow-hidden'>
                <CodeEditor
                  language={language}
                  onLanguageChange={setLanguage}
                  code={code}
                  onCodeChange={setCode}
                  onSubmit={handleSubmit}
                  isSubmitting={submitting}
                />
              </TabsContent>

              <TabsContent
                value='submissions'
                className='flex-1 overflow-hidden'
              >
                <SubmissionsList submissions={room.submissions} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </main>
  );
}
