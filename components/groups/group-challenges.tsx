'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  CalendarDays,
  Trophy,
  Users,
  Target,
  Sparkles,
  Clock,
  Check,
  Loader2,
  Calendar,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [savingProgress, setSavingProgress] = useState<Record<string, boolean>>({});

  const { data, error, isLoading, mutate } = useSWR<ChallengesResponse>(
    groupId ? `/api/groups/${groupId}/challenges` : null,
    fetcher
  );

  const challenges = data?.challenges || [];

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

  const getCountdownInfo = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    if (Number.isNaN(end.getTime())) return { label: 'Ends soon', days: 0, urgent: false };
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: 'Ended', days: 0, urgent: false };
    if (diff === 0) return { label: 'Ends today', days: 0, urgent: true };
    if (diff === 1) return { label: 'Ends tomorrow', days: 1, urgent: true };
    if (diff <= 3) return { label: `${diff} days left`, days: diff, urgent: true };
    return { label: `${diff} days left`, days: diff, urgent: false };
  };

  const handleProgressSave = async (challenge: ChallengeDTO, count: number) => {
    setSavingProgress(prev => ({ ...prev, [challenge.id]: true }));
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
        description: count >= challenge.target ? 'Challenge completed! 🎉' : "Keep pushing, you're on track.",
      });
      mutate();
      setDraftProgress(prev => ({ ...prev, [challenge.id]: null }));
    } catch (err: any) {
      toast({
        title: 'Could not save progress',
        description: err?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSavingProgress(prev => ({ ...prev, [challenge.id]: false }));
    }
  };

  const getStatusStyles = (status: ChallengeDTO['status']) => {
    switch (status) {
      case 'completed':
        return {
          gradient: 'from-emerald-500/20 via-emerald-500/10 to-teal-500/5',
          border: 'border-emerald-500/30',
          progressBg: 'bg-emerald-500/20',
          progressFill: 'bg-gradient-to-r from-emerald-500 to-teal-400',
          badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        };
      case 'expired':
        return {
          gradient: 'from-zinc-500/20 via-zinc-500/10 to-slate-500/5',
          border: 'border-zinc-500/30',
          progressBg: 'bg-zinc-500/20',
          progressFill: 'bg-gradient-to-r from-zinc-500 to-slate-400',
          badge: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
        };
      default:
        return {
          gradient: 'from-blue-500/20 via-indigo-500/10 to-purple-500/5',
          border: 'border-blue-500/30',
          progressBg: 'bg-blue-500/20',
          progressFill: 'bg-gradient-to-r from-blue-500 to-indigo-400',
          badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        };
    }
  };

  const statusLabel = (status: ChallengeDTO['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'expired':
        return 'Expired';
      default:
        return 'Active';
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Challenge Section - Admin Only */}
      {isAdmin && (
        <div className="relative group">
          {/* Gradient border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-500" />

          <Card className="relative overflow-hidden border-0 bg-background/80 backdrop-blur-xl rounded-2xl">
            {/* Inner gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />

            <CardContent className="relative p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-50" />
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Launch a Group Challenge
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Rally your group with a shared goal and track everyone&apos;s progress
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateChallenge} className="space-y-6">
                {/* Challenge Name */}
                <div className="space-y-2">
                  <Label htmlFor="challenge-title" className="text-sm font-medium">
                    Challenge Name
                  </Label>
                  <Input
                    id="challenge-title"
                    placeholder="e.g., Solve 50 problems this week"
                    value={form.title}
                    onChange={event => setForm(prev => ({ ...prev, title: event.target.value }))}
                    required
                    className="h-12 bg-background/50 border-border/50 focus:border-blue-500/50 transition-colors"
                  />
                </div>

                {/* Target & Duration Row */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="challenge-target" className="text-sm font-medium">
                      Target Problems
                    </Label>
                    <Input
                      id="challenge-target"
                      type="number"
                      min={1}
                      value={form.target}
                      onChange={event => setForm(prev => ({ ...prev, target: event.target.value }))}
                      required
                      className="h-12 bg-background/50 border-border/50 focus:border-blue-500/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Duration</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, duration: 'weekly' }))}
                        className={cn(
                          'relative flex flex-col items-center justify-center h-12 rounded-xl border-2 transition-all duration-200',
                          form.duration === 'weekly'
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-border/50 bg-background/50 hover:border-border hover:bg-background/80'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">Weekly</span>
                        </div>
                        {form.duration === 'weekly' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, duration: 'monthly' }))}
                        className={cn(
                          'relative flex flex-col items-center justify-center h-12 rounded-xl border-2 transition-all duration-200',
                          form.duration === 'monthly'
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-border/50 bg-background/50 hover:border-border hover:bg-background/80'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          <span className="text-sm font-medium">Monthly</span>
                        </div>
                        {form.duration === 'monthly' && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="challenge-description" className="text-sm font-medium">
                    Description <span className="text-muted-foreground font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="challenge-description"
                    placeholder="Add details, rules, or rewards for the group"
                    value={form.description}
                    onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))}
                    className="h-12 bg-background/50 border-border/50 focus:border-blue-500/50 transition-colors"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={creating}
                    className="relative h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-blue-500/40 hover:scale-[1.02]"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Launch Challenge
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Challenges List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i} className="overflow-hidden border-border/50">
              <CardContent className="p-6">
                <div className="space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-5 w-48 bg-muted rounded" />
                      <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full" />
                  <div className="flex gap-4">
                    <div className="h-8 w-24 bg-muted rounded" />
                    <div className="h-8 w-24 bg-muted rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4">
              <Zap className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm text-red-400">Could not load challenges. Please refresh the page.</p>
          </CardContent>
        </Card>
      ) : challenges.length === 0 ? (
        /* Empty State */
        <Card className="border-dashed border-2 border-border/50 bg-gradient-to-br from-background to-muted/20">
          <CardContent className="py-16 px-6 text-center">
            <div className="relative inline-flex mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-orange-500/30 rounded-full blur-xl" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/20">
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No Challenges Yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              {isAdmin
                ? 'Launch your first challenge to motivate your group and track everyone\'s progress together!'
                : 'No active challenges in this group yet. Check back soon for new challenges!'}
            </p>
            {isAdmin && (
              <div className="inline-flex items-center gap-2 text-sm text-blue-400">
                <Sparkles className="w-4 h-4" />
                <span>Use the form above to create a challenge</span>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Challenge Cards */
        <div className="grid gap-5">
          {challenges.map(challenge => {
            const countValue = draftProgress[challenge.id] ?? challenge.currentUserCount;
            const countdown = getCountdownInfo(challenge.endDate);
            const styles = getStatusStyles(challenge.status);
            const progressPercent = Math.min(100, (countValue / challenge.target) * 100);
            const isSaving = savingProgress[challenge.id];

            return (
              <Card
                key={challenge.id}
                className={cn(
                  'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
                  styles.border
                )}
              >
                {/* Background gradient */}
                <div className={cn('absolute inset-0 bg-gradient-to-br', styles.gradient)} />

                <CardContent className="relative p-6">
                  {/* Header Row */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'flex items-center justify-center w-12 h-12 rounded-xl shrink-0',
                          challenge.status === 'completed'
                            ? 'bg-emerald-500/20'
                            : challenge.status === 'expired'
                              ? 'bg-zinc-500/20'
                              : 'bg-blue-500/20'
                        )}
                      >
                        {challenge.status === 'completed' ? (
                          <Trophy className="w-6 h-6 text-emerald-400" />
                        ) : challenge.status === 'expired' ? (
                          <Clock className="w-6 h-6 text-zinc-400" />
                        ) : (
                          <Target className="w-6 h-6 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold">{challenge.title}</h3>
                          <Badge variant="outline" className={cn('text-xs', styles.badge)}>
                            {statusLabel(challenge.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Solve {challenge.target} problems by {new Date(challenge.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Stats Pills */}
                    <div className="flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 text-xs">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium">{challenge.participants}</span>
                        <span className="text-muted-foreground">participants</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-medium text-amber-400">{challenge.membersCompleted}</span>
                        <span className="text-amber-400/70">completed</span>
                      </div>
                      <div
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs',
                          countdown.urgent
                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                            : 'bg-background/50 border-border/50 text-muted-foreground'
                        )}
                      >
                        <Clock className={cn('w-3.5 h-3.5', countdown.urgent && 'animate-pulse')} />
                        <span className={cn('font-medium', countdown.urgent && 'text-red-400')}>
                          {countdown.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Your Progress
                      </span>
                      <span className="text-sm font-semibold">
                        {countValue}
                        <span className="text-muted-foreground font-normal">/{challenge.target}</span>
                      </span>
                    </div>
                    {/* Custom Progress Bar */}
                    <div className={cn('relative h-3 rounded-full overflow-hidden', styles.progressBg)}>
                      <div
                        className={cn(
                          'absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out',
                          styles.progressFill
                        )}
                        style={{ width: `${progressPercent}%` }}
                      />
                      {/* Animated shimmer effect for active challenges */}
                      {challenge.status === 'active' && progressPercent > 0 && progressPercent < 100 && (
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                          style={{ width: `${progressPercent}%` }}
                        />
                      )}
                    </div>
                    {/* Progress milestones */}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Quick Update Section */}
                  {challenge.status === 'active' && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
                      <div className="flex-1">
                        <Input
                          type="number"
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
                          className="h-11 bg-background/50 border-border/50"
                        />
                      </div>
                      <Button
                        onClick={() => handleProgressSave(challenge, countValue)}
                        disabled={isSaving}
                        className="h-11 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 shadow-md transition-all duration-200 hover:shadow-lg"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Update Progress
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
