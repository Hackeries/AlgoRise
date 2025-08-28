import { db } from "@/lib/db";
import { startOfWeek } from "date-fns";

export default async function LeaderboardPage() {
  const since = startOfWeek(new Date(), { weekStartsOn: 1 });
  const rows = await db.$queryRawUnsafe<any[]>(`
    SELECT "User".id, "User".cfHandle, "User".image,
      COUNT(DISTINCT CASE WHEN "Submission"."verdict"='OK' AND "Submission"."submittedAt" >= $1 THEN "Submission"."problemId" END) AS weekly
    FROM "User"
    LEFT JOIN "Submission" ON "Submission"."userId" = "User".id
    GROUP BY "User".id
    ORDER BY weekly DESC NULLS LAST
    LIMIT 100
  `, since);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h2 className="text-xl font-semibold">Weekly solves</h2>
      <ol className="mt-4 space-y-2">
        {rows.map((r, i) => (
          <li key={r.id} className="flex items-center gap-3">
            <span className="w-6 text-right">{i + 1}.</span>
            <img src={r.image ?? "/avatar.png"} className="w-7 h-7 rounded-full" />
            <span className="font-mono">@{r.cfHandle ?? "—"}</span>
            <span className="ml-auto text-sm">{r.weekly ?? 0} solved</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
