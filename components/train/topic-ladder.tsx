'use client';

import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function TopicLadder() {
  const { data, isLoading } = useSWR<{
    tags: { tag: string; accuracy: number }[];
  }>('/api/analytics/tag-accuracy?range=30d', fetcher);

  const tags = data?.tags?.slice(0, 9) || [];

  return (
    <Card className='border'>
      <CardHeader className='pb-2'>
        <CardTitle>Topic Ladder</CardTitle>
      </CardHeader>
      <CardContent className='overflow-x-auto'>
        {isLoading && (
          <div className='text-sm text-muted-foreground'>
            Loading your tag performance…
          </div>
        )}
        {!isLoading && tags.length === 0 && (
          <div className='text-sm text-muted-foreground'>
            No attempts yet. Start solving to unlock insights.
          </div>
        )}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-w-[280px]'>
          {tags.map(t => (
            <div key={t.tag} className='rounded-md border p-3 bg-card'>
              <div className='flex items-center justify-between mb-2'>
                <span className='font-medium'>{t.tag}</span>
                <span className='text-sm text-muted-foreground'>
                  {Math.round(Math.min(100, Math.max(0, t.accuracy)))}%
                </span>
              </div>
              <Progress value={Math.min(100, Math.max(0, t.accuracy))} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}