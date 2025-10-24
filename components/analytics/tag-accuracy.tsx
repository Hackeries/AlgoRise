'use client';

import useSWR from 'swr';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function TagAccuracy({ range }: { range: '7d' | '30d' }) {
  const { data } = useSWR<{
    tags: { tag: string; accuracy: number; solved: number }[];
  }>(`/api/analytics/tag-accuracy?range=${range}`, fetcher);

  const tags = data?.tags ?? [];

  return (
    <div className='h-64'>
      <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={tags}>
          <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
          <XAxis dataKey='tag' tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip />
            <Bar dataKey='accuracy' fill={'hsl(var(--accent))'} />
        </BarChart>
      </ResponsiveContainer>
      <div className='mt-2 text-sm text-muted-foreground'>
        Based on recent attempts. Accuracy is percentage of solves per tag.
      </div>
    </div>
  );
}
