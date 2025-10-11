'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

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
  id: string;
  name: string;
  description?: string;
  visibility: string;
  status: string;
  host_user_id: string;
  starts_at?: string;
  ends_at?: string;
  duration_minutes?: number;
  max_participants?: number;
  allow_late_join?: boolean;
  contest_mode: string;
  problem_count: number;
  rating_min: number;
  rating_max: number;
  created_at: string;
  isRegistered?: boolean;
  isHost?: boolean;
};

export default function ContestsPage() {
  const [upcomingCfContests, setUpcomingCfContests] = useState<
    CodeforcesContest[]
  >([]);
  const [privateContests, setPrivateContests] = useState<PrivateContest[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
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
  });
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [userRating, setUserRating] = useState<number>(0);

  const [createdContestLink, setCreatedContestLink] = useState<string | null>(
    null
  );
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [notifiedContestIds, setNotifiedContestIds] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };

    const fetchUserRating = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) return;

      const { data, error } = await supabase
        .from('cf_snapshots')
        .select('rating')
        .eq('user_id', userId)
        .order('captured_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching rating:', error);
        return;
      }

      if (data?.rating) {
        setUserRating(data.rating);
      }
    };

    fetchCurrentUser();
    fetchUserRating();
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);

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
      toast({
        title: 'Error',
        description: 'Failed to fetch contests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
        title: 'Error',
        description: 'Contest name is required',
        variant: 'destructive',
      });
      return;
    }

    // Validate start date & time
    if (!formData.startDate || !formData.startTime) {
      toast({
        title: 'Error',
        description: 'Start date and time are required',
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
        title: 'Error',
        description: 'Maximum rating must be higher than minimum rating',
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

        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          (typeof window !== 'undefined' ? window.location.origin : '');
        setCreatedContestLink(
          `${baseUrl}/contests/${data.contest.id}/participate`
        );
        setShareDialogOpen(true);

        resetForm();
        setCreateDialogOpen(false);
        fetchContests();

        toast({
          title: 'Success',
          description: 'Contest created successfully!',
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
          title: 'Not Eligible',
          description:
            'Register for Div2 because your current rating is <1900.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (daysLeft <= 2) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: 'Registration Not Started',
        description: `Registration isn't opened yet, please wait ~${daysLeft} days to register!`,
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
        title: 'Contest Ended',
        description:
          'This contest has already ended. You can view details or leaderboard instead.',
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
          title: 'Registration Closed',
          description: 'Registration closed when the contest started.',
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
            title: 'Registered!',
            description: 'You have been registered for the contest.',
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
          title: 'Registered',
          description:
            "You're registered. You can join once the contest starts.",
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
    <main className='mx-auto max-w-6xl px-4 py-10'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-2xl font-semibold'>Contests</h1>
          <p className='mt-2 text-white/80 leading-relaxed'>
            Host or join private training contests. After the contest, view
            rating simulation and get a recovery set.
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className='w-4 h-4 mr-2' />
              Create Contest
            </Button>
          </DialogTrigger>

          <DialogContent className='max-w-3xl w-full max-h-[80vh] overflow-hidden'>
            <DialogHeader>
              <DialogTitle>Create New Contest</DialogTitle>
              <DialogDescription>
                Create a private training contest for your group or friends.
              </DialogDescription>
            </DialogHeader>

            <div className='overflow-y-auto max-h-[60vh] space-y-6 py-4 px-2 sm:px-4'>
              {/* Contest Name */}
              <div className='space-y-2'>
                <Label htmlFor='contest-name'>Contest Name *</Label>
                <Input
                  id='contest-name'
                  placeholder='Enter contest name...'
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              {/* Description */}
              <div className='space-y-2'>
                <Label htmlFor='contest-description'>Description</Label>
                <Textarea
                  id='contest-description'
                  placeholder='Describe your contest (optional)...'
                  value={formData.description}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <Separator />

              {/* Contest Mode */}
              <div className='space-y-2'>
                <Label htmlFor='contest-mode'>Contest Mode *</Label>
                <Select
                  value={formData.contestMode}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, contestMode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select contest mode' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='practice'>
                      Practice Arena (5-12 problems, 2-4 hours)
                    </SelectItem>
                    <SelectItem value='icpc'>
                      ICPC Arena (10-13 problems, 5 hours)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className='text-xs text-muted-foreground'>
                  {formData.contestMode === 'practice'
                    ? 'Flexible training contests for individuals or groups'
                    : 'ICPC-style contests with teams of 3 (or solo)'}
                </p>
              </div>

              {/* Visibility */}
              <div className='space-y-2'>
                <Label htmlFor='visibility'>Visibility *</Label>
                <Select
                  value={formData.visibility}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, visibility: value }))
                  }
                >
                  <SelectTrigger>
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

              {/* Contest Schedule */}
              <div className='space-y-4'>
                <h4 className='font-medium text-lg'>Contest Schedule</h4>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='start-date'>Start Date *</Label>
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
                      className='dark:bg-background dark:text-foreground dark:[color-scheme:dark]'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='start-time'>Start Time *</Label>
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
                      className='dark:bg-background dark:text-foreground dark:[color-scheme:dark]'
                    />
                  </div>
                </div>

                <p className='text-xs text-muted-foreground'>
                  Note: Contest must start at least 1 hour from now. Time will
                  be adjusted automatically if needed.
                </p>

                {formData.problemCount && (
                  <div className='text-sm text-muted-foreground'>
                    <strong>Duration:</strong>{' '}
                    {formData.contestMode === 'icpc'
                      ? '5 hours (fixed for ICPC)'
                      : `${
                          getAutoDuration(
                            Number.parseInt(formData.problemCount)
                          ).hours
                        } hours (auto-calculated)`}
                  </div>
                )}
              </div>

              <Separator />

              {/* Problem Configuration */}
              <div className='space-y-4'>
                <h4 className='font-medium text-lg'>Problem Configuration</h4>
                <div className='space-y-2'>
                  <Label htmlFor='problem-count'>Number of Problems *</Label>
                  <Select
                    value={formData.problemCount}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, problemCount: value }))
                    }
                  >
                    <SelectTrigger>
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
                              {num} Problems
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Rating Range */}
                <div className='space-y-2'>
                  <Label>Problem Rating Range *</Label>
                  <div className='grid grid-cols-2 gap-4'>
                    <Select
                      value={formData.ratingMin}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, ratingMin: value }))
                      }
                    >
                      <SelectTrigger>
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
                        setFormData(prev => ({ ...prev, ratingMax: value }))
                      }
                    >
                      <SelectTrigger>
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
                  <p className='text-xs text-muted-foreground'>
                    Problems will be randomly selected from Codeforces (rating
                    800-3500).
                  </p>
                </div>
              </div>

              <Separator />

              {/* Contest Settings */}
              <div className='space-y-4'>
                <h4 className='font-medium text-lg'>Contest Settings</h4>

                <div className='space-y-2'>
                  <Label htmlFor='max-participants'>Max Participants</Label>
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
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label>Allow Late Join</Label>
                    <p className='text-sm text-muted-foreground'>
                      Participants can join after contest starts
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowLateJoin}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, allowLateJoin: checked }))
                    }
                  />
                </div>
              </div>

              {/* Preview */}
              {formData.startDate && formData.startTime && (
                <>
                  <Separator />
                  <div className='space-y-2'>
                    <h4 className='font-medium'>Preview</h4>
                    <div className='text-sm text-muted-foreground space-y-1'>
                      <p>
                        <strong>Mode:</strong>{' '}
                        {formData.contestMode === 'practice'
                          ? 'Practice Arena'
                          : 'ICPC Arena'}
                      </p>
                      <p>
                        <strong>Visibility:</strong>{' '}
                        {formData.visibility === 'public'
                          ? 'Public'
                          : 'Private'}
                      </p>
                      <p>
                        <strong>Start:</strong>{' '}
                        {new Date(
                          `${formData.startDate}T${formData.startTime}`
                        ).toLocaleString()}
                      </p>
                      <p>
                        <strong>Duration:</strong>{' '}
                        {formData.contestMode === 'icpc'
                          ? '5 hours'
                          : `${
                              getAutoDuration(
                                Number.parseInt(formData.problemCount)
                              ).hours
                            } hours`}
                      </p>
                      <p>
                        <strong>Problems:</strong> {formData.problemCount}{' '}
                        (Rating {formData.ratingMin}-{formData.ratingMax})
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={createContest}
                disabled={creating || !formData.name.trim()}
              >
                {creating ? 'Creating...' : 'Create Contest'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className='text-center py-12'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white/60'></div>
          <p className='mt-2 text-white/60'>Loading contests...</p>
        </div>
      ) : (
        <div className='space-y-8'>
          {/* Upcoming Codeforces Contests */}
          <section>
            <div className='flex items-center gap-2 mb-4'>
              <h2 className='text-xl font-semibold'>
                Upcoming Codeforces Contests
              </h2>
              <Badge variant='secondary'>{upcomingCfContests.length}</Badge>
            </div>

            {upcomingCfContests.length === 0 ? (
              <Card>
                <CardContent className='p-6'>
                  <p className='text-white/60 text-center'>
                    No upcoming Codeforces contests found.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {upcomingCfContests.slice(0, 6).map(contest => (
                  <Card
                    key={contest.id}
                    className='hover:bg-white/5 transition-colors cursor-pointer'
                    onClick={() =>
                      handleCodeforcesContestClick(
                        contest.id,
                        contest.startTimeSeconds || 0,
                        contest.name
                      )
                    }
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex items-start justify-between'>
                        <CardTitle className='text-sm font-medium leading-tight'>
                          {contest.name}
                        </CardTitle>
                        <ExternalLinkIcon className='w-4 h-4 text-white/40 flex-shrink-0 ml-2 hover:text-white/60 transition-colors' />
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='text-xs'>
                          {contest.type}
                        </Badge>
                        <Badge variant='secondary' className='text-xs'>
                          {contest.phase}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className='pt-0'>
                      <div className='space-y-2 text-sm'>
                        {contest.startTimeSeconds && (
                          <div className='flex items-center gap-2 text-white/70'>
                            <CalendarIcon className='w-4 h-4' />
                            <span>{formatTime(contest.startTimeSeconds)}</span>
                          </div>
                        )}
                        <div className='flex items-center gap-2 text-white/70'>
                          <ClockIcon className='w-4 h-4' />
                          <span>{formatDuration(contest.durationSeconds)}</span>
                        </div>
                        {contest.startTimeSeconds && (
                          <div className='flex items-center justify-between'>
                            <span className='text-white/60'>Starts in:</span>
                            <Badge variant='default' className='text-xs'>
                              {getTimeUntilStart(contest.startTimeSeconds)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Private Contests */}
          <section>
            <div className='flex items-center gap-2 mb-4'>
              <h2 className='text-xl font-semibold'>Private Contests</h2>
              <Badge variant='secondary'>{privateContests.length}</Badge>
            </div>

            {privateContests.length === 0 ? (
              <Card>
                <CardContent className='p-6'>
                  <div className='text-center'>
                    <UsersIcon className='w-12 h-12 text-white/20 mx-auto mb-4' />
                    <p className='text-white/60 mb-4'>
                      No private contests yet.
                    </p>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <PlusIcon className='w-4 h-4 mr-2' />
                      Create Your First Contest
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {privateContests.map(contest => (
                  <Card
                    key={contest.id}
                    className='hover:bg-white/5 transition-colors'
                  >
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-sm font-medium'>
                        {contest.name}
                      </CardTitle>
                      <CardDescription className='text-xs'>
                        {contest.visibility === 'public' ? 'Public' : 'Private'}{' '}
                        • Created by {contest.isHost ? 'You' : 'Others'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className='pt-0'>
                      <div className='flex items-center justify-between mb-3'>
                        <Badge
                          variant={
                            computeDisplayStatus(contest) === 'live'
                              ? 'default'
                              : computeDisplayStatus(contest) === 'ended'
                              ? 'secondary'
                              : 'outline'
                          }
                          className='text-xs'
                        >
                          {computeDisplayStatus(contest)}
                        </Badge>
                        <div className='flex gap-2'>
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

                            // Hide action when ended
                            if (hasEnded || contest.status === 'ended') {
                              return (
                                <Button
                                  size='sm'
                                  variant='outline'
                                  className='h-8 px-2 text-xs bg-transparent'
                                  onClick={() =>
                                    window.open(
                                      `/contests/${contest.id}`,
                                      '_blank'
                                    )
                                  }
                                >
                                  View Leaderboard
                                </Button>
                              );
                            }

                            // Allow register/join for both participants and host
                            const label = contest.isRegistered
                              ? hasStarted
                                ? 'Join Now'
                                : `Registered • ${
                                    contest.starts_at
                                      ? getTimeUntilStart(
                                          Math.floor(
                                            new Date(
                                              contest.starts_at
                                            ).getTime() / 1000
                                          )
                                        )
                                      : ''
                                  }`
                              : 'Register';

                            const disabled = contest.isRegistered
                              ? !hasStarted && !contest.allow_late_join
                              : false;

                            return (
                              <Button
                                size='sm'
                                className={`h-8 px-2 text-xs ${
                                  hasStarted
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : ''
                                }`}
                                onClick={() =>
                                  handleJoinPrivateContest(contest)
                                }
                                disabled={disabled}
                                aria-disabled={disabled}
                                title={
                                  contest.isHost && !contest.isRegistered
                                    ? 'Register as participant (host)'
                                    : undefined
                                }
                              >
                                {label}
                              </Button>
                            );
                          })()}
                        </div>
                      </div>

                      {contest.starts_at && (
                        <div className='mt-3 text-xs text-white/70 space-y-2'>
                          <div className='flex items-center gap-2'>
                            <CalendarIcon className='w-3 h-3' />
                            <span>
                              {new Date(contest.starts_at).toLocaleString()}
                            </span>
                          </div>
                          {contest.description && (
                            <div className='text-white/60'>
                              {contest.description}
                            </div>
                          )}
                          <div className='flex flex-wrap items-center gap-3 text-white/60'>
                            <span>{contest.problem_count} problems</span>
                            <span>{contest.duration_minutes} min</span>
                            <span>Mode: {contest.contest_mode}</span>
                            {contest.allow_late_join && (
                              <span>• Late join</span>
                            )}
                            {contest.isHost && (
                              <span>
                                • Rating {contest.rating_min}-
                                {contest.rating_max}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
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
            <Input
              value={createdContestLink || ''}
              readOnly
              className='flex-1'
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