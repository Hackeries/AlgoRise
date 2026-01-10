'use client';

import useSWR, { mutate } from 'swr';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { GroupLeaderboard } from '@/components/groups/group-leaderboard';
import { GroupManagement } from '@/components/groups/group-management';
import { GroupChallenges } from '@/components/groups/group-challenges';
import {
  Users,
  Plus,
  Trophy,
  Crown,
  Shield,
  User,
  Award,
  TrendingUp,
  Zap,
  Target,
  Flame,
  Search,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  Clock,
  CheckCircle2,
  UserPlus,
  Activity,
  Star,
  BarChart3,
  Calendar,
  ArrowRight,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Group {
  id: string;
  name: string;
  type: 'college' | 'friends' | 'icpc';
  memberCount: number;
  maxMembers?: number;
  description?: string;
  createdAt?: string;
}

interface Membership {
  role: 'admin' | 'moderator' | 'member';
  group: Group;
}

export default function GroupsPage() {
  const { toast } = useToast();
  const { data, isLoading } = useSWR<{
    memberships: Membership[];
  }>('/api/groups/mine', fetcher);
  const memberships = data?.memberships ?? [];
  const [selectedGroup, setSelectedGroup] = useState<Membership | null>(null);

  const [groupType, setGroupType] = useState<'friends' | 'icpc'>('friends');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createStep, setCreateStep] = useState(1);

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'college' | 'friends' | 'icpc'
  >('all');
  const [sortKey, setSortKey] = useState<'name' | 'members' | 'recent'>('name');
  const [discoverTab, setDiscoverTab] = useState<
    'all' | 'top-icpc' | 'college' | 'friends' | 'recent'
  >('all');
  const [tab, setTab] = useState<
    | 'overview'
    | 'leaderboard'
    | 'members'
    | 'challenges'
    | 'practice'
    | 'contests'
    | 'analytics'
  >('overview');

  const { data: lbData } = useSWR<{
    stats?: {
      totalMembers: number;
      activeMembers: number;
      avgRating: number;
      totalProblems: number;
    };
  }>(
    selectedGroup
      ? `/api/groups/${selectedGroup.group.id}/leaderboard?range=all&sort=rating`
      : null,
    fetcher
  );

  const sortGroups = (groups: Membership[]) => {
    const copy = [...groups];
    if (sortKey === 'name') {
      return copy.sort((a, b) => a.group.name.localeCompare(b.group.name));
    }
    if (sortKey === 'members') {
      return copy.sort(
        (a, b) => (b.group.memberCount || 0) - (a.group.memberCount || 0)
      );
    }
    return copy.sort((a, b) => {
      const at = a.group.createdAt ? new Date(a.group.createdAt).getTime() : 0;
      const bt = b.group.createdAt ? new Date(b.group.createdAt).getTime() : 0;
      return bt - at;
    });
  };

  const filterGroups = (groups: Membership[]) => {
    let filtered = groups;
    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.group.type === filterType);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.group.name.toLowerCase().includes(q) ||
          m.group.description?.toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      toast({
        title: 'Group name needed',
        description: "Give your awesome team a name! It's the first step to greatness.",
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const endpoint =
        groupType === 'icpc'
          ? '/api/groups/create-icpc'
          : '/api/groups/create-friends';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim(),
          description: groupDescription.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Unable to create group');

      toast({
        title: 'Your team is ready!',
        description: `${groupName} is all set! Time to invite your teammates and start crushing problems together.`,
      });

      setGroupName('');
      setGroupDescription('');
      setShowCreateDialog(false);
      setCreateStep(1);
      mutate('/api/groups/mine');
    } catch (e: unknown) {
      const error = e as Error;
      toast({
        title: 'Could not create group',
        description: error?.message || 'Something went wrong. Mind trying again?',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const leaveGroup = async (id: string) => {
    try {
      const res = await fetch('/api/groups/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Unable to leave group');
      toast({ title: 'You have left the group', description: 'Catch you on the leaderboard! You can always rejoin later.' });
      setSelectedGroup(null);
      mutate('/api/groups/mine');
    } catch (e: unknown) {
      const error = e as Error;
      toast({
        title: 'Could not leave group',
        description: error?.message || 'Something went wrong. Try again in a moment.',
        variant: 'destructive',
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className='h-4 w-4 text-yellow-500' />;
      case 'moderator':
        return <Shield className='h-4 w-4 text-blue-500' />;
      default:
        return <User className='h-4 w-4 text-muted-foreground' />;
    }
  };

  const getGroupTypeConfig = (type: string) => {
    switch (type) {
      case 'icpc':
        return {
          variant: 'default' as const,
          icon: <Award className='h-3.5 w-3.5' />,
          label: 'ICPC Team',
          gradient: 'from-purple-500 to-violet-600',
          bgGradient: 'from-purple-500/10 via-violet-500/5 to-transparent',
          borderColor: 'border-purple-500/30',
          textColor: 'text-purple-400',
          badgeBg: 'bg-purple-500/20',
        };
      case 'college':
        return {
          variant: 'secondary' as const,
          icon: <Users className='h-3.5 w-3.5' />,
          label: 'College',
          gradient: 'from-blue-500 to-cyan-600',
          bgGradient: 'from-blue-500/10 via-cyan-500/5 to-transparent',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          badgeBg: 'bg-blue-500/20',
        };
      case 'friends':
        return {
          variant: 'outline' as const,
          icon: <Users className='h-3.5 w-3.5' />,
          label: 'Friends',
          gradient: 'from-emerald-500 to-green-600',
          bgGradient: 'from-emerald-500/10 via-green-500/5 to-transparent',
          borderColor: 'border-emerald-500/30',
          textColor: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/20',
        };
      default:
        return {
          variant: 'outline' as const,
          icon: null,
          label: type,
          gradient: 'from-gray-500 to-slate-600',
          bgGradient: 'from-gray-500/10 via-slate-500/5 to-transparent',
          borderColor: 'border-gray-500/30',
          textColor: 'text-gray-400',
          badgeBg: 'bg-gray-500/20',
        };
    }
  };

  const filteredAndSortedMemberships = sortGroups(filterGroups(memberships));

  useEffect(() => {
    if (discoverTab === 'all') {
      setFilterType('all');
      setSortKey('name');
    } else if (discoverTab === 'top-icpc') {
      setFilterType('icpc');
      setSortKey('members');
    } else if (discoverTab === 'college') {
      setFilterType('college');
      setSortKey('name');
    } else if (discoverTab === 'friends') {
      setFilterType('friends');
      setSortKey('members');
    } else if (discoverTab === 'recent') {
      setFilterType('all');
      setSortKey('recent');
    }
  }, [discoverTab]);

  const totalMembers = memberships.reduce((acc, m) => acc + (m.group.memberCount || 0), 0);
  const activeChallenges = 0;

  if (selectedGroup) {
    const typeConfig = getGroupTypeConfig(selectedGroup.group.type);

    return (
      <main className='min-h-screen'>
        <div className={`relative bg-gradient-to-br ${typeConfig.bgGradient} border-b border-white/5`}>
          <div className='absolute inset-0 bg-[url("/grid.svg")] opacity-5' />
          <div className='absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl' />
          
          <div className='relative mx-auto max-w-7xl px-4 py-8'>
            <Button
              variant='ghost'
              onClick={() => setSelectedGroup(null)}
              className='mb-6 gap-2 hover:bg-white/10'
            >
              <ArrowLeft className='h-4 w-4' />
              Back to Groups
            </Button>

            <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6'>
              <div className='flex-1'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${typeConfig.gradient} flex items-center justify-center shadow-lg`}>
                    {selectedGroup.group.type === 'icpc' ? (
                      <Award className='h-8 w-8 text-white' />
                    ) : (
                      <Users className='h-8 w-8 text-white' />
                    )}
                  </div>
                  <div>
                    <h1 className='text-3xl sm:text-4xl font-bold'>{selectedGroup.group.name}</h1>
                    <div className='flex items-center gap-3 mt-2'>
                      <Badge className={`${typeConfig.badgeBg} ${typeConfig.textColor} border-0 gap-1.5`}>
                        {typeConfig.icon}
                        {typeConfig.label}
                      </Badge>
                      <Badge variant='outline' className='gap-1.5 border-white/20'>
                        {getRoleIcon(selectedGroup.role)}
                        <span className='capitalize'>{selectedGroup.role}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {selectedGroup.group.description && (
                  <p className='text-muted-foreground max-w-2xl mt-4'>
                    {selectedGroup.group.description}
                  </p>
                )}
              </div>

              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setTab('members');
                    setTimeout(() => {
                      window.dispatchEvent(
                        new CustomEvent('algorise:open-invite', {
                          detail: { groupId: selectedGroup.group.id },
                        })
                      );
                    }, 100);
                  }}
                  className='gap-2 border-white/20 hover:bg-white/10'
                >
                  <UserPlus className='h-4 w-4' />
                  Invite
                </Button>
                <Button
                  variant='ghost'
                  onClick={() => leaveGroup(selectedGroup.group.id)}
                  className='text-red-400 hover:text-red-300 hover:bg-red-500/10'
                >
                  Leave Group
                </Button>
              </div>
            </div>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-8'>
              <div className='bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10'>
                <div className='flex items-center gap-2 text-muted-foreground text-sm mb-1'>
                  <Users className='h-4 w-4' />
                  Members
                </div>
                <div className='text-2xl font-bold'>
                  {lbData?.stats?.totalMembers ?? selectedGroup.group.memberCount}
                  {selectedGroup.group.maxMembers && (
                    <span className='text-muted-foreground text-sm font-normal'>/{selectedGroup.group.maxMembers}</span>
                  )}
                </div>
              </div>
              <div className='bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10'>
                <div className='flex items-center gap-2 text-muted-foreground text-sm mb-1'>
                  <Activity className='h-4 w-4 text-green-400' />
                  Active
                </div>
                <div className='text-2xl font-bold text-green-400'>
                  {lbData?.stats?.activeMembers ?? 0}
                </div>
              </div>
              <div className='bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10'>
                <div className='flex items-center gap-2 text-muted-foreground text-sm mb-1'>
                  <Star className='h-4 w-4 text-yellow-400' />
                  Avg Rating
                </div>
                <div className='text-2xl font-bold text-yellow-400'>
                  {lbData?.stats?.avgRating ? Math.round(lbData.stats.avgRating) : '—'}
                </div>
              </div>
              <div className='bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10'>
                <div className='flex items-center gap-2 text-muted-foreground text-sm mb-1'>
                  <CheckCircle2 className='h-4 w-4 text-purple-400' />
                  Problems Solved
                </div>
                <div className='text-2xl font-bold text-purple-400'>
                  {lbData?.stats?.totalProblems ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='mx-auto max-w-7xl px-4 py-8'>
          <Tabs
            value={tab}
            onValueChange={v => setTab(v as typeof tab)}
            className='space-y-6'
          >
            <div className='overflow-x-auto pb-2'>
              <TabsList className='inline-flex h-12 items-center justify-start rounded-xl bg-muted/50 p-1.5 gap-1'>
                <TabsTrigger value='overview' className='rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm'>
                  <Zap className='h-4 w-4 mr-2' />
                  Overview
                </TabsTrigger>
                <TabsTrigger value='leaderboard' className='rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm'>
                  <Trophy className='h-4 w-4 mr-2' />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value='members' className='rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm'>
                  <Users className='h-4 w-4 mr-2' />
                  Members
                </TabsTrigger>
                <TabsTrigger value='challenges' className='rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm'>
                  <Target className='h-4 w-4 mr-2' />
                  Challenges
                </TabsTrigger>
                <TabsTrigger value='practice' className='rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm hidden md:flex'>
                  <Flame className='h-4 w-4 mr-2' />
                  Practice
                </TabsTrigger>
                <TabsTrigger value='contests' className='rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm hidden md:flex'>
                  <Calendar className='h-4 w-4 mr-2' />
                  Contests
                </TabsTrigger>
                <TabsTrigger value='analytics' className='rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm hidden md:flex'>
                  <BarChart3 className='h-4 w-4 mr-2' />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value='overview' className='space-y-6'>
              <div className='grid md:grid-cols-2 gap-6'>
                <Card className='relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent'>
                  <div className='absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl' />
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <div className='p-2 rounded-lg bg-primary/20'>
                        <Zap className='h-5 w-5 text-primary' />
                      </div>
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <p className='text-sm text-muted-foreground'>
                      Get started with your {selectedGroup.group.type === 'icpc' ? 'team' : 'group'}.
                    </p>
                    <div className='flex flex-wrap gap-3'>
                      <Button
                        onClick={() => {
                          setTab('members');
                          setTimeout(() => {
                            window.dispatchEvent(
                              new CustomEvent('algorise:open-invite', {
                                detail: { groupId: selectedGroup.group.id },
                              })
                            );
                          }, 50);
                        }}
                        className='gap-2'
                      >
                        <UserPlus className='h-4 w-4' />
                        Invite Teammates
                      </Button>
                      <Button variant='outline' onClick={() => (window.location.href = '/train')} className='gap-2'>
                        <Target className='h-4 w-4' />
                        Generate Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className='relative overflow-hidden border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent'>
                  <div className='absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl' />
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <div className='p-2 rounded-lg bg-green-500/20'>
                        <Trophy className='h-5 w-5 text-green-500' />
                      </div>
                      Upcoming Contests
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <p className='text-sm text-muted-foreground'>
                      Check live and virtual contests to practice together.
                    </p>
                    <Button variant='outline' onClick={() => (window.location.href = '/contests')} className='gap-2'>
                      View Contests
                      <ArrowRight className='h-4 w-4' />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className='border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <div className='p-2 rounded-lg bg-orange-500/20'>
                      <Activity className='h-5 w-5 text-orange-500' />
                    </div>
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center py-8 text-muted-foreground'>
                    <Clock className='h-12 w-12 mx-auto mb-3 opacity-50' />
                    <p>Activity feed coming soon</p>
                    <p className='text-sm'>Track your team&apos;s progress and achievements</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='leaderboard' className='space-y-6'>
              <GroupLeaderboard
                groupId={selectedGroup.group.id}
                groupName={selectedGroup.group.name}
              />
            </TabsContent>

            <TabsContent value='members' className='space-y-6' id='members'>
              <GroupManagement
                groupId={selectedGroup.group.id}
                groupName={selectedGroup.group.name}
                groupType={selectedGroup.group.type}
                userRole={selectedGroup.role}
                maxMembers={selectedGroup.group.maxMembers}
              />
            </TabsContent>

            <TabsContent value='challenges' className='space-y-6'>
              <GroupChallenges
                groupId={selectedGroup.group.id}
                isAdmin={selectedGroup.role === 'admin'}
              />
            </TabsContent>

            <TabsContent value='practice' className='space-y-6'>
              <Card className='relative overflow-hidden border-orange-500/20'>
                <div className='absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl' />
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <div className='p-2 rounded-lg bg-orange-500/20'>
                      <Flame className='h-5 w-5 text-orange-500' />
                    </div>
                    Topic Tracker
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground mb-4'>
                    Track DP, Graphs, Number Theory and more. Use Train to generate a tailored plan.
                  </p>
                  <Button onClick={() => (window.location.href = '/train')} className='gap-2'>
                    Open Train
                    <ArrowRight className='h-4 w-4' />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='contests' className='space-y-6'>
              <Card className='relative overflow-hidden border-yellow-500/20'>
                <div className='absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl' />
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <div className='p-2 rounded-lg bg-yellow-500/20'>
                      <Trophy className='h-5 w-5 text-yellow-500' />
                    </div>
                    Mock Contests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground mb-4'>
                    Schedule team practice using ICPC-style contests on AlgoRise or Codeforces virtuals.
                  </p>
                  <Button onClick={() => (window.location.href = '/contests')} className='gap-2'>
                    Browse Contests
                    <ArrowRight className='h-4 w-4' />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='analytics' className='space-y-6'>
              <Card className='relative overflow-hidden border-blue-500/20'>
                <div className='absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl' />
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <div className='p-2 rounded-lg bg-blue-500/20'>
                      <TrendingUp className='h-5 w-5 text-blue-500' />
                    </div>
                    Team Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-center py-8 text-muted-foreground'>
                    <BarChart3 className='h-12 w-12 mx-auto mb-3 opacity-50' />
                    <p>Analytics dashboard coming soon</p>
                    <p className='text-sm'>View solve counts, efficiency, and consistency</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen'>
      {/* Hero Section */}
      <div className='relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-background to-emerald-500/10'>
        <div className='absolute inset-0 bg-[url("/grid.svg")] opacity-5' />
        <div className='absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-[100px] animate-pulse' />
        <div className='absolute bottom-20 right-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse' style={{ animationDelay: '1s' }} />
        
        <div className='relative mx-auto max-w-7xl px-4 py-16 sm:py-20'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8'>
            <div className='flex-1 max-w-2xl'>
              <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6'>
                <Sparkles className='h-4 w-4' />
                Collaborative Learning
              </div>
              
              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight'>
                Build Your
                <span className='block bg-gradient-to-r from-purple-400 via-pink-500 to-emerald-400 bg-clip-text text-transparent'>
                  Dream Team
                </span>
              </h1>
              
              <p className='mt-6 text-lg text-muted-foreground leading-relaxed'>
                Practice together, run mock contests, and track progress as a team.
                Whether you&apos;re preparing for ICPC or learning with friends, groups make it better.
              </p>

              <div className='flex flex-wrap gap-4 mt-8'>
                <Dialog open={showCreateDialog} onOpenChange={(open) => {
                  setShowCreateDialog(open);
                  if (!open) {
                    setCreateStep(1);
                    setGroupName('');
                    setGroupDescription('');
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size='lg' className='gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all'>
                      <Plus className='h-5 w-5' />
                      Create Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-2xl p-0 overflow-hidden'>
                    <div className='relative'>
                      <div className='absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-emerald-500/10' />
                      <div className='relative p-6'>
                        <DialogHeader>
                          <div className='flex items-center gap-3'>
                            <div className='p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30'>
                              <Users className='h-6 w-6 text-purple-400' />
                            </div>
                            <div>
                              <DialogTitle className='text-2xl'>Create a Group</DialogTitle>
                              <DialogDescription>
                                Choose your group type and get started
                              </DialogDescription>
                            </div>
                          </div>
                        </DialogHeader>

                        {/* Progress Steps */}
                        <div className='flex items-center justify-center gap-2 my-6'>
                          {[1, 2].map((step) => (
                            <div key={step} className='flex items-center'>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                                createStep >= step 
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {step}
                              </div>
                              {step < 2 && (
                                <div className={`w-20 h-0.5 mx-2 ${createStep > step ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-muted'}`} />
                              )}
                            </div>
                          ))}
                        </div>

                        {createStep === 1 && (
                          <div className='space-y-4'>
                            <p className='text-center text-muted-foreground mb-6'>What type of group do you want to create?</p>
                            <div className='grid grid-cols-2 gap-4'>
                              <button
                                onClick={() => {
                                  setGroupType('friends');
                                  setCreateStep(2);
                                }}
                                className='group relative p-6 rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-500/5 hover:border-emerald-500/60 hover:from-emerald-500/20 transition-all text-left'
                              >
                                <div className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity'>
                                  <ArrowRight className='h-5 w-5 text-emerald-400' />
                                </div>
                                <div className='p-3 rounded-xl bg-emerald-500/20 w-fit mb-4'>
                                  <Users className='h-6 w-6 text-emerald-400' />
                                </div>
                                <h3 className='font-semibold text-lg mb-2'>Friends Group</h3>
                                <p className='text-sm text-muted-foreground'>
                                  Flexible group for practice sessions and friendly competitions. No size limits.
                                </p>
                              </button>

                              <button
                                onClick={() => {
                                  setGroupType('icpc');
                                  setCreateStep(2);
                                }}
                                className='group relative p-6 rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-violet-500/5 hover:border-purple-500/60 hover:from-purple-500/20 transition-all text-left'
                              >
                                <div className='absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity'>
                                  <ArrowRight className='h-5 w-5 text-purple-400' />
                                </div>
                                <div className='p-3 rounded-xl bg-purple-500/20 w-fit mb-4'>
                                  <Award className='h-6 w-6 text-purple-400' />
                                </div>
                                <h3 className='font-semibold text-lg mb-2'>ICPC Team</h3>
                                <p className='text-sm text-muted-foreground'>
                                  Official ICPC team with exactly 3 members from the same college.
                                </p>
                                <Badge className='mt-3 bg-purple-500/20 text-purple-400 border-0'>Max 3 members</Badge>
                              </button>
                            </div>
                          </div>
                        )}

                        {createStep === 2 && (
                          <div className='space-y-6'>
                            <div className={`p-4 rounded-xl border ${groupType === 'icpc' ? 'border-purple-500/30 bg-purple-500/10' : 'border-emerald-500/30 bg-emerald-500/10'}`}>
                              <div className='flex items-center gap-3'>
                                <div className={`p-2 rounded-lg ${groupType === 'icpc' ? 'bg-purple-500/20' : 'bg-emerald-500/20'}`}>
                                  {groupType === 'icpc' ? (
                                    <Award className={`h-5 w-5 ${groupType === 'icpc' ? 'text-purple-400' : 'text-emerald-400'}`} />
                                  ) : (
                                    <Users className='h-5 w-5 text-emerald-400' />
                                  )}
                                </div>
                                <div>
                                  <p className='font-medium'>{groupType === 'icpc' ? 'ICPC Team' : 'Friends Group'}</p>
                                  <p className='text-sm text-muted-foreground'>
                                    {groupType === 'icpc' ? 'Competitive team (max 3 members)' : 'Flexible practice group'}
                                  </p>
                                </div>
                                <Button variant='ghost' size='sm' className='ml-auto' onClick={() => setCreateStep(1)}>
                                  Change
                                </Button>
                              </div>
                            </div>

                            <div className='space-y-4'>
                              <div>
                                <Label htmlFor='group-name' className='text-sm font-medium'>
                                  {groupType === 'icpc' ? 'Team Name' : 'Group Name'}
                                </Label>
                                <Input
                                  id='group-name'
                                  placeholder={groupType === 'icpc' ? 'e.g., AlgoRise Champions' : 'e.g., Weekend Warriors'}
                                  value={groupName}
                                  onChange={e => setGroupName(e.target.value)}
                                  className='mt-1.5'
                                />
                              </div>
                              <div>
                                <Label htmlFor='group-desc' className='text-sm font-medium'>
                                  Description (Optional)
                                </Label>
                                <Textarea
                                  id='group-desc'
                                  placeholder={groupType === 'icpc' ? 'Describe your team goals and strategy' : 'What is your group about?'}
                                  value={groupDescription}
                                  onChange={e => setGroupDescription(e.target.value)}
                                  rows={3}
                                  className='mt-1.5'
                                />
                              </div>
                            </div>

                            {/* Preview */}
                            {groupName && (
                              <div className='p-4 rounded-xl border border-white/10 bg-white/5'>
                                <p className='text-xs text-muted-foreground mb-3'>Preview</p>
                                <div className='flex items-center gap-3'>
                                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${groupType === 'icpc' ? 'from-purple-500 to-violet-600' : 'from-emerald-500 to-green-600'} flex items-center justify-center`}>
                                    {groupType === 'icpc' ? (
                                      <Award className='h-6 w-6 text-white' />
                                    ) : (
                                      <Users className='h-6 w-6 text-white' />
                                    )}
                                  </div>
                                  <div>
                                    <p className='font-semibold'>{groupName}</p>
                                    <div className='flex items-center gap-2 mt-1'>
                                      <Badge className={`text-xs ${groupType === 'icpc' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'} border-0`}>
                                        {groupType === 'icpc' ? 'ICPC Team' : 'Friends'}
                                      </Badge>
                                      <span className='text-xs text-muted-foreground'>1 member</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <DialogFooter className='mt-6'>
                          {createStep === 2 && (
                            <Button variant='outline' onClick={() => setCreateStep(1)}>
                              Back
                            </Button>
                          )}
                          <Button
                            variant='ghost'
                            onClick={() => {
                              setShowCreateDialog(false);
                              setCreateStep(1);
                              setGroupName('');
                              setGroupDescription('');
                            }}
                          >
                            Cancel
                          </Button>
                          {createStep === 2 && (
                            <Button
                              onClick={createGroup}
                              disabled={creating || !groupName.trim()}
                              className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                            >
                              {creating ? 'Creating...' : `Create ${groupType === 'icpc' ? 'Team' : 'Group'}`}
                            </Button>
                          )}
                        </DialogFooter>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button size='lg' variant='outline' className='gap-2' onClick={() => document.getElementById('discover-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  <Search className='h-5 w-5' />
                  Discover Groups
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className='grid grid-cols-3 gap-4 lg:gap-6'>
              <div className='text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10'>
                <div className='text-3xl sm:text-4xl font-bold text-purple-400'>{memberships.length}</div>
                <div className='text-sm text-muted-foreground mt-1'>Your Groups</div>
              </div>
              <div className='text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10'>
                <div className='text-3xl sm:text-4xl font-bold text-emerald-400'>{totalMembers}</div>
                <div className='text-sm text-muted-foreground mt-1'>Teammates</div>
              </div>
              <div className='text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10'>
                <div className='text-3xl sm:text-4xl font-bold text-yellow-400'>{activeChallenges}</div>
                <div className='text-sm text-muted-foreground mt-1'>Challenges</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Discover Section */}
      <div id='discover-section' className='mx-auto max-w-7xl px-4 py-12'>
        <div className='mb-8'>
          <h2 className='text-2xl sm:text-3xl font-bold'>Discover Groups</h2>
          <p className='text-muted-foreground mt-1'>Find your perfect training squad</p>
        </div>

        {/* Category Tabs */}
        <div className='flex flex-wrap gap-2 mb-6'>
          {[
            { v: 'all', label: 'All Groups', icon: Users },
            { v: 'top-icpc', label: 'Top ICPC Teams', icon: Trophy },
            { v: 'college', label: 'College Groups', icon: Users },
            { v: 'friends', label: 'Active DSA Circles', icon: Flame },
            { v: 'recent', label: 'Recently Formed', icon: Zap },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.v}
                onClick={() => setDiscoverTab(t.v as typeof discoverTab)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  discoverTab === t.v
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className='h-4 w-4' />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search & Sort */}
        <div className='flex flex-col sm:flex-row gap-4 mb-8'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search groups...'
              value={query}
              onChange={e => setQuery(e.target.value)}
              className='pl-10 bg-muted/50'
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label='Clear search'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>
          <div className='relative'>
            <select
              className='h-10 rounded-xl border bg-muted/50 px-4 pr-10 text-sm appearance-none cursor-pointer hover:bg-muted transition-colors'
              value={sortKey}
              onChange={e => setSortKey(e.target.value as typeof sortKey)}
              aria-label='Sort groups'
            >
              <option value='name'>Sort by Name</option>
              <option value='members'>Sort by Members</option>
              <option value='recent'>Sort by Recent</option>
            </select>
            <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
          </div>
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className='rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse'>
                <div className='flex items-center gap-4 mb-4'>
                  <div className='h-14 w-14 rounded-xl bg-muted' />
                  <div className='flex-1'>
                    <div className='h-5 bg-muted rounded w-32 mb-2' />
                    <div className='h-4 bg-muted rounded w-24' />
                  </div>
                </div>
                <div className='h-4 bg-muted rounded w-full mb-2' />
                <div className='h-4 bg-muted rounded w-3/4' />
              </div>
            ))}
          </div>
        ) : filteredAndSortedMemberships.length === 0 ? (
          /* Empty State */
          <div className='text-center py-20'>
            <div className='relative inline-block mb-6'>
              <div className='absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl' />
              <div className='relative p-6 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20'>
                <Users className='h-16 w-16 text-purple-400' />
              </div>
            </div>
            <h3 className='text-2xl font-bold mb-2'>
              {query.trim() || filterType !== 'all'
                ? 'No groups match your filters'
                : 'Start Your Journey'}
            </h3>
            <p className='text-muted-foreground mb-8 max-w-md mx-auto'>
              {query.trim() || filterType !== 'all'
                ? 'Try adjusting your search or filters to find what you are looking for.'
                : 'Create your first group to practice with friends, prepare for ICPC, or join a college team.'}
            </p>
            <div className='flex flex-wrap justify-center gap-4'>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className='gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
              >
                <Plus className='h-5 w-5' />
                Create Your First Group
              </Button>
              {(query.trim() || filterType !== 'all') && (
                <Button
                  variant='outline'
                  onClick={() => {
                    setQuery('');
                    setFilterType('all');
                    setDiscoverTab('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Suggestions */}
            {!query.trim() && filterType === 'all' && (
              <div className='mt-12 max-w-2xl mx-auto'>
                <p className='text-sm text-muted-foreground mb-4'>Popular group types to get started:</p>
                <div className='grid sm:grid-cols-3 gap-4'>
                  <div className='p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-left'>
                    <Award className='h-8 w-8 text-purple-400 mb-2' />
                    <p className='font-medium'>ICPC Team</p>
                    <p className='text-sm text-muted-foreground'>Compete in ICPC regionals</p>
                  </div>
                  <div className='p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-left'>
                    <Users className='h-8 w-8 text-emerald-400 mb-2' />
                    <p className='font-medium'>Study Group</p>
                    <p className='text-sm text-muted-foreground'>Learn DSA together</p>
                  </div>
                  <div className='p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-left'>
                    <Trophy className='h-8 w-8 text-blue-400 mb-2' />
                    <p className='font-medium'>Contest Squad</p>
                    <p className='text-sm text-muted-foreground'>Weekly challenges</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {filteredAndSortedMemberships.map(m => {
              const typeConfig = getGroupTypeConfig(m.group.type);
              const isRecent = m.group.createdAt && 
                new Date().getTime() - new Date(m.group.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
              
              return (
                <div
                  key={m.group.id}
                  role='button'
                  tabIndex={0}
                  onClick={() => setSelectedGroup(m)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedGroup(m)}
                  className={`group relative rounded-2xl border bg-gradient-to-br ${typeConfig.bgGradient} ${typeConfig.borderColor} p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-${m.group.type === 'icpc' ? 'purple' : m.group.type === 'friends' ? 'emerald' : 'blue'}-500/10`}
                >
                  {/* Activity Indicator */}
                  {isRecent && (
                    <div className='absolute top-4 right-4'>
                      <Badge className='bg-green-500/20 text-green-400 border-0 text-xs'>
                        <span className='w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse' />
                        New
                      </Badge>
                    </div>
                  )}

                  <div className='flex items-start gap-4 mb-4'>
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${typeConfig.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      {m.group.type === 'icpc' ? (
                        <Award className='h-7 w-7 text-white' />
                      ) : (
                        <Users className='h-7 w-7 text-white' />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-lg truncate group-hover:text-primary transition-colors'>
                        {m.group.name}
                      </h3>
                      <div className='flex flex-wrap items-center gap-2 mt-1'>
                        <Badge className={`${typeConfig.badgeBg} ${typeConfig.textColor} border-0 text-xs`}>
                          {typeConfig.icon}
                          <span className='ml-1'>{typeConfig.label}</span>
                        </Badge>
                        <Badge variant='outline' className='text-xs gap-1 border-white/20'>
                          {getRoleIcon(m.role)}
                          <span className='capitalize'>{m.role}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {m.group.description && (
                    <p className='text-sm text-muted-foreground line-clamp-2 mb-4'>
                      {m.group.description}
                    </p>
                  )}

                  {/* Stats Row */}
                  <div className='flex items-center justify-between pt-4 border-t border-white/10'>
                    <div className='flex items-center gap-4'>
                      {/* Member Avatars Stack */}
                      <div className='flex -space-x-2'>
                        {[...Array(Math.min(3, m.group.memberCount))].map((_, i) => (
                          <Avatar key={i} className='h-7 w-7 border-2 border-background'>
                            <AvatarFallback className='text-[10px] bg-muted'>
                              {String.fromCharCode(65 + i)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {m.group.memberCount > 3 && (
                          <div className='h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium'>
                            +{m.group.memberCount - 3}
                          </div>
                        )}
                      </div>
                      <span className='text-sm text-muted-foreground'>
                        {m.group.memberCount}
                        {m.group.maxMembers ? `/${m.group.maxMembers}` : ''} members
                      </span>
                    </div>
                    <ArrowRight className='h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all' />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
