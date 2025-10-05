"use client"

import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ActivityHeatmap({ range }: { range: "7d" | "30d" }) {
  const { data } = useSWR<{ grid: number[][]; days: string[]; hours: string[] }>(
    `/api/analytics/activity-heatmap?range=${range}`,
    fetcher,
  )
  const grid = data?.grid ?? []
  const days = data?.days ?? []
  const hours = data?.hours ?? []

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid" style={{ gridTemplateColumns: `80px repeat(${hours.length}, minmax(20px, 1fr))` }}>
        <div></div>
        {hours.map((h) => (
          <div key={h} className="text-xs text-center text-muted-foreground">
            {h}
          </div>
        ))}
        {grid.map((row, rIdx) => (
          <FragmentRow key={rIdx} label={days[rIdx]} values={row} />
        ))}
      </div>
    </div>
  )
}

function FragmentRow({ label, values }: { label: string; values: number[] }) {
  return (
    <>
      <div className="text-xs text-muted-foreground pr-2 self-center">{label}</div>
      {values.map((v, i) => (
        <div
          key={i}
          className="h-5 w-5 rounded"
          style={{ backgroundColor: intensityToColor(v) }}
          aria-label={`${label} hour ${i}: ${v} attempts`}
          title={`${label} hour ${i}: ${v} attempts`}
        />
      ))}
    </>
  )
}

function intensityToColor(v: number) {
  if (v <= 0) return "rgba(37, 99, 235, 0.08)"
  if (v === 1) return "rgba(37, 99, 235, 0.25)"
  if (v === 2) return "rgba(37, 99, 235, 0.45)"
  if (v === 3) return "rgba(37, 99, 235, 0.65)"
  return "rgba(37, 99, 235, 0.85)"
}
