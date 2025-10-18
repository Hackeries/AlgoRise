'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, User } from 'lucide-react';

interface BattleParticipantProps {
  userId: string;
  username: string;
  rating: number;
  isWinner?: boolean;
  isHost?: boolean;
  status?: 'waiting' | 'ready' | 'coding' | 'submitted';
}

export function BattleParticipant({ 
  userId, 
  username, 
  rating, 
  isWinner = false, 
  isHost = false,
  status = 'waiting'
}: BattleParticipantProps) {
  const getStatusBadge = () => {
    switch (status) {
      case 'ready':
        return <Badge variant="default">Ready</Badge>;
      case 'coding':
        return <Badge variant="secondary">Coding</Badge>;
      case 'submitted':
        return <Badge variant="outline">Submitted</Badge>;
      default:
        return <Badge variant="secondary">Waiting</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium flex items-center gap-2">
                {username}
                {isHost && <Badge variant="secondary">Host</Badge>}
                {isWinner && <Crown className="h-4 w-4 text-yellow-500" />}
              </div>
              <div className="text-sm text-muted-foreground">
                Rating: {rating}
              </div>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardContent>
    </Card>
  );
}