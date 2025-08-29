'use client';

import dynamic from 'next/dynamic';

const RatingChart = dynamic(() => import('./rating-chart'), { ssr: false });

export default function RatingChartWrapper({ data }: { data: { at: Date; rating: number }[] }) {
  return <RatingChart data={data} />;
}
