"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import { differenceInCalendarDays, isSameDay, subDays } from "date-fns";

const CF = "https://codeforces.com/api";

async function cachedGet(path: string, ttlMs: number) {
  const key = `cf:${path}`;
  const now = new Date();
  const hit = await db.cache.findUnique({ where: { key } });
  if (hit && hit.expiresAt > now) return JSON.parse(hit.value);
  const res = await fetch(`${CF}/${path}`, { cache: "no-store", next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`CF ${path} failed`);
  const json = await res.json();
  await db.cache.upsert({
    where: { key },
    create: { key, value: JSON.stringify(json), expiresAt: new Date(Date.now() + ttlMs) },
    update: { value: JSON.stringify(json), expiresAt: new Date(Date.now() + ttlMs) },
  });
  return json;
}

export async function linkHandleAction(handle: string) {
  const schema = z.string().min(2).max(32);
  const h = schema.parse(handle.trim());
  const info = await cachedGet(`user.info?handles=${encodeURIComponent(h)}`, 2 * 60_000);
  const u = info.result[0];
  await db.user.upsert({
    where: { cfHandle: h },
    create: {
      cfHandle: h,
      cfUserId: u?.id ?? null,
      image: u?.avatar ?? null,
      rating: u?.rating ?? null,
      maxRating: u?.maxRating ?? null,
      contestsCount: u?.contestCount ?? null,
      lastSyncAt: new Date(),
    },
    update: {
      cfUserId: u?.id ?? null,
      image: u?.avatar ?? null,
      rating: u?.rating ?? null,
      maxRating: u?.maxRating ?? null,
      contestsCount: u?.contestCount ?? null,
      lastSyncAt: new Date(),
    },
  });
  await refreshUserData(h);
  return { ok: true };
}

export async function refreshUserData(handle: string) {
  // 1) user.info
  const info = await cachedGet(`user.info?handles=${encodeURIComponent(handle)}`, 3 * 60_000);
  const u = info.result[0];
  await db.user.update({
    where: { cfHandle: handle },
    data: {
      cfUserId: u?.id ?? null,
      image: u?.avatar ?? null,
      rating: u?.rating ?? null,
      maxRating: u?.maxRating ?? null,
      contestsCount: u?.contestCount ?? null,
      lastSyncAt: new Date(),
    },
  });

  // 2) user.rating -> snapshots
  const rating = await cachedGet(`user.rating?handle=${encodeURIComponent(handle)}`, 60 * 60_000);
  for (const r of rating.result as any[]) {
    await db.ratingSnapshot.upsert({
      where: { userId_at: { userId: (await db.user.findUnique({ where: { cfHandle: handle } }))!.id, at: new Date(r.ratingUpdateTimeSeconds * 1000) } } as any,
      create: {
        userId: (await db.user.findUnique({ where: { cfHandle: handle } }))!.id,
        at: new Date(r.ratingUpdateTimeSeconds * 1000),
        rating: r.newRating,
      },
      update: {},
    });
  }

  // 3) user.status -> submissions, streaks, solved counts
  const status = await cachedGet(`user.status?handle=${encodeURIComponent(handle)}&from=1&count=200`, 2 * 60_000);
  const user = await db.user.findUnique({ where: { cfHandle: handle } });
  if (!user) return;

  let solvedToday = 0;
  let solvedWeek = 0;
  const today = new Date();
  const weekStart = subDays(today, 6);
  const seenOK = new Set<string>();

  for (const s of status.result as any[]) {
    const pid = `${s.problem.contestId}-${s.problem.index}`;
    if (s.verdict === "OK") {
      if (!seenOK.has(pid)) {
        seenOK.add(pid);
        const at = new Date(s.creationTimeSeconds * 1000);
        if (isSameDay(at, today)) solvedToday++;
        if (at >= weekStart) solvedWeek++;
      }
    }
    await db.problem.upsert({
      where: { id: pid },
      create: {
        id: pid,
        name: s.problem.name,
        rating: s.problem.rating ?? null,
        tags: s.problem.tags ?? [],
        contestId: s.problem.contestId ?? null,
        index: s.problem.index,
      },
      update: {},
    });
    await db.submission.upsert({
      where: { userId_cfSubmissionId: { userId: user.id, cfSubmissionId: s.id } },
      create: {
        userId: user.id,
        problemId: pid,
        cfSubmissionId: s.id,
        verdict: s.verdict ?? "UNKNOWN",
        language: s.programmingLanguage ?? null,
        submittedAt: new Date(s.creationTimeSeconds * 1000),
      },
      update: {
        verdict: s.verdict ?? "UNKNOWN",
        language: s.programmingLanguage ?? null,
      },
    });
  }

  // streak calc (based on last AC per day)
  const subs = await db.submission.findMany({
    where: { userId: user.id, verdict: "OK" },
    orderBy: { submittedAt: "desc" },
    take: 365,
  });
  let streak = 0;
  let dayCursor = new Date();
  for (let i = 0; i < 365; i++) {
    const hasAC = subs.some((s) => isSameDay(s.submittedAt, dayCursor));
    if (hasAC) streak++;
    else break;
    dayCursor = subDays(dayCursor, 1);
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      solvedCount: seenOK.size,
      lastSolvedAt: subs[0]?.submittedAt ?? null,
      streakDays: streak,
    },
  });

  // emit events (for real-time feed)
  try {
    const { events } = await import("@/lib/events");
    events.emit("rating", { userId: user.id, rating: u?.rating ?? null });
    for (const pid of seenOK) {
      events.emit("ac", { userId: user.id, problemId: pid, at: new Date() });
    }
  } catch {}
}

export async function recommendProblems(handle: string, limit = 10, tags: string[] = []) {
  const user = await db.user.findUnique({ where: { cfHandle: handle } });
  const rating = user?.rating ?? 1000;
  const min = rating - 200, max = rating + 200;

  const solved = await db.submission.findMany({
    where: { userId: user!.id, verdict: "OK" },
    select: { problemId: true },
  });
  const solvedSet = new Set(solved.map((s) => s.problemId));

  const where: any = { rating: { gte: min, lte: max } };
  if (tags.length) where.tags = { hasSome: tags };

  const candidates = await db.problem.findMany({
    where,
    take: 200,
  });
  const filtered = candidates.filter((p) => !solvedSet.has(p.id)).slice(0, limit);
  return filtered;
}

export async function refreshProblemset() {
  const ps = await cachedGet("problemset.problems", 24 * 60 * 60_000);
  const problems = ps.result.problems as any[];
  for (const p of problems) {
    const id = `${p.contestId}-${p.index}`;
    await db.problem.upsert({
      where: { id },
      create: {
        id,
        name: p.name,
        rating: p.rating ?? null,
        tags: p.tags ?? [],
        contestId: p.contestId ?? null,
        index: p.index,
      },
      update: {
        name: p.name,
        rating: p.rating ?? null,
        tags: p.tags ?? [],
      },
    });
  }
  return { count: problems.length };
}
