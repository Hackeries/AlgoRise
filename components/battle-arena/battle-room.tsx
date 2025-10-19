'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [chatInput, setChatInput] = useState('');
  const [scoreboard, setScoreboard] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <motion.div
      className={`h-screen flex flex-col ${
        mode === '3v3'
          ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900'
          : 'bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900'
      } text-white`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Top Bar */}
      <div className='border-b border-border/20 bg-black/30 backdrop-blur-sm p-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className='flex items-center gap-2'
          >
            <Clock className='w-5 h-5 text-sky-400' />
            <span className='font-mono text-xl font-bold text-sky-300'>
              {formatTime(timeRemaining)}
            </span>
          </motion.div>
          {!isBot ? (
            <Badge
              variant='outline'
              className={`ml-4 px-3 py-1 ${
                isConnected
                  ? 'border-green-400 text-green-300 animate-pulse'
                  : 'border-yellow-400 text-yellow-200'
              }`}
            >
              {isConnected ? 'Connected' : 'Connecting...'}
            </Badge>
          ) : (
            <Badge variant='secondary' className='bg-purple-700 text-white'>
              vs Bot
            </Badge>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='hover:scale-105 transition-all'
          >
            Pause
          </Button>
          <Button
            variant='destructive'
            size='sm'
            className='hover:scale-105 transition-all hover:shadow-lg hover:shadow-red-500/40'
          >
            Surrender
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Left: Problems */}
        <div className='w-1/3 border-r border-border/10 overflow-y-auto p-4 space-y-4'>
          <motion.h3
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='font-bold text-xl text-sky-300'
          >
            Problems
          </motion.h3>

          {problems.length === 0 ? (
            <p className='text-center text-gray-400 py-8 italic'>
              Loading problems...
            </p>
          ) : (
            problems.map((problem, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, rotateY: 5 }}
                className='[perspective:1000px]'
              >
                <Card className='p-4 bg-gray-800/60 border border-gray-700 hover:shadow-lg hover:shadow-sky-500/30 cursor-pointer transition-all rounded-2xl'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <p className='font-semibold text-white'>
                        {String.fromCharCode(65 + idx)}. {problem.name}
                      </p>
                      <p className='text-xs text-gray-400'>
                        Rating: {problem.rating}
                      </p>
                    </div>
                    {problem.solved && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs'
                      >
                        ✓
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Right: Editor, Chat, Scoreboard */}
        <div className='flex-1 flex flex-col'>
          <Tabs defaultValue='editor' className='flex-1 flex flex-col'>
            <TabsList className='w-full rounded-none border-b border-border/20 bg-black/30 backdrop-blur-md'>
              <TabsTrigger value='editor'>Editor</TabsTrigger>
              {mode === '3v3' && (
                <TabsTrigger value='chat'>Team Chat</TabsTrigger>
              )}
              <TabsTrigger value='scoreboard'>Scoreboard</TabsTrigger>
            </TabsList>

            {/* Editor */}
            <TabsContent value='editor' className='flex-1 flex flex-col p-4'>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex-1 bg-gray-900 rounded-xl p-4 font-mono text-sm mb-4 overflow-auto border border-gray-700'
              >
                <div className='text-gray-400'>
                  <div>// Write your solution here</div>
                  <div>#include &lt;bits/stdc++.h&gt;</div>
                  <div>using namespace std;</div>
                  <div>&nbsp;</div>
                  <div>int main() {'{}'}</div>
                </div>
              </motion.div>
              <div className='flex gap-2'>
                <select className='px-3 py-2 border border-gray-700 rounded-lg bg-black text-gray-200'>
                  <option>C++</option>
                  <option>Python</option>
                  <option>Java</option>
                </select>
                <Button className='flex-1 bg-sky-600 hover:bg-sky-700 hover:shadow-sky-500/40 shadow-md transition-all'>
                  Submit
                </Button>
              </div>
            </TabsContent>

            {/* Chat */}
            {mode === '3v3' && (
              <TabsContent value='chat' className='flex-1 flex flex-col p-4'>
                <div className='flex-1 overflow-y-auto mb-4 space-y-3'>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className='flex items-start gap-2'
                    >
                      <Badge
                        variant='outline'
                        className='text-xs text-sky-400 border-sky-600'
                      >
                        {msg.handle}
                      </Badge>
                      <p className='text-gray-200'>{msg.message}</p>
                    </motion.div>
                  ))}
                </div>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    placeholder='Type a message...'
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    className='flex-1 px-3 py-2 border border-gray-700 rounded-lg bg-black text-gray-200'
                  />
                  <Button
                    size='icon'
                    onClick={handleSendMessage}
                    className='bg-sky-700 hover:bg-sky-600'
                  >
                    <Send className='w-4 h-4' />
                  </Button>
                </div>
              </TabsContent>
            )}

            {/* Scoreboard */}
            <TabsContent
              value='scoreboard'
              className='flex-1 overflow-y-auto p-4 space-y-2'
            >
              {scoreboard.length === 0 ? (
                <p className='text-gray-400 text-center'>No submissions yet</p>
              ) : (
                scoreboard.map((team, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className='p-4 bg-gray-800/70 border border-gray-700 rounded-xl hover:shadow-md hover:shadow-sky-500/30 transition-all'>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-2'>
                          <Trophy className='w-4 h-4 text-sky-400' />
                          <span className='font-semibold text-gray-100'>
                            {team.teamName}
                          </span>
                        </div>
                        <div className='text-right'>
                          <p className='font-bold text-sky-300'>
                            {team.score} problems
                          </p>
                          <p className='text-xs text-gray-400'>
                            {team.penaltyTime} penalty
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}