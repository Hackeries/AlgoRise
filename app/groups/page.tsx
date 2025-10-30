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
        title: 'Error',
        description: 'Please enter a group name',
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
        title: 'Group created',
        description: `Your ${
          groupType === 'icpc' ? 'ICPC team' : 'friends group'
        } "${groupName}" has been created.`,
      });

      setGroupName('');
      setGroupDescription('');
      setShowCreateDialog(false);
      mutate('/api/groups/mine');
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Unable to create group',
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
      toast({ title: 'Left group', description: 'You have left this group.' });
      setSelectedGroup(null);
      mutate('/api/groups/mine');
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Unable to leave group',
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

  const getGroupTypeBadge = (type: string) => {
    switch (type) {
      case 'icpc':
        return {
          variant: 'default' as const,
          icon: <Award className='h-3 w-3 mr-1' />,
          label: 'ICPC Team',
          color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
        };
      case 'college':
        return {
          variant: 'secondary' as const,
          icon: null,
          label: 'College',
          color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
        };
      case 'friends':
        return {
          variant: 'outline' as const,
          icon: null,
          label: 'Friends',
          color: 'from-green-500/20 to-green-600/20 border-green-500/30',
        };
      default:
        return {
          variant: 'outline' as const,
          icon: null,
          label: type,
          color: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
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

  if (selectedGroup) {
    const typeBadge = getGroupTypeBadge(selectedGroup.group.type);

    return (
      <main className='mx-auto max-w-7xl px-4 py-6'>
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              onClick={() => setSelectedGroup(null)}
              className='px-2'
            >
              ← Back
            </Button>
            <div>
              <h1 className='text-4xl font-bold'>{selectedGroup.group.name}</h1>
              <div className='flex items-center gap-3 mt-2'>
                <Badge
                  variant={typeBadge.variant}
                  className='flex items-center'
                >
                  {typeBadge.icon}
                  {typeBadge.label}
                </Badge>
                <Badge variant='outline' className='flex items-center gap-1'>
                  {getRoleIcon(selectedGroup.role)}
                  {selectedGroup.role}
                </Badge>
                <span className='text-sm text-muted-foreground'>
                  {selectedGroup.group.memberCount}
                  {selectedGroup.group.maxMembers
                    ? `/${selectedGroup.group.maxMembers}`
                    : ''}{' '}
                  members
                </span>
              </div>
              {selectedGroup.group.description && (
                <p className='text-sm text-muted-foreground mt-3'>
                  {selectedGroup.group.description}
                </p>
              )}
            </div>
          </div>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => leaveGroup(selectedGroup.group.id)}
              className='text-destructive hover:text-destructive'
            >
              Leave Group
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid gap-4 md:grid-cols-4 mb-8'>
          <Card className='border-l-4 border-l-blue-500'>
            <CardContent className='p-5'>
              <div className='text-sm text-muted-foreground font-medium'>
                Total Members
              </div>
              <div className='mt-2 text-3xl font-bold'>
                {lbData?.stats?.totalMembers ?? selectedGroup.group.memberCount}
              </div>
            </CardContent>
          </Card>
          <Card className='border-l-4 border-l-green-500'>
            <CardContent className='p-5'>
              <div className='text-sm text-muted-foreground font-medium'>
                Active Members
              </div>
              <div className='mt-2 text-3xl font-bold'>
                {lbData?.stats?.activeMembers ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card className='border-l-4 border-l-yellow-500'>
            <CardContent className='p-5'>
              <div className='text-sm text-muted-foreground font-medium'>
                Avg Rating
              </div>
              <div className='mt-2 text-3xl font-bold'>
                {lbData?.stats?.avgRating
                  ? Math.round(lbData.stats.avgRating)
                  : '—'}
              </div>
            </CardContent>
          </Card>
          <Card className='border-l-4 border-l-purple-500'>
            <CardContent className='p-5'>
              <div className='text-sm text-muted-foreground font-medium'>
                Total Solved
              </div>
              <div className='mt-2 text-3xl font-bold'>
                {lbData?.stats?.totalProblems ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={tab}
          onValueChange={v => setTab(v as any)}
          className='space-y-6'
        >
          <TabsList className='flex flex-wrap'>
            <TabsTrigger value='overview' className='flex items-center gap-2'>
              Overview
            </TabsTrigger>
            <TabsTrigger
              value='leaderboard'
              className='flex items-center gap-2'
            >
              <Trophy className='h-4 w-4' />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value='members' className='flex items-center gap-2'>
              <Users className='h-4 w-4' />
              Members
            </TabsTrigger>
            <TabsTrigger value='practice' className='hidden md:inline-flex'>
              Practice
            </TabsTrigger>
            <TabsTrigger value='contests' className='hidden md:inline-flex'>
              Contests
            </TabsTrigger>
            <TabsTrigger value='analytics' className='hidden md:inline-flex'>
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-6'>
            <Card className='border-l-4 border-l-primary'>
              <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <Zap className='h-5 w-5 text-primary' />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <p className='text-sm text-muted-foreground'>
                  Get started with your{' '}
                  {selectedGroup.group.type === 'icpc' ? 'team' : 'group'}.
                </p>
                <div className='flex flex-wrap gap-3'>
                  <Button
                    variant='secondary'
                    onClick={() => {
                      setTab('members');
                      window.history.replaceState(null, '', '#members');
                      setTimeout(() => {
                        document.getElementById('members')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start',
                        });
                        window.dispatchEvent(
                          new CustomEvent('algorise:open-invite', {
                            detail: { groupId: selectedGroup.group.id },
                          })
                        );
                      }, 50);
                    }}
                  >
                    Invite teammates
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => (window.location.href = '/train')}
                  >
                    Generate practice plan
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => (window.location.href = '/contests')}
                  >
                    Browse contests
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className='border-l-4 border-l-green-500'>
              <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <Target className='h-5 w-5 text-green-500' />
                  Upcoming Contests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground mb-4'>
                  Check live and virtual contests to practice together on
                  AlgoRise or Codeforces.
                </p>
                <Button
                  variant='outline'
                  onClick={() => (window.location.href = '/contests')}
                >
                  View contests
                </Button>
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

          <TabsContent value='practice' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <Flame className='h-5 w-5 text-orange-500' />
                  Topic Tracker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground mb-4'>
                  Track DP, Graphs, Number Theory and more. Use Train to
                  generate a tailored plan.
                </p>
                <Button
                  variant='outline'
                  onClick={() => (window.location.href = '/train')}
                >
                  Open Train
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='contests' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <Trophy className='h-5 w-5 text-yellow-500' />
                  Mock Contests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground mb-4'>
                  Schedule team practice using ICPC-style contests on AlgoRise
                  or Codeforces virtuals.
                </p>
                <Button
                  variant='outline'
                  onClick={() => (window.location.href = '/contests')}
                >
                  Browse Contests
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='analytics' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5 text-blue-500' />
                  Team Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>
                  View solve counts, efficiency, and consistency. More detailed
                  charts coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    );
  }

  return (
    <main className='mx-auto max-w-7xl px-4 py-10'>
      {/* Hero */}
      <div className='relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-transparent to-transparent dark:from-primary/15 p-8 mb-8'>
        <div className='flex items-center justify-between gap-6'>
          <div>
            <h1 className='text-4xl font-bold tracking-tight'>Groups & Teams</h1>
            <p className='text-muted-foreground mt-3 text-lg'>
              Practice together, run mock contests, and track progress as a team.
            </p>
          </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size='lg' className='gap-2'>
              <Plus className='h-5 w-5' />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle className='text-2xl'>Create a Group</DialogTitle>
              <DialogDescription>
                Choose between creating a Friends Group for casual competition
                or an ICPC Team for official competitions.
              </DialogDescription>
            </DialogHeader>

            <Tabs
              value={groupType}
              onValueChange={v => setGroupType(v as any)}
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger
                  value='friends'
                  className='flex items-center gap-2'
                >
                  <Users className='h-4 w-4' />
                  Friends Group
                </TabsTrigger>
                <TabsTrigger value='icpc' className='flex items-center gap-2'>
                  <Award className='h-4 w-4' />
                  ICPC Team
                </TabsTrigger>
              </TabsList>

              <TabsContent value='friends' className='space-y-4 mt-4'>
                <div className='bg-gradient-to-r from-green-500/10 to-green-600/10 p-4 rounded-lg space-y-2 border border-green-500/20'>
                  <h4 className='font-semibold flex items-center gap-2'>
                    <Users className='h-4 w-4 text-green-600' />
                    Friends Group
                  </h4>
                  <p className='text-sm text-muted-foreground'>
                    Create a flexible group to compete with friends. No size
                    limits, open to anyone you invite. Perfect for study groups,
                    practice sessions, and friendly competitions.
                  </p>
                </div>

                <div className='space-y-3'>
                  <div>
                    <Label htmlFor='friends-name' className='font-medium'>
                      Group Name
                    </Label>
                    <Input
                      id='friends-name'
                      placeholder='e.g., Weekend Warriors, Study Squad'
                      value={groupName}
                      onChange={e => setGroupName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor='friends-desc' className='font-medium'>
                      Description (Optional)
                    </Label>
                    <Textarea
                      id='friends-desc'
                      placeholder="What's your group about?"
                      value={groupDescription}
                      onChange={e => setGroupDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='icpc' className='space-y-4 mt-4'>
                <div className='bg-gradient-to-r from-purple-500/10 to-purple-600/10 p-4 rounded-lg space-y-2 border border-purple-500/20'>
                  <h4 className='font-semibold flex items-center gap-2'>
                    <Award className='h-4 w-4 text-purple-600' />
                    ICPC Team
                  </h4>
                  <p className='text-sm text-muted-foreground'>
                    Form an official ICPC team with{' '}
                    <strong>exactly 3 members from the same college</strong>.
                    Follows ICPC rules and regulations for competitive
                    programming contests.
                  </p>
                  <ul className='text-sm text-muted-foreground list-disc list-inside space-y-1'>
                    <li>Strictly 3 members maximum</li>
                    <li>All members must be from the same college</li>
                    <li>
                      Ideal for ICPC regional and world finals preparation
                    </li>
                  </ul>
                </div>

                <div className='space-y-3'>
                  <div>
                    <Label htmlFor='icpc-name' className='font-medium'>
                      Team Name
                    </Label>
                    <Input
                      id='icpc-name'
                      placeholder='e.g., AlgoRise Champions, Code Ninjas'
                      value={groupName}
                      onChange={e => setGroupName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor='icpc-desc' className='font-medium'>
                      Team Description (Optional)
                    </Label>
                    <Textarea
                      id='icpc-desc'
                      placeholder="Describe your team's goals and strategy"
                      value={groupDescription}
                      onChange={e => setGroupDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setShowCreateDialog(false);
                  setGroupName('');
                  setGroupDescription('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={createGroup}
                disabled={creating || !groupName.trim()}
              >
                {creating
                  ? 'Creating...'
                  : `Create ${
                      groupType === 'icpc' ? 'ICPC Team' : 'Friends Group'
                    }`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Discover Tabs */}
      <div className='mb-8'>
        <div className='inline-flex rounded-lg border bg-background p-1 gap-1'>
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
                onClick={() => setDiscoverTab(t.v as any)}
                className={`px-4 py-2 text-sm rounded-md font-medium transition-all flex items-center gap-2 ${
                  discoverTab === t.v
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted/60'
                }`}
              >
                <Icon className='h-4 w-4' />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter */}
      <div className='flex gap-4 mb-8'>
        <Input
          placeholder='Search groups...'
          value={query}
          onChange={e => setQuery(e.target.value)}
          className='flex-1 max-w-md'
        />
        <select
          className='h-10 rounded-md border bg-background px-3 text-sm'
          value={sortKey}
          onChange={e => setSortKey(e.target.value as any)}
        >
          <option value='name'>Sort by Name</option>
          <option value='members'>Sort by Members</option>
          <option value='recent'>Sort by Recent</option>
        </select>
      </div>

      {isLoading ? (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='h-32 bg-muted animate-pulse rounded' />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredAndSortedMemberships.length === 0 ? (
            <Card className='col-span-full'>
              <CardContent className='p-12 text-center'>
                <Users className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
                <p className='text-muted-foreground text-lg'>
                  {query.trim() || filterType !== 'all'
                    ? 'No groups match your filters.'
                    : "You haven't joined any groups yet. Create one to get started!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAndSortedMemberships.map(m => {
              const typeBadge = getGroupTypeBadge(m.group.type);
              return (
                <Card
                  key={m.group.id}
                  role='button'
                  onClick={() => setSelectedGroup(m)}
                  className={`hover:shadow-md transition-all cursor-pointer border bg-gradient-to-br ${typeBadge.color}`}
                >
                  <CardContent className='p-6'>
                    <div className='flex flex-col gap-4'>
                      <div>
                        <h3 className='text-lg font-semibold truncate'>
                          {m.group.name}
                        </h3>
                        <div className='mt-3 flex flex-wrap items-center gap-2'>
                          <Badge
                            variant={typeBadge.variant}
                            className='flex items-center'
                          >
                            {typeBadge.icon}
                            {typeBadge.label}
                          </Badge>
                          <Badge variant='outline'>
                            {m.group.memberCount}
                            {m.group.maxMembers
                              ? `/${m.group.maxMembers}`
                              : ''}{' '}
                            members
                          </Badge>
                          <Badge
                            variant='outline'
                            className='flex items-center gap-1'
                          >
                            {getRoleIcon(m.role)}
                            {m.role}
                          </Badge>
                        </div>
                        {m.group.description && (
                          <p className='mt-3 text-sm text-muted-foreground line-clamp-2'>
                            {m.group.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </main>
  );
}