import { requireUserId } from "@/lib/auth";
import { getUserStats } from "@/lib/stats";
import { recommendProblems } from "@/app/actions/cf";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, TrendingUp, Calendar, Play } from "lucide-react";
import RatingChartWrapper from "./rating-chart-wrapper";

async function getUpcomingContests() {
  try {
    const res = await fetch("https://codeforces.com/api/contest.list?gym=false", {
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    if (data.status !== "OK") return [];
    return data.result
      .filter((c: any) => c.phase === "BEFORE")
      .slice(0, 5)
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        start: new Date(c.startTimeSeconds * 1000),
      }));
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const userId = await requireUserId();
  const stats = await getUserStats(userId);
  const recs = await recommendProblems(6);
  const subs = await db.submission.findMany({
    where: { userId },
    orderBy: { submittedAt: "desc" },
    take: 10,
    select: { cfSubmissionId: true, verdict: true, problemId: true, submittedAt: true },
  });
  const contests = await getUpcomingContests();

  const ratingSnapshots = await db.ratingSnapshot.findMany({
    where: { userId },
    orderBy: { at: "asc" },
    select: { at: true, rating: true },
  });

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your competitive programming control center 🚀
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Solved Total</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.solved}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Solved Last 30 Days</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{stats.solved30}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Streak</CardTitle></CardHeader><CardContent className="text-2xl font-bold">🔥 5 days</CardContent></Card>
      </div>

      {/* Rating History Chart */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Rating Progress</h2>
        {ratingSnapshots.length > 1 ? (
          <RatingChartWrapper data={ratingSnapshots} />
        ) : (
          <p className="text-muted-foreground">Not enough data yet — sync to start tracking your rating.</p>
        )}
      </section>

      {/* Recommendations */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Recommended Problems</h2>
          <Link href="/problems" className="text-sm text-primary flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recs.map((p) => (
            <Card key={p.id} className="hover:shadow-lg transition">
              <CardHeader><CardTitle className="text-base">{p.name}</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="space-x-2">
                  <Badge variant="outline">{p.rating ?? "?"}</Badge>
                  {p.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <Button asChild size="sm" variant="outline">
                  <a
                    href={`https://codeforces.com/problemset/problem/${p.id.replace(/-.+$/, "")}/${p.index}`}
                    target="_blank"
                  >
                    <Play size={14} className="mr-1" /> Solve
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Upcoming Contests */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="text-primary" /> 
          <h2 className="text-xl font-semibold">Upcoming Contests</h2>
        </div>
        {contests.length === 0 ? (
          <p className="text-muted-foreground">No upcoming contests found.</p>
        ) : (
          <ul className="space-y-2">
            {contests.map((c) => (
              <li key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                <span>{c.name}</span>
                <Badge variant="outline">
                  {c.start.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="text-primary" /> 
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <ul className="divide-y rounded-lg border">
          {subs.map((s) => (
            <li key={s.cfSubmissionId} className="flex items-center justify-between py-2 px-3 text-sm">
              <span>{s.problemId}</span>
              <Badge variant={s.verdict === "OK" ? "default" : "destructive"}>
                {s.verdict}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
