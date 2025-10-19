'use client';

import { useState, useEffect } from 'react';
import { useBattleRealtime, useTeamChat } from '@/hooks/use-battle-realtime';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, Send } from 'lucide-react';

interface BattleRoomProps {
  battleId: string;
  teamId: string;
  mode: '1v1' | '3v3';
  isBot?: boolean;
}

export function BattleRoom({
  battleId,
  teamId,
  mode,
  isBot = false,
}: BattleRoomProps) {
  const { battleUpdate, isConnected } = useBattleRealtime(battleId);
  const { messages, sendMessage } = useTeamChat(
    battleId,
    teamId,
    mode === '3v3'
  );
  const [timeRemaining, setTimeRemaining] = useState(3600); // 1 hour
  const [chatInput, setChatInput] = useState('');
  const [scoreboard, setScoreboard] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update scoreboard from realtime
  useEffect(() => {
    if (battleUpdate?.type === 'scoreboard_update' && battleUpdate.scoreboard) {
      setScoreboard(battleUpdate.scoreboard);
    }
  }, [battleUpdate]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (chatInput.trim()) {
      await sendMessage(chatInput);
      setChatInput('');
    }
  };

  return (
    <div className='h-screen flex flex-col bg-background'>
      {/* Top Bar */}
      <div className='border-b border-border bg-card p-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <Clock className='w-5 h-5 text-primary' />
            <span className='font-mono text-lg font-bold'>
              {formatTime(timeRemaining)}
            </span>
          </div>
          {!isBot && (
            <Badge variant='outline' className='ml-4'>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Badge>
          )}
          {isBot && <Badge variant='secondary'>vs Bot</Badge>}
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
      <div className='flex-1 flex overflow-hidden'>
        {/* Left: Problems */}
        <div className='w-1/3 border-r border-border overflow-y-auto p-4 space-y-3'>
          <h3 className='font-bold text-lg'>Problems</h3>
          {problems.length === 0 ? (
            <div className='text-center text-muted-foreground py-8'>
              <p>Loading problems...</p>
            </div>
          ) : (
            problems.map((problem, idx) => (
              <Card
                key={idx}
                className='p-3 cursor-pointer hover:bg-accent transition'
              >
                <div className='flex items-start justify-between'>
                  <div>
                    <p className='font-semibold'>
                      {String.fromCharCode(65 + idx)}. {problem.name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Rating: {problem.rating}
                    </p>
                  </div>
                  {problem.solved && (
                    <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs'>
                      ✓
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Right: Editor & Chat */}
        <div className='flex-1 flex flex-col'>
          <Tabs defaultValue='editor' className='flex-1 flex flex-col'>
            <TabsList className='w-full rounded-none border-b border-border'>
              <TabsTrigger value='editor'>Editor</TabsTrigger>
              {mode === '3v3' && (
                <TabsTrigger value='chat'>Team Chat</TabsTrigger>
              )}
              <TabsTrigger value='scoreboard'>Scoreboard</TabsTrigger>
            </TabsList>

            {/* Editor Tab */}
            <TabsContent value='editor' className='flex-1 flex flex-col p-4'>
              <div className='flex-1 bg-muted rounded-lg p-4 font-mono text-sm mb-4 overflow-auto'>
                <div className='text-muted-foreground'>
                  <div>// Write your solution here</div>
                  <div>#include &lt;bits/stdc++.h&gt;</div>
                  <div>using namespace std;</div>
                  <div>&nbsp;</div>
                  <div>int main() {'{}'}</div>
                </div>
              </div>
              <div className='flex gap-2'>
                <select className='px-3 py-2 border border-border rounded-lg bg-background'>
                  <option>C++</option>
                  <option>Python</option>
                  <option>Java</option>
                </select>
                <Button className='flex-1'>Submit</Button>
              </div>
            </TabsContent>

            {/* Chat Tab */}
            {mode === '3v3' && (
              <TabsContent value='chat' className='flex-1 flex flex-col p-4'>
                <div className='flex-1 overflow-y-auto mb-4 space-y-2'>
                  {messages.map((msg, idx) => (
                    <div key={idx} className='text-sm'>
                      <span className='font-semibold text-primary'>
                        {msg.handle}:
                      </span>
                      <span className='ml-2 text-foreground'>
                        {msg.message}
                      </span>
                    </div>
                  ))}
                </div>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    placeholder='Type a message...'
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    className='flex-1 px-3 py-2 border border-border rounded-lg bg-background'
                  />
                  <Button size='icon' onClick={handleSendMessage}>
                    <Send className='w-4 h-4' />
                  </Button>
                </div>
              </TabsContent>
            )}

            {/* Scoreboard Tab */}
            <TabsContent
              value='scoreboard'
              className='flex-1 overflow-y-auto p-4'
            >
              <div className='space-y-2'>
                {scoreboard.length === 0 ? (
                  <p className='text-muted-foreground'>No submissions yet</p>
                ) : (
                  scoreboard.map((team, idx) => (
                    <Card key={idx} className='p-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Trophy className='w-4 h-4 text-primary' />
                          <span className='font-semibold'>{team.teamName}</span>
                        </div>
                        <div className='text-right'>
                          <p className='font-bold'>{team.score} problems</p>
                          <p className='text-xs text-muted-foreground'>
                            {team.penaltyTime} penalty
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
