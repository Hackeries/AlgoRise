import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { recommendProblems } from "@/app/actions/cf";

export default async function ProblemsPage({ searchParams }: { searchParams: { tags?: string } }) {
  const session = await getServerSession();
  const me = await db.user.findUnique({ where: { email: session?.user?.email ?? undefined } });
  if (!me?.cfHandle) return <div className="p-6">Link your CF handle in /me</div>;
  const tags = searchParams.tags ? searchParams.tags.split(",").map((t) => t.trim()) : [];
  const recs = await recommendProblems(me.cfHandle, 30, tags);
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="text-xl font-semibold">Recommended problems</h2>
      <p className="text-sm text-muted-foreground">Filters: {tags.length ? tags.join(", ") : "none"}</p>
      <ul className="mt-4 space-y-2">
        {recs.map((p) => (
          <li key={p.id} className="flex justify-between border rounded px-3 py-2">
            <span>{p.name} <span className="text-xs text-muted-foreground">({p.rating ?? "?"}) - {p.tags.join(", ")}</span></span>
            <a className="text-primary underline text-sm" href={`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`} target="_blank">Open</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
