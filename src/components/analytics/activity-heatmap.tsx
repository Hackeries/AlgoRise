'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function ActivityHeatmap({ range }: { range: '7d' | '30d' }) {
  const { data } = useSWR<{
    grid: number[][];
    days: string[];
    hours: string[];
  }>(`/api/analytics/activity-heatmap?range=${range}`, fetcher);
  const grid = data?.grid ?? [];
  const days = data?.days ?? [];
  const hours = data?.hours ?? [];

  return (
    <div className='overflow-x-auto'>
      <div
        className='inline-grid'
        style={{
          gridTemplateColumns: `80px repeat(${hours.length}, minmax(20px, 1fr))`,
        }}
      >
        <div></div>
        {hours.map(h => (
          <div key={h} className='text-xs text-center text-muted-foreground'>
            {h}
          </div>
        ))}
        {grid.map((row, rIdx) => (
          <FragmentRow key={rIdx} label={days[rIdx]} values={row} />
        ))}
      </div>
    </div>
  );
}

function FragmentRow({ label, values }: { label: string; values: number[] }) {
  return (
    <>
      <div className='text-xs text-muted-foreground pr-2 self-center'>
        {label}
      </div>
      {values.map((v, i) => (
        <div
          key={i}
          className='h-5 w-5 rounded'
          style={{ backgroundColor: intensityToColor(v) }}
          aria-label={`${label} hour ${i}: ${v} attempts`}
          title={`${label} hour ${i}: ${v} attempts`}
        />
      ))}
    </>
  );
}

function intensityToColor(v: number) {
  const base = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary')
    .trim();
  // Fallback to blue if CSS variable not ready
  const hslBody = base || '217 91% 60%';
  const opacities = [0.08, 0.25, 0.45, 0.65, 0.85];
  const idx = Math.max(0, Math.min(4, v));
  return `hsl(${hslBody} / ${opacities[idx]})`;
}
