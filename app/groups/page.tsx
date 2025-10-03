'use client';

import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Settings,
  Crown,
  Shield,
  User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Group {
  id: string;
  name: string;
  type: 'college' | 'friends';
  memberCount: number;
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
  const [friendName, setFriendName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  async function createFriendsGroup() {
    if (!friendName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/groups/create-friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: friendName.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Unable to create group');
      toast({
        title: 'Group created',
        description: `Your friends group "${friendName}" has been created.`,
      });
      setFriendName('');
      setShowCreateDialog(false);
      mutate('/api/groups/mine');
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Unable to create friends group',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  }

  async function leaveGroup(id: string) {
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
  }

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

  if (selectedGroup) {
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
                  variant={
                    selectedGroup.group.type === 'college'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {selectedGroup.group.type}
                </Badge>
                <Badge variant='outline' className='flex items-center gap-1'>
                  {getRoleIcon(selectedGroup.role)}
                  {selectedGroup.role}
                </Badge>
                <span className='text-sm text-muted-foreground'>
                  {selectedGroup.group.memberCount} members
                </span>
              </div>
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
              userRole={selectedGroup.role}
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
            Join groups to compete with friends and classmates
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='h-4 w-4 mr-2' />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Friends Group</DialogTitle>
              <DialogDescription>
                Create a group to compete with your friends and track progress
                together.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium'>Group Name</label>
                <Input
                  placeholder='Enter group name'
                  value={friendName}
                  onChange={e => setFriendName(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createFriendsGroup}
                disabled={creating || !friendName.trim()}
              >
                {creating ? 'Creating...' : 'Create Group'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
      ) : memberships.length === 0 ? (
        <div className='text-center py-12'>
          <Users className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-xl font-semibold mb-2'>No groups yet</h3>
          <p className='text-muted-foreground mb-6 max-w-md mx-auto'>
            Join your college group or create a friends group to start competing
            and tracking progress together.
          </p>

          <div className='flex gap-4 justify-center'>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className='h-4 w-4 mr-2' />
              Create Group
            </Button>
            <Button variant='outline' asChild>
              <Link href='/onboarding'>Join College</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {memberships.map(membership => (
            <Card
              key={membership.group.id}
              className='cursor-pointer hover:shadow-md transition-shadow'
              onClick={() => setSelectedGroup(membership)}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-lg'>
                      {membership.group.name}
                    </CardTitle>
                    <div className='flex items-center gap-2 mt-1'>
                      <Badge
                        variant={
                          membership.group.type === 'college'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {membership.group.type}
                      </Badge>
                      <Badge
                        variant='outline'
                        className='flex items-center gap-1'
                      >
                        {getRoleIcon(membership.role)}
                        {membership.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-0'>
                {membership.group.description && (
                  <p className='text-sm text-muted-foreground mb-3'>
                    {membership.group.description}
                  </p>
                )}
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>
                    {membership.group.memberCount} members
                  </span>
                  <Button variant='ghost' size='sm'>
                    View →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
