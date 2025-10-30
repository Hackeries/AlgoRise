'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Trophy, Users } from 'lucide-react';

interface ChallengeDTO {
  id: string;
  title: string;
  description: string | null;
  metric: string;
  target: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'expired';
  createdAt: string;
  createdBy: string;
  currentUserCount: number;
  percentComplete: number;
  membersCompleted: number;
  participants: number;
  lastUpdated: string | null;
}

interface ChallengesResponse {
  challenges: ChallengeDTO[];
  role: 'member' | 'admin';
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface GroupChallengesProps {
  groupId: string;
  isAdmin: boolean;
}

export function GroupChallenges({ groupId, isAdmin }: GroupChallengesProps) {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    target: '50',
    duration: 'weekly',
    description: '',
  });
  const [draftProgress, setDraftProgress] = useState<Record<string, number | null>>({});

  const { data, error, isLoading, mutate } = useSWR<ChallengesResponse>(
    groupId ? `/api/groups/${groupId}/challenges` : null,
    fetcher
  );

  const challenges = data?.challenges || [];

  const statusBadge = (status: ChallengeDTO['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className='bg-emerald-500/20 text-emerald-500'>Completed</Badge>;
      case 'expired':
        return <Badge className='bg-red-500/20 text-red-400'>Expired</Badge>;
      default:
        return <Badge className='bg-blue-500/10 text-blue-400'>Active</Badge>;
    }
  };

  const handleCreateChallenge = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast({ title: 'Title required', description: 'Give your challenge a name first!', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          target: parseInt(form.target, 10),
          duration: form.duration,
          description: form.description.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Failed to create challenge');
      }

      toast({ title: 'Challenge launched! 🚀', description: 'Your group can now start logging progress.' });
      setForm({ title: '', target: '50', duration: 'weekly', description: '' });
      mutate();
    } catch (err: any) {
      toast({
        title: 'Unable to create challenge',
        description: err?.message || 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const countdownLabelFor = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) return 'Ends soon';
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Ended';
    if (diff === 0) return 'Ends today';
    if (diff === 1) return 'Ends tomorrow';
    return `${diff} days left`;
  };

  const handleProgressSave = async (challenge: ChallengeDTO, count: number) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/challenges/${challenge.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Failed to update progress');
      }

      toast({
        title: 'Progress updated',
        description: count >= challenge.target ? 'Challenge completed! 🎉' : 'Keep pushing, you’re on track.',
      });
      mutate();
      setDraftProgress(prev => ({ ...prev, [challenge.id]: null }));
    } catch (err: any) {
      toast({
        title: 'Could not save progress',
        description: err?.message || 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='space-y-6'>
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Launch a group challenge</CardTitle>
            <CardDescription>Example: “Solve 50 problems this week” to keep everyone accountable.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateChallenge} className='grid gap-4 md:grid-cols-2'>
              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='challenge-title'>Challenge name</Label>
                <Input
                  id='challenge-title'
                  placeholder='Solve 50 problems this week'
                  value={form.title}
                  onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='challenge-target'>Target problems</Label>
                <Input
                  id='challenge-target'
                  type='number'
                  min={1}
                  value={form.target}
                  onChange={event => setForm(prev => ({ ...prev, target: event.target.value }))}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label>Duration</Label>
                <Select
                  value={form.duration}
                  onValueChange={value => setForm(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Weekly' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='weekly'>Weekly</SelectItem>
                    <SelectItem value='monthly'>Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='md:col-span-2 space-y-2'>
                <Label htmlFor='challenge-description'>Description (optional)</Label>
                <Input
                  id='challenge-description'
                  placeholder='Optional details or reward for the group'
                  value={form.description}
                  onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))}
                />
              </div>

              <div className='md:col-span-2 flex justify-end gap-2'>
                <Button type='submit' disabled={creating}>
                  {creating ? 'Creating...' : 'Create Challenge'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card>
          <CardContent className='p-6 space-y-4'>
            <div className='h-4 w-48 bg-muted animate-pulse rounded' />
            <div className='h-3 w-full bg-muted animate-pulse rounded' />
            <div className='h-3 w-2/3 bg-muted animate-pulse rounded' />
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className='p-6 text-sm text-red-400'>
            Could not load challenges. Please refresh.
          </CardContent>
        </Card>
      ) : challenges.length === 0 ? (
        <Card className='border-dashed'>
          <CardContent className='p-10 text-center space-y-3 text-sm text-muted-foreground'>
            <Trophy className='h-10 w-10 mx-auto text-muted-foreground/70' />
            <p>No group challenges yet.</p>
            {isAdmin && <p>Launch the first challenge to get everyone competing!</p>}
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-4'>
          {challenges.map(challenge => {
            const countValue = draftProgress[challenge.id] ?? challenge.currentUserCount;
            const countdownLabel = countdownLabelFor(challenge.endDate);

            return (
              <Card key={challenge.id} className='border border-primary/10'>
                <CardHeader className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                      {challenge.title}
                      {statusBadge(challenge.status)}
                    </CardTitle>
                    <CardDescription>
                      Solve {challenge.target} problems by {new Date(challenge.endDate).toLocaleDateString()}.
                    </CardDescription>
                  </div>
                  <div className='flex gap-3 text-xs sm:text-sm text-muted-foreground'>
                    <div className='flex items-center gap-1'>
                      <Users className='h-3.5 w-3.5' /> {challenge.participants} participants
                    </div>
                    <div className='flex items-center gap-1'>
                      <Trophy className='h-3.5 w-3.5 text-amber-400' /> {challenge.membersCompleted} completed
                    </div>
                    <div className='flex items-center gap-1'>
                      <CalendarDays className='h-3.5 w-3.5' /> {countdownLabel}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-xs uppercase tracking-wide text-muted-foreground'>
                      <span>Your progress</span>
                      <span>
                        {countValue}/{challenge.target}
                      </span>
                    </div>
                    <Progress value={Math.min(100, (countValue / challenge.target) * 100)} />
                  </div>

                  <div className='flex flex-col sm:flex-row gap-3'>
                    <Input
                      type='number'
                      min={0}
                      max={challenge.target}
                      value={countValue}
                      onChange={event => {
                        const next = Math.max(0, parseInt(event.target.value || '0', 10));
                        setDraftProgress(prev => ({
                          ...prev,
                          [challenge.id]: Number.isFinite(next) ? next : 0,
                        }));
                      }}
                    />
                    <Button
                      onClick={() => handleProgressSave(challenge, countValue)}
                    >
                      Save progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
