'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { 
  Users, 
  Crown, 
  Circle, 
  CheckCircle, 
  Lock, 
  Unlock,
  MessageSquare,
  Code
} from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamMember {
  id: string;
  username: string;
  role: 'captain' | 'member';
  isOnline: boolean;
  currentProblem?: string;
  solvedProblems: string[];
}

interface TeamCollaborationProps {
  battleId: string;
  teamId: string;
  userId: string;
  members: TeamMember[];
  onProblemClaim?: (problemId: string) => void;
  onEditorLock?: (locked: boolean) => void;
}

export default function TeamCollaboration({
  battleId,
  teamId,
  userId,
  members,
  onProblemClaim,
  onEditorLock
}: TeamCollaborationProps) {
  const [editorLocked, setEditorLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const [teamChat, setTeamChat] = useState<Array<{ from: string; message: string; timestamp: number }>>([]);

  const currentUser = members.find(m => m.id === userId);
  const isCaptain = currentUser?.role === 'captain';

  const handleLockToggle = () => {
    const newLockState = !editorLocked;
    setEditorLocked(newLockState);
    setLockedBy(newLockState ? userId : null);
    onEditorLock?.(newLockState);
  };

  const handleProblemClaim = (problemId: string) => {
    onProblemClaim?.(problemId);
  };

  return (
    <div className="space-y-4">
      {/* Team Overview */}
      <Card className="bg-slate-900/50 border-purple-500/20">
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
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500">
                      <div className="flex items-center justify-center h-full text-white font-semibold">
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{member.username}</span>
                      {member.role === 'captain' && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      {member.id === lockedBy && (
                        <Lock className="h-3 w-3 text-blue-400" />
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {member.currentProblem 
                        ? `Working on ${member.currentProblem}` 
                        : 'Idle'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-400 border-green-500">
                    {member.solvedProblems.length} solved
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Editor Control */}
      <Card className="bg-slate-900/50 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Code className="h-5 w-5" />
            Editor Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <div className="font-semibold text-white">Shared Editor</div>
                <div className="text-xs text-slate-400">
                  {editorLocked 
                    ? `Locked by ${members.find(m => m.id === lockedBy)?.username || 'someone'}` 
                    : 'Unlocked - Anyone can edit'}
                </div>
              </div>
              
              <Button
                onClick={handleLockToggle}
                variant={editorLocked ? 'destructive' : 'default'}
                size="sm"
                disabled={editorLocked && lockedBy !== userId && !isCaptain}
              >
                {editorLocked ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Unlock
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Lock for Me
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-slate-400 bg-blue-500/10 border border-blue-500/20 rounded p-2">
              💡 <strong>Tip:</strong> Lock the editor when working on a specific problem to prevent conflicts. 
              Captains can override locks.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Problem Assignment */}
      <Card className="bg-slate-900/50 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <CheckCircle className="h-5 w-5" />
            Problem Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm text-slate-400 mb-3">
              Coordinate who works on which problem for maximum efficiency
            </div>
            
            {['A', 'B', 'C', 'D', 'E'].map((problem) => {
              const assignedMember = members.find(m => m.currentProblem === problem);
              const isSolved = members.some(m => m.solvedProblems.includes(problem));
              
              return (
                <div key={problem} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                  <div className="flex items-center gap-2">
                    {isSolved ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-600" />
                    )}
                    <span className="font-semibold">Problem {problem}</span>
                  </div>
                  
                  {assignedMember ? (
                    <Badge variant="outline" className="text-purple-400 border-purple-500 text-xs">
                      {assignedMember.username}
                    </Badge>
                  ) : (
                    <Button
                      onClick={() => handleProblemClaim(problem)}
                      size="sm"
                      variant="ghost"
                      className="text-xs h-6"
                    >
                      Claim
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team Chat Preview */}
      <Card className="bg-slate-900/50 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-400">
            <MessageSquare className="h-5 w-5" />
            Team Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="max-h-32 overflow-y-auto space-y-2">
              {teamChat.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No messages yet. Start collaborating!
                </p>
              ) : (
                teamChat.map((msg, idx) => (
                  <div key={idx} className="text-xs bg-slate-800/30 p-2 rounded">
                    <span className="font-semibold text-purple-400">{msg.from}:</span>{' '}
                    <span className="text-slate-300">{msg.message}</span>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" className="w-full text-xs" size="sm">
              Open Full Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
