import { requireUserId } from "@/lib/auth";
import { getUserStats } from "@/lib/stats";
import { recommendProblems } from "@/app/actions/cf";
import { db } from "@/lib/db";

export async function GET() {
  const userId = await requireUserId();
  const stats = await getUserStats(userId);
  const recs = await recommendProblems(6);
  const subs = await db.submission.findMany({
    where: { userId },
    orderBy: { submittedAt: "desc" },
    take: 10,
  });
  const ratingSnapshots = await db.ratingSnapshot.findMany({
    where: { userId },
    orderBy: { at: "asc" },
  });

  return Response.json({ stats, recs, subs, ratingSnapshots });
}
