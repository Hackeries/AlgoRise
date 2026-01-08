'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Target,
  CheckCircle,
  PlayCircle,
  Loader2,
  Zap,
  Trophy,
  Flame,
  TrendingUp,
  Lock,
  Star,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Bookmark,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LEARNING_PATH_DATA, type Section } from '@/lib/learning-path-data';
import { cn } from '@/lib/utils';

type LevelInfo = {
  name: string;
  minProgress: number;
  maxProgress: number;
  icon: string;
  color: string;
  gradient: string;
};

const LEVELS: LevelInfo[] = [
  {
    name: 'Newbie',
    minProgress: 0,
    maxProgress: 10,
    icon: '🌱',
    color: 'text-gray-500',
    gradient: 'from-gray-400 to-gray-500',
  },
  {
    name: 'Beginner',
    minProgress: 10,
    maxProgress: 25,
    icon: '🔰',
    color: 'text-green-500',
    gradient: 'from-green-400 to-green-600',
  },
  {
    name: 'Apprentice',
    minProgress: 25,
    maxProgress: 40,
    icon: '⚔️',
    color: 'text-blue-500',
    gradient: 'from-blue-400 to-blue-600',
  },
  {
    name: 'Intermediate',
    minProgress: 40,
    maxProgress: 55,
    icon: '🎯',
    color: 'text-purple-500',
    gradient: 'from-purple-400 to-purple-600',
  },
  {
    name: 'Advanced',
    minProgress: 55,
    maxProgress: 70,
    icon: '🚀',
    color: 'text-orange-500',
    gradient: 'from-orange-400 to-orange-600',
  },
  {
    name: 'Expert',
    minProgress: 70,
    maxProgress: 85,
    icon: '💎',
    color: 'text-cyan-500',
    gradient: 'from-cyan-400 to-cyan-600',
  },
  {
    name: 'Master',
    minProgress: 85,
    maxProgress: 100,
    icon: '👑',
    color: 'text-yellow-500',
    gradient: 'from-yellow-400 to-yellow-600',
  },
];

const TOPIC_ICONS: Record<string, string> = {
  'basic-cpp': '💻',
  'stl': '📚',
  'number-theory': '🔢',
  'greedy': '🎰',
  'searching-sorting': '🔍',
  'recursion': '🔄',
  'dynamic-programming': '🧩',
  'graphs': '🕸️',
  'trees': '🌳',
  'strings': '📝',
  'default': '📖',
};

function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  showLabel = true,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(280, 100%, 70%)" />
          </linearGradient>
        </defs>
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{value}%</span>
          <span className="text-xs text-muted-foreground">Complete</span>
        </div>
      )}
    </div>
  );
}

