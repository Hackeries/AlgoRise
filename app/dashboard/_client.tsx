"use client";

import { useState, useCallback } from "react";
import { useSSE } from "@/components/useSSE";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardClient({ me, snapshots, recs }: any) {
  const [events, setEvents] = useState<any[]>([]);
  const onEvent = useCallback((ev: any) => setEvents((e) => [ev, ...e].slice(0, 50)), []);
  useSSE(onEvent);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Rating</h3>
          <p className="text-sm text-muted-foreground">Current: {me.rating ?? "—"} | Max: {me.maxRating ?? "—"}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snapshots.map((s: any) => ({ x: new Date(s.at).toLocaleDateString(), y: s.rating }))}>
                <XAxis dataKey="x" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="y" stroke="#6366f1" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Recommended problems</h3>
          <ul className="mt-3 space-y-2">
            {recs.map((p: any) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>{p.name} <span className="text-xs text-muted-foreground">({p.rating ?? "?"})</span></span>
                <a className="text-primary underline text-sm" href={`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`} target="_blank">Open</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="p-4 border rounded">
        <h3 className="font-semibold">Live activity</h3>
        <ul className="mt-3 space-y-1 max-h-64 overflow-auto">
          {events.map((e, i) => (
            <li key={i} className="text-sm">
              {e.type === "ac" ? `New AC by ${e.data.userId} on ${e.data.problemId}` : e.type === "rating" ? `Rating update for ${e.data.userId}` : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
