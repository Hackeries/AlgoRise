'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Lock, 
  Unlock, 
  MessageSquare, 
  Send,
  AlertCircle,
  CheckCircle,
  Circle,
  Clock,
  FileText,
  Crown
} from 'lucide-react';

interface TeamMember {
  id: string;
  username: string;
  role: 'captain' | 'member';
  isOnline: boolean;
  currentProblem?: string;
  solvedProblems: string[];
  wrongAttempts: number;
  timeSpent: number;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

interface TeamBattleUIProps {
  teamId: string;
  userId: string;
  members: TeamMember[];
  onLockRequest: () => void;
  onUnlock: () => void;
  onProblemClaim: (problemId: string) => void;
}

export function TeamBattleUI({
  teamId,
  userId,
  members,
  onLockRequest,
  onUnlock,
  onProblemClaim
}: TeamBattleUIProps) {
  const [editorLocked, setEditorLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sharedNotes, setSharedNotes] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const currentUser = members.find(m => m.id === userId);
  const isCaptain = currentUser?.role === 'captain';
  const hasEditorControl = lockedBy === userId || !editorLocked;

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleLockToggle = () => {
    if (editorLocked && lockedBy === userId) {
      onUnlock();
      setEditorLocked(false);
      setLockedBy(null);
    } else if (!editorLocked) {
      onLockRequest();
      setEditorLocked(true);
      setLockedBy(userId);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId,
      username: currentUser?.username || 'You',
      message: messageInput,
      timestamp: Date.now()
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessageInput('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Team Status Panel */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Users className="h-5 w-5" />
            Team Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border transition-all ${
                  member.id === lockedBy
                    ? 'bg-blue-900/30 border-blue-500/50'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {member.username}
                          {member.id === userId && <span className="text-xs text-blue-400"> (You)</span>}
                        </span>
                        {member.role === 'captain' && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        {member.id === lockedBy && (
                          <Lock className="h-3 w-3 text-blue-400" />
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {member.currentProblem 
                          ? `Solving: Problem ${member.currentProblem} (${formatTime(member.timeSpent)})` 
                          : 'Idle'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="outline" className="text-green-400 border-green-500 mb-1">
                      {member.solvedProblems.length} ✓
                    </Badge>
                    <div className="text-xs text-red-400">
                      {member.wrongAttempts} ✗
                    </div>
                  </div>
                </div>

                {/* Progress indicators */}
                <div className="flex gap-1 mt-2">
                  {['A', 'B', 'C', 'D'].map((problem) => {
                    const isSolved = member.solvedProblems.includes(problem);
                    const isCurrent = member.currentProblem === problem;
                    
                    return (
                      <div
                        key={problem}
                        className={`flex-1 h-1 rounded ${
                          isSolved
                            ? 'bg-green-500'
                            : isCurrent
                            ? 'bg-yellow-500 animate-pulse'
                            : 'bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor Control Lock System */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            {editorLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
            Editor Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <div className="font-semibold text-white">Shared Editor</div>
                <div className="text-sm text-slate-400">
                  {editorLocked 
                    ? `🔒 Locked by ${members.find(m => m.id === lockedBy)?.username || 'someone'}` 
                    : '🔓 Unlocked - Anyone can edit'}
                </div>
              </div>
              
              <Button
                onClick={handleLockToggle}
                variant={hasEditorControl ? 'destructive' : 'default'}
                size="sm"
                disabled={editorLocked && lockedBy !== userId && !isCaptain}
              >
                {hasEditorControl ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Release
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Request Control
                  </>
                )}
              </Button>
            </div>

            {editorLocked && lockedBy !== userId && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-300">
                    {members.find(m => m.id === lockedBy)?.username} is currently typing. 
                    {isCaptain && ' As captain, you can override this lock.'}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="text-xs text-slate-400 bg-blue-500/10 border border-blue-500/20 rounded p-2">
              💡 <strong>Tip:</strong> Only one person can type at a time. Lock the editor when working on a problem to prevent conflicts.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problem Strategy Board */}
      <Card className="bg-gradient-to-br from-cyan-900/20 to-teal-900/20 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <CheckCircle className="h-5 w-5" />
            Problem Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm text-slate-400 mb-3">
              Coordinate who works on which problem for maximum efficiency
            </div>
            
            {['A', 'B', 'C', 'D'].map((problem) => {
              const assignedMember = members.find(m => m.currentProblem === problem);
              const isSolved = members.some(m => m.solvedProblems.includes(problem));
              const isClaimedByUser = currentUser?.currentProblem === problem;
              
              return (
                <motion.div
                  key={problem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isSolved
                      ? 'bg-green-900/20 border border-green-500/30'
                      : assignedMember
                      ? 'bg-yellow-900/20 border border-yellow-500/30'
                      : 'bg-slate-800/30 border border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isSolved ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : assignedMember ? (
                      <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-600" />
                    )}
                    <div>
                      <span className="font-semibold text-white">Problem {problem}</span>
                      {assignedMember && !isSolved && (
                        <div className="text-xs text-slate-400">
                          by {assignedMember.username} • {formatTime(assignedMember.timeSpent)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isSolved ? (
                    <Badge className="bg-green-600 text-white">Solved ✓</Badge>
                  ) : assignedMember ? (
                    <Badge variant="outline" className="text-yellow-400 border-yellow-500">
                      In Progress
                    </Badge>
                  ) : (
                    <Button
                      onClick={() => onProblemClaim(problem)}
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7 hover:bg-cyan-500/20 hover:text-cyan-300"
                    >
                      Claim
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Chat */}
      <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <MessageSquare className="h-5 w-5" />
            Team Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ScrollArea className="h-48 pr-4" ref={chatScrollRef}>
              <div className="space-y-2">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500">
                    No messages yet. Start collaborating!
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-2 rounded-lg ${
                        msg.userId === userId
                          ? 'bg-blue-900/30 border border-blue-500/30'
                          : 'bg-slate-800/30 border border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xs text-white font-semibold">
                          {msg.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-green-400">
                              {msg.username}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-sm text-slate-300">{msg.message}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message... (Shift+Enter for new line)"
                className="min-h-[60px] max-h-[120px] bg-slate-800 border-slate-700 text-white resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="h-[60px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shared Notepad */}
      <Card className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 border-orange-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-400">
            <FileText className="h-5 w-5" />
            Shared Notepad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              value={sharedNotes}
              onChange={(e) => setSharedNotes(e.target.value)}
              placeholder="Problem D hints:
- Use Dijkstra
- Watch for overflow
- Consider edge case: single node"
              className="min-h-[150px] bg-slate-800 border-slate-700 text-white font-mono text-sm"
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-slate-400">
                All team members can view and edit these notes
              </div>
              <Button
                onClick={() => setSharedNotes('')}
                variant="outline"
                size="sm"
                className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
              >
                Clear Notepad
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