function LevelProgressBar({ progress }: { progress: number }) {
  const currentLevel = LEVELS.find(
    level => progress >= level.minProgress && progress < level.maxProgress
  ) || LEVELS[LEVELS.length - 1];
  
  const currentLevelIndex = LEVELS.indexOf(currentLevel);
  const progressInLevel = 
    ((progress - currentLevel.minProgress) / 
    (currentLevel.maxProgress - currentLevel.minProgress)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentLevel.icon}</span>
          <div>
            <p className={cn('font-semibold', currentLevel.color)}>
              {currentLevel.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentLevelIndex < LEVELS.length - 1 
                ? `${currentLevel.maxProgress - progress}% to ${LEVELS[currentLevelIndex + 1].name}`
                : 'Maximum level reached!'
              }
            </p>
          </div>
        </div>
        {currentLevelIndex < LEVELS.length - 1 && (
          <div className="flex items-center gap-2">
            <span className="text-lg opacity-50">{LEVELS[currentLevelIndex + 1].icon}</span>
          </div>
        )}
      </div>
      <div className="relative">
        <div className="flex gap-1">
          {LEVELS.map((level, idx) => (
            <div
              key={level.name}
              className={cn(
                'h-2 flex-1 rounded-full transition-all',
                idx < currentLevelIndex
                  ? `bg-gradient-to-r ${level.gradient}`
                  : idx === currentLevelIndex
                  ? 'overflow-hidden bg-muted/30'
                  : 'bg-muted/20'
              )}
            >
              {idx === currentLevelIndex && (
                <div
                  className={cn('h-full rounded-full bg-gradient-to-r', currentLevel.gradient)}
                  style={{ width: `${progressInLevel}%` }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="absolute -bottom-5 left-0 right-0 flex justify-between">
          {LEVELS.map((level, idx) => (
            <Tooltip key={level.name}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'text-[10px] transition-opacity',
                    idx <= currentLevelIndex ? 'opacity-100' : 'opacity-40'
                  )}
                >
                  {level.icon}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{level.name}</p>
                <p className="text-xs opacity-70">{level.minProgress}% - {level.maxProgress}%</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineMilestone({
  section,
  index,
  isLast,
  progress,
  isExpanded,
  onToggle,
  subsectionProgress,
}: {
  section: Section;
  index: number;
  isLast: boolean;
  progress: number;
  isExpanded: boolean;
  onToggle: () => void;
  subsectionProgress: Record<string, number>;
}) {
  const isCompleted = progress === 100;
  const isInProgress = progress > 0 && progress < 100;
  const isLocked = index > 0 && progress === 0;
  const topicIcon = TOPIC_ICONS[section.id] || TOPIC_ICONS['default'];

  const totalProblems = section.subsections.reduce(
    (sum, sub) => sum + sub.problems.length,
    0
  );
  const completedProblems = Math.round((progress * totalProblems) / 100);

  const getStatusConfig = () => {
    if (isCompleted)
      return {
        bg: 'bg-gradient-to-br from-green-500 to-emerald-600',
        border: 'border-green-500/50',
        glow: 'shadow-green-500/25',
        line: 'bg-gradient-to-b from-green-500 to-green-600',
        badge: 'bg-green-500/10 text-green-500 border-green-500/30',
      };
    if (isInProgress)
      return {
        bg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
        border: 'border-blue-500/50',
        glow: 'shadow-blue-500/25',
        line: 'bg-gradient-to-b from-blue-500/50 to-muted/30',
        badge: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      };
    return {
      bg: 'bg-gradient-to-br from-muted/50 to-muted/30',
      border: 'border-muted/50',
      glow: '',
      line: 'bg-muted/30',
      badge: 'bg-muted/10 text-muted-foreground border-muted/30',
    };
  };

  const config = getStatusConfig();

  return (
    <div className="relative">
      <div className="flex gap-6">
        {/* Timeline Node */}
        <div className="relative flex flex-col items-center">
          <div
            className={cn(
              'relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-lg transition-all duration-300',
              config.bg,
              config.glow,
              'shadow-xl',
              isExpanded && 'scale-110'
            )}
          >
            {isCompleted ? (
              <CheckCircle className="h-7 w-7 text-white" />
            ) : isLocked ? (
              <Lock className="h-6 w-6 text-muted-foreground" />
            ) : (
              <span>{topicIcon}</span>
            )}
          </div>
          {!isLast && (
            <div
              className={cn(
                'w-1 flex-1 min-h-[60px] transition-all',
                config.line,
                isExpanded && 'min-h-[calc(100%-56px)]'
              )}
            />
          )}
        </div>

        {/* Content Card */}
        <div className="flex-1 pb-8">
          <div
            className={cn(
              'group relative overflow-hidden rounded-2xl border transition-all duration-300',
              config.border,
              'bg-card/50 backdrop-blur-xl',
              'hover:shadow-xl hover:shadow-primary/5',
              isExpanded && 'ring-2 ring-primary/20'
            )}
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Card Header */}
            <div
              className="relative cursor-pointer p-6"
              onClick={onToggle}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold tracking-tight">
                      {section.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', config.badge)}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" /> Completed
                        </>
                      ) : isInProgress ? (
                        <>
                          <Sparkles className="mr-1 h-3 w-3" /> In Progress
                        </>
                      ) : (
                        <>
                          <Lock className="mr-1 h-3 w-3" /> Locked
                        </>
                      )}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {section.estimatedTime}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>

                  {/* Stats Row */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>
                        {completedProblems}/{totalProblems} problems
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{section.subsections.length} topics</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{progress}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/30">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700 ease-out',
                          isCompleted
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expand Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-xl"
                >
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 transition-transform duration-300',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </Button>
              </div>
            </div>

            {/* Expanded Subsections */}
            <div
              className={cn(
                'grid transition-all duration-500 ease-out',
                isExpanded
                  ? 'grid-rows-[1fr] opacity-100'
                  : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-border/50 bg-muted/20 p-6 pt-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold text-muted-foreground flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Topics in this section
                    </h4>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {section.subsections.map(subsection => {
                      const subProgress =
                        subsectionProgress[`${section.id}-${subsection.id}`] || 0;
                      const subCompleted = subProgress === 100;
                      const subInProgress = subProgress > 0 && subProgress < 100;

                      return (
                        <div
                          key={subsection.id}
                          className={cn(
                            'group/sub relative overflow-hidden rounded-xl border p-4 transition-all duration-300',
                            'bg-background/50 backdrop-blur-sm',
                            'hover:border-primary/30 hover:bg-background/80',
                            subCompleted && 'border-green-500/30 bg-green-500/5'
                          )}
                        >
                          {/* Hover preview indicator */}
                          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover/sub:opacity-100">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-semibold">{subsection.title}</h5>
                                  {subCompleted && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                  {subsection.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {subsection.problems.length} problems
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {subsection.estimatedTime}
                              </span>
                            </div>

                            {/* Mini Progress */}
                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-500',
                                  subCompleted
                                    ? 'bg-green-500'
                                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                )}
                                style={{ width: `${subProgress}%` }}
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                size="sm"
                                asChild
                                className={cn(
                                  'flex-1 gap-1.5 rounded-lg text-xs',
                                  subCompleted && 'bg-green-600 hover:bg-green-700'
                                )}
                              >
                                <Link href={`/paths/${section.id}/${subsection.id}`}>
                                  {subCompleted ? (
                                    <>
                                      <RotateCcw className="h-3 w-3" />
                                      Review
                                    </>
                                  ) : subInProgress ? (
                                    <>
                                      <PlayCircle className="h-3 w-3" />
                                      Continue
                                    </>
                                  ) : (
                                    <>
                                      <ArrowRight className="h-3 w-3" />
                                      Start
                                    </>
                                  )}
                                </Link>
                              </Button>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="rounded-lg px-2"
                                  >
                                    <Bookmark className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Bookmark topic</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  gradient,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-5 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className={cn('mb-3 inline-flex rounded-xl p-2.5', gradient)}>
        <Icon className={cn('h-5 w-5', color)} />
      </div>
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {subtext && (
        <p className="mt-0.5 text-xs text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}

function AchievementBadge({
  icon,
  title,
  unlocked,
}: {
  icon: string;
  title: string;
  unlocked: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl text-xl transition-all',
            unlocked
              ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 shadow-lg shadow-yellow-500/10'
              : 'bg-muted/30 opacity-40 grayscale'
          )}
        >
          {icon}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{title}</p>
        {!unlocked && <p className="text-xs opacity-70">Not yet unlocked</p>}
      </TooltipContent>
    </Tooltip>
  );
}

export default function LearningPathsPage() {
  const supabase = createClient();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [sectionProgress, setSectionProgress] = useState<Record<string, number>>({});
  const [subsectionProgress, setSubsectionProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const totalProblems = useMemo(
    () =>
      LEARNING_PATH_DATA.reduce((sum, section) => {
        return (
          sum +
          section.subsections.reduce((subSum, sub) => subSum + sub.problems.length, 0)
        );
      }, 0),
    []
  );

  useEffect(() => {
    loadAllProgress();
  }, []);

  const loadAllProgress = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const allProblemIds = LEARNING_PATH_DATA.flatMap(section =>
        section.subsections.flatMap(subsection =>
          subsection.problems.map(problem => problem.id)
        )
      );

      const { data: solvedProblems, error } = await supabase
        .from('user_problems')
        .select('problem_id')
        .eq('user_id', user.id)
        .in('problem_id', allProblemIds)
        .eq('solved', true);

      if (error) {
        console.error('Error loading progress:', error);
        setLoading(false);
        return;
      }

      const solvedProblemIds = new Set(
        solvedProblems?.map((p: { problem_id: string }) => p.problem_id) || []
      );

      const newSectionProgress: Record<string, number> = {};
      const newSubsectionProgress: Record<string, number> = {};

      LEARNING_PATH_DATA.forEach(section => {
        let sectionSolved = 0;
        let sectionTotal = 0;

        section.subsections.forEach(subsection => {
          const subsectionSolved = subsection.problems.filter(problem =>
            solvedProblemIds.has(problem.id)
          ).length;
          const subsectionTotal = subsection.problems.length;

          const subsectionPercentage =
            subsectionTotal > 0
              ? Math.round((subsectionSolved / subsectionTotal) * 100)
              : 0;

          newSubsectionProgress[`${section.id}-${subsection.id}`] = subsectionPercentage;

          sectionSolved += subsectionSolved;
          sectionTotal += subsectionTotal;
        });

        const sectionPercentage =
          sectionTotal > 0 ? Math.round((sectionSolved / sectionTotal) * 100) : 0;

        newSectionProgress[section.id] = sectionPercentage;
      });

      setSectionProgress(newSectionProgress);
      setSubsectionProgress(newSubsectionProgress);
    } catch (error) {
      console.error('Error in loadAllProgress:', error);
    } finally {
      setLoading(false);
    }
  };

  const overallProgress = useMemo(() => {
    const totalSolved = Object.values(sectionProgress).reduce(
      (sum, progress, index) => {
        const section = LEARNING_PATH_DATA[index];
        if (!section) return sum;
        const sectionTotal = section.subsections.reduce(
          (subSum, sub) => subSum + sub.problems.length,
          0
        );
        return sum + Math.round((progress * sectionTotal) / 100);
      },
      0
    );
    return totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
  }, [sectionProgress, totalProblems]);

  const completedProblems = Math.round((overallProgress * totalProblems) / 100);
  const estimatedWeeks = Math.ceil((totalProblems - completedProblems) / 10);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              Loading your learning journey...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-gradient-to-br from-primary/5 via-transparent to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 h-full w-full rounded-full bg-gradient-to-tr from-purple-500/5 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-30" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Hero Section */}
        <section className="relative mb-12 overflow-hidden rounded-3xl border border-border/50 bg-card/30 p-8 backdrop-blur-xl sm:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto]">
            <div className="space-y-6">
              {/* Greeting */}
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Learning Paths
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Structured problem sets by topic and difficulty
                  </p>
                </div>
              </div>

              {/* Level Progress */}
              <div className="rounded-2xl border border-border/50 bg-background/50 p-5 backdrop-blur-sm">
                <LevelProgressBar progress={overallProgress} />
              </div>
            </div>

            {/* Circular Progress */}
            <div className="flex flex-col items-center justify-center gap-4 lg:pr-4">
              <CircularProgress value={overallProgress} size={140} strokeWidth={10} />
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Journey Progress
                </p>
                <p className="text-xs text-muted-foreground">
                  {completedProblems} of {totalProblems} problems
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Target}
            label="Total Problems"
            value={totalProblems}
            subtext="Curated challenges"
            color="text-blue-500"
            gradient="bg-blue-500/10"
          />
          <StatCard
            icon={CheckCircle}
            label="Completed"
            value={completedProblems}
            subtext={`${overallProgress}% of total`}
            color="text-green-500"
            gradient="bg-green-500/10"
          />
          <StatCard
            icon={Flame}
            label="Current Streak"
            value={`${currentStreak} days`}
            subtext="Keep it up!"
            color="text-orange-500"
            gradient="bg-orange-500/10"
          />
          <StatCard
            icon={Clock}
            label="Est. Completion"
            value={`${estimatedWeeks} weeks`}
            subtext="At current pace"
            color="text-purple-500"
            gradient="bg-purple-500/10"
          />
        </section>

        {/* Recommended Next */}
        {overallProgress < 100 && (
          <section className="mb-12">
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/10 p-6">
              <div className="absolute right-4 top-4">
                <Sparkles className="h-8 w-8 text-primary/30" />
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-xl">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Recommended Next
                    </p>
                    <p className="text-lg font-semibold">
                      Continue where you left off
                    </p>
                  </div>
                </div>
                <Button className="gap-2 rounded-xl">
                  <PlayCircle className="h-4 w-4" />
                  Resume Learning
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Timeline Learning Path */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Your Learning Journey</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {LEARNING_PATH_DATA.length} sections • {totalProblems} problems
              </p>
            </div>
          </div>

          <div className="space-y-0">
            {LEARNING_PATH_DATA.map((section, index) => (
              <TimelineMilestone
                key={section.id}
                section={section}
                index={index}
                isLast={index === LEARNING_PATH_DATA.length - 1}
                progress={sectionProgress[section.id] || 0}
                isExpanded={expandedSection === section.id}
                onToggle={() =>
                  setExpandedSection(
                    expandedSection === section.id ? null : section.id
                  )
                }
                subsectionProgress={subsectionProgress}
              />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/10 via-card to-purple-500/10 p-8 text-center sm:p-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS1vcGFjaXR5PSIuMDMiLz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative">
            <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-4">
              <Trophy className="h-10 w-10 text-yellow-500" />
            </div>
            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to Master Competitive Programming?
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
              Follow our structured learning path designed by experts. Track your progress,
              earn achievements, and become a competitive programming champion.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="gap-2 rounded-xl">
                <PlayCircle className="h-5 w-5" />
                Start Your Journey
              </Button>
              <Button size="lg" variant="outline" className="gap-2 rounded-xl">
                <BookOpen className="h-5 w-5" />
                View Syllabus
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
