'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Trophy, CheckCircle2, Flag, Code2, Send, Users } from 'lucide-react';
import { useBattleRealtime, useTeamChat, broadcastCodeUpdate } from '@/hooks/use-battle-realtime';
import { CodeEditor } from '@/components/battle-arena/code-editor';
import { ProblemDetails } from '@/components/battle-arena/problem-details';
import { SubmissionsList } from '@/components/battle-arena/submissions-list';
import { motion } from 'framer-motion';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';

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
  const [showStats, setShowStats] = useState(false);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const [scoreboard, setScoreboard] = useState<Array<{ teamId: string; teamName: string; score: number; penaltyTime: number }>>([]);
  const [chatInput, setChatInput] = useState('');

  const { battleUpdate, isConnected, latestCode } = useBattleRealtime(
    params.id,
    true,
    myTeamId || undefined
  );
  const teamChat = useTeamChat(params.id, myTeamId || '', room?.battle?.mode === '3v3' && !!myTeamId);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/arena/room/${params.id}`);
        const data = await response.json();
        setRoom(data);
        setScoreboard(data.scoreboard || []);
        if (data.problems?.length > 0) {
          setSelectedProblemId(data.problems[0].id);
        }
        // determine my team membership and spectator mode
        try {
          const supabase = createSupabaseClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user && data.teams) {
            const myTeam = data.teams.find((t: any) =>
              (t.battle_team_players || []).some((p: any) => p.user_id === user.id)
            );
            setMyTeamId(myTeam?.id || null);
            setIsSpectator(!myTeam);
          } else {
            setIsSpectator(true);
          }
        } catch {}
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
    if (battleUpdate?.type === 'submission' || battleUpdate?.type === 'scoreboard_update') {
      const fetchRoom = async () => {
        const response = await fetch(`/api/arena/room/${params.id}`);
        const data = await response.json();
        setRoom(data);
        if (data.scoreboard) setScoreboard(data.scoreboard);
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
          teamId: myTeamId,
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

  // Live code sync: broadcast on change (debounced at consumer level)
  useEffect(() => {
    const handle = setTimeout(() => {
      if (code) {
        broadcastCodeUpdate(params.id, code, language, myTeamId || undefined);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [code, language, params.id, myTeamId]);

  // Apply incoming code updates if from teammates (basic demo; in prod add author separation)
  useEffect(() => {
    if (latestCode && latestCode.content !== code) {
      setCode(latestCode.content);
      setLanguage(latestCode.language || 'cpp');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestCode]);

  const handleSendTeamMessage = async () => {
    if (!teamChat || !chatInput.trim()) return;
    try {
      await teamChat.sendMessage(chatInput.trim());
      setChatInput('');
    } catch (e) {
      console.error('chat send failed', e);
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
  const timeWarning = timeRemaining < 300;

  if (!room) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
          className='w-12 h-12 border-4 border-blue-500/30 border-t-blue-400 rounded-full'
        />
      </div>
    );
  }

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950'>
      <motion.div
        className='border-b border-blue-500/20 bg-gradient-to-r from-slate-900/80 to-blue-900/80 backdrop-blur-sm p-4 sticky top-0 z-20 shadow-lg shadow-blue-500/10'
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <div className='flex items-center gap-6'>
            {/* Timer with warning state */}
            <motion.div
              className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${
                timeWarning
                  ? 'bg-red-900/30 border-red-500/50'
                  : 'bg-blue-900/30 border-blue-500/30'
              } backdrop-blur-sm`}
              animate={timeWarning ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
            >
              <Clock
                className={`w-5 h-5 ${
                  timeWarning ? 'text-red-400' : 'text-cyan-400'
                }`}
              />
              <span
                className={`font-mono text-lg font-bold ${
                  timeWarning ? 'text-red-300' : 'text-white'
                }`}
              >
                {formatTime(timeRemaining)}
              </span>
            </motion.div>

            {/* Connection Status */}
            <motion.div
              className='flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50'
              animate={{
                borderColor: isConnected
                  ? 'rgb(34, 197, 94)'
                  : 'rgb(239, 68, 68)',
              }}
            >
              <motion.div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              />
              <span className='text-xs text-slate-300'>
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className='flex items-center gap-3'>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant='outline'
                size='sm'
                className='border-blue-500/50 text-blue-300 hover:bg-blue-900/20 hover:border-blue-400'
              >
                <Flag className='w-4 h-4 mr-2' />
                Pause
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant='destructive'
                size='sm'
                className='bg-red-600/80 hover:bg-red-700 text-white'
                onClick={async () => {
                  try {
                    await fetch(`/api/arena/room/${params.id}/end`, { method: 'POST' });
                  } catch (e) {
                    console.error('surrender failed', e);
                  }
                }}
              >
                Surrender
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 h-[calc(100vh-80px)] max-w-7xl mx-auto'>
        {/* Left Sidebar: Problems & Scoreboard */}
        <motion.div
          className='lg:col-span-1 flex flex-col gap-4 overflow-hidden'
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Problems Card */}
          <Card className='flex-1 p-4 overflow-y-auto bg-gradient-to-br from-slate-900/50 to-blue-900/30 border-blue-500/20 backdrop-blur-sm'>
            <h3 className='font-bold text-white mb-3 flex items-center gap-2'>
              <Code2 className='w-4 h-4 text-cyan-400' />
              Problems
            </h3>
            <div className='space-y-2'>
              {room.problems.map((problem, idx) => (
                <motion.button
                  key={problem.id}
                  onClick={() => setSelectedProblemId(problem.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-3 text-left rounded-lg border transition-all duration-300 ${
                    selectedProblemId === problem.id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400 shadow-lg shadow-blue-500/30'
                      : 'border-blue-500/20 hover:bg-blue-900/30 hover:border-blue-400/50 text-blue-100'
                  }`}
                >
                  <p className='font-semibold text-sm'>
                    {String.fromCharCode(65 + idx)}. {problem.name}
                  </p>
                  <p className='text-xs opacity-75 mt-1'>
                    Rating: {problem.rating || 'N/A'}
                  </p>
                </motion.button>
              ))}
            </div>
          </Card>

          {/* Scoreboard Card */}
          <Card className='flex-1 p-4 overflow-y-auto bg-gradient-to-br from-slate-900/50 to-purple-900/30 border-purple-500/20 backdrop-blur-sm'>
            <h3 className='font-bold text-white mb-3 flex items-center gap-2'>
              <Trophy className='w-4 h-4 text-yellow-400' />
              Scoreboard
            </h3>
            <div className='space-y-2'>
              {(scoreboard.length ? scoreboard : (room.teams || []).map((t: any) => ({ teamId: t.id, teamName: t.team_name, score: t.score ?? 0, penaltyTime: t.penalty_time ?? 0 })) ).map((team: any, idx: number) => (
                <motion.div
                  key={team.teamId}
                  className='p-3 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg border border-purple-500/20 hover:border-purple-400/50 transition-all'
                  whileHover={{ scale: 1.02 }}
                >
                  <div className='flex items-center justify-between mb-1'>
                    <p className='font-semibold text-sm text-white'>
                      {team.teamName}
                    </p>
                    <motion.div
                      className='text-xs font-bold text-yellow-400'
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    >
                      #{idx + 1}
                    </motion.div>
                  </div>
                  <div className='flex items-center justify-between text-xs text-purple-200/70'>
                    <span>Score: {team.score}</span>
                    <span>Penalty: {team.penaltyTime}m</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Middle: Problem Details */}
        <motion.div
          className='lg:col-span-1 overflow-hidden'
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className='h-full p-4 overflow-y-auto bg-gradient-to-br from-slate-900/50 to-cyan-900/30 border-cyan-500/20 backdrop-blur-sm'>
            <ProblemDetails problem={selectedProblem} />
          </Card>
        </motion.div>

        {/* Right: Editor & Submissions */}
        <motion.div
          className='lg:col-span-2 flex flex-col gap-4 overflow-hidden'
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className='flex-1 p-4 flex flex-col overflow-hidden bg-gradient-to-br from-slate-900/50 to-blue-900/30 border-blue-500/20 backdrop-blur-sm'>
            <Tabs
              defaultValue='editor'
              className='flex-1 flex flex-col overflow-hidden'
            >
              <TabsList className={`grid w-full ${room.battle?.mode === '3v3' && myTeamId ? 'grid-cols-3' : 'grid-cols-2'} bg-slate-800/50 border border-blue-500/20 rounded-lg p-1 mb-4`}>
                <TabsTrigger
                  value='editor'
                  className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 rounded-md transition-all'
                >
                  <Code2 className='w-4 h-4 mr-2' />
                  Editor
                </TabsTrigger>
                {room.battle?.mode === '3v3' && myTeamId && (
                  <TabsTrigger
                    value='chat'
                    className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-md transition-all'
                  >
                    <Users className='w-4 h-4 mr-2' /> Team Chat
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value='submissions'
                  className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-md transition-all'
                >
                  <CheckCircle2 className='w-4 h-4 mr-2' />
                  Submissions
                </TabsTrigger>
              </TabsList>

              <TabsContent value='editor' className='flex-1 overflow-hidden'>
                <CodeEditor
                  language={language}
                  onLanguageChange={setLanguage}
                  code={code}
                  onCodeChange={setCode}
                  onSubmit={handleSubmit}
                  isSubmitting={submitting}
                  readOnly={isSpectator}
                />
              </TabsContent>

              {room.battle?.mode === '3v3' && myTeamId && (
                <TabsContent value='chat' className='flex-1 overflow-hidden'>
                  <div className='flex flex-col h-full'>
                    <div className='flex-1 overflow-y-auto space-y-3 p-2'>
                      {teamChat?.messages?.map((m, idx) => (
                        <div key={idx} className='flex items-start gap-2'>
                          <span className='text-xs text-cyan-300 font-mono'>{m.handle}</span>
                          <span className='text-sm text-white'>{m.message}</span>
                        </div>
                      ))}
                    </div>
                    <div className='flex gap-2 pt-2'>
                      <input
                        className='flex-1 px-3 py-2 rounded-md bg-slate-900/50 border border-slate-700 text-white'
                        placeholder='Type a message...'
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendTeamMessage()}
                      />
                      <Button size='icon' onClick={handleSendTeamMessage}>
                        <Send className='w-4 h-4' />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              )}

              <TabsContent
                value='submissions'
                className='flex-1 overflow-hidden'
              >
                <SubmissionsList submissions={room.submissions as any} />
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
