'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HintGeneratorProps {
  problemTitle: string;
  problemDescription: string;
  problemTags: string[];
  problemDifficulty?: number;
  userCode?: string;
  className?: string;
}

type HintLevel = 'subtle' | 'medium' | 'detailed';

interface HintResponse {
  hint: string;
  conceptualTips: string[];
  relatedTopics: string[];
  cached?: boolean;
}

export function HintGenerator({
  problemTitle,
  problemDescription,
  problemTags,
  problemDifficulty,
  userCode,
  className,
}: HintGeneratorProps) {
  const [selectedLevel, setSelectedLevel] = useState<HintLevel>('subtle');
  const [hints, setHints] = useState<Record<HintLevel, HintResponse | null>>({
    subtle: null,
    medium: null,
    detailed: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHint = async (level: HintLevel) => {
    // Check if we already have this hint cached locally
    if (hints[level]) {
      setSelectedLevel(level);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSelectedLevel(level);

    try {
      const response = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle,
          problemDescription,
          problemTags,
          problemDifficulty,
          userCode,
          hintLevel: level,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to get hint');
      }

      const data: HintResponse = await response.json();
      setHints(prev => ({ ...prev, [level]: data }));
    } catch (err) {
      console.error('Hint generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate hint');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHint = () => {
    setHints(prev => ({ ...prev, [selectedLevel]: null }));
    getHint(selectedLevel);
  };

  const currentHint = hints[selectedLevel];
  const levels: { level: HintLevel; label: string; description: string }[] = [
    { level: 'subtle', label: 'Subtle', description: 'Just a nudge' },
    { level: 'medium', label: 'Medium', description: 'More direction' },
    { level: 'detailed', label: 'Detailed', description: 'Step by step' },
  ];

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Hints</CardTitle>
              <CardDescription className="text-xs">
                Get help without spoiling the solution
              </CardDescription>
            </div>
          </div>
          {currentHint && (
            <Button variant="ghost" size="sm" onClick={refreshHint}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Hint Level Selector */}
        <div className="flex gap-2">
          {levels.map(({ level, label, description }) => (
            <Button
              key={level}
              variant={selectedLevel === level ? 'default' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => getHint(level)}
              disabled={isLoading}
            >
              <div className="text-center">
                <div className="font-medium">{label}</div>
                <div className="text-xs opacity-70">{description}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Hint Display */}
        <div className="min-h-[200px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Generating hint...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-destructive">
              <p>{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => getHint(selectedLevel)}>
                Try Again
              </Button>
            </div>
          ) : currentHint ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{currentHint.hint}</p>
                {currentHint.cached && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Cached
                  </Badge>
                )}
              </div>

              {currentHint.conceptualTips.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Key Concepts</h4>
                  <ul className="space-y-1">
                    {currentHint.conceptualTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentHint.relatedTopics.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Related Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentHint.relatedTopics.map((topic, i) => (
                      <Badge key={i} variant="outline">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Lightbulb className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-center">
                Select a hint level to get help with this problem.
                <br />
                <span className="text-xs">Start subtle to preserve the learning experience!</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
