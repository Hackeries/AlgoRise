'use client';

import { useMemo, useState, useEffect } from 'react';
import useSWR from 'swr';
import { AdaptiveFilterBar, type FilterState } from './filter-bar';
import { AdaptiveProblemCard } from './problem-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useRealtimeUpdates } from '@/lib/hooks/use-real-time';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Clock, CheckSquare, Calendar, Zap } from 'lucide-react';

type Outcome = 'solved' | 'failed' | 'skipped';

type Problem = {
  id: string;
  title: string;
  url?: string;
  rating: number;
  tags: string[];
};

type SheetItem = {
  id: string;
  problem: Problem;
  repetitions: number;
  ease: number;
  intervalDays: number;
  nextDueAt: string; // ISO
  lastOutcome?: Outcome;
};

type AdaptiveSheetResponse = {
  baseRating: number;
  groups: {
    dueNow: SheetItem[];
    dueSoon: SheetItem[];
    later: SheetItem[];
  };
  stats: {
    solvedRate: number;
    streak: number;
    lastInteractionAt?: string;
    weakTags: Record<string, { attempts: number; fails: number }>;
  };
};

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('JSON parse error. Response was:', text.substring(0, 200));
    throw new Error('Invalid JSON response');
  }
};

function fmtDue(dueIso: string) {
  const due = new Date(dueIso).getTime();
  const now = Date.now();
  const diff = due - now;
  if (diff <= 0) return 'Due now';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `Due in ${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `Due in ${hrs}h`;
  const days = Math.round(hrs / 24);
  return `Due in ${days}d`;
}

function getSectionIcon(key: string) {
  switch (key) {
    case 'dueNow':
      return <Zap className='h-4 w-4 text-red-500' />;
    case 'dueSoon':
      return <Clock className='h-4 w-4 text-orange-500' />;
    case 'later':
      return <Calendar className='h-4 w-4 text-blue-500' />;
    default:
      return null;
  }
}

function getSectionColor(key: string) {
  switch (key) {
    case 'dueNow':
      return 'border-red-200 bg-red-50/50';
    case 'dueSoon':
      return 'border-orange-200 bg-orange-50/50';
    case 'later':
      return 'border-blue-200 bg-blue-50/50';
    default:
      return 'border-muted bg-muted/20';
  }
}

export function AdaptiveSheetContent({
  controlledFilters,
  onFiltersChange,
  srMode = 'standard',
  cfHandle,
}: {
  controlledFilters?: FilterState;
  onFiltersChange?: (s: FilterState) => void;
  srMode?: 'standard' | 'aggressive';
  cfHandle?: string;
}) {
  const [uncontrolled, setUncontrolled] = useState<FilterState>({
    ratingBase: 1500,
    tags: [],
  });
  const filters = controlledFilters ?? uncontrolled;
  const setFilters = onFiltersChange ?? setUncontrolled;

  // Notes state
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<SheetItem | null>(null);
  const [notes, setNotes] = useState('');
  const [problemNotes, setProblemNotes] = useState<Record<string, string>>({});

  const { toast } = useToast();
  const router = useRouter();

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('adaptive-problem-notes');
    if (savedNotes) {
      try {
        setProblemNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to parse saved notes:', e);
      }
    }
  }, []);

  const LIMITS = { now: 8, soon: 8, later: 8 };

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('baseRating', String(filters.ratingBase));
    if (filters.tags.length) params.set('tags', filters.tags.join(','));
    if (cfHandle) params.set('handle', cfHandle);
    params.set('limitNow', String(LIMITS.now));
    params.set('limitSoon', String(LIMITS.soon));
    params.set('limitLater', String(LIMITS.later));
    return `/api/adaptive-sheet?${params.toString()}`;
  }, [filters, cfHandle]);

  const { data, isLoading, error, mutate } = useSWR<AdaptiveSheetResponse>(
    query,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000, // Update every 30 seconds to refresh due times
    }
  );

  useRealtimeUpdates(query, {
    refreshInterval: 30000, // Update every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  function optimisticRemove(
    current: AdaptiveSheetResponse | undefined,
    id: string
  ): AdaptiveSheetResponse | undefined {
    if (!current) return current;
    const rm = (arr: SheetItem[]) => arr.filter(i => i.id !== id);
    return {
      ...current,
      groups: {
        dueNow: rm(current.groups.dueNow),
        dueSoon: rm(current.groups.dueSoon),
        later: rm(current.groups.later),
      },
    };
  }

  async function postAction(path: string, body: any, itemId?: string) {
    try {
      await mutate(
        async current => {
          await fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const refreshed = await fetch(query).then(r => r.json());
          return refreshed;
        },
        {
          optimisticData: itemId ? optimisticRemove(data, itemId) : data,
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        }
      );
    } catch (e) {
      toast({
        title: 'Action failed',
        description: 'Please try again.',
      });
      throw e;
    }
  }

  function handleCompleted(item: SheetItem) {
    postAction(
      '/api/adaptive-sheet/solve',
      {
        problemId: item.id,
        baseRating: filters.ratingBase,
        tags: filters.tags,
      },
      item.id
    ).then(async () => {
      // base toast about next due
      toast({
        title: 'Marked as completed — great job!',
        description: `Next review: ${fmtDue(item.nextDueAt)}`,
      });
      // streak update + milestone celebration
      try {
        const res = await fetch('/api/streaks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const payload = await res.json().catch(() => null);
        if (
          payload?.newLongest === true &&
          typeof payload?.currentStreak === 'number'
        ) {
          toast({
            title: '🏆 New longest streak!',
            description: `${payload.currentStreak} days — keep the momentum!`,
          });
        }
      } catch {
        // no-op on failure
      }
    });
  }

  function handleNotes(item: SheetItem) {
    setCurrentProblem(item);
    setNotes(problemNotes[item.id] || '');
    setNotesDialogOpen(true);
  }

  function saveNotes() {
    if (currentProblem) {
      const newNotes = { ...problemNotes, [currentProblem.id]: notes };
      setProblemNotes(newNotes);
      localStorage.setItem('adaptive-problem-notes', JSON.stringify(newNotes));
      toast({
        title: 'Notes saved',
        description: 'Your learning notes have been saved locally.',
      });
    }
    setNotesDialogOpen(false);
    setCurrentProblem(null);
    setNotes('');
  }
  function handleSkip(item: SheetItem) {
    postAction(
      '/api/adaptive-sheet/skip',
      { problemId: item.id },
      item.id
    ).then(() =>
      toast({
        title: 'Skipped',
        description: 'We’ll resurface this later.',
      })
    );
  }
  function handleFail(item: SheetItem) {
    postAction(
      '/api/adaptive-sheet/fail',
      { problemId: item.id },
      item.id
    ).then(() =>
      toast({
        title: 'Marked as failed',
        description: 'Recovery mode will adapt your next set.',
      })
    );
  }

  const sections = useMemo(() => {
    return [
      {
        key: 'dueNow' as const,
        title: 'Due now',
        items: data?.groups.dueNow ?? [],
      },
      {
        key: 'dueSoon' as const,
        title: 'Due soon',
        items: data?.groups.dueSoon ?? [],
      },
      {
        key: 'later' as const,
        title: 'Later',
        items: data?.groups.later ?? [],
      },
    ];
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='space-y-6'
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AdaptiveFilterBar
          initialRatingBase={filters.ratingBase}
          initialTags={filters.tags}
          onChange={s => setFilters(s)}
        />
      </motion.div>

      <AnimatePresence mode='wait'>
        {isLoading ? (
          <motion.div
            key='loading'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='flex items-center justify-center py-12'
          >
            <div className='flex items-center gap-3 text-muted-foreground'>
              <Loader2 className='h-5 w-5 animate-spin' />
              <span>Loading your adaptive practice sheet...</span>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            key='error'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='flex items-center justify-center py-12'
          >
            <div className='text-center space-y-3'>
              <div className='text-red-500 text-lg'>⚠️</div>
              <p className='text-red-600 font-medium'>
                Failed to load adaptive sheet
              </p>
              <p className='text-sm text-muted-foreground'>
                Please try refreshing the page
              </p>
            </div>
          </motion.div>
        ) : sections.every(s => s.items.length === 0) ? (
          <motion.div
            key='empty'
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='flex items-center justify-center py-16'
          >
            <div className='text-center space-y-4 max-w-md'>
              <h3 className='text-lg font-semibold text-muted-foreground'>
                No problems found
              </h3>
              <p className='text-sm text-muted-foreground'>
                Try adjusting your filters or rating range to find more
                problems.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key='content'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='space-y-8'
          >
            {sections.map((section, sectionIndex) =>
              section.items.length ? (
                <motion.section
                  key={section.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: sectionIndex * 0.1 }}
                  className={`space-y-4 p-4 sm:p-6 rounded-xl border-2 ${getSectionColor(section.key)}`}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: sectionIndex * 0.1 + 0.2,
                    }}
                    className='flex items-center gap-3'
                  >
                    {getSectionIcon(section.key)}
                    <h2 className='text-lg sm:text-xl font-semibold'>
                      {section.title}
                    </h2>
                    <Badge
                      variant='secondary'
                      className='px-3 py-1 text-sm font-medium'
                    >
                      {section.items.length} problem
                      {section.items.length !== 1 ? 's' : ''}
                    </Badge>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: sectionIndex * 0.1 + 0.3,
                    }}
                    className='grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                  >
                    <AnimatePresence>
                      {section.items.map((item, itemIndex) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20, scale: 0.95 }}
                          transition={{
                            duration: 0.3,
                            delay: sectionIndex * 0.1 + itemIndex * 0.05 + 0.4,
                          }}
                          layout
                        >
                          <AdaptiveProblemCard
                            problem={{
                              id: item.id,
                              title: item.problem.title,
                              url: item.problem.url,
                              rating: item.problem.rating,
                              tags: item.problem.tags,
                            }}
                            subtitle={fmtDue(item.nextDueAt)}
                            onCompleted={() => handleCompleted(item)}
                            onNotes={() => handleNotes(item)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </motion.section>
              ) : null
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='text-xl'>
              📝 Notes for: {currentProblem?.problem.title}
            </DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='space-y-6'
          >
            <div className='flex flex-wrap gap-2'>
              <Badge variant='outline' className='font-medium'>
                ⭐ Rating {currentProblem?.problem.rating}
              </Badge>
              {currentProblem?.problem.tags.map(tag => (
                <Badge key={tag} variant='secondary' className='text-xs'>
                  {tag}
                </Badge>
              ))}
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-muted-foreground'>
                Your learning notes
              </label>
              <Textarea
                placeholder='📖 What did you learn from this problem?
💡 What approach or algorithm did you use?
🔍 Any key insights or tricks to remember?
⚠️ Common pitfalls to avoid?
🎯 Similar problems to practice...'
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={10}
                className='resize-none text-sm leading-relaxed'
              />
            </div>

            <div className='flex justify-end gap-3'>
              <Button
                variant='outline'
                onClick={() => setNotesDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={saveNotes}
                className='bg-primary hover:bg-primary/90'
              >
                💾 Save Notes
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
