// lib/stats.ts
import { db } from "@/lib/db";

export async function getUserStats(userId: string) {
  // Total solved (unique problems)
  const totalSolved = await db.submission.groupBy({
    by: ["problemId"],
    where: {
      userId,
      verdict: "OK",
    },
    _count: true,
  });

  // Solved in the last 30 days
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const solvedLast30 = await db.submission.groupBy({
    by: ["problemId"],
    where: {
      userId,
      verdict: "OK",
      submittedAt: { gte: since },
    },
    _count: true,
  });

  return {
    solved: totalSolved.length,
    solved30: solvedLast30.length,
  };
}
