"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { cfUserInfo, cfUserStatus } from "@/lib/cf";

const linkSchema = z.object({
  handle: z.string().min(2).max(32).regex(/^[a-zA-Z0-9_.-]+$/, "Invalid handle"),
});

export async function linkCodeforces(prevState: any, formData: FormData) {
  try {
    const userId = await requireUserId();
    const parsed = linkSchema.safeParse({ handle: formData.get("handle")?.toString().trim() });
    if (!parsed.success)
      return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid handle" };

    const info = await cfUserInfo(parsed.data.handle);

    await db.user.update({
      where: { id: userId },
      data: {
        cfHandle: info.handle,
        rating: info.rating ?? null,
        maxRating: info.maxRating ?? null,
        lastSyncAt: new Date(),
      },
    });

    const { created } = await syncRecentSubmissionsInternal(userId, info.handle);

    revalidatePath("/me");
    revalidatePath("/dashboard");
    return { ok: true, message: `Linked ${info.handle}. Synced ${created} submissions.` };
  } catch (e: any) {
    return { ok: false, error: e.message || "Failed to link handle" };
  }
}

export async function syncNow() {
  try {
    const userId = await requireUserId();
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { cfHandle: true },
    });
    if (!user?.cfHandle)
      return { ok: false, error: "Link your Codeforces handle first" };

    const { created } = await syncRecentSubmissionsInternal(userId, user.cfHandle);

    revalidatePath("/me");
    revalidatePath("/dashboard");
    return { ok: true, message: `Synced ${created} new submissions.` };
  } catch (e: any) {
    return { ok: false, error: e.message || "Sync failed" };
  }
}


export async function recommendProblems(limit?: number) {
  const userId = await requireUserId();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { rating: true },
  });

  if (!user?.rating) return [];

  const lower = user.rating - 100;
  const upper = user.rating + 200;

  // Make sure limit is always a positive integer
  const safeLimit = Number.isFinite(limit) && limit! > 0 ? Math.floor(limit!) : 6;

  return db.problem.findMany({
    where: {
      rating: { gte: lower, lte: upper },
      submissions: {
        none: { userId, verdict: "OK" }, // exclude already-solved
      },
    },
    take: safeLimit,
    orderBy: { rating: "asc" },
  });
}



// Internal helper
async function syncRecentSubmissionsInternal(userId: string, handle: string) {
  const subs = await cfUserStatus(handle);

  const problemsMap = new Map<string, any>();
  const submissionRows: any[] = [];

  for (const s of subs) {
    const p = s.problem ?? {};
    const pid = `${p.contestId ?? "GYM"}-${p.index ?? "X"}`;
    if (!problemsMap.has(pid)) {
      problemsMap.set(pid, {
        id: pid,
        name: p.name ?? "Unknown",
        rating: p.rating ?? null,
        tags: p.tags ?? [],
        contestId: typeof p.contestId === "number" ? p.contestId : null,
        index: p.index,
      });
    }
    submissionRows.push({
      userId,
      problemId: pid,
      cfSubmissionId: s.id,
      verdict: s.verdict ?? "UNKNOWN",
      language: s.programmingLanguage ?? null,
      submittedAt: new Date((s.creationTimeSeconds ?? 0) * 1000),
      fromCF: true,
    });
  }

  const chunk = <T,>(arr: T[], size: number) =>
    Array.from(
      { length: Math.ceil(arr.length / size) },
      (_, i) => arr.slice(i * size, i * size + size)
    );

  for (const group of chunk(Array.from(problemsMap.values()), 50)) {
    await db.$transaction(
      group.map((pr) =>
        db.problem.upsert({
          where: { id: pr.id },
          update: pr,
          create: pr,
        })
      )
    );
  }

  let created = 0;
  for (const group of chunk(submissionRows, 50)) {
    await db.$transaction(
      group.map((r) =>
        db.submission.upsert({
          where: { userId_cfSubmissionId: { userId: r.userId, cfSubmissionId: r.cfSubmissionId } },
          update: r,
          create: r,
        })
      )
    );
    created += group.length;
  }

  return { created };
}
