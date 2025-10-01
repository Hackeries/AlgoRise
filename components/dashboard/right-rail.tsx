"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRealtimeUpdates, useCrossTabSync } from "@/lib/hooks/use-real-time";

type Contest = {
  id: string;
  name: string;
  date: string;
  type: "group" | "public";
};

export function RightRail() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState({
    current: 0,
    calendar: [] as boolean[],
  });
  const [contests, setContests] = useState<Contest[]>([]);
  const [cfHandle, setCfHandle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useRealtimeUpdates("/api/analytics/summary", {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  useRealtimeUpdates("/api/contests/upcoming", {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });

  useCrossTabSync("rg_streak_updated", () => {
    fetchData();
  });

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch streak data
      const streakResponse = await fetch("/api/analytics/summary");
      const streakJson = await streakResponse.json();

      const currentStreak = streakJson.currentStreak || 0;
      const calendar = Array.from(
        { length: 21 },
        (_, i) => 20 - i < currentStreak
      );

      setStreakData({ current: currentStreak, calendar });

      // Fetch upcoming contests
      const contestsResponse = await fetch("/api/contests/upcoming");
      const contestsJson = await contestsResponse.json();
      setContests(contestsJson.contests || []);

      // Fetch CF handle
      const profileResponse = await fetch("/api/profile/cf-handle");
      const profileJson = await profileResponse.json();
      setCfHandle(profileJson.handle || null);
    } catch (error) {
      console.error("Failed to fetch right rail data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2 space-y-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Streak Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">🔥 Streak</CardTitle>
          <CardDescription>
            {streakData.current > 0
              ? `${streakData.current} day${
                  streakData.current === 1 ? "" : "s"
                } strong! Keep going.`
              : "Complete one meaningful action today to start your streak."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div aria-label="Streak calendar" className="grid grid-cols-7 gap-1">
            {streakData.calendar.map((active, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded transition-colors ${
                  active ? "bg-primary" : "bg-muted"
                }`}
                title={active ? "Active day" : "Inactive day"}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating Trend Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">📈 Rating Trend</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            role="img"
            aria-label="Rating trend visualization"
            className="h-28 w-full rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground"
          >
            {cfHandle
              ? "Rating chart coming soon"
              : "Link your CF handle to see rating trends"}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Contests Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">🏆 Upcoming Contests</CardTitle>
          <CardDescription>Private practice and group events.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {contests.length > 0 ? (
            contests.slice(0, 3).map((contest) => (
              <div
                key={contest.id}
                className="flex items-center justify-between text-sm hover:bg-muted/50 p-2 rounded transition"
              >
                <span className="truncate">{contest.name}</span>
                <Badge variant="outline">{contest.date}</Badge>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground py-2">
              No upcoming contests. Create one to get started!
            </div>
          )}
          <Button variant="outline" className="mt-2 w-full">
            Create contest
          </Button>
        </CardContent>
      </Card>

      {/* CF Handle Verification Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">🖥️ CF Handle</CardTitle>
          <CardDescription>
            {cfHandle
              ? "Linked and verified"
              : "Link and verify your CF handle"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-2">
          <Badge variant={cfHandle ? "default" : "secondary"}>
            {cfHandle || "Not linked"}
          </Badge>
          <Button variant="outline" size="sm">
            {cfHandle ? "Update" : "Verify"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
