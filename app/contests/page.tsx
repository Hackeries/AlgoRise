'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
  ExternalLinkIcon,
  Zap,
  Trophy,
  RefreshCw,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

type CodeforcesContest = {
  id: number;
  name: string;
  type: string;
  phase: string;
  durationSeconds: number;
  startTimeSeconds?: number;
  relativeTimeSeconds?: number;
};

type PrivateContest = {
  id: string
  name: string
  description?: string
  visibility: string
  status: string
  host_user_id: string
  starts_at?: string
  ends_at?: string
  duration_minutes?: number
  max_participants?: number
  allow_late_join?: boolean
  contest_mode: string
  problem_count: number
  rating_min: number
  rating_max: number
  created_at: string
  isRegistered?: boolean
  isHost?: boolean
}

// auto refresh every 5 minutes
const AUTO_REFRESH_MS = 5 * 60 * 1000

export default function ContestsPage() {
  // create supabase client inside component to avoid SSR issues
  const supabase = useMemo(() => createClient(), [])

  const [upcomingCfContests, setUpcomingCfContests] = useState<CodeforcesContest[]>([])
  const [privateContests, setPrivateContests] = useState<PrivateContest[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: 'Custom Contest',
    description: '',
    startDate: '',
    startTime: '',
    problemCount: '5',
    ratingMin: '800',
    ratingMax: '3500',
    maxParticipants: '',
    allowLateJoin: true,
    contestMode: 'practice',
    visibility: 'private',
  })
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [userRating, setUserRating] = useState<number>(0)
  const [createdContestLink, setCreatedContestLink] = useState<string | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    setBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin)
  }, [])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }

    const fetchUserRating = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) return

      const { data } = await supabase
        .from('cf_snapshots')
        .select('rating')
        .eq('user_id', userId)
        .order('captured_at', { ascending: false })
        .limit(1)
        .single()

      if (data?.rating) {
        setUserRating(data.rating)
      }
    }

    fetchCurrentUser()
    fetchUserRating()
    fetchContests()

    const refreshInterval = setInterval(() => {
      fetchContests()
    }, AUTO_REFRESH_MS)

    return () => clearInterval(refreshInterval)
  }, [supabase])

  const fetchContests = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch Codeforces contests
      try {
        const cfResponse = await fetch('/api/cf/contests');
        if (cfResponse.ok) {
          const cfData = await cfResponse.json();
          setUpcomingCfContests(cfData.upcoming || []);
        } else {
          console.error('Failed to fetch CF contests:', cfResponse.status);
        }
      } catch (cfError) {
        console.error('Error fetching CF contests:', cfError);
      }

      // Fetch private contests
      try {
        const privateResponse = await fetch('/api/contests');
        if (privateResponse.ok) {
          const privateData = await privateResponse.json();
          setPrivateContests(privateData.contests || []);
        } else {
          console.error(
            'Failed to fetch private contests:',
            privateResponse.status
          );
        }
      } catch (privateError) {
        console.error('Error fetching private contests:', privateError);
      }
    } catch (error) {
      console.error('Error fetching contests:', error);
      if (!isManualRefresh) {
        toast({
          title: '⚠️ Connection hiccup',
          description:
            "Couldn't load contests right now. Check your connection and try again!",
          variant: 'destructive',
        });
      }
    } finally {
      if (isManualRefresh) {
        setRefreshing(false);
        toast({
          title: '✅ Refreshed',
          description: 'Contest list updated successfully!',
          variant: 'default',
        });
      } else {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: 'Custom Contest',
      description: '',
      startDate: '',
      startTime: '',
      problemCount: '5',
      ratingMin: '800',
      ratingMax: '3500',
      maxParticipants: '',
      allowLateJoin: true,
      contestMode: 'practice',
      visibility: 'private',
    });
  };

  const getAutoDuration = (problemCount: number) => {
    if (problemCount <= 6) return { hours: '2', minutes: '0' };
    if (problemCount <= 9) return { hours: '3', minutes: '0' };
    if (problemCount <= 12) return { hours: '4', minutes: '0' };
    return { hours: '5', minutes: '0' };
  };

  const createContest = async () => {
    // Validate name
    if (!formData.name.trim()) {
      toast({
        title: '📝 Name your battle',
        description: "Every great contest needs an epic name! What's yours?",
        variant: 'destructive',
      });
      return;
    }

    // Validate start date & time
    if (!formData.startDate || !formData.startTime) {
      toast({
        title: "⏰ When's the showdown?",
        description:
          'Pick a date and time so everyone knows when to show up ready!',
        variant: 'destructive',
      });
      return;
    }

    const selectedStart = new Date(
      `${formData.startDate}T${formData.startTime}`
    );

    // Validate rating range
    const minRating = Number.parseInt(formData.ratingMin);
    const maxRating = Number.parseInt(formData.ratingMax);
    if (isNaN(minRating) || isNaN(maxRating) || minRating >= maxRating) {
      toast({
        title: '🔢 Rating range issue',
        description:
          "Max rating should be higher than min rating. Let's fix that!",
        variant: 'destructive',
      });
      return;
    }

    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    if (selectedStart.getTime() < oneHourFromNow.getTime()) {
      // Silently adjust to 1 hour from now
      const adjustedStart = oneHourFromNow;
      const adjustedDate = adjustedStart.toISOString().split('T')[0];
      const adjustedTime = adjustedStart.toTimeString().slice(0, 5);

      setFormData(prev => ({
        ...prev,
        startDate: adjustedDate,
        startTime: adjustedTime,
      }));

      toast({
        title: 'Start time adjusted',
        description:
          'Contest start time must be at least 1 hour from now. Time has been adjusted automatically.',
        variant: 'default',
      });
      return;
    }

    let durationMinutes: number;
    if (formData.contestMode === 'icpc') {
      durationMinutes = 5 * 60; // 5 hours fixed for ICPC
    } else {
      const autoDuration = getAutoDuration(
        Number.parseInt(formData.problemCount)
      );
      durationMinutes = Number.parseInt(autoDuration.hours) * 60;
    }

    const endDateTime = new Date(
      selectedStart.getTime() + durationMinutes * 60 * 1000
    ).toISOString();

    setCreating(true);

    try {
      const startDateTime = selectedStart.toISOString();

      // Match backend schema exactly
      const bodyData: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        starts_at: startDateTime,
        ends_at: endDateTime,
        duration_minutes: durationMinutes,
        problem_count: Number.parseInt(formData.problemCount) || 5,
        rating_min: minRating,
        rating_max: maxRating,
        allow_late_join: formData.allowLateJoin,
        contest_mode: formData.contestMode,
        visibility: formData.visibility,
      };

      if (formData.maxParticipants) {
        const maxPart = Number.parseInt(formData.maxParticipants);
        if (!isNaN(maxPart) && maxPart > 0) {
          bodyData.max_participants = maxPart;
        }
      }

      const response = await fetch('/api/contests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      // Explicit 401 handling (common on deployed site if not signed in)
      if (response.status === 401) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to create a contest.',
          variant: 'destructive',
        });
        // Redirect to login for deployed users
        window.location.href = '/auth/login';
        return;
      }

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        // swallow JSON parse errors to surface a generic message
      }

      if (response.ok) {
        if (!data || !data.contest?.id) {
          toast({
            title: 'Error',
            description: 'Contest created but no ID returned',
            variant: 'destructive',
          });
          return;
        }

        setCreatedContestLink(
          `${baseUrl}/contests/${data.contest.id}/participate`
        );
        setShareDialogOpen(true);

        resetForm();
        setCreateDialogOpen(false);
        fetchContests();

        toast({
          title: '🎊 Contest is live!',
          description:
            'Your contest is ready to rock! Share the link and watch the participants roll in.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Error',
          description:
            data?.error || data?.details || 'Failed to create contest',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to create contest',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    return date.toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getCodeforcesContestUrl = (contestId: number) => {
    return `https://codeforces.com/contestRegistration/${contestId}`;
  };

  const handleCodeforcesContestClick = (
    contestId: number,
    startSeconds: number,
    contestName: string
  ) => {
    const url = getCodeforcesContestUrl(contestId);

    const now = Math.floor(Date.now() / 1000);
    const timeLeftSeconds = startSeconds - now;
    const daysLeft = Math.floor(timeLeftSeconds / (60 * 60 * 24));

    const lowername = contestName.toLowerCase();

    if (lowername.includes('div. 1') && !lowername.includes('div. 2')) {
      if (userRating < 1999) {
        toast({
          title: '🚫 Not eligible yet',
          description:
            "This is Div 1 only. Try Div 2 instead—it's perfect for ratings under 1900!",
          variant: 'destructive',
        });
        return;
      }
    }

    if (daysLeft <= 2) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: '⏳ Hold your horses!',
        description: `Registration opens in ~${daysLeft} days. Mark your calendar and come back soon!`,
        variant: 'destructive',
      });
    }
  };

  const handleJoinPrivateContest = async (contest: PrivateContest) => {
    if (!contest.starts_at) {
      toast({
        title: 'Invalid Contest',
        description: 'Start time is not set for this contest.',
        variant: 'destructive',
      });
      return;
    }

    const now = new Date();
    const start = new Date(contest.starts_at);
    const end = contest.ends_at
      ? new Date(contest.ends_at)
      : new Date(
          new Date(contest.starts_at).getTime() +
            (contest.duration_minutes ?? 0) * 60 * 1000
        );

    if (contest.status === 'ended' || (contest.ends_at && now >= end)) {
      toast({
        title: '🏁 Contest finished',
        description:
          "This one's over! Check out the leaderboard to see how everyone did.",
        variant: 'destructive',
      });
      return;
    }

    // Registration closes 10 minutes BEFORE start (Codeforces-style)
    const registrationClose = new Date(start.getTime() - 10 * 60 * 1000);

    if (!contest.isRegistered) {
      // Not registered yet
      // If contest already started and late join is not allowed -> block new registrations
      if (now >= start && !contest.allow_late_join) {
        toast({
          title: '🔒 Too late!',
          description:
            'Registration closed when the contest kicked off. Catch the next one!',
          variant: 'destructive',
        });
        return;
      }

      // If before start but within 10 minutes window -> block registrations
      if (now < start && now >= registrationClose) {
        toast({
          title: 'Registration Closed',
          description:
            'Registration closes 10 minutes before the contest start.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const response = await fetch(`/api/contests/${contest.id}/join`, {
          method: 'POST',
        });

        if (response.ok) {
          toast({
            title: "✅ You're in!",
            description:
              'Registration confirmed! Get ready to compete and show your skills.',
            variant: 'default',
          });
          fetchContests(); // Refresh to update registration status
        } else {
          const errorData = await response.json().catch(() => null);
          toast({
            title: 'Registration Failed',
            description: errorData?.error || 'Failed to register for contest',
            variant: 'destructive',
          });
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to register for contest',
          variant: 'destructive',
        });
      }
    } else {
      // Already registered
      if (now >= start) {
        // If registered before start, allow joining any time after start
        window.open(
          `/contests/${contest.id}/participate`,
          '_blank',
          'noopener'
        );
      } else {
        toast({
          title: "✅ You're all set",
          description:
            'Already registered! Just wait for the contest to start, then jump right in.',
        });
      }
    }
  };

  const getTimeUntilStart = (startSeconds: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = startSeconds - now;

    if (diff < 0) return 'Started';

    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Helper to compute display status for private contests
  const computeDisplayStatus = (c: PrivateContest) => {
    const now = Date.now();
    const startsAt = c.starts_at ? new Date(c.starts_at).getTime() : null;
    const endsAt = c.ends_at
      ? new Date(c.ends_at).getTime()
      : startsAt && c.duration_minutes
      ? startsAt + c.duration_minutes * 60 * 1000
      : null;

    if (endsAt && now >= endsAt) return 'ended';
    if (startsAt && now >= startsAt) return 'live';
    return 'upcoming';
  };

  useEffect(() => {
    if (!privateContests?.length) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const nextNotified = new Set(notifiedContestIds);
      privateContests.forEach(c => {
        if (!c.isRegistered || !c.starts_at) return;
        const startMs = new Date(c.starts_at).getTime();
        const endMs = c.ends_at
          ? new Date(c.ends_at).getTime()
          : c.starts_at && c.duration_minutes
          ? new Date(c.starts_at).getTime() + c.duration_minutes * 60 * 1000
          : null;

        const isLive = now >= startMs && (endMs == null || now < endMs);
        const alreadyNotified = nextNotified.has(c.id);
        if (isLive && !alreadyNotified) {
          nextNotified.add(c.id);
          toast({
            title: 'Contest started',
            description: `${c.name} is live. Click join to enter now.`,
            action: (
              <Button
                onClick={() =>
                  window.open(`/contests/${c.id}/participate`, '_blank')
                }
                className='bg-green-600 hover:bg-green-700'
              >
                Join Now
              </Button>
            ),
          });
        }
      });
      if (nextNotified.size !== notifiedContestIds.size) {
        setNotifiedContestIds(nextNotified);
      }
    }, 15000); // check every 15s
    return () => clearInterval(interval);
  }, [privateContests, notifiedContestIds, toast]);

  return (
    <main className='mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8'>
      {/* Enhanced Hero Section */}
      <div className='relative overflow-hidden rounded-lg bg-card/50 backdrop-blur-sm border-2 border-border hover:border-foreground/20 transition-colors p-6 sm:p-8 mb-8 shadow-sm'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6'>
          <div className='flex-1'>
            <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2'>
              Contests
            </h1>
            <p className='text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl'>
              Host or join Codeforces contests and private training sessions
            </p>
          </div>

          <div className='flex gap-2 w-full sm:w-auto'>
            <Button
              size='lg'
              variant='outline'
              onClick={() => fetchContests(true)}
              disabled={refreshing}
              className='gap-2'
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
              />
              <span className='font-semibold hidden sm:inline'>Refresh</span>
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size='lg' className='flex-1 sm:flex-none gap-2'>
                  <PlusIcon className='w-5 h-5' />
                  <span className='font-semibold'>Create Private Contest</span>
                </Button>
              </DialogTrigger>

              <DialogContent className='max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
                <DialogHeader className='border-b pb-4'>
                  <DialogTitle className='text-2xl flex items-center gap-2'>
                    <div className='p-2 rounded-md border bg-background'>
                      <Trophy className='h-6 w-6 text-foreground' />
                    </div>
                    Create Private Contest
                  </DialogTitle>
                  <DialogDescription>
                    Set up a custom training contest for your group or friends.
                    Configure problems, timing, and rules to match your needs.
                  </DialogDescription>
                </DialogHeader>

                <div className='overflow-y-auto flex-1 space-y-6 py-4 px-4 sm:px-6'>
                  {/* Contest Name & Description */}
                  <div className='space-y-4'>
                    <h4 className='font-semibold text-lg flex items-center gap-2'>
                      <span className='flex items-center justify-center w-6 h-6 rounded-full bg-muted text-foreground text-sm font-bold'>
                        1
                      </span>
                      Basic Information
                    </h4>
                    <div className='space-y-3 ml-8'>
                      <div className='space-y-2'>
                        <Label htmlFor='contest-name' className='font-medium'>
                          Contest Name *
                        </Label>
                        <Input
                          id='contest-name'
                          placeholder='e.g., Weekly Practice Round 5'
                          value={formData.name}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className='text-base'
                          aria-label='Contest name'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='contest-description'
                          className='font-medium'
                        >
                          Description
                        </Label>
                        <Textarea
                          id='contest-description'
                          placeholder='Describe your contest goals and rules...'
                          value={formData.description}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          rows={3}
                          className='text-base'
                          aria-label='Contest description'
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Contest Mode & Visibility */}
                  <div className='space-y-4'>
                    <h4 className='font-semibold text-lg flex items-center gap-2'>
                      <span className='flex items-center justify-center w-6 h-6 rounded-full bg-muted text-foreground text-sm font-bold'>
                        2
                      </span>
                      Contest Type
                    </h4>
                    <div className='space-y-3 ml-8'>
                      <div className='space-y-2'>
                        <Label htmlFor='contest-mode' className='font-medium'>
                          Contest Mode *
                        </Label>
                        <Select
                          value={formData.contestMode}
                          onValueChange={value =>
                            setFormData(prev => ({
                              ...prev,
                              contestMode: value,
                            }))
                          }
                        >
                          <SelectTrigger
                            id='contest-mode'
                            className='text-base'
                            aria-label='Contest mode'
                          >
                            <SelectValue placeholder='Select contest mode' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='practice'>
                              <div className='flex items-center gap-2'>
                                <span>Practice Arena</span>
                                <Badge variant='outline' className='text-xs'>
                                  5-12 problems, 2-4 hours
                                </Badge>
                              </div>
                            </SelectItem>
                            <SelectItem value='icpc'>
                              <div className='flex items-center gap-2'>
                                <span>ICPC Arena</span>
                                <Badge variant='outline' className='text-xs'>
                                  10-13 problems, 5 hours
                                </Badge>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='visibility' className='font-medium'>
                          Visibility *
                        </Label>
                        <Select
                          value={formData.visibility}
                          onValueChange={value =>
                            setFormData(prev => ({
                              ...prev,
                              visibility: value,
                            }))
                          }
                        >
                          <SelectTrigger
                            id='visibility'
                            className='text-base'
                            aria-label='Contest visibility'
                          >
                            <SelectValue placeholder='Select visibility' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='private'>
                              Private (Only invited users)
                            </SelectItem>
                            <SelectItem value='public'>
                              Public (Anyone can join)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Schedule */}
                  <div className='space-y-4'>
                    <h4 className='font-semibold text-lg flex items-center gap-2'>
                      <span className='flex items-center justify-center w-6 h-6 rounded-full bg-muted text-foreground text-sm font-bold'>
                        3
                      </span>
                      Schedule
                    </h4>
                    <div className='space-y-3 ml-8'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='start-date' className='font-medium'>
                            Start Date *
                          </Label>
                          <Input
                            id='start-date'
                            type='date'
                            value={formData.startDate}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                startDate: e.target.value,
                              }))
                            }
                            min={new Date().toISOString().split('T')[0]}
                            className='light:scheme-light dark:scheme-dark'
                            aria-label='Contest start date'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='start-time' className='font-medium'>
                            Start Time *
                          </Label>
                          <Input
                            id='start-time'
                            type='time'
                            value={formData.startTime}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                startTime: e.target.value,
                              }))
                            }
                            className='light:scheme-light dark:scheme-dark'
                            aria-label='Contest start time'
                          />
                        </div>
                      </div>
                      <p className='text-xs text-muted-foreground bg-muted/50 p-2 rounded'>
                        Note: Contest must start at least 1 hour from now. Time
                        will be adjusted automatically if needed.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Problems */}
                  <div className='space-y-4'>
                    <h4 className='font-semibold text-lg flex items-center gap-2'>
                      <span className='flex items-center justify-center w-6 h-6 rounded-full bg-muted text-foreground text-sm font-bold'>
                        4
                      </span>
                      Problem Configuration
                    </h4>
                    <div className='space-y-3 ml-8'>
                      <div className='space-y-2'>
                        <Label htmlFor='problem-count' className='font-medium'>
                          Number of Problems *
                        </Label>
                        <Select
                          value={formData.problemCount}
                          onValueChange={value =>
                            setFormData(prev => ({
                              ...prev,
                              problemCount: value,
                            }))
                          }
                        >
                          <SelectTrigger
                            id='problem-count'
                            className='text-base'
                            aria-label='Number of problems'
                          >
                            <SelectValue placeholder='Select number of problems' />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.contestMode === 'practice'
                              ? [5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                                  <SelectItem key={num} value={`${num}`}>
                                    {num} Problems
                                  </SelectItem>
                                ))
                              : [10, 11, 12, 13].map(num => (
                                  <SelectItem key={num} value={`${num}`}>
                                    {num} Problems (ICPC Standard)
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label className='font-medium'>
                          Problem Rating Range *
                        </Label>
                        <div className='grid grid-cols-2 gap-4'>
                          <Select
                            value={formData.ratingMin}
                            onValueChange={value =>
                              setFormData(prev => ({
                                ...prev,
                                ratingMin: value,
                              }))
                            }
                          >
                            <SelectTrigger
                              className='text-base'
                              aria-label='Minimum rating'
                            >
                              <SelectValue placeholder='Min' />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(
                                { length: 28 },
                                (_, i) => 800 + i * 100
                              ).map(val => (
                                <SelectItem key={val} value={`${val}`}>
                                  {val}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={formData.ratingMax}
                            onValueChange={value =>
                              setFormData(prev => ({
                                ...prev,
                                ratingMax: value,
                              }))
                            }
                          >
                            <SelectTrigger
                              className='text-base'
                              aria-label='Maximum rating'
                            >
                              <SelectValue placeholder='Max' />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(
                                { length: 28 },
                                (_, i) => 800 + i * 100
                              ).map(val => (
                                <SelectItem key={val} value={`${val}`}>
                                  {val}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Settings */}
                  <div className='space-y-4'>
                    <h4 className='font-semibold text-lg flex items-center gap-2'>
                      <span className='flex items-center justify-center w-6 h-6 rounded-full bg-muted text-foreground text-sm font-bold'>
                        5
                      </span>
                      Additional Settings
                    </h4>
                    <div className='space-y-3 ml-8'>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='max-participants'
                          className='font-medium'
                        >
                          Max Participants
                        </Label>
                        <Input
                          id='max-participants'
                          type='number'
                          placeholder='Leave empty for unlimited'
                          value={formData.maxParticipants}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              maxParticipants: e.target.value,
                            }))
                          }
                          min={1}
                          max={1000}
                          aria-label='Maximum participants'
                        />
                      </div>

                      <div className='flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30'>
                        <div className='space-y-0.5'>
                          <Label
                            htmlFor='late-join-toggle'
                            className='font-medium'
                          >
                            Allow Late Join
                          </Label>
                          <p className='text-sm text-muted-foreground'>
                            Participants can join after contest starts
                          </p>
                        </div>
                        <Switch
                          id='late-join-toggle'
                          checked={formData.allowLateJoin}
                          onCheckedChange={checked =>
                            setFormData(prev => ({
                              ...prev,
                              allowLateJoin: checked,
                            }))
                          }
                          aria-label='Allow late join'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  {formData.startDate && formData.startTime && (
                    <>
                      <Separator />
                      <div className='space-y-3 p-4 rounded-md bg-muted border'>
                        <h4 className='font-semibold flex items-center gap-2'>
                          <span>✓</span>
                          Contest Preview
                        </h4>
                        <div className='text-sm space-y-2 text-muted-foreground'>
                          <div className='flex justify-between'>
                            <span>Mode:</span>
                            <span className='font-medium text-foreground'>
                              {formData.contestMode === 'practice'
                                ? 'Practice Arena'
                                : 'ICPC Arena'}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span>Start:</span>
                            <span className='font-medium text-foreground'>
                              {new Date(
                                `${formData.startDate}T${formData.startTime}`
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span>Duration:</span>
                            <span className='font-medium text-foreground'>
                              {formData.contestMode === 'icpc'
                                ? '5 hours'
                                : `${
                                    getAutoDuration(
                                      Number.parseInt(formData.problemCount)
                                    ).hours
                                  } hours`}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span>Problems:</span>
                            <span className='font-medium text-foreground'>
                              {formData.problemCount} (Rating{' '}
                              {formData.ratingMin}-{formData.ratingMax})
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <DialogFooter className='border-t pt-4 flex justify-end gap-3'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setCreateDialogOpen(false);
                      resetForm();
                    }}
                    className='min-w-[100px]'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createContest}
                    disabled={creating || !formData.name.trim()}
                    size='lg'
                    className='min-w-[150px]'
                  >
                    {creating ? 'Creating...' : 'Create Contest'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {loading ? (
        <div className='text-center py-12'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground/60'></div>
          <p className='mt-2 text-foreground/60'>Loading contests...</p>
        </div>
      ) : (
        <div className='space-y-10'>
          {/* Upcoming Contests Section - Codeforces */}
          <section>
            <div className='flex items-center gap-4 mb-8 pb-4 border-b-2'>
              <div className='flex items-center gap-4 flex-1'>
                <div className='p-3 rounded-lg border-2 bg-muted/50'>
                  <Trophy className='w-6 h-6 text-foreground' />
                </div>
                <div>
                  <h2 className='text-xl sm:text-2xl font-bold text-foreground mb-1'>
                    Upcoming Contests
                  </h2>
                  <p className='text-sm text-muted-foreground'>
                    Official Codeforces competitions
                  </p>
                </div>
              </div>
              <Badge
                variant='secondary'
                className='text-sm px-4 py-2 font-semibold'
              >
                {upcomingCfContests.length}
              </Badge>
            </div>

            {upcomingCfContests.length === 0 ? (
              <Card className='border-2 border-dashed hover:border-primary/30 transition-colors'>
                <CardContent className='p-12'>
                  <div className='text-center'>
                    <div className='inline-flex p-6 rounded-lg border-2 bg-muted/50 mb-4'>
                      <Trophy className='w-12 h-12 text-muted-foreground/50' />
                    </div>
                    <p className='text-base text-muted-foreground font-medium'>
                      No upcoming Codeforces contests at the moment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
                {upcomingCfContests.slice(0, 6).map(contest => (
                  <Card
                    key={contest.id}
                    className='group relative cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-foreground/20 bg-card/50 backdrop-blur-sm'
                    onClick={() =>
                      handleCodeforcesContestClick(
                        contest.id,
                        contest.startTimeSeconds || 0,
                        contest.name
                      )
                    }
                  >
                    <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                    <CardHeader className='pb-4 relative z-10'>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex-1 min-w-0'>
                          <CardTitle className='text-base font-semibold leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors'>
                            {contest.name}
                          </CardTitle>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <Badge
                              variant='outline'
                              className='text-xs font-medium border-foreground/20'
                            >
                              {contest.type}
                            </Badge>
                            <Badge
                              variant='secondary'
                              className='text-xs font-medium'
                            >
                              {contest.phase}
                            </Badge>
                          </div>
                        </div>
                        <div className='p-2 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors'>
                          <ExternalLinkIcon className='w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors' />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='pt-0 space-y-4 relative z-10'>
                      <div className='space-y-3'>
                        {contest.startTimeSeconds && (
                          <div className='flex items-center gap-3 text-sm'>
                            <div className='p-2 rounded-md bg-muted/50'>
                              <CalendarIcon className='w-4 h-4 text-foreground/70' />
                            </div>
                            <span className='truncate text-foreground/80 font-medium'>
                              {formatTime(contest.startTimeSeconds)}
                            </span>
                          </div>
                        )}
                        <div className='flex items-center gap-3 text-sm'>
                          <div className='p-2 rounded-md bg-muted/50'>
                            <ClockIcon className='w-4 h-4 text-foreground/70' />
                          </div>
                          <span className='text-foreground/80 font-medium'>
                            {formatDuration(contest.durationSeconds)}
                          </span>
                        </div>
                      </div>
                      {contest.startTimeSeconds && (
                        <div className='pt-4 border-t'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm font-medium text-muted-foreground'>
                              Starts in
                            </span>
                            <Badge
                              variant='default'
                              className='text-xs font-semibold px-3 py-1'
                            >
                              {getTimeUntilStart(contest.startTimeSeconds)}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Private Contest Section */}
          <section>
            <div className='flex items-center gap-4 mb-8 pb-4 border-b-2'>
              <div className='flex items-center gap-4 flex-1'>
                <div className='p-3 rounded-lg border-2 bg-muted/50'>
                  <Zap className='w-6 h-6 text-foreground' />
                </div>
                <div>
                  <h2 className='text-xl sm:text-2xl font-bold text-foreground mb-1'>
                    Private Contests
                  </h2>
                  <p className='text-sm text-muted-foreground'>
                    Custom training sessions
                  </p>
                </div>
              </div>
              <Badge
                variant='secondary'
                className='text-sm px-4 py-2 font-semibold'
              >
                {privateContests.length}
              </Badge>
            </div>

            {privateContests.length === 0 ? (
              <Card className='border-2 border-dashed hover:border-primary/30 transition-colors'>
                <CardContent className='p-8 sm:p-12'>
                  <div className='text-center'>
                    <div className='inline-flex p-6 rounded-lg border-2 bg-muted/50 mb-4'>
                      <UsersIcon className='w-12 h-12 text-muted-foreground' />
                    </div>
                    <h3 className='text-lg font-semibold mb-2'>
                      No Private Contests Yet
                    </h3>
                    <p className='text-muted-foreground mb-6 max-w-md mx-auto'>
                      Create your first private contest to practice with friends
                      or host training sessions for your group.
                    </p>
                    <Button
                      onClick={() => setCreateDialogOpen(true)}
                      size='lg'
                      className='shadow-md hover:shadow-lg transition-shadow'
                    >
                      <PlusIcon className='w-4 h-4 mr-2' />
                      Create Your First Contest
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
                {privateContests.map(contest => {
                  const status = computeDisplayStatus(contest);
                  const isLive = status === 'live';
                  const isEnded = status === 'ended';

                  const handleOpenContest = () => {
                    window.open(`/contests/${contest.id}`, '_blank');
                  };

                  return (
                    <Card
                      key={contest.id}
                      className='group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-foreground/20 bg-card/50 backdrop-blur-sm cursor-pointer'
                      onClick={handleOpenContest}
                    >
                      <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                      {/* Live indicator */}
                      {isLive && (
                        <div className='absolute top-4 right-4 z-20'>
                          <span className='flex h-3 w-3'>
                            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75'></span>
                            <span className='relative inline-flex rounded-full h-3 w-3 bg-green-500'></span>
                          </span>
                        </div>
                      )}

                      <CardHeader className='pb-4 relative z-10'>
                        <div className='flex items-start justify-between gap-3 mb-3'>
                          <div className='flex-1 min-w-0'>
                            <CardTitle className='text-base font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors'>
                              {contest.name}
                            </CardTitle>
                            <CardDescription className='text-xs font-medium'>
                              {contest.visibility === 'public'
                                ? 'Public'
                                : 'Private'}{' '}
                              • {contest.isHost ? 'Host' : 'Guest'}
                            </CardDescription>
                          </div>
                        </div>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <Badge
                            variant={
                              isLive
                                ? 'default'
                                : isEnded
                                ? 'secondary'
                                : 'outline'
                            }
                            className={`text-xs font-medium ${
                              isLive ? 'bg-green-600 hover:bg-green-700' : ''
                            }`}
                          >
                            {isLive && '• '}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                          <Badge
                            variant='outline'
                            className='text-xs font-medium border-foreground/20'
                          >
                            {contest.contest_mode === 'icpc'
                              ? 'ICPC'
                              : 'Practice'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className='pt-0 space-y-4 relative z-10'>
                        <div className='space-y-3'>
                          {contest.starts_at && (
                            <div className='flex items-center gap-3 text-sm'>
                              <div className='p-2 rounded-md bg-muted/50'>
                                <CalendarIcon className='w-4 h-4 text-foreground/70' />
                              </div>
                              <span className='truncate text-foreground/80 font-medium'>
                                {new Date(contest.starts_at).toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className='flex items-center gap-3 text-sm'>
                            <div className='p-2 rounded-md bg-muted/50'>
                              <ClockIcon className='w-4 h-4 text-foreground/70' />
                            </div>
                            <span className='text-foreground/80 font-medium'>
                              {contest.duration_minutes} minutes
                            </span>
                          </div>
                        </div>

                        {contest.description && (
                          <p className='text-sm text-muted-foreground line-clamp-2 pt-2 border-t italic'>
                            {contest.description}
                          </p>
                        )}

                        <div className='flex flex-wrap items-center gap-2 pt-2 border-t'>
                          <span className='text-xs font-medium text-muted-foreground'>
                            {contest.problem_count} problems
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            •
                          </span>
                          <span className='text-xs font-medium text-muted-foreground'>
                            {contest.rating_min}-{contest.rating_max}
                          </span>
                          {contest.allow_late_join && (
                            <>
                              <span className='text-xs text-muted-foreground'>
                                •
                              </span>
                              <span className='text-xs font-medium text-muted-foreground'>
                                Late join
                              </span>
                            </>
                          )}
                        </div>

                        <div className='pt-4 border-t'>
                          {(() => {
                            const now = Date.now();
                            const startsAt = contest.starts_at
                              ? new Date(contest.starts_at).getTime()
                              : null;
                            const endsAt = contest.ends_at
                              ? new Date(contest.ends_at).getTime()
                              : startsAt && contest.duration_minutes
                              ? startsAt + contest.duration_minutes * 60 * 1000
                              : null;
                            const hasEnded = !!(endsAt && now >= endsAt);
                            const hasStarted = !!(startsAt && now >= startsAt);

                            if (hasEnded || contest.status === 'ended') {
                              return (
                                <div className='space-y-2'>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    className='w-full text-xs font-semibold hover:bg-muted transition-colors bg-transparent'
                                    onClick={e => {
                                      e.stopPropagation();
                                      window.open(
                                        `/contests/${contest.id}`,
                                        '_blank'
                                      );
                                    }}
                                  >
                                    View Leaderboard
                                  </Button>
                                  {contest.isHost && (
                                    <Button
                                      size='sm'
                                      variant='outline'
                                      className='w-full text-xs font-semibold bg-transparent'
                                      onClick={e => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(
                                          `${baseUrl}/contests/${contest.id}`
                                        );
                                        toast({
                                          title: 'Link Copied!',
                                          description:
                                            'Contest link copied to clipboard.',
                                        });
                                      }}
                                    >
                                      Copy Link
                                    </Button>
                                  )}
                                </div>
                              );
                            }

                            const label = contest.isRegistered
                              ? hasStarted
                                ? 'Join Contest'
                                : 'Registered'
                              : 'Register';
                            const disabled = contest.isRegistered
                              ? !hasStarted && !contest.allow_late_join
                              : false;

                            return (
                              <div className='space-y-2'>
                                <Button
                                  size='sm'
                                  variant={hasStarted ? 'default' : 'default'}
                                  className={`w-full text-xs font-semibold shadow-md hover:shadow-lg transition-all ${
                                    hasStarted
                                      ? 'bg-green-600 hover:bg-green-700'
                                      : ''
                                  }`}
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleJoinPrivateContest(contest);
                                  }}
                                  disabled={disabled}
                                >
                                  {label}
                                </Button>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  className='w-full text-xs font-semibold bg-transparent'
                                  onClick={e => {
                                    e.stopPropagation();
                                    window.open(
                                      `/contests/${contest.id}`,
                                      '_blank'
                                    );
                                  }}
                                >
                                  View Details
                                </Button>
                              </div>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Contest Created!</DialogTitle>
            <DialogDescription>
              Share this contest link with your friends. Users can register up
              to 10 minutes before start.
            </DialogDescription>
          </DialogHeader>
          <div className='flex items-center gap-2 mt-4'>
            <label htmlFor='created-link' className='sr-only'>
              Created contest link
            </label>
            <Input
              id='created-link'
              value={createdContestLink || ''}
              readOnly
              className='flex-1'
              aria-label='Created contest link'
            />
            <Button
              onClick={() => {
                if (createdContestLink)
                  navigator.clipboard.writeText(createdContestLink);
                toast({
                  title: 'Copied!',
                  description: 'Link copied to clipboard.',
                });
              }}
              className='bg-primary hover:bg-primary/90 text-primary-foreground font-medium'
            >
              Copy
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setShareDialogOpen(false)} variant='outline'>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
