"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Trophy, Medal, Award, TrendingUp, Users } from "lucide-react";
import useSWR from "swr";

interface LeaderboardEntry {
  id: string;
  name: string;
  handle: string;
  rating: number;
  college: string;
  rank: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function GlobalLeaderboard() {
  const [ratingRange, setRatingRange] = useState<[number, number]>([0, 4000]);
  const [activeTab, setActiveTab] = useState<"same" | "all">("same");

  const { data, isLoading } = useSWR<{
    leaderboard: LeaderboardEntry[];
  }>(
    `/api/leaderboards?type=${activeTab}&ratingMin=${ratingRange[0]}&ratingMax=${ratingRange[1]}`,
    fetcher
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-sm font-medium text-muted-foreground">
            #{rank}
          </span>
        );
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 2400) return "text-red-500"; // Grandmaster
    if (rating >= 2100) return "text-orange-500"; // Master
    if (rating >= 1900) return "text-purple-500"; // Candidate Master
    if (rating >= 1600) return "text-blue-500"; // Expert
    if (rating >= 1400) return "text-cyan-500"; // Specialist
    if (rating >= 1200) return "text-green-500"; // Pupil
    return "text-gray-500"; // Newbie
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leaderboards
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="same"
          onValueChange={(value) => setActiveTab(value as "same" | "all")}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="same">Same College</TabsTrigger>
            <TabsTrigger value="all">All Colleges</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Rating Filter: {ratingRange[0]} - {ratingRange[1]}
              </label>
              <Slider
                value={ratingRange}
                onValueChange={(value) =>
                  setRatingRange(value as [number, number])
                }
                max={4000}
                min={0}
                step={100}
                className="mt-2"
              />
            </div>
          </div>

          <TabsContent value="same" className="mt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-3 bg-muted/20 rounded-lg animate-pulse"
                  >
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-24 mb-2" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                    <div className="h-6 bg-muted rounded w-12" />
                  </div>
                ))}
              </div>
            ) : data?.leaderboard ? (
              <div className="space-y-2">
                {data.leaderboard.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center space-x-4 p-3 rounded-lg transition-colors hover:bg-muted/20 ${
                      entry.rank <= 3 ? "bg-muted/10 border border-muted" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(entry.rank)}
                    </div>

                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {entry.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {entry.name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {entry.handle}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.college}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${getRatingColor(
                          entry.rating
                        )}`}
                      >
                        {entry.rating}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  No members found
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-3 bg-muted/20 rounded-lg animate-pulse"
                  >
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-24 mb-2" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                    <div className="h-6 bg-muted rounded w-12" />
                  </div>
                ))}
              </div>
            ) : data?.leaderboard ? (
              <div className="space-y-2">
                {data.leaderboard.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center space-x-4 p-3 rounded-lg transition-colors hover:bg-muted/20 ${
                      entry.rank <= 3 ? "bg-muted/10 border border-muted" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(entry.rank)}
                    </div>

                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {entry.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {entry.name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {entry.handle}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.college}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${getRatingColor(
                          entry.rating
                        )}`}
                      >
                        {entry.rating}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  No members found
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
