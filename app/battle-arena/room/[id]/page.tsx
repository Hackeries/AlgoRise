'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBattleRealtime, useTeamChat } from '@/hooks/use-battle-realtime';

interface BattleRoom {
  battle: any;
  teams: any[];
  submissions: any[];
}

export default function BattleRoomPage({ params }: { params: { id: string } }) {
  const [room, setRoom] = useState<BattleRoom | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [selectedProblem, setSelectedProblem] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { battleUpdate, isConnected } = useBattleRealtime(params.id);
  const { messages, sendMessage } = useTeamChat(
    params.id,
    room?.teams[0]?.id || '',
    room?.battle?.mode === '3v3'
  );

  useEffect(() => {
    if (battleUpdate?.type === 'scoreboard_update' && battleUpdate.scoreboard) {
      setRoom(prev =>
        prev ? { ...prev, teams: battleUpdate.scoreboard || [] } : null
      );
    }
    if (battleUpdate?.type === 'submission') {
      // Refresh submissions
      fetchRoom();
    }
  }, [battleUpdate]);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/arena/room/${params.id}`);
      const data = await response.json();
      setRoom(data);
    } catch (error) {
      console.error('[v0] Error fetching room:', error);
    }
  };

  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
  }, [params.id]);

  const handleSubmit = async () => {
    if (!code || !selectedProblem) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/arena/room/${params.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          problemId: selectedProblem,
        }),
      });

      const data = await response.json();
      console.log('[v0] Submission result:', data);
      setCode('');
    } catch (error) {
      console.error('[v0] Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!room) {
    return <div className='p-8'>Loading...</div>;
  }

  return (
    <main className='min-h-screen bg-background p-4 md:p-8'>
      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Problems Panel */}
        <div className='lg:col-span-1'>
          <Card className='p-4 mb-4 bg-muted'>
            <p className='text-xs text-muted-foreground'>
              {isConnected ? '✓ Connected' : '⚠ Connecting...'}
            </p>
          </Card>
          <Card className='p-4'>
            <h3 className='font-bold mb-4'>Problems</h3>
            <div className='space-y-2'>
              {[1, 2, 3].map(i => (
                <button
                  key={i}
                  onClick={() => setSelectedProblem(`problem-${i}`)}
                  className={`w-full p-3 text-left rounded border transition ${
                    selectedProblem === `problem-${i}`
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  Problem {i}
                </button>
              ))}
            </div>
          </Card>

          {/* Scoreboard */}
          <Card className='p-4 mt-4'>
            <h3 className='font-bold mb-4'>Scoreboard</h3>
            <div className='space-y-2'>
              {room.teams.map((team: any) => (
                <div key={team.id} className='p-3 bg-muted rounded'>
                  <p className='font-semibold'>{team.team_name}</p>
                  <p className='text-sm text-muted-foreground'>
                    Score: {team.score} | Penalty: {team.penalty_time}m
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Editor Panel */}
        <div className='lg:col-span-2'>
          <Card className='p-4'>
            <Tabs defaultValue='editor' className='w-full'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='editor'>Editor</TabsTrigger>
                <TabsTrigger value='submissions'>Submissions</TabsTrigger>
              </TabsList>

              <TabsContent value='editor' className='space-y-4'>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='cpp'>C++</SelectItem>
                    <SelectItem value='python'>Python</SelectItem>
                    <SelectItem value='java'>Java</SelectItem>
                    <SelectItem value='javascript'>JavaScript</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder='Write your code here...'
                  className='font-mono h-96'
                />

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !code || !selectedProblem}
                  className='w-full'
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </TabsContent>

              <TabsContent value='submissions' className='space-y-2'>
                {room.submissions.map((sub: any) => (
                  <div key={sub.id} className='p-3 bg-muted rounded'>
                    <p className='text-sm font-semibold'>
                      Problem {sub.problem_id} - {sub.verdict}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {new Date(sub.submitted_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </main>
  );
}
