'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, BookOpen } from 'lucide-react';

/**
 * Dynamic recommendations sidebar.
 * 
 * TODO: Integrate with app/adaptive-sheet for personalized recommendations
 */

interface TopicStat {
  solved: number;
  attempted: number;
  hintsUsed: number;
}

interface AdaptiveSidebarProps {
  recommendations: string[];
  topicStats: Record<string, TopicStat>;
  sessionTopics: string[];
}

function getTopicMastery(stat: TopicStat): { level: string; color: string; icon: React.ReactNode } {
  if (stat.attempted === 0) {
    return { level: 'Not Started', color: 'text-gray-500', icon: <BookOpen className="h-3 w-3" /> };
  }
  
  const solveRate = stat.solved / stat.attempted;
  const hintPenalty = Math.min(0.3, stat.hintsUsed * 0.1);
  const mastery = Math.max(0, solveRate - hintPenalty);
  
  if (mastery >= 0.8) {
    return { level: 'Strong', color: 'text-green-500', icon: <CheckCircle2 className="h-3 w-3" /> };
  } else if (mastery >= 0.5) {
    return { level: 'Developing', color: 'text-yellow-500', icon: <TrendingUp className="h-3 w-3" /> };
  } else {
    return { level: 'Needs Work', color: 'text-red-500', icon: <AlertTriangle className="h-3 w-3" /> };
  }
}

export function AdaptiveSidebar({
  recommendations,
  topicStats,
  sessionTopics,
}: AdaptiveSidebarProps) {
  return (
    <div className="space-y-4">
      {/* Recommendations */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-[200px]">
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Solve some problems to get personalized recommendations.
              </p>
            ) : (
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-purple-500 flex-shrink-0">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Topic Progress */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Topic Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {sessionTopics.map((topic) => {
              const stat = topicStats[topic] || { solved: 0, attempted: 0, hintsUsed: 0 };
              const mastery = getTopicMastery(stat);
              
              return (
                <div key={topic} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{topic}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${mastery.color}`}
                    >
                      <span className="mr-1">{mastery.icon}</span>
                      {mastery.level}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      Solved: {stat.solved}/{stat.attempted || 0}
                    </span>
                    {stat.hintsUsed > 0 && (
                      <span className="text-yellow-500">
                        ({stat.hintsUsed} hints)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
