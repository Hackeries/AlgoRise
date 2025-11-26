'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, SkipForward, Send, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Problem display with hint/skip/submit actions.
 * 
 * TODO: Integrate with actual code editor component
 * TODO: Add syntax highlighting for code
 */

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  hints_available?: number;
}

interface ProblemStageProps {
  problem: Problem | null;
  hintsEnabled: boolean;
  hintsUsed: number;
  language: string;
  onHint: () => void;
  onSkip: () => void;
  onSubmit: (code: string) => void;
  isLoading?: boolean;
  currentHint?: string | null;
}

const difficultyColors = {
  easy: 'bg-green-500/20 text-green-500 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-500 border-red-500/30',
};

export function ProblemStage({
  problem,
  hintsEnabled,
  hintsUsed,
  language,
  onHint,
  onSkip,
  onSubmit,
  isLoading = false,
  currentHint,
}: ProblemStageProps) {
  const [code, setCode] = useState('');

  if (!problem) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Session Complete!</h3>
          <p className="text-muted-foreground">
            You&apos;ve completed all problems in this session.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = () => {
    if (code.trim()) {
      onSubmit(code);
      setCode('');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{problem.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={difficultyColors[problem.difficulty]}>
                {problem.difficulty}
              </Badge>
              <Badge variant="secondary">{problem.topic}</Badge>
              <Badge variant="outline" className="text-xs">
                {language.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {hintsEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={onHint}
                disabled={isLoading}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                Hint ({hintsUsed})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onSkip}
              disabled={isLoading}
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Problem Description */}
        <div className="bg-muted/50 rounded-lg p-4 flex-shrink-0">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </p>
        </div>

        {/* Current Hint */}
        {currentHint && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex-shrink-0">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-200">{currentHint}</p>
            </div>
          </div>
        )}

        {/* Code Input */}
        <div className="flex-1 min-h-0 flex flex-col">
          <label className="text-sm font-medium mb-2">Your Solution</label>
          <Textarea
            placeholder={`Write your ${language} solution here...`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 min-h-[200px] font-mono text-sm resize-none"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!code.trim() || isLoading}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          Submit Solution
        </Button>
      </CardContent>
    </Card>
  );
}
