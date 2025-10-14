'use client';

import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Users, Plus, Trophy, Crown, Shield, User, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Group {
  id: string;
  name: string;
  type: 'college' | 'friends' | 'icpc';
  memberCount: number;
  maxMembers?: number;
  description?: string;
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
  const [sortKey, setSortKey] = useState<'name' | 'members'>('name');

  const sortGroups = (groups: Membership[]) => {
    if (sortKey === 'name') {
      return groups.sort((a, b) => a.group.name.localeCompare(b.group.name));
    }
    return groups.sort(
      (a, b) => (b.group.memberCount || 0) - (a.group.memberCount || 0)
    );
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
        };
      case 'college':
        return { variant: 'secondary' as const, icon: null, label: 'College' };
      case 'friends':
        return { variant: 'outline' as const, icon: null, label: 'Friends' };
      default:
        return { variant: 'outline' as const, icon: null, label: type };
    }
  };

  const filteredAndSortedMemberships = sortGroups(filterGroups(memberships));

  if (selectedGroup) {
    const typeBadge = getGroupTypeBadge(selectedGroup.group.type);

    return (
      <main className='mx-auto max-w-7xl px-4 py-6'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              onClick={() => setSelectedGroup(null)}
              className='px-2'
            >
              ← Back
            </Button>
            <div>
              <h1 className='text-3xl font-bold'>{selectedGroup.group.name}</h1>
              <div className='flex items-center gap-2 mt-1'>
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
                <p className='text-sm text-muted-foreground mt-2'>
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

        <Tabs defaultValue='leaderboard' className='space-y-6'>
          <TabsList>
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
          </TabsList>

          <TabsContent value='leaderboard' className='space-y-6'>
            <GroupLeaderboard
              groupId={selectedGroup.group.id}
              groupName={selectedGroup.group.name}
            />
          </TabsContent>

          <TabsContent value='members' className='space-y-6'>
            <GroupManagement
              groupId={selectedGroup.group.id}
              groupName={selectedGroup.group.name}
              groupType={selectedGroup.group.type}
              userRole={selectedGroup.role}
              maxMembers={selectedGroup.group.maxMembers}
            />
          </TabsContent>
        </Tabs>
      </main>
    );
  }

  return (
    <main className='mx-auto max-w-6xl px-4 py-10'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Groups</h1>
          <p className='text-muted-foreground mt-1'>
            Join groups to compete with friends and classmates, or form ICPC
            teams
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <div className='hidden sm:flex items-center gap-2'>
            <label className='text-sm text-muted-foreground'>Sort</label>
            <select
              className='h-9 rounded-md border bg-background px-2 text-sm'
              value={sortKey}
              onChange={e => setSortKey(e.target.value as any)}
            >
              <option value='name'>Name</option>
              <option value='members'>Members</option>
            </select>

            <label className='ml-3 text-sm text-muted-foreground'>Type</label>
            <select
              className='h-9 rounded-md border bg-background px-2 text-sm'
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
            >
              <option value='all'>All</option>
              <option value='college'>College</option>
              <option value='friends'>Friends</option>
              <option value='icpc'>ICPC Teams</option>
            </select>
          </div>

          <Input
            placeholder='Search groups...'
            value={query}
            onChange={e => setQuery(e.target.value)}
            className='w-40 sm:w-56 md:w-64'
          />

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>Create a Group</DialogTitle>
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
                  <div className='bg-muted/50 p-4 rounded-lg space-y-2'>
                    <h4 className='font-semibold flex items-center gap-2'>
                      <Users className='h-4 w-4' />
                      Friends Group
                    </h4>
                    <p className='text-sm text-muted-foreground'>
                      Create a flexible group to compete with friends. No size
                      limits, open to anyone you invite. Perfect for study
                      groups, practice sessions, and friendly competitions.
                    </p>
                  </div>

                  <div className='space-y-3'>
                    <div>
                      <Label htmlFor='friends-name'>Group Name</Label>
                      <Input
                        id='friends-name'
                        placeholder='e.g., Weekend Warriors, Study Squad'
                        value={groupName}
                        onChange={e => setGroupName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor='friends-desc'>
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
                  <div className='bg-muted/50 p-4 rounded-lg space-y-2'>
                    <h4 className='font-semibold flex items-center gap-2'>
                      <Award className='h-4 w-4' />
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
                      <Label htmlFor='icpc-name'>Team Name</Label>
                      <Input
                        id='icpc-name'
                        placeholder='e.g., AlgoRise Champions, Code Ninjas'
                        value={groupName}
                        onChange={e => setGroupName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor='icpc-desc'>
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
              <CardContent className='p-6 text-center'>
                <Users className='h-12 w-12 mx-auto text-muted-foreground mb-3' />
                <p className='text-muted-foreground'>
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
                  className='hover:bg-muted/50 transition-colors cursor-pointer'
                >
                  <CardContent className='p-6'>
                    <div className='flex flex-col gap-3'>
                      <div>
                        <h3 className='text-lg font-semibold truncate'>
                          {m.group.name}
                        </h3>
                        <div className='mt-2 flex flex-wrap items-center gap-2'>
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
                          <p className='mt-2 text-sm text-muted-foreground line-clamp-2'>
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