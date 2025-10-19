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
  AlertCircle,
  Copy,
  Send,
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
  groupType: 'college' | 'friends' | 'icpc';
  userRole: 'admin' | 'moderator' | 'member';
  maxMembers?: number;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

const safeJson = async (res: Response) => {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

export function GroupManagement({
  groupId,
  groupName,
  groupType,
  userRole,
  maxMembers,
}: GroupManagementProps) {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'moderator'>(
    'member'
  );
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [addHandle, setAddHandle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showAddByHandleDialog, setShowAddByHandleDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

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
    const handler = (e: any) => {
      if (e?.detail?.groupId === groupId) {
        setShowInviteDialog(true);
        setTimeout(() => {
          const el = document.getElementById(
            'invite-email-input'
          ) as HTMLInputElement | null;
          el?.focus();
        }, 75);
      }
    };
    window.addEventListener('algorise:open-invite', handler as any);
    return () =>
      window.removeEventListener('algorise:open-invite', handler as any);
  }, [groupId]);

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
      const data = await safeJson(res);

      if (!res.ok) {
        const msg =
          res.status === 401
            ? 'You are not logged in. Please refresh and sign in.'
            : res.status === 403
            ? 'Only group members can generate invite links.'
            : (data as any).error || 'Failed to generate invite link';
        throw new Error(msg);
      }

      setInviteCode((data as any).code);
      setInviteLink((data as any).link || null);
    } catch (error: any) {
      toast({
        title: 'Failed to generate invite link',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      console.log('[v0] invite code error', error?.message);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !canInvite) return;

    if (!inviteCode || !inviteLink) {
      await generateInviteCode();
    }
    if (!inviteCode || !inviteLink) return;

    setIsInviting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          code: inviteCode,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok)
        throw new Error((data as any).error || 'Failed to send invitation');

      const linkToShare =
        (data as any).link ||
        inviteLink ||
        (inviteCode
          ? `${window.location.origin}/groups/join/${inviteCode}`
          : '');

      const subject = `Join ${groupName} on AlgoRise - Competitive Programming Community`;
      const body =
        `Hi there!\n\n` +
        `You've been invited to join "${groupName}" on AlgoRise.\n\n` +
        `AlgoRise is a competitive programming platform designed for serious coders who want to master algorithms and climb the ratings ladder.\n\n` +
        `Join Link: ${linkToShare}\n` +
        `Role: ${inviteRole === 'moderator' ? 'Moderator' : 'Member'}\n\n` +
        `What you'll get:\n` +
        `• Curated problem sets from Codeforces, AtCoder, and LeetCode\n` +
        `• Real-time contests and practice sessions\n` +
        `• AI-powered analytics to track your progress\n` +
        `• Collaborate with teammates and compete together\n\n` +
        `See you on AlgoRise!\n` +
        `The AlgoRise Team`;

      if ((navigator as any).share) {
        try {
          await (navigator as any).share({
            title: subject,
            text: body,
            url: linkToShare,
          });
        } catch {
          // user cancelled share sheet
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
        title: 'Invitation sent!',
        description: `${inviteEmail} will receive an invitation to join ${groupName}.`,
      });

      setInviteEmail('');
      setShowInviteDialog(false);
      mutate(`/api/groups/${groupId}/members`);
    } catch (error: any) {
      toast({
        title: 'Failed to send invitation',
        description: error.message || 'Please try again',
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

  const handleAddByHandle = async () => {
    if (!addHandle.trim() || !canManageMembers) return;
    setIsAdding(true);
    try {
      const res = await fetch(`/api/groups/add-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, handle: addHandle.trim() }),
      });
      const data = await safeJson(res);
      if (!res.ok)
        throw new Error((data as any).error || 'Failed to add member');

      toast({
        title: 'Member added',
        description: `${addHandle} has been added to the group${
          (data as any).needsVerification
            ? ". They'll need to verify their CF handle."
            : '.'
        }`,
      });
      setAddHandle('');
      setShowAddByHandleDialog(false);
      mutate(`/api/groups/${groupId}/members`);
    } catch (error: any) {
      toast({
        title: 'Failed to add member',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteCode || !inviteLink) {
      await generateInviteCode();
    }
    let inviteUrl = inviteLink;
    if (!inviteUrl && inviteCode) {
      inviteUrl = `${window.location.origin}/groups/join/${inviteCode}`;
    }
    if (!inviteUrl) {
      toast({
        title: 'Failed to generate invite link',
        description: 'Please try again',
        variant: 'destructive',
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedInvite(true);
      toast({
        title: 'Invite link copied!',
        description: 'Share this link to invite members to your group',
      });
      setTimeout(() => setCopiedInvite(false), 2000);
    } catch {
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
        <Card className='border-2 bg-gradient-to-br from-card to-card/50'>
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
                className='h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary bg-gradient-to-br from-primary/5 to-transparent border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20'
                disabled={
                  (maxMembers ? members.length >= maxMembers : false) ||
                  isGeneratingCode
                }
              >
                {copiedInvite ? (
                  <Check className='h-5 w-5 text-green-600 animate-bounce' />
                ) : (
                  <Copy className='h-5 w-5 text-primary' />
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
                open={showAddByHandleDialog}
                onOpenChange={setShowAddByHandleDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary bg-gradient-to-br from-primary/5 to-transparent border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20'
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
                        value={addHandle}
                        onChange={e => setAddHandle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && addHandle.trim()) {
                            handleAddByHandle();
                          }
                        }}
                      />
                      <p className='text-xs text-muted-foreground'>
                        No verification required to add. If their Codeforces
                        handle isn't verified yet, they'll be prompted to verify
                        after joining.
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant='outline'
                      onClick={() => setShowAddByHandleDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddByHandle}
                      disabled={!addHandle.trim() || isAdding}
                    >
                      {isAdding ? 'Adding...' : 'Add Member'}
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
                    className='h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary bg-gradient-to-br from-primary/5 to-transparent border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20'
                    disabled={maxMembers ? members.length >= maxMembers : false}
                  >
                    <Send className='h-5 w-5 text-primary' />
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
                      Send a professional invitation email to add someone to{' '}
                      {groupName}. They'll receive a link to join the group.
                    </DialogDescription>
                  </DialogHeader>

                  <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>
                        Email Address
                      </label>
                      <Input
                        id='invite-email-input'
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

                    <div className='bg-muted/50 rounded-lg p-3 space-y-2 border border-border/50'>
                      <p className='text-xs font-semibold text-muted-foreground'>
                        Email Preview:
                      </p>
                      <div className='text-xs space-y-1 text-foreground/80'>
                        <p>
                          <strong>Subject:</strong> Join {groupName} on AlgoRise
                        </p>
                        <p className='line-clamp-3'>
                          <strong>Body:</strong> You've been invited to join "
                          {groupName}" on AlgoRise...
                        </p>
                      </div>
                    </div>
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
                      className='gap-2'
                    >
                      <Send className='h-4 w-4' />
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
