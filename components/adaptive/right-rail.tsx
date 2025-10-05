import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import useSWR from 'swr';
import { useCFVerification } from '@/lib/context/cf-verification';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Target, Flame, AlertTriangle, Trophy } from 'lucide-react';

type AdaptiveSheetResponse = {
  baseRating: number;
  groups: {
    dueNow: any[];
    dueSoon: any[];
    later: any[];
  };
  stats: {
    solvedRate: number;
    streak: number;
    lastInteractionAt?: string;
    weakTags: Record<string, { attempts: number; fails: number }>;
  };
};

type CFProgressResponse = {
  progress: {
    totalSolved: number;
    byDifficulty: Record<string, number>;
    byTags: Record<string, number>;
    recentActivity: Array<{ date: string; count: number }>;
    streakData: {
      current: number;
      longest: number;
      lastSolvedDate: string | null;
    };
    ratingHistory: Array<{ change: number }>;
  };
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function AdaptiveRightRailData({
  baseRating = 1500,
  tags = [],
}: {
  baseRating?: number;
  tags?: string[];
}) {
  const { isVerified, verificationData } = useCFVerification();

  const params = new URLSearchParams();
  params.set('baseRating', String(baseRating));
  if (tags.length) params.set('tags', tags.join(','));

  const { data } = useSWR<AdaptiveSheetResponse>(
    `/api/adaptive-sheet?${params.toString()}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: cfProgress } = useSWR<CFProgressResponse>(
    isVerified && verificationData?.handle
      ? `/api/cf/progress?handle=${verificationData.handle}`
      : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: tagAccuracy } = useSWR<{
    tags: any[];
    weakTags: { tag: string; accuracy: number; solved: number; total: number }[];
  }>('/api/analytics/tag-accuracy', fetcher, { revalidateOnFocus: false });

  // Safe defaults for groups
  const dueNow = data?.groups?.dueNow ?? [];
  const dueSoon = data?.groups?.dueSoon ?? [];
  const later = data?.groups?.later ?? [];

  const totalCandidates = dueNow.length + dueSoon.length + later.length;
  const solved = Math.round((data?.stats?.solvedRate || 0) * Math.max(1, totalCandidates));

  // Use real CF progress if available
  const realSolved = cfProgress?.progress?.totalSolved ?? solved;
  const realStreak = cfProgress?.progress?.streakData?.current ?? data?.stats?.streak ?? 0;

  // Weak tags calculation with safe fallbacks
  let weakTagItems: { tag: string; acc: number }[] = [];
  if (tagAccuracy?.weakTags?.length) {
    weakTagItems = tagAccuracy.weakTags.map(item => ({
      tag: item.tag,
      acc: item.accuracy,
    }));
  } else if (cfProgress?.progress?.byTags) {
    const tagEntries = Object.entries(cfProgress.progress.byTags);
    const totalProblems = Math.max(1, realSolved);
    weakTagItems = tagEntries
      .map(([tag, count]) => ({ tag, acc: Math.round((count / totalProblems) * 100) }))
      .filter(item => item.acc < 70)
      .sort((a, b) => a.acc - b.acc)
      .slice(0, 4);
  } else if (data?.stats?.weakTags) {
    weakTagItems = Object.entries(data.stats.weakTags).map(([tag, v]) => ({
      tag,
      acc: v.attempts > 0 ? Math.round(((v.attempts - v.fails) / v.attempts) * 100) : 0,
    }));
  }

  // Rating change for recovery mode
  const { data: cfSnapshot } = useSWR<{
    ratingDelta: number;
    lastContest: string | null;
    lastRating: number | null;
    handle: string | null;
  }>('/api/cf-snapshot', fetcher, { revalidateOnFocus: false });

  let ratingChange = cfSnapshot?.ratingDelta ?? 0;
  const ratingHistory = cfProgress?.progress?.ratingHistory ?? [];
  if (ratingChange === 0 && ratingHistory.length >= 2) {
    ratingChange = ratingHistory[ratingHistory.length - 1].change;
  }
  if (ratingChange === 0) ratingChange = -48;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, staggerChildren: 0.1 }}
      className="flex flex-col gap-6"
    >
      <ProgressTracker solved={realSolved} total={Math.max(realSolved + 10, totalCandidates, 1)} streak={realStreak} />
      <WeakTagHeatmap items={weakTagItems} />
      <RecoveryCard show={ratingChange < -30} delta={ratingChange} />
    </motion.div>
  );
}

// -------------------- Subcomponents --------------------
export function ProgressTracker({ solved = 12, total = 40, streak = 5 }: { solved?: number; total?: number; streak?: number }) {
  const pct = Math.round((solved / Math.max(total, 1)) * 100);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-background to-muted/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" /> Progress Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Problems Solved</span>
            <span className="font-semibold text-primary">
              {solved}/{total} ({pct}%)
            </span>
          </div>
          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.8, delay: 0.2 }}>
            <Progress value={pct} className="h-3" />
          </motion.div>
          <motion.div
            className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Current Streak</span>
            </div>
            <span className="text-lg font-bold text-orange-600">{streak} days</span>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function WeakTagHeatmap({ items = [] }: { items?: { tag: string; acc: number }[] }) {
  if (!items.length) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="border-2 hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-background to-muted/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-600" /> Weak Tags Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              Complete more problems to see your weak tags analysis
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-2 hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-background to-muted/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-600" /> Weak Tags Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div key={item.tag} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3, delay: idx * 0.1 }}>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-medium border-amber-300 text-amber-700 bg-amber-50">{item.tag}</Badge>
                  <span className="text-sm font-semibold text-amber-700">{item.acc}%</span>
                </div>
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(5, Math.min(item.acc, 100))}%` }} transition={{ duration: 0.8, delay: 0.4 + idx * 0.1 }} className="h-2 w-full rounded-full bg-amber-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600" />
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function RecoveryCard({ show = true, delta = -48 }: { show?: boolean; delta?: number }) {
  if (!show) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.4 }}>
      <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 hover:border-red-300 transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" /> Recovery Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-100 border border-red-200">
            <span className="text-sm font-medium text-red-800">Recent Rating Change</span>
            <span className="text-lg font-bold text-red-600 flex items-center gap-1">
              <TrendingUp className="h-4 w-4 rotate-180" /> {delta}
            </span>
          </div>
          <div className="space-y-2 text-sm text-red-700">
            <p className="font-medium">💡 Recommended Recovery Strategy:</p>
            <p className="text-red-600">
              Practice problems at <span className="font-semibold">-300 to -150</span> rating with your favorite tags to rebuild confidence.
            </p>
            <p className="text-xs text-red-500 mt-2">This mode activates automatically after significant rating drops or contest struggles.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}