'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';

interface Problem {
  id: string;
  name: string;
  description: string;
  examples: Array<{ input: string; output: string }>;
  constraints: string;
  timeLimit: number;
  memoryLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
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
    <div className='space-y-4 overflow-y-auto h-full pr-4'>
      <div>
        <div className='flex items-center gap-2 mb-2'>
          <h2 className='text-xl font-bold'>{problem.name}</h2>
          <Badge className={difficultyColor[problem.difficulty]}>
            {problem.difficulty}
          </Badge>
        </div>
        <div className='flex gap-4 text-sm text-muted-foreground'>
          <div className='flex items-center gap-1'>
            <Clock className='w-4 h-4' />
            {problem.timeLimit}s
          </div>
          <div className='flex items-center gap-1'>
            <Zap className='w-4 h-4' />
            {problem.memoryLimit}MB
          </div>
        </div>
      </div>

      <div>
        <h3 className='font-semibold mb-2'>Description</h3>
        <p className='text-sm text-foreground whitespace-pre-wrap'>
          {problem.description}
        </p>
      </div>

      {problem.examples.length > 0 && (
        <div>
          <h3 className='font-semibold mb-2'>Examples</h3>
          <div className='space-y-2'>
            {problem.examples.map((example, idx) => (
              <Card key={idx} className='p-3 bg-muted'>
                <p className='text-xs font-semibold mb-1'>Example {idx + 1}</p>
                <div className='grid grid-cols-2 gap-2 text-xs font-mono'>
                  <div>
                    <p className='text-muted-foreground mb-1'>Input:</p>
                    <pre className='bg-background p-2 rounded overflow-x-auto'>
                      {example.input}
                    </pre>
                  </div>
                  <div>
                    <p className='text-muted-foreground mb-1'>Output:</p>
                    <pre className='bg-background p-2 rounded overflow-x-auto'>
                      {example.output}
                    </pre>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className='font-semibold mb-2'>Constraints</h3>
        <p className='text-sm text-foreground whitespace-pre-wrap'>
          {problem.constraints}
        </p>
      </div>
    </div>
  );
}
