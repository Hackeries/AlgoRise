'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserPlus,
  Users,
  Mail,
  Crown,
  Shield,
  User,
  MoreVertical,
  Copy,
  Check,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import useSWR, { mutate } from 'swr';

interface GroupMember {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  lastActive: string;
  isOnline: boolean;
}

interface GroupManagementProps {
  groupId: string;
  groupName: string;
  groupType: 'college' | 'friends' | 'icpc'; // Added groupType prop
  userRole: 'admin' | 'moderator' | 'member';
  maxMembers?: number; // Added maxMembers prop
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function GroupManagement({
  groupId,
  groupName,
  groupType, // Added groupType
  userRole,
  maxMembers, // Added maxMembers
}: GroupManagementProps) {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'moderator'>(
    'member'
  );
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [addMemberHandle, setAddMemberHandle] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);

  const { data: groupData, isLoading } = useSWR<{
    members: GroupMember[];
    invites: Array<{
      id: string;
      email: string;
      role: string;
      createdAt: string;
      status: 'pending' | 'accepted' | 'expired';
    }>;
    inviteCode: string;
  }>(`/api/groups/${groupId}/members`, fetcher);

  const members = groupData?.members || [];
  const invites = groupData?.invites || [];
  const canInvite = userRole === 'admin' || userRole === 'moderator';
  const canManageMembers = userRole === 'admin';

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !canInvite) return;

    setIsInviting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      toast({
        title: 'Invitation sent!',
        description: `Invited ${inviteEmail} to join ${groupName}`,
      });

      setInviteEmail('');
      setShowInviteDialog(false);
      mutate(`/api/groups/${groupId}/members`);
    } catch (error: any) {
      toast({
        title: 'Failed to send invitation',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleChangeRole = async (
    memberId: string,
    newRole: 'admin' | 'moderator' | 'member'
  ) => {
    if (!canManageMembers) return;

    try {
      const res = await fetch(
        `/api/groups/${groupId}/members/${memberId}/role`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!res.ok) {
        throw new Error('Failed to change member role');
      }

      toast({
        title: 'Role updated',
        description: `Member role changed to ${newRole}`,
      });

      mutate(`/api/groups/${groupId}/members`);
    } catch (error: any) {
      toast({
        title: 'Failed to update role',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!canManageMembers) return;

    try {
      const res = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to remove member');
      }

      toast({
        title: 'Member removed',
        description: `${memberName} has been removed from the group`,
      });

      mutate(`/api/groups/${groupId}/members`);
    } catch (error: any) {
      toast({
        title: 'Failed to remove member',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const copyInviteLink = async () => {
    if (!groupData?.inviteCode) return;

    const inviteUrl = `${window.location.origin}/groups/join/${groupData.inviteCode}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInvite(true);
      toast({
        title: 'Invite link copied!',
        description: 'Share this link with others to invite them to the group',
      });

      setTimeout(() => setCopiedInvite(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy link',
        description: 'Please copy the link manually',
        variant: 'destructive',
      });
    }
  };

  const handleAddMemberByHandle = async () => {
    if (!addMemberHandle.trim() || !canInvite) return;

    setIsAddingMember(true);
    try {
      const res = await fetch(`/api/groups/add-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          handle: addMemberHandle.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add member');
      }

      toast({
        title: 'Member added!',
        description: `${addMemberHandle} has been added to ${groupName}`,
      });

      setAddMemberHandle('');
      setShowAddMemberDialog(false);
      mutate(`/api/groups/${groupId}/members`);
    } catch (error: any) {
      toast({
        title: 'Failed to add member',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsAddingMember(false);
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Group Actions */}
      {canInvite && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <UserPlus className='h-5 w-5' />
              Invite Members
              {maxMembers && (
                <Badge variant='secondary' className='ml-auto'>
                  {members.length}/{maxMembers} members
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {maxMembers && members.length >= maxMembers && (
              <div className='bg-destructive/10 text-destructive p-3 rounded-lg text-sm'>
                This group is full. Remove a member before adding new ones.
              </div>
            )}

            {groupType === 'icpc' && (
              <div className='bg-muted/50 p-3 rounded-lg text-sm'>
                <p className='font-medium'>ICPC Team Rules:</p>
                <ul className='list-disc list-inside mt-1 text-muted-foreground'>
                  <li>Maximum 3 members (ICPC regulation)</li>
                  <li>All members must be from the same college</li>
                </ul>
              </div>
            )}

            <div className='flex gap-2'>
              <Button
                onClick={copyInviteLink}
                variant='outline'
                className='flex-1'
                disabled={maxMembers ? members.length >= maxMembers : false}
              >
                {copiedInvite ? (
                  <Check className='h-4 w-4 mr-2' />
                ) : (
                  <Copy className='h-4 w-4 mr-2' />
                )}
                {copiedInvite ? 'Copied!' : 'Copy Invite Link'}
              </Button>

              <Dialog
                open={showAddMemberDialog}
                onOpenChange={setShowAddMemberDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    disabled={maxMembers ? members.length >= maxMembers : false}
                  >
                    <UserPlus className='h-4 w-4 mr-2' />
                    Add by Handle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Member to {groupName}</DialogTitle>
                    <DialogDescription>
                      Enter the Codeforces handle of the user you want to add.
                      {groupType === 'icpc' &&
                        ' They must be from the same college.'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className='space-y-4'>
                    <div>
                      <label className='text-sm font-medium'>
                        Codeforces Handle
                      </label>
                      <Input
                        placeholder='Enter CF handle'
                        value={addMemberHandle}
                        onChange={e => setAddMemberHandle(e.target.value)}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant='outline'
                      onClick={() => setShowAddMemberDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddMemberByHandle}
                      disabled={!addMemberHandle.trim() || isAddingMember}
                    >
                      {isAddingMember ? 'Adding...' : 'Add Member'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={showInviteDialog}
                onOpenChange={setShowInviteDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Mail className='h-4 w-4 mr-2' />
                    Send Invitation
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite to {groupName}</DialogTitle>
                    <DialogDescription>
                      Send an invitation email to add someone to this group
                    </DialogDescription>
                  </DialogHeader>

                  <div className='space-y-4'>
                    <div>
                      <label className='text-sm font-medium'>
                        Email Address
                      </label>
                      <Input
                        type='email'
                        placeholder='Enter email address'
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                      />
                    </div>

                    {canManageMembers && (
                      <div>
                        <label className='text-sm font-medium'>Role</label>
                        <Select
                          value={inviteRole}
                          onValueChange={(value: 'member' | 'moderator') =>
                            setInviteRole(value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='member'>Member</SelectItem>
                            <SelectItem value='moderator'>Moderator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      variant='outline'
                      onClick={() => setShowInviteDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInvite}
                      disabled={!inviteEmail.trim() || isInviting}
                    >
                      {isInviting ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className='flex items-center space-x-4 p-3 bg-muted/20 rounded-lg animate-pulse'
                >
                  <div className='h-10 w-10 bg-muted rounded-full' />
                  <div className='flex-1'>
                    <div className='h-4 bg-muted rounded w-24 mb-2' />
                    <div className='h-3 bg-muted rounded w-16' />
                  </div>
                  <div className='h-6 bg-muted rounded w-20' />
                </div>
              ))}
            </div>
          ) : (
            <div className='space-y-2'>
              {members.map(member => (
                <div
                  key={member.id}
                  className='flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/20'
                >
                  <div className='relative'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage
                        src={member.avatar || '/placeholder.svg'}
                        alt={member.name}
                      />
                      <AvatarFallback>
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className='absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background' />
                    )}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm font-medium truncate'>
                        {member.name}
                      </p>
                      <Badge variant='outline' className='text-xs'>
                        {member.handle}
                      </Badge>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Badge className={getRoleBadgeColor(member.role)}>
                      <span className='flex items-center gap-1'>
                        {getRoleIcon(member.role)}
                        {member.role}
                      </span>
                    </Badge>

                    {canManageMembers && member.role !== 'admin' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          {member.role !== 'moderator' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRole(member.id, 'moderator')
                              }
                            >
                              Promote to Moderator
                            </DropdownMenuItem>
                          )}
                          {member.role === 'moderator' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRole(member.id, 'member')
                              }
                            >
                              Demote to Member
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              handleRemoveMember(member.id, member.name)
                            }
                            className='text-destructive'
                          >
                            Remove from Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations ({invites.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {invites.map(invite => (
                <div
                  key={invite.id}
                  className='flex items-center justify-between p-3 rounded-lg bg-muted/20'
                >
                  <div>
                    <p className='text-sm font-medium'>{invite.email}</p>
                    <p className='text-xs text-muted-foreground'>
                      Invited {new Date(invite.createdAt).toLocaleDateString()}{' '}
                      • Role: {invite.role}
                    </p>
                  </div>
                  <Badge
                    variant={
                      invite.status === 'pending'
                        ? 'secondary'
                        : invite.status === 'accepted'
                        ? 'default'
                        : 'destructive'
                    }
                  >
                    {invite.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}