"use client";

import useSWR from "swr";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Dot,
  LabelList,
} from "recharts";

type Point = {
  rating: number;
  at: string; // ISO date string
  contestName?: string;
};
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function RatingSparkline() {
  const { data, error, isLoading } = useSWR(
    "/api/cf-snapshot/history",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  if (isLoading)
    return <div className="text-xs text-muted-foreground">Loading rating…</div>;
  if (error || !data?.ok)
    return <div className="text-xs text-muted-foreground">No rating data</div>;

  const points: Point[] = data.data ?? [];
  if (!points.length)
    return <div className="text-xs text-muted-foreground">No contests yet</div>;

  // Add delta for tooltip
  const pointsWithDelta = points.map((p, i) => {
    const prev = points[i - 1];
    return {
      ...p,
      delta: prev ? p.rating - prev.rating : 0,
    };
  });

  return (
    <div className="w-full h-32">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={pointsWithDelta}>
          <defs>
            <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="at"
            hide={false}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString(undefined, { month: "short" })
            }
          />
          <YAxis hide domain={["auto", "auto"]} />

          <Tooltip
            contentStyle={{
              background: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              padding: "0.5rem",
            }}
            labelFormatter={(v) =>
              `Contest: ${new Date(v).toLocaleDateString()}`
            }
            formatter={(value: number, _: string, props: any) => {
              const delta = props.payload.delta;
              return [`${value} (${delta >= 0 ? "+" : ""}${delta})`, "Rating"];
            }}
          />

          <Area
            type="monotone"
            dataKey="rating"
            stroke="#2563EB"
            fill="url(#ratingGradient)"
            strokeWidth={2}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "#2563EB" }}
            dot={(props) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={payload.delta >= 0 ? "#10B981" : "#EF4444"} // green up, red down
                  stroke="#ffffff"
                  strokeWidth={1}
                />
              );
            }}
          >
            <LabelList
              dataKey="rating"
              position="top"
              formatter={(v) => v}
              style={{ fontSize: 10, fill: "var(--foreground)" }}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
