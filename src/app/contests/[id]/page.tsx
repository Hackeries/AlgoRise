'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useContestRealtime } from '@/hooks/use-contest-realtime';
import {
  Clock,
  Calendar,
  Trophy,
  Share2,
  Copy,
  Info,
  RefreshCw,
  Users,
  Radio,
  Timer,
  Target,
  Zap,
  Award,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Circle,
  Sparkles,
  Edit,
  StopCircle,
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Contest {
  id: string;
  name: string;
  description: string;
  contest_mode: 'practice' | 'icpc';
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  problem_count: number;
  rating_min: number;
  rating_max: number;
  max_participants?: number;
  status: string;
  host_user_id: string;
  allow_late_join?: boolean;
  visibility: 'public' | 'private';
  problems?: {
    id: string;
    contestId: number;
    index: string;
    name: string;
    rating: number;
  }[];
  my_submissions?: Record<string, 'solved' | 'failed'>;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username?: string;
  solved: number;
  penalty: number;
}

const LEADERBOARD_REFRESH_INTERVAL = 15000;
const CONTEST_REFRESH_INTERVAL = 30000;
const LEADERBOARD_PAGE_SIZE = 10;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function CountdownDigit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/20 flex items-center justify-center shadow-lg">
          <span className="text-2xl sm:text-3xl font-bold font-mono gradient-text">
            {value}
          </span>
        </div>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/5 pointer-events-none" />
      </motion.div>
      <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  gradient: string;
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative group"
    >
      <div
        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`}
      />
      <div className="relative p-4 rounded-xl bg-card/80 backdrop-blur-md border border-border/50 shadow-lg hover:border-primary/30 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-lg bg-gradient-to-br ${gradient} shadow-md`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className="text-lg font-semibold">{value}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProblemCard({
  problem,
  index,
  status,
  isLocked,
  onClick,
}: {
  problem: { id: string; contestId: number; index: string; name: string; rating: number };
  index: number;
  status?: 'solved' | 'failed';
  isLocked: boolean;
  onClick?: () => void;
}) {
  const letter = String.fromCharCode(65 + index);
  const isSolved = status === 'solved';
  const isFailed = status === 'failed';

  const getRatingColor = (rating: number) => {
    if (rating <= 1200) return 'bg-gray-500';
    if (rating <= 1400) return 'bg-green-500';
    if (rating <= 1600) return 'bg-cyan-500';
    if (rating <= 1900) return 'bg-blue-500';
    if (rating <= 2100) return 'bg-violet-500';
    if (rating <= 2400) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={!isLocked ? { scale: 1.01 } : undefined}
      className={`relative group ${!isLocked ? 'cursor-pointer' : ''}`}
      onClick={!isLocked ? onClick : undefined}
    >
      <div
        className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
          isSolved
            ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15'
            : isFailed
              ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/15'
              : isLocked
                ? 'bg-muted/30 border-border/50 opacity-60'
                : 'bg-card/80 border-border/50 hover:border-primary/30 hover:bg-card'
        }`}
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md ${
            isSolved
              ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
              : isFailed
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                : isLocked
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-gradient-to-br from-primary/80 to-primary text-primary-foreground'
          }`}
        >
          {letter}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{problem.name}</h4>
            {!isLocked && (
              <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              CF {problem.contestId}/{problem.index}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full text-white ${getRatingColor(problem.rating || 0)}`}
            >
              {problem.rating || 'Unrated'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSolved ? (
            <Badge className="bg-green-600 hover:bg-green-700 gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Solved
            </Badge>
          ) : isFailed ? (
            <Badge className="bg-red-600 hover:bg-red-700 gap-1">
              <XCircle className="w-3.5 h-3.5" />
              Attempted
            </Badge>
          ) : isLocked ? (
            <Badge variant="outline" className="gap-1">
              <Circle className="w-3.5 h-3.5" />
              Locked
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Circle className="w-3.5 h-3.5" />
              Unattempted
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function LeaderboardRow({
  entry,
  isCurrentUser,
  isNew,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  isNew?: boolean;
}) {
  const getRankStyle = (rank: number) => {
    if (rank === 1)
      return {
        bg: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10',
        border: 'border-yellow-500/40',
        badge: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
        icon: '🥇',
      };
    if (rank === 2)
      return {
        bg: 'bg-gradient-to-r from-gray-400/20 to-gray-500/10',
        border: 'border-gray-400/40',
        badge: 'bg-gradient-to-br from-gray-300 to-gray-500',
        icon: '🥈',
      };
    if (rank === 3)
      return {
        bg: 'bg-gradient-to-r from-orange-500/20 to-orange-600/10',
        border: 'border-orange-500/40',
        badge: 'bg-gradient-to-br from-orange-400 to-orange-600',
        icon: '🥉',
      };
    return {
      bg: 'bg-card/50',
      border: 'border-border/50',
      badge: 'bg-muted',
      icon: null,
    };
  };

  const style = getRankStyle(entry.rank);

  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -20, scale: 0.95 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-xl border transition-all ${style.bg} ${style.border} ${
        isCurrentUser ? 'ring-2 ring-primary/50' : ''
      } ${entry.rank % 2 === 0 ? 'bg-opacity-50' : ''}`}
    >
      <div className="col-span-1 flex items-center">
        {style.icon ? (
          <span className="text-2xl">{style.icon}</span>
        ) : (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${style.badge} ${entry.rank <= 3 ? 'text-white' : 'text-foreground'}`}
          >
            {entry.rank}
          </div>
        )}
      </div>

      <div className="col-span-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-primary/30 flex items-center justify-center text-sm font-semibold">
          {(entry.username || entry.user_id)[0].toUpperCase()}
        </div>
        <div>
          <div className="font-semibold flex items-center gap-2">
            {entry.username || `User ${entry.user_id.slice(0, 6)}`}
            {isCurrentUser && (
              <Badge variant="outline" className="text-xs">
                You
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-2 flex items-center justify-center">
        <Badge className="bg-green-600 hover:bg-green-700 font-mono">
          {entry.solved}
        </Badge>
      </div>

      <div className="col-span-2 flex items-center justify-center">
        <span className="font-mono text-sm text-muted-foreground">
          {Math.floor(entry.penalty / 60)}m
        </span>
      </div>

      <div className="col-span-2 flex items-center justify-end">
        <span className="text-lg font-bold gradient-text">{entry.solved * 100}</span>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>

        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

export default function ContestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const supabase = useMemo(() => createClient(), []);

  const [contest, setContest] = useState<Contest | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAttemptedOnly, setShowAttemptedOnly] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const isContestLive = useMemo(() => {
    if (!contest) return false;
    const now = Date.now();
    const startsAt = new Date(contest.starts_at).getTime();
    const endsAt = new Date(contest.ends_at).getTime();
    return now >= startsAt && now < endsAt;
  }, [contest]);

  const { isConnected: realtimeConnected } = useContestRealtime({
    contestId: params.id,
    enabled: isContestLive,
    onLeaderboardUpdate: useCallback((newLeaderboard: LeaderboardEntry[]) => {
      setLeaderboard(newLeaderboard);
      setHasNewUpdates(true);
      setLastUpdateTime(new Date());
      setTimeout(() => setHasNewUpdates(false), 3000);
    }, []),
  });

  const fetchContestData = useCallback(async () => {
    try {
      const response = await fetch(`/api/contests/${params.id}`);
      if (!response.ok) {
        console.error('Contest fetch failed:', response.status);
        if (response.status === 404) {
          setContest(null);
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.contest) {
        setContest(data.contest);
      }
    } catch (error) {
      console.error('Error fetching contest:', error);
    }
    setLoading(false);
  }, [params.id]);

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const leaderboardResponse = await fetch(
        `/api/contests/${params.id}/leaderboard?limit=50`
      );
      if (leaderboardResponse.ok) {
        const data = await leaderboardResponse.json();
        setLeaderboard(data.leaderboard || []);
        setParticipantCount(
          data.totalParticipants || data.leaderboard?.length || 0
        );
        setLastUpdateTime(new Date());
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
    setLeaderboardLoading(false);
  }, [params.id]);

  const checkRegistration = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);

      const { data } = await supabase
        .from('contest_participants')
        .select('id')
        .eq('contest_id', params.id)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsRegistered(!!data);
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  }, [params.id, supabase]);

  useEffect(() => {
    if (contest?.id) {
      const base =
        process.env.NEXT_PUBLIC_SITE_URL ??
        (typeof window !== 'undefined' ? window.location.origin : '');
      setShareUrl(`${base}/contests/${contest.id}`);
    }
  }, [contest?.id]);

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([fetchContestData(), checkRegistration()]);
      await fetchLeaderboard();
    };

    fetchAllData();
  }, [fetchContestData, checkRegistration, fetchLeaderboard]);

  useEffect(() => {
    if (!contest) return;

    const now = Date.now();
    const startsAt = new Date(contest.starts_at).getTime();
    const endsAt = new Date(contest.ends_at).getTime();
    const isLive = now >= startsAt && now < endsAt;
    const hasEnded = now >= endsAt;

    if (hasEnded) return;

    const leaderboardInterval = setInterval(() => {
      if (isLive) {
        fetchLeaderboard();
      }
    }, LEADERBOARD_REFRESH_INTERVAL);

    const contestInterval = setInterval(() => {
      if (!hasEnded) {
        fetchContestData();
      }
    }, CONTEST_REFRESH_INTERVAL);

    return () => {
      clearInterval(leaderboardInterval);
      clearInterval(contestInterval);
    };
  }, [contest, fetchContestData, fetchLeaderboard]);

  useEffect(() => {
    if (!contest) return;

    const updateTimer = () => {
      const now = new Date();
      const start = new Date(contest.starts_at);
      const end = new Date(contest.ends_at);
      const diffToStart = start.getTime() - now.getTime();
      const diffToEnd = end.getTime() - now.getTime();

      if (diffToStart > 0) {
        const days = Math.floor(diffToStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diffToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (diffToStart % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((diffToStart % (1000 * 60)) / 1000);

        setTimeUntilStart({
          days: days.toString().padStart(2, '0'),
          hours: hours.toString().padStart(2, '0'),
          minutes: minutes.toString().padStart(2, '0'),
          seconds: seconds.toString().padStart(2, '0'),
        });
        setTimeRemaining('');
      } else if (diffToEnd > 0) {
        const hours = Math.floor(diffToEnd / (1000 * 60 * 60));
        const minutes = Math.floor(
          (diffToEnd % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((diffToEnd % (1000 * 60)) / 1000);
        setTimeRemaining(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      } else {
        setTimeRemaining('');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  const handleRegister = async () => {
    if (!contest) return;
    setRegistering(true);
    try {
      const now = new Date();
      const start = new Date(contest.starts_at);
      const registrationClose = new Date(start.getTime() - 10 * 60 * 1000);

      if (now < start && now >= registrationClose) {
        toast({
          title: 'Registration Closed',
          description:
            'Registration closes 10 minutes before the contest start.',
          variant: 'destructive',
        });
        setRegistering(false);
        return;
      }

      if (now >= start && !contest.allow_late_join) {
        toast({
          title: 'Registration Closed',
          description: 'Registration closed when the contest started.',
          variant: 'destructive',
        });
        setRegistering(false);
        return;
      }

      const response = await fetch(`/api/contests/${params.id}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        setIsRegistered(true);
        toast({
          title: 'Registered!',
          description: 'You have successfully registered for this contest.',
        });
        fetchContestData();
      } else {
        const error = await response.json();
        toast({
          title: 'Registration Failed',
          description: error.error || 'Failed to register for contest',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to register for contest',
        variant: 'destructive',
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleJoinContest = () => {
    if (!contest) return;

    const now = new Date();
    const start = new Date(contest.starts_at);

    if (now < start) {
      toast({
        title: 'Too Early!',
        description: 'Contest has not started yet. Please wait.',
        variant: 'destructive',
      });
      return;
    }

    if (!isRegistered && !contest.allow_late_join) {
      toast({
        title: 'Registration Required',
        description: 'You needed to register before the contest started.',
        variant: 'destructive',
      });
      return;
    }

    router.push(`/contests/${params.id}/participate`);
  };

  const copyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Link Copied!',
        description: 'Contest link copied to clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy link to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const solvedCount = useMemo(() => {
    if (!contest?.my_submissions) return 0;
    return Object.values(contest.my_submissions).filter((s) => s === 'solved')
      .length;
  }, [contest?.my_submissions]);

  const progressPercentage = useMemo(() => {
    if (!contest?.problems?.length) return 0;
    return (solvedCount / contest.problems.length) * 100;
  }, [solvedCount, contest?.problems?.length]);

  const displayedLeaderboard = useMemo(() => {
    return leaderboard.slice(0, leaderboardPage * LEADERBOARD_PAGE_SIZE);
  }, [leaderboard, leaderboardPage]);

  const hasMoreLeaderboard = useMemo(() => {
    return leaderboard.length > leaderboardPage * LEADERBOARD_PAGE_SIZE;
  }, [leaderboard.length, leaderboardPage]);

  const isHost = currentUserId === contest?.host_user_id;

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="inline-flex p-4 rounded-full bg-muted"
                >
                  <Info className="w-8 h-8 text-muted-foreground" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold">Contest Not Found</h1>
                  <p className="text-sm text-muted-foreground mt-2">
                    This contest does not exist or may have been deleted.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/contests')}
                  className="w-full"
                >
                  Back to Contests
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const now = new Date();
  const start = new Date(contest.starts_at);
  const end = new Date(contest.ends_at);
  const hasStarted = now >= start;
  const hasEnded = now >= end;

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/40 bg-card/30 backdrop-blur-md sticky top-0 z-40"
        >
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-bold tracking-tight gradient-text truncate">
                    {contest.name}
                  </h1>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={`${
                      hasEnded
                        ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        : hasStarted
                          ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    } px-3 py-1`}
                  >
                    {hasEnded ? (
                      <>
                        <Circle className="w-2 h-2 mr-1.5 fill-current" />
                        Ended
                      </>
                    ) : hasStarted ? (
                      <>
                        <Radio className="w-3 h-3 mr-1.5" />
                        Live
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1.5" />
                        Upcoming
                      </>
                    )}
                  </Badge>

                  {realtimeConnected && isContestLive && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge
                          variant="outline"
                          className="gap-1 border-green-500/50 text-green-500"
                        >
                          <Sparkles className="w-3 h-3" />
                          Real-time
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        Connected for live updates
                      </TooltipContent>
                    </Tooltip>
                  )}

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-sm">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/50 to-primary/30 flex items-center justify-center text-xs font-semibold">
                      H
                    </div>
                    <span>Host</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isHost && !hasEnded && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/contests/${params.id}/edit`)
                      }
                      className="gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    {hasStarted && (
                      <Button variant="destructive" size="sm" className="gap-2">
                        <StopCircle className="w-4 h-4" />
                        End
                      </Button>
                    )}
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShareDialogOpen(true)}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>

            {contest.description && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4 p-4 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/50"
              >
                <p className="text-muted-foreground leading-relaxed">
                  {contest.description}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Info Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <InfoCard
              icon={Timer}
              label="Duration"
              value={`${Math.floor(contest.duration_minutes / 60)}h ${contest.duration_minutes % 60}m`}
              gradient="from-blue-500 to-blue-600"
            />
            <InfoCard
              icon={Target}
              label="Problems"
              value={String(contest.problem_count)}
              gradient="from-purple-500 to-purple-600"
            />
            <InfoCard
              icon={Zap}
              label="Rating"
              value={`${contest.rating_min}-${contest.rating_max}`}
              gradient="from-orange-500 to-orange-600"
            />
            <InfoCard
              icon={Award}
              label="Mode"
              value={contest.contest_mode === 'icpc' ? 'ICPC' : 'Practice'}
              gradient="from-green-500 to-green-600"
            />
          </motion.div>

          {/* Countdown & Actions */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Countdown Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card
                className={`overflow-hidden border-2 ${
                  hasStarted && !hasEnded
                    ? 'border-green-500/30 bg-green-500/5'
                    : hasEnded
                      ? 'border-gray-500/30'
                      : 'border-blue-500/30 bg-blue-500/5'
                }`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {hasEnded
                      ? 'Contest Ended'
                      : hasStarted
                        ? 'Time Remaining'
                        : 'Starts In'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasEnded && !hasStarted && (
                    <div className="flex justify-center gap-3 py-4">
                      {parseInt(timeUntilStart.days) > 0 && (
                        <CountdownDigit
                          value={timeUntilStart.days}
                          label="Days"
                        />
                      )}
                      <CountdownDigit
                        value={timeUntilStart.hours}
                        label="Hours"
                      />
                      <CountdownDigit
                        value={timeUntilStart.minutes}
                        label="Mins"
                      />
                      <CountdownDigit
                        value={timeUntilStart.seconds}
                        label="Secs"
                      />
                    </div>
                  )}

                  {hasStarted && !hasEnded && (
                    <div className="text-center py-4">
                      <motion.div
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-4xl sm:text-5xl font-bold font-mono text-green-500"
                      >
                        {timeRemaining}
                      </motion.div>
                      <p className="text-muted-foreground mt-2">remaining</p>
                    </div>
                  )}

                  {hasEnded && (
                    <div className="text-center py-6">
                      <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        View final results below
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="h-full border-2 border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Participation
                    <Badge variant="secondary" className="ml-auto">
                      {participantCount} joined
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">
                        {new Date(contest.starts_at).toLocaleDateString(
                          undefined,
                          {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </p>
                      <p className="text-muted-foreground">
                        {new Date(contest.starts_at).toLocaleTimeString(
                          undefined,
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {!hasEnded && (
                    <div className="space-y-3">
                      {hasStarted ? (
                        isRegistered ||
                        isHost ||
                        contest.allow_late_join ? (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={handleJoinContest}
                              size="lg"
                              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25 gap-2"
                            >
                              <Zap className="w-5 h-5" />
                              Join Contest Now
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ) : (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={handleRegister}
                              disabled={registering}
                              size="lg"
                              className="w-full"
                            >
                              {registering ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Registering...
                                </>
                              ) : (
                                'Register & Join'
                              )}
                            </Button>
                          </motion.div>
                        )
                      ) : isRegistered || isHost ? (
                        <div className="text-center space-y-2">
                          <Badge
                            variant="outline"
                            className="gap-1 border-green-500/50 text-green-500"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Registered
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            You can join when the contest starts
                          </p>
                        </div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={handleRegister}
                            disabled={registering}
                            size="lg"
                            className="w-full btn-attractive"
                          >
                            {registering ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Registering...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Register Now
                              </>
                            )}
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Problems Section */}
          {contest.problems && contest.problems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="mb-8 border-2 border-border/50 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Problems
                      <Badge variant="secondary">{contest.problems.length}</Badge>
                    </CardTitle>

                    {(hasStarted || hasEnded) && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Progress:</span>
                          <span className="font-semibold">
                            {solvedCount}/{contest.problems.length}
                          </span>
                        </div>
                        <div className="w-32">
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor="attempted-filter"
                            className="text-sm text-muted-foreground"
                          >
                            Attempted only
                          </Label>
                          <Switch
                            id="attempted-filter"
                            checked={showAttemptedOnly}
                            onCheckedChange={setShowAttemptedOnly}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-3"
                  >
                    {!hasStarted ? (
                      contest.problems.map((p, i) => (
                        <ProblemCard
                          key={p.id}
                          problem={p}
                          index={i}
                          isLocked={true}
                        />
                      ))
                    ) : (showAttemptedOnly
                        ? contest.problems.filter((p) => {
                            const st = contest.my_submissions?.[p.id];
                            return st === 'solved' || st === 'failed';
                          })
                        : contest.problems
                      ).length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        {showAttemptedOnly
                          ? 'No attempted problems yet.'
                          : 'No problems available.'}
                      </div>
                    ) : (
                      (showAttemptedOnly
                        ? contest.problems.filter((p) => {
                            const st = contest.my_submissions?.[p.id];
                            return st === 'solved' || st === 'failed';
                          })
                        : contest.problems
                      ).map((p, i) => {
                        const originalIndex = contest.problems!.findIndex(
                          (prob) => prob.id === p.id
                        );
                        return (
                          <ProblemCard
                            key={p.id}
                            problem={p}
                            index={originalIndex}
                            status={contest.my_submissions?.[p.id]}
                            isLocked={false}
                            onClick={() =>
                              window.open(
                                `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
                                '_blank'
                              )
                            }
                          />
                        );
                      })
                    )}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Leaderboard Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 border-border/50 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-transparent">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Leaderboard
                    {!hasStarted && (
                      <Badge variant="outline" className="ml-2">
                        Preview
                      </Badge>
                    )}
                  </CardTitle>

                  <div className="flex items-center gap-3">
                    <AnimatePresence>
                      {hasNewUpdates && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
                            <Sparkles className="w-3 h-3" />
                            Updated
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {lastUpdateTime && (
                      <span className="text-xs text-muted-foreground">
                        Last updated:{' '}
                        {lastUpdateTime.toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}

                    {isContestLive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchLeaderboard}
                        disabled={leaderboardLoading}
                        className="gap-1"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${leaderboardLoading ? 'animate-spin' : ''}`}
                        />
                        Refresh
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No submissions yet. Be the first to participate!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border/50">
                      <div className="col-span-1">Rank</div>
                      <div className="col-span-5">Participant</div>
                      <div className="col-span-2 text-center">Solved</div>
                      <div className="col-span-2 text-center">Penalty</div>
                      <div className="col-span-2 text-right">Score</div>
                    </div>

                    <AnimatePresence mode="popLayout">
                      {displayedLeaderboard.map((entry) => (
                        <LeaderboardRow
                          key={entry.user_id}
                          entry={entry}
                          isCurrentUser={entry.user_id === currentUserId}
                          isNew={hasNewUpdates}
                        />
                      ))}
                    </AnimatePresence>

                    {hasMoreLeaderboard && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-4 text-center"
                      >
                        <Button
                          variant="outline"
                          onClick={() =>
                            setLeaderboardPage((p) => p + 1)
                          }
                          className="gap-2"
                        >
                          Load More
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Share Contest
              </DialogTitle>
              <DialogDescription>
                Share this contest link with others to invite them to participate.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4 p-3 rounded-xl border border-border/50 bg-muted/30">
              <label htmlFor="share-link" className="sr-only">
                Contest share link
              </label>
              <input
                id="share-link"
                type="text"
                readOnly
                value={shareUrl}
                aria-label="Contest share link"
                className="flex-1 bg-transparent text-sm truncate outline-none"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={copyShareLink}
                  size="sm"
                  variant={copied ? 'default' : 'outline'}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </TooltipProvider>
  );
}
