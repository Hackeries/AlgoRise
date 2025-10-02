// Enums for safer values
export enum Platform {
  Codeforces = "codeforces",
  LeetCode = "leetcode",
  AtCoder = "atcoder",
}

export enum Outcome {
  Solved = "solved",
  Failed = "failed",
  Skipped = "skipped",
}

export enum DueGroup {
  DueNow = "dueNow",
  DueSoon = "dueSoon",
  Later = "later",
}

// Problem definition
export type Problem = {
  id: string;
  platform: Platform;
  problemId: string;
  rating?: number; // optional in case unknown
  tags: string[];
  title: string;
  url: string;
  difficulty?: "easy" | "medium" | "hard";
};

// Sheet item for spaced repetition
export type SheetItem = {
  id: string;
  problem: Problem;
  repetitions: number;
  ease: 1 | 2 | 3 | 4 | 5; // controlled ease values
  intervalDays: number;
  nextDueAt: Date; // use Date instead of string
  lastOutcome?: Outcome;
};

// Weak tag statistics
export type WeakTagStats = Record<
  string,
  { attempts: number; fails: number; successRate?: number }
>;

// Adaptive sheet response
export type AdaptiveSheetResponse = {
  baseRating: number;
  groups: Record<DueGroup, SheetItem[]>;
  stats: {
    solvedRate: number; // 0-1
    streak: number;
    lastInteractionAt?: Date;
    weakTags: WeakTagStats;
  };
};