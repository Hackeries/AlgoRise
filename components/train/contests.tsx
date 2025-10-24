'use client';

import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function UpcomingContests() {
  const { data, isLoading } = useSWR<{
    contests: {
      id: string;
      name: string;
      date: string;
      type: 'group' | 'public';
    }[];
  }>('/api/contests/upcoming', fetcher);
  const contests = data?.contests || [];

  return (
    <Card className='border h-full'>
      <CardHeader className='pb-2'>
        <CardTitle>Upcoming Contests</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {isLoading && (
          <div className='text-sm text-muted-foreground'>
            Fetching contests…
          </div>
        )}
        {!isLoading && contests.length === 0 && (
          <div className='text-sm text-muted-foreground'>
            No upcoming contests found for your groups yet.
          </div>
        )}
        {contests.map(c => (
          <div key={c.id} className='rounded-md border p-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='font-medium'>{c.name}</span>
              <Badge variant='outline'>{c.type}</Badge>
              <span className='ml-auto text-sm text-muted-foreground'>
                {c.date}
              </span>
            </div>
            <div className='mt-2'>
              <Button size='sm' variant='outline'>
                Set Reminder
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}