'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBattleRealtime, useTeamChat } from '@/hooks/use-battle-realtime';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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
  const initialTime = 3600;
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [chatInput, setChatInput] = useState('');
  const [scoreboard, setScoreboard] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

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

  useEffect(() => {
    if (timeRemaining === 0) {
      setShowCelebration(true);
      const t = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(t);
    }
  }, [timeRemaining]);

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
      className={`h-screen flex flex-col bg-background text-foreground`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Top Bar */}
      <div className='border-b border-border/20 bg-card/60 backdrop-blur-sm p-4 flex items-center justify-between sticky top-0 z-10'>
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
            <Badge variant='secondary' className='bg-primary/20 text-primary'>
              vs Bot
            </Badge>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='btn-hover'
          >
            Pause
          </Button>
          <Button
            variant='destructive'
            size='sm'
            className='btn-hover hover:shadow-red-500/40'
          >
            Surrender
          </Button>
        </div>
      </div>
      {/* Timer progress */}
      <div className='px-4 py-2 border-b border-border/20 bg-card/40'>
        <Progress value={((initialTime - timeRemaining) / initialTime) * 100} />
      </div>

      {/* Main */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Left: Problems */}
        <div className='w-1/3 border-r border-border/10 overflow-y-auto p-4 space-y-4 hidden md:block'>
          <motion.h3
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='font-bold text-xl text-primary'
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
                <Card className='p-4 bg-card/80 border hover:shadow-elevation2 cursor-pointer transition-all rounded-xl hover:border-primary/30'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <p className='font-semibold'>
                        {String.fromCharCode(65 + idx)}. {problem.name}
                      </p>
                      <p className='text-xs text-muted-foreground'>
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
            <TabsList className='w-full rounded-none border-b border-border/20 bg-card/60 backdrop-blur-md'>
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
                className='flex-1 bg-card rounded-xl p-4 font-mono text-sm mb-4 overflow-auto border'
              >
                <div className='text-muted-foreground'>
                  <div>// Editor moved to dedicated room page</div>
                </div>
              </motion.div>
              <div className='flex gap-2'>
                <select className='px-3 py-2 border rounded-lg bg-background text-foreground'>
                  <option>C++</option>
                  <option>Python</option>
                  <option>Java</option>
                </select>
                <Button className='flex-1 btn-hover'>
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
                        className='text-xs text-primary border-primary'
                      >
                        {msg.handle}
                      </Badge>
                      <p className='text-foreground'>{msg.message}</p>
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
                    className='flex-1 px-3 py-2 border rounded-lg bg-background text-foreground'
                  />
                  <Button
                    size='icon'
                    onClick={handleSendMessage}
                    className='btn-hover'
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
                <p className='text-muted-foreground text-center'>No submissions yet</p>
              ) : (
                scoreboard.map((team, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className='p-4 bg-card/80 border rounded-xl hover:shadow-elevation2 transition-all'>
                      <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-2'>
                          <Trophy className='w-4 h-4 text-primary' />
                          <span className='font-semibold'>
                            {team.teamName}
                          </span>
                        </div>
                        <div className='text-right'>
                          <p className='font-bold text-primary'>
                            {team.score} problems
                          </p>
                          <p className='text-xs text-muted-foreground'>
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
      {/* Celebration overlay */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='pointer-events-none fixed inset-0 z-20 grid place-items-center bg-gradient-to-br from-primary/10 to-accent/10'
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className='rounded-2xl border border-primary/30 bg-card/80 px-8 py-6 shadow-elevation3 text-center'
          >
            <div className='flex items-center justify-center gap-2 text-primary'>
              <Trophy className='h-6 w-6' />
              <span className='font-semibold'>Match Completed</span>
            </div>
            <p className='mt-2 text-sm text-muted-foreground'>Great job! Review the scoreboard and share your results.</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}