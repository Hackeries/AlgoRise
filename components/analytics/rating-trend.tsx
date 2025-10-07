'use client';

import useSWR from 'swr';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function RatingTrend({ range }: { range: '7d' | '30d' }) {
  const { data } = useSWR<{ points: { date: string; rating: number }[] }>(
    `/api/analytics/rating-trend?range=${range}`,
    fetcher
  );

  const points = data?.points ?? [];

  return (
    <div className='h-64'>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart data={points}>
          <defs>
            <linearGradient id='ratingFill' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#2563EB' stopOpacity={0.5} />
              <stop offset='100%' stopColor='#2563EB' stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray='3 3' className='stroke-muted' />
          <XAxis dataKey='date' tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area
            type='monotone'
            dataKey='rating'
            stroke='#2563EB'
            fill='url(#ratingFill)'
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
