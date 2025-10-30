'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, Award, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Mentor {
  id: string;
  name: string;
  avatar: string | null;
  handle: string | null;
  rating: number | null;
  college: string | null;
  topic: string;
  badge: string;
  problemsSolved: number;
  successRate: number;
  currentStreak: number;
  lastActive: string | null;
}

interface MentorResponse {
  mentors: Mentor[];
  topics?: string[] | null;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function MentorMatching() {
  const { toast } = useToast();
  const [activeTopic, setActiveTopic] = useState<string>('all');
  const [requestMentorId, setRequestMentorId] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<MentorResponse>('/api/mentorship/match', fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (!data?.topics || data.topics.length === 0) {
      setActiveTopic('all');
    } else {
      setActiveTopic(data.topics[0]);
    }
  }, [data?.topics]);

  const mentorsByTopic = useMemo(() => {
    if (!data?.mentors) return [];
    if (activeTopic === 'all') return data.mentors;
    return data.mentors.filter(mentor => mentor.topic === activeTopic);
  }, [data?.mentors, activeTopic]);

  const formatSuccessRate = (rate: number) => `${Math.round(rate * 100)}% success`;

  const formatLastActive = (iso: string | null) => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Active today';
    if (diffDays === 1) return 'Active yesterday';
    if (diffDays < 7) return `Active ${diffDays}d ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `Active ${diffWeeks}w ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `Active ${diffMonths}mo ago`;
  };

  const handleSendRequest = async () => {
    if (!requestMentorId) return;
    const mentor = data?.mentors.find(m => m.id === requestMentorId);
    const topics = mentor ? [mentor.topic] : data?.topics || [];

    setSubmitting(true);
    try {
      const res = await fetch('/api/mentorship/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: requestMentorId,
          topics,
          message: requestMessage,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Failed to send request');
      }

      toast({
        title: 'Request sent! ✅',
        description: 'We let your mentor know. They will get in touch soon.',
      });
      setRequestMentorId(null);
      setRequestMessage('');
      mutate();
    } catch (err: any) {
      toast({
        title: 'Could not send request',
        description: err?.message || 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Award className='h-5 w-5 text-primary' />
          Mentor Matching
        </CardTitle>
        <CardDescription>
          Request guidance from proven experts in your weak topics. Mentors earn badges like “Expert in DP” after solving 100+ problems with a 90% success rate.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <Tabs value={activeTopic} onValueChange={setActiveTopic}>
          <TabsList className='flex flex-wrap gap-2 bg-muted/40 p-1 justify-start'>
            <TabsTrigger value='all' className='capitalize'>All</TabsTrigger>
            {(data?.topics || []).map(topic => (
              <TabsTrigger key={topic} value={topic} className='capitalize'>
                {topic}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTopic} className='pt-4'>
            {isLoading ? (
              <div className='grid gap-4 md:grid-cols-2'>
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className='p-4'>
                    <div className='flex items-center gap-4'>
                      <Skeleton className='h-12 w-12 rounded-full' />
                      <div className='flex-1 space-y-2'>
                        <Skeleton className='h-4 w-32' />
                        <Skeleton className='h-3 w-20' />
                      </div>
                    </div>
                    <div className='mt-4 space-y-2'>
                      <Skeleton className='h-3 w-full' />
                      <Skeleton className='h-3 w-2/3' />
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className='rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300'>
                Failed to load mentors. Please refresh and try again.
              </div>
            ) : mentorsByTopic.length === 0 ? (
              <div className='text-center py-12 border border-dashed rounded-lg'>
                <MessageCircle className='h-10 w-10 mx-auto text-muted-foreground mb-3' />
                <p className='text-sm text-muted-foreground'>We couldn’t find mentors yet. Solve more problems to unlock tailored matches!</p>
              </div>
            ) : (
              <div className='grid gap-4 md:grid-cols-2'>
                {mentorsByTopic.map(mentor => (
                  <Card key={`${mentor.id}-${mentor.topic}`} className='border border-primary/10 hover:border-primary/30 transition-colors'>
                    <CardContent className='p-5 space-y-4'>
                      <div className='flex items-start gap-4'>
                        <Avatar className='h-14 w-14 border border-primary/20'>
                          {mentor.avatar && <AvatarImage src={mentor.avatar} alt={mentor.name} />}
                          <AvatarFallback>{mentor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <p className='text-base font-semibold'>{mentor.name}</p>
                            {mentor.handle && (
                              <Badge variant='outline'>@{mentor.handle}</Badge>
                            )}
                          </div>
                          <p className='text-xs text-muted-foreground'>
                            {mentor.college ? mentor.college : 'Independent mentor'}
                          </p>
                          <div className='flex items-center gap-2 mt-2'>
                            <Badge className='bg-primary/10 text-primary border-primary/20 text-xs'>
                              {mentor.badge}
                            </Badge>
                            {mentor.rating && (
                              <Badge variant='secondary' className='text-xs'>
                                CF {mentor.rating}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <p className='font-semibold'>{mentor.problemsSolved.toLocaleString()}</p>
                          <p className='text-xs text-muted-foreground uppercase tracking-wide'>Solved in {mentor.topic}</p>
                        </div>
                        <div>
                          <p className='font-semibold'>{formatSuccessRate(mentor.successRate)}</p>
                          <p className='text-xs text-muted-foreground uppercase tracking-wide'>Success rate</p>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Flame className='h-4 w-4 text-orange-400' />
                          <div>
                            <p className='font-semibold'>{mentor.currentStreak} days</p>
                            <p className='text-xs text-muted-foreground uppercase tracking-wide'>Current streak</p>
                          </div>
                        </div>
                        <div>
                          <p className='font-semibold'>{formatLastActive(mentor.lastActive)}</p>
                          <p className='text-xs text-muted-foreground uppercase tracking-wide'>Last active</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <Button
                          className='flex-1'
                          onClick={() => {
                            setRequestMentorId(mentor.id);
                            setRequestMessage(`Hey ${mentor.name.split(' ')[0]}, could you help me level up in ${mentor.topic}?`);
                          }}
                        >
                          <Send className='h-4 w-4 mr-2' />
                          Request Mentor
                        </Button>
                      </div>

                      {requestMentorId === mentor.id && (
                        <div className='space-y-3 border-t pt-3'>
                          <Textarea
                            value={requestMessage}
                            onChange={event => setRequestMessage(event.target.value)}
                            placeholder='Add a short note (optional)'
                            rows={3}
                          />
                          <div className='flex gap-2 justify-end'>
                            <Button
                              variant='ghost'
                              onClick={() => {
                                setRequestMentorId(null);
                                setRequestMessage('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleSendRequest} disabled={submitting}>
                              {submitting ? 'Sending...' : 'Send Request'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className='rounded-lg border border-muted bg-muted/50 p-4 flex items-start gap-3 text-sm text-muted-foreground'>
          <CheckCircle className='h-4 w-4 text-green-400 mt-0.5' />
          <div>
            <p className='font-medium text-foreground'>How badges work</p>
            <p>
              Mentors earn badges like <strong>Expert in DP</strong> after solving 100+ problems in a topic with over 90% success. Keep practicing consistently to unlock your own mentor badge!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
