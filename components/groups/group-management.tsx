'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
  Check,
  Link2,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import useSWR, { mutate } from 'swr';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

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

  useEffect(() => {
    if (canInvite && !inviteCode) {
      generateInviteCode();
    }
  }, [canInvite]);

  const generateInviteCode = async () => {
    setIsGeneratingCode(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/invite`, {
        method: 'GET',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate invite code');
      }

      setInviteCode(data.code);
      setInviteLink(data.link || null);
    } catch (error: any) {
      console.error('[v0] Failed to generate invite code:', error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !canInvite) return;

    if (!inviteCode || !inviteLink) {
      await generateInviteCode();
    }

    setIsInviting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          code: inviteCode, // server also persists the invite and returns link
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }
      const linkToShare =
        data.link ||
        inviteLink ||
        (inviteCode
          ? `${window.location.origin}/groups/join/${inviteCode}`
          : '');

      // Try Web Share API; if not available, open a mailto link
      const subject = `You're invited to join ${groupName} on AlgoRise`;
      const body =
        `Hi,\n\nYou've been invited to join the group "${groupName}".\n\nJoin link: ${linkToShare}\n\n` +
        `Role: ${inviteRole}\n\nSee you on AlgoRise!`;
      if ((navigator as any).share) {
        try {
          await (navigator as any).share({
            title: subject,
            text: body,
            url: linkToShare,
          });
        } catch {
          // ignore if user cancels
        }
      } else {
        const mailto = `mailto:${encodeURIComponent(
          inviteEmail.trim()
        )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
          body
        )}`;
        window.open(mailto, '_blank', 'noopener,noreferrer');
      }

      toast({
        title: 'Invitation ready to share',
        description: `We generated a join link for ${inviteEmail}. Share via email or chat.`,
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

  const handleAddMemberByHandle = async () => {
    if (!addMemberHandle.trim() || !canManageMembers) return;

    setIsAddingMember(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/members/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: addMemberHandle.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add member');
      }

      toast({
        title: 'Member added',
        description: `Added ${addMemberHandle.trim()} to the group`,
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

  const copyInviteLink = async () => {
    if (!inviteCode || !inviteLink) {
      await generateInviteCode();
    }
    if (!inviteCode || !inviteLink) {
      toast({
        title: 'Failed to generate invite link',
        description: 'Please try again',
        variant: 'destructive',
      });
      return;
    }
    const inviteUrl = inviteLink!;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInvite(true);
      toast({
        title: 'Invite link copied!',
        description: 'Share this link to invite members to your group',
      });
      setTimeout(() => setCopiedInvite(false), 2000);
    } catch (error) {
      toast({
        title: 'Failed to copy link',
        description: 'Please try again or copy manually',
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
      {canInvite && (
        <Card className='border-2'>
          <CardHeader className='pb-4'>
            <div className='flex items-start justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2 text-xl'>
                  <UserPlus className='h-5 w-5 text-primary' />
                  Invite Members
                </CardTitle>
                <CardDescription className='mt-1.5'>
                  {groupType === 'icpc'
                    ? 'Add teammates to your ICPC team (max 3 members from same college)'
                    : groupType === 'friends'
                    ? 'Invite friends to compete together in practice sessions'
                    : 'Add members from your college to the group'}
                </CardDescription>
              </div>
              {maxMembers && (
                <Badge variant='secondary' className='text-sm px-3 py-1'>
                  {members.length}/{maxMembers}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {maxMembers && members.length >= maxMembers && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  This group has reached its maximum capacity. Remove a member
                  before adding new ones.
                </AlertDescription>
              </Alert>
            )}

            {groupType === 'icpc' && members.length < (maxMembers || 3) && (
              <Alert>
                <Shield className='h-4 w-4' />
                <AlertDescription>
                  <strong>ICPC Rules:</strong> All team members must be from the
                  same college and maximum 3 members allowed per team.
                </AlertDescription>
              </Alert>
            )}

            <div className='grid gap-3 sm:grid-cols-3'>
              <Button
                onClick={copyInviteLink}
                variant='outline'
                className='h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary bg-transparent'
                disabled={
                  (maxMembers ? members.length >= maxMembers : false) ||
                  isGeneratingCode
                }
              >
                {copiedInvite ? (
                  <Check className='h-5 w-5 text-green-600' />
                ) : (
                  <Link2 className='h-5 w-5 text-primary' />
                )}
                <div className='text-center'>
                  <div className='font-semibold'>
                    {copiedInvite ? 'Link Copied!' : 'Copy Invite Link'}
                  </div>
                  <div className='text-xs text-muted-foreground mt-0.5'>
                    Share with anyone
                  </div>
                </div>
              </Button>

              <Dialog
                open={showAddMemberDialog}
                onOpenChange={setShowAddMemberDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary bg-transparent'
                    disabled={maxMembers ? members.length >= maxMembers : false}
                  >
                    <UserPlus className='h-5 w-5 text-primary' />
                    <div className='text-center'>
                      <div className='font-semibold'>Add by Handle</div>
                      <div className='text-xs text-muted-foreground mt-0.5'>
                        Direct add via CF handle
                      </div>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-md'>
                  <DialogHeader>
                    <DialogTitle>Add Member by Codeforces Handle</DialogTitle>
                    <DialogDescription>
                      Enter the Codeforces handle of the user you want to add to{' '}
                      {groupName}.
                      {groupType === 'icpc' &&
                        ' They must be from the same college as your team.'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Codeforces Handle
                      </label>
                      <Input
                        placeholder='e.g., tourist, Benq, Errichto'
                        value={addMemberHandle}
                        onChange={e => setAddMemberHandle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && addMemberHandle.trim()) {
                            handleAddMemberByHandle();
                          }
                        }}
                      />
                      <p className='text-xs text-muted-foreground'>
                        The user must have a verified Codeforces handle on
                        AlgoRise
                      </p>
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
                  <Button
                    variant='outline'
                    className='h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary bg-transparent'
                    disabled={maxMembers ? members.length >= maxMembers : false}
                  >
                    <Mail className='h-5 w-5 text-primary' />
                    <div className='text-center'>
                      <div className='font-semibold'>Send Invitation</div>
                      <div className='text-xs text-muted-foreground mt-0.5'>
                        Invite via email
                      </div>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-md'>
                  <DialogHeader>
                    <DialogTitle>Send Email Invitation</DialogTitle>
                    <DialogDescription>
                      Send an invitation email to add someone to {groupName}.
                      They'll receive a link to join the group.
                    </DialogDescription>
                  </DialogHeader>

                  <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Email Address
                      </label>
                      <Input
                        type='email'
                        placeholder='teammate@example.com'
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && inviteEmail.trim()) {
                            handleInvite();
                          }
                        }}
                      />
                    </div>

                    {canManageMembers && (
                      <div className='space-y-2'>
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
                            <SelectItem value='member'>
                              Member - Can participate in group activities
                            </SelectItem>
                            <SelectItem value='moderator'>
                              Moderator - Can invite and manage members
                            </SelectItem>
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

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5 text-primary' />
            Team Members
            <Badge variant='secondary' className='ml-auto'>
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {groupType === 'icpc'
              ? 'Your ICPC team roster'
              : groupType === 'friends'
              ? 'Friends in your practice group'
              : 'Members of your college group'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className='flex items-center space-x-4 p-4 bg-muted/30 rounded-lg animate-pulse'
                >
                  <div className='h-12 w-12 bg-muted rounded-full' />
                  <div className='flex-1'>
                    <div className='h-4 bg-muted rounded w-32 mb-2' />
                    <div className='h-3 bg-muted rounded w-24' />
                  </div>
                  <div className='h-6 bg-muted rounded w-20' />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className='text-center py-12'>
              <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>No members yet</h3>
              <p className='text-sm text-muted-foreground mb-4'>
                Start building your {groupType === 'icpc' ? 'team' : 'group'} by
                inviting members
              </p>
            </div>
          ) : (
            <div className='space-y-2'>
              {members.map(member => (
                <div
                  key={member.id}
                  className='flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border'
                >
                  <div className='relative'>
                    <Avatar className='h-12 w-12 border-2 border-background'>
                      <AvatarImage
                        src={member.avatar || '/placeholder.svg'}
                        alt={member.name}
                      />
                      <AvatarFallback className='text-sm font-semibold'>
                        {member.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className='absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-background' />
                    )}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-1'>
                      <p className='text-sm font-semibold truncate'>
                        {member.name}
                      </p>
                      {member.isOnline && (
                        <Badge
                          variant='outline'
                          className='text-xs px-1.5 py-0'
                        >
                          Online
                        </Badge>
                      )}
                    </div>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Badge variant='secondary' className='text-xs font-mono'>
                        {member.handle}
                      </Badge>
                      <span>•</span>
                      <span>
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Badge className={getRoleBadgeColor(member.role)}>
                      <span className='flex items-center gap-1.5'>
                        {getRoleIcon(member.role)}
                        <span className='capitalize'>{member.role}</span>
                      </span>
                    </Badge>

                    {canManageMembers && member.role !== 'admin' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0'
                          >
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
                              <Shield className='h-4 w-4 mr-2' />
                              Promote to Moderator
                            </DropdownMenuItem>
                          )}
                          {member.role === 'moderator' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRole(member.id, 'member')
                              }
                            >
                              <User className='h-4 w-4 mr-2' />
                              Demote to Member
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              handleRemoveMember(member.id, member.name)
                            }
                            className='text-destructive focus:text-destructive'
                          >
                            <AlertCircle className='h-4 w-4 mr-2' />
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

      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Mail className='h-5 w-5 text-primary' />
              Pending Invitations
              <Badge variant='secondary' className='ml-auto'>
                {invites.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Invitations waiting to be accepted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {invites.map(invite => (
                <div
                  key={invite.id}
                  className='flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border'
                >
                  <div className='flex-1'>
                    <p className='text-sm font-medium'>{invite.email}</p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      Sent {new Date(invite.createdAt).toLocaleDateString()} •
                      Will join as {invite.role}
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
                    className='capitalize'
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