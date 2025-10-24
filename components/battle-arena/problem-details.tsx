'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

interface Problem {
  id: string;
  name: string;
  description: string; // Can be plain text or HTML
  examples: Array<{ input: string; output: string }>;
  constraints: string;
  timeLimit: number;
  memoryLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  rating?: number; // for CF/AtCoder
  tags?: string[];
  contestUrl?: string;
  source?: 'Codeforces' | 'AtCoder';
}

interface ProblemDetailsProps {
  problem: Problem | null;
}

export function ProblemDetails({ problem }: ProblemDetailsProps) {
  if (!problem) {
    return (
      <div className='flex items-center justify-center h-full text-muted-foreground'>
        <p>Select a problem to view details</p>
      </div>
    );
  }

  const difficultyColor = {
    easy: 'bg-green-500/20 text-green-700',
    medium: 'bg-yellow-500/20 text-yellow-700',
    hard: 'bg-red-500/20 text-red-700',
  };

  return (
    <div className='space-y-5 overflow-y-auto h-full pr-4'>
      {/* Header */}
      <div>
        <div className='flex flex-wrap items-center gap-2 mb-2'>
          <h2 className='text-2xl font-semibold'>{problem.name}</h2>
          <Badge className={difficultyColor[problem.difficulty]}>
            {problem.difficulty}
          </Badge>
          {/* Rating intentionally hidden in arena for contest feel */}
          {problem.source && (
            <Badge variant='outline' className='text-xs'>
              {problem.source}
            </Badge>
          )}
        </div>

        <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <Clock className='w-4 h-4' />
            {problem.timeLimit}s
          </div>
          <div className='flex items-center gap-1'>
            <Zap className='w-4 h-4' />
            {problem.memoryLimit}MB
          </div>
          {problem.contestUrl && (
            <Link
              href={problem.contestUrl}
              target='_blank'
              className='text-blue-600 hover:underline'
            >
              View Contest ↗
            </Link>
          )}
        </div>
      </div>

      {/* Tags */}
      {problem.tags && problem.tags.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {problem.tags.map((tag, i) => (
            <Badge key={i} variant='secondary' className='text-xs'>
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Description */}
      <div>
        <h3 className='font-semibold mb-2 text-lg'>Description</h3>
        <div
          className='text-sm text-foreground leading-relaxed prose prose-sm max-w-none'
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(problem.description),
          }}
        />
      </div>

      {/* Examples */}
      {problem.examples.length > 0 && (
        <div>
          <h3 className='font-semibold mb-2 text-lg'>Examples</h3>
          <div className='space-y-3'>
            {problem.examples.map((example, idx) => (
              <Card key={idx} className='p-4 bg-muted'>
                <p className='text-xs font-semibold mb-2 text-muted-foreground'>
                  Example {idx + 1}
                </p>
                <div className='grid sm:grid-cols-2 gap-4 text-xs font-mono'>
                  <div>
                    <p className='text-muted-foreground mb-1'>Input:</p>
                    <pre className='bg-background p-2 rounded overflow-x-auto border border-border'>
                      {example.input}
                    </pre>
                  </div>
                  <div>
                    <p className='text-muted-foreground mb-1'>Output:</p>
                    <pre className='bg-background p-2 rounded overflow-x-auto border border-border'>
                      {example.output}
                    </pre>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Constraints */}
      {problem.constraints && (
        <div>
          <h3 className='font-semibold mb-2 text-lg'>Constraints</h3>
          <p className='text-sm text-foreground whitespace-pre-wrap leading-relaxed'>
            {problem.constraints}
          </p>
        </div>
      )}
    </div>
  );
}
