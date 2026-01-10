'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  MemoryStick,
  Star,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Code2,
  FileText,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils';

// Type definitions matching our database schema
interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

interface Hint {
  id: string;
  level: number;
  hint_type: 'restatement' | 'algorithm' | 'pseudocode' | 'solution';
  content: string;
}

interface Problem {
  id: string;
  platform: string;
  external_id: string;
  title: string;
  difficulty_rating: number;
  topic?: string[];
  tags?: string[];
  time_limit: number; // in milliseconds
  memory_limit: number; // in MB
  problem_statement: string;
  input_format?: string;
  output_format?: string;
  constraints?: string;
  test_cases: TestCase[];
  source_url?: string;
  hints?: Hint[];
}

interface ProblemDisplayProps {
  problem: Problem;
  showHints?: boolean;
  compact?: boolean;
}

export function ProblemDisplay({
  problem,
  showHints = true,
  compact = false,
}: ProblemDisplayProps) {
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [visibleHints, setVisibleHints] = useState<Hint[]>([]);
  const [copiedExample, setCopiedExample] = useState<number | null>(null);

  // Get difficulty color based on rating
  const getDifficultyInfo = (rating: number) => {
    if (rating < 1000)
      return { label: 'Beginner', color: 'bg-green-500/20 text-green-700' };
    if (rating < 1400)
      return { label: 'Easy', color: 'bg-emerald-500/20 text-emerald-700' };
    if (rating < 1900)
      return { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-700' };
    if (rating < 2400)
      return { label: 'Hard', color: 'bg-orange-500/20 text-orange-700' };
    return { label: 'Expert', color: 'bg-red-500/20 text-red-700' };
  };

  const difficultyInfo = getDifficultyInfo(problem.difficulty_rating);

  // Load hints progressively
  const loadNextHint = async () => {
    if (!problem.hints || currentHintLevel >= 4) return;

    const nextLevel = currentHintLevel + 1;
    const nextHint = problem.hints.find((h) => h.level === nextLevel);

    if (nextHint) {
      setVisibleHints((prev) => [...prev, nextHint]);
      setCurrentHintLevel(nextLevel);
    }
  };

  // Copy test case input to clipboard
  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(index);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  // Get hint icon based on type
  const getHintIcon = (type: string) => {
    switch (type) {
      case 'restatement':
        return <FileText className="w-4 h-4" />;
      case 'algorithm':
        return <Lightbulb className="w-4 h-4" />;
      case 'pseudocode':
        return <Code2 className="w-4 h-4" />;
      case 'solution':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getHintLabel = (type: string) => {
    switch (type) {
      case 'restatement':
        return 'Problem Simplification';
      case 'algorithm':
        return 'Algorithm Hint';
      case 'pseudocode':
        return 'Pseudocode';
      case 'solution':
        return 'Full Solution';
      default:
        return 'Hint';
    }
  };

  return (
    <div
      className={cn(
        'space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent',
        compact ? 'p-4' : 'p-6'
      )}
    >
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1
              className={cn(
                'font-bold leading-tight',
                compact ? 'text-xl' : 'text-3xl'
              )}
            >
              {problem.title}
            </h1>
            {problem.external_id && (
              <p className="text-sm text-muted-foreground mt-1">
                {problem.platform.toUpperCase()} #{problem.external_id}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className={difficultyInfo.color}>
              {difficultyInfo.label} ({problem.difficulty_rating})
            </Badge>
            {problem.platform && (
              <Badge variant="outline" className="capitalize">
                {problem.platform}
              </Badge>
            )}
          </div>
        </div>

        {/* Time and Memory Limits */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              Time Limit:{' '}
              <strong className="text-foreground">
                {problem.time_limit / 1000}s
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MemoryStick className="w-4 h-4" />
            <span>
              Memory Limit:{' '}
              <strong className="text-foreground">
                {problem.memory_limit} MB
              </strong>
            </span>
          </div>
          {problem.source_url && (
            <a
              href={problem.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Original ↗
            </a>
          )}
        </div>

        {/* Tags */}
        {problem.topic && problem.topic.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {problem.topic.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Problem Statement */}
      <section>
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Problem Statement
        </h2>
        <div
          className="prose prose-sm prose-invert max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(problem.problem_statement),
          }}
        />
      </section>

      {/* Input Format */}
      {problem.input_format && (
        <section>
          <h3 className="text-lg font-semibold mb-2">Input Format</h3>
          <div
            className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border border-border"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(problem.input_format),
            }}
          />
        </section>
      )}

      {/* Output Format */}
      {problem.output_format && (
        <section>
          <h3 className="text-lg font-semibold mb-2">Output Format</h3>
          <div
            className="text-sm leading-relaxed bg-muted/30 p-4 rounded-lg border border-border"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(problem.output_format),
            }}
          />
        </section>
      )}

      {/* Constraints - Highlighted */}
      {problem.constraints && (
        <section>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Constraints
          </h3>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div
              className="text-sm leading-relaxed whitespace-pre-wrap font-mono"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(problem.constraints),
              }}
            />
          </div>
        </section>
      )}

      {/* Examples - Easy to Copy */}
      {problem.test_cases && problem.test_cases.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-3">Examples</h3>
          <div className="space-y-4">
            {problem.test_cases.map((testCase, idx) => (
              <Card
                key={idx}
                className="p-4 bg-muted/40 border-muted-foreground/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Example {idx + 1}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(testCase.input, idx)}
                    className="h-7 px-2"
                  >
                    {copiedExample === idx ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Input
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Input:
                    </p>
                    <pre className="bg-background p-3 rounded-md overflow-x-auto border border-border text-xs font-mono">
                      {testCase.input}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Output:
                    </p>
                    <pre className="bg-background p-3 rounded-md overflow-x-auto border border-border text-xs font-mono">
                      {testCase.output}
                    </pre>
                  </div>
                </div>

                {testCase.explanation && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Explanation:
                    </p>
                    <p className="text-sm text-foreground/90">
                      {testCase.explanation}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Multi-Level Hint System */}
      {showHints && problem.hints && problem.hints.length > 0 && (
        <section>
          <Separator className="mb-4" />
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Need Help?
            </h3>

            {/* Visible Hints */}
            {visibleHints.length > 0 && (
              <div className="space-y-3">
                {visibleHints.map((hint, idx) => (
                  <Card
                    key={hint.id}
                    className={cn(
                      'p-4 border-l-4',
                      hint.hint_type === 'restatement' &&
                        'border-l-blue-500 bg-blue-500/5',
                      hint.hint_type === 'algorithm' &&
                        'border-l-yellow-500 bg-yellow-500/5',
                      hint.hint_type === 'pseudocode' &&
                        'border-l-purple-500 bg-purple-500/5',
                      hint.hint_type === 'solution' &&
                        'border-l-green-500 bg-green-500/5'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getHintIcon(hint.hint_type)}
                      <p className="text-sm font-semibold">
                        Level {hint.level}: {getHintLabel(hint.hint_type)}
                      </p>
                    </div>
                    <div
                      className="text-sm leading-relaxed prose prose-sm prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(hint.content),
                      }}
                    />
                  </Card>
                ))}
              </div>
            )}

            {/* Show Next Hint Button */}
            {currentHintLevel < 4 &&
              currentHintLevel < (problem.hints?.length || 0) && (
                <Button
                  variant="outline"
                  onClick={loadNextHint}
                  className="w-full border-dashed hover:bg-yellow-500/10"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Show Level {currentHintLevel + 1} Hint
                  {currentHintLevel + 1 === 4 && ' (Full Solution)'}
                </Button>
              )}

            {currentHintLevel === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Click above to reveal hints progressively. Start with a simple
                restatement, then get algorithm hints, pseudocode, and finally
                the full solution.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
