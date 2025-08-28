import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { refreshUserData, recommendProblems } from "@/app/actions/cf";
import DashboardClient from "./_client";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) return null;
  const me = await db.user.findUnique({ where: { email: session.user?.email ?? undefined } });
  if (!me?.cfHandle) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <p className="text-lg">Link your Codeforces handle to get started.</p>
        <a className="text-primary underline" href="/me">Go to linking page →</a>
      </div>
    );
  }

  // serve cached data quickly; kick a refresh in background
  refreshUserData(me.cfHandle); // fire and forget

  const [snapshots, recs] = await Promise.all([
    db.ratingSnapshot.findMany({ where: { userId: me.id }, orderBy: { at: "asc" } }),
    recommendProblems(me.cfHandle, 6),
  ]);

  return <DashboardClient me={me} snapshots={snapshots} recs={recs} />;
}
