"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { RatingSparkline } from "./rating-sparkline";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function RightRailToday() {
  // ---------------- Streaks ----------------
  const { data: streakData } = useSWR<{
    currentStreak: number;
    longestStreak: number;
    lastActiveDay: string | null;
  }>("/api/streaks", fetcher);
  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;
  const lastActive = streakData?.lastActiveDay
    ? new Date(streakData.lastActiveDay)
    : null;

  // ---------------- Next Contest Countdown ----------------
  const { data: profile } = useSWR<{
    nextContestAt?: string;
  }>("/api/profile", fetcher);
  const [countdown, setCountdown] = useState("—");

  useEffect(() => {
    if (!profile?.nextContestAt) return;

    const updateCountdown = () => {
      const diff = Math.max(
        0,
        new Date(profile.nextContestAt!).getTime() - Date.now()
      );
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${hrs}h ${mins}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30 * 1000);
    return () => clearInterval(interval);
  }, [profile?.nextContestAt]);

  return (
    <aside className="flex flex-col gap-4">
      {/* ---------------- Streak Card ---------------- */}
      <div className="rounded-lg border border-gray-800 bg-neutral-950 p-4">
        <h4 className="text-sm font-semibold text-white">Streak</h4>
        <p className="mt-1 text-2xl font-bold text-white">{currentStreak}</p>
        <p className="mt-1 text-sm text-gray-300">Days active</p>
        <div className="mt-3 text-xs text-gray-400">
          <div>Longest streak: {longestStreak} days</div>
          <div>
            Last active: {lastActive ? lastActive.toLocaleDateString() : "—"}
          </div>
        </div>
      </div>

      {/* ---------------- Next Contest Card ---------------- */}
      {profile?.nextContestAt && (
        <div className="rounded-lg border border-gray-800 bg-neutral-950 p-4">
          <h4 className="text-sm font-semibold text-white">Next contest</h4>
          <p className="mt-1 text-2xl font-bold text-white">{countdown}</p>
        </div>
      )}

      {/* ---------------- Rating Sparkline ---------------- */}
      <div className="rounded-lg border border-gray-800 bg-neutral-950 p-4">
        <h4 className="text-sm font-semibold text-white">Rating progression</h4>
        <div className="mt-2">
          <RatingSparkline />
        </div>
      </div>
    </aside>
  );
}
