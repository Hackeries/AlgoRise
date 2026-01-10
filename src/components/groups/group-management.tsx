'use client';

import { useState, useEffect } from 'react';
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
  Zap,
  Link2,
  QrCode,
  Clock,
  RefreshCw,
  X,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import useSWR, { mutate } from 'swr';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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

const AdvancedToast = ({
  title,
  description,
  isSuccess,
}: {
  title: string;
  description: string;
  isSuccess: boolean;
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={cn(
          'rounded-xl shadow-2xl border p-4 max-w-sm backdrop-blur-xl',
          isSuccess
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'mt-0.5 p-1.5 rounded-full',
              isSuccess ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
            )}
          >
            {isSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1">
            <p
              className={cn(
                'font-semibold text-sm',
                isSuccess ? 'text-green-400' : 'text-red-400'
              )}
            >
              {title}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GlassCard = ({
  children,
  className,
  gradient,
}: {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}) => (
  <div
    className={cn(
      'relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden',
      gradient && 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/10 before:via-transparent before:to-purple-500/5 before:pointer-events-none',
      className
    )}
  >
    {children}
  </div>
);

const RoleBadge = ({ role }: { role: 'admin' | 'moderator' | 'member' }) => {
  const config = {
    admin: {
      icon: Crown,
      label: 'Admin',
      className: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30',
    },
    moderator: {
      icon: Shield,
      label: 'Moderator',
      className: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30',
    },
    member: {
      icon: User,
      label: 'Member',
      className: 'bg-white/5 text-muted-foreground border-white/10',
    },
  };

  const { icon: Icon, label, className } = config[role];

  return (
    <Badge variant="outline" className={cn('gap-1.5 px-2.5 py-1 font-medium', className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
};

const MemberCard = ({
  member,
  index,
  canManageMembers,
  onChangeRole,
  onRemove,
}: {
  member: GroupMember;
  index: number;
  canManageMembers: boolean;
  onChangeRole: (id: string, role: 'admin' | 'moderator' | 'member') => void;
  onRemove: (id: string, name: string) => void;
}) => {
  const isTopMember = index < 3;

  return (
    <div
      className={cn(
        'group relative rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02]',
        isTopMember
          ? 'bg-gradient-to-br from-primary/10 via-white/5 to-purple-500/10 border-primary/20 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
      )}
    >
      {isTopMember && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2 h-[2px] w-16 bg-gradient-to-r from-transparent via-primary to-transparent" />
      )}

      <div className="flex flex-col items-center text-center">
        <div className="relative mb-3">
          <Avatar
            className={cn(
              'h-16 w-16 ring-2 ring-offset-2 ring-offset-background transition-all',
              member.isOnline ? 'ring-green-500' : 'ring-white/10'
            )}
          >
            <AvatarImage src={member.avatar || '/placeholder.svg'} alt={member.name} />
            <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/20 to-purple-500/20">
              {member.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {member.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          )}
        </div>

        <h4 className="font-semibold text-sm truncate w-full">{member.name}</h4>
        <p className="text-xs text-muted-foreground font-mono mb-2">@{member.handle}</p>

        <RoleBadge role={member.role} />

        <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          <span>{new Date(member.joinedAt).toLocaleDateString()}</span>
        </div>

        {canManageMembers && member.role !== 'admin' && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/10 hover:bg-white/20">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {member.role !== 'moderator' && (
                  <DropdownMenuItem onClick={() => onChangeRole(member.id, 'moderator')}>
                    <Shield className="h-4 w-4 mr-2 text-blue-500" />
                    Promote to Moderator
                  </DropdownMenuItem>
                )}
                {member.role === 'moderator' && (
                  <DropdownMenuItem onClick={() => onChangeRole(member.id, 'member')}>
                    <User className="h-4 w-4 mr-2" />
                    Demote to Member
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onRemove(member.id, member.name)}
                  className="text-destructive focus:text-destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove from Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ onInvite, groupType }: { onInvite: () => void; groupType: string }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="relative mb-6">
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
      <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10">
        <Users className="h-12 w-12 text-primary" />
      </div>
    </div>
    <h3 className="text-xl font-semibold mb-2">No members yet</h3>
    <p className="text-muted-foreground text-center max-w-sm mb-6">
      Start building your {groupType === 'icpc' ? 'team' : 'group'} by inviting members to join
    </p>
    <Button onClick={onInvite} className="gap-2">
      <UserPlus className="h-4 w-4" />
      Invite Members
    </Button>
  </div>
);

export function GroupManagement({
  groupId,
  groupName,
  groupType,
  userRole,
  maxMembers,
}: GroupManagementProps) {
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'moderator'>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [addHandle, setAddHandle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showAddByHandleDialog, setShowAddByHandleDialog] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [advancedToast, setAdvancedToast] = useState<{
    title: string;
    description: string;
    isSuccess: boolean;
  } | null>(null);
  const [inviteTab, setInviteTab] = useState<'email' | 'link'>('link');

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
  const canManageMembers = userRole === 'admin' || userRole === 'moderator';
  const pendingInvites = invites.filter(i => i.status === 'pending');

  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.groupId === groupId) {
        setShowInviteDialog(true);
        setTimeout(() => {
          const el = document.getElementById('invite-email-input') as HTMLInputElement | null;
          el?.focus();
        }, 75);
      }
    };
    window.addEventListener('algorise:open-invite', handler as any);
    return () => window.removeEventListener('algorise:open-invite', handler as any);
  }, [groupId]);

  useEffect(() => {
    if (canInvite && !inviteCode) {
      generateInviteCode();
    }
  }, [canInvite]);

  const generateInviteCode = async () => {
    setIsGeneratingCode(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/invite`, { method: 'GET' });
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
        title: 'Link generation failed',
        description: error.message || "Couldn't create the invite link. Try refreshing!",
        variant: 'destructive',
      });
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
      if (!res.ok) throw new Error((data as any).error || 'Failed to send invitation');

      setAdvancedToast({
        title: 'Invitation sent!',
        description: `${inviteEmail} will receive an invite to join ${groupName}.`,
        isSuccess: true,
      });

      setTimeout(() => setAdvancedToast(null), 5000);

      setInviteEmail('');
      setShowInviteDialog(false);
      mutate(`/api/groups/${groupId}/members`);
    } catch (error: any) {
      setAdvancedToast({
        title: "Couldn't send invite",
        description: error.message || 'Something went wrong. Try again.',
        isSuccess: false,
      });
      setTimeout(() => setAdvancedToast(null), 5000);
    } finally {
      setIsInviting(false);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: 'admin' | 'moderator' | 'member') => {
    if (!canManageMembers) return;

    try {
      const res = await fetch(`/api/groups/${groupId}/members/${memberId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        throw new Error('Failed to change member role');
      }

      toast({
        title: 'Role updated',
        description: `Successfully changed role to ${newRole}.`,
      });

      mutate(`/api/groups/${groupId}/members`);
    } catch (error: any) {
      toast({
        title: 'Role update failed',
        description: error.message || "Couldn't change the role. Try again.",
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
        description: `${memberName} has been removed from the group.`,
      });

      mutate(`/api/groups/${groupId}/members`);
    } catch (error: any) {
      toast({
        title: 'Removal failed',
        description: error.message || "Couldn't remove the member.",
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
      if (!res.ok) throw new Error((data as any).error || 'Failed to add member');

      toast({
        title: 'Member added',
        description: `${addHandle} has joined the team${
          (data as any).needsVerification ? '. They need to verify their handle.' : '!'
        }`,
      });
      setAddHandle('');
      setShowAddByHandleDialog(false);
      mutate(`/api/groups/${groupId}/members`);
    } catch (error: any) {
      toast({
        title: "Couldn't add member",
        description: error.message || 'Make sure the handle is correct.',
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
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = inviteUrl;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedInvite(true);
      toast({
        title: 'Link copied!',
        description: 'Share it with your team.',
      });
      setTimeout(() => setCopiedInvite(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Try copying manually.',
        variant: 'destructive',
      });
    }
  };

  const handleResendInvite = async (inviteId: string, email: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/invite/${inviteId}/resend`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to resend');
      toast({
        title: 'Invite resent',
        description: `Sent a new invitation to ${email}.`,
      });
    } catch {
      toast({
        title: 'Failed to resend',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/invite/${inviteId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to cancel');
      toast({ title: 'Invite cancelled' });
      mutate(`/api/groups/${groupId}/members`);
    } catch {
      toast({
        title: 'Failed to cancel',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {advancedToast && <AdvancedToast {...advancedToast} />}

      {canInvite && (
        <GlassCard gradient className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  Invite Members
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </h2>
                <p className="text-sm text-muted-foreground">
                  {groupType === 'icpc'
                    ? 'Add teammates (max 3 from same college)'
                    : groupType === 'friends'
                      ? 'Invite friends to practice together'
                      : 'Add members from your college'}
                </p>
              </div>
            </div>
            {maxMembers && (
              <Badge variant="secondary" className="px-3 py-1.5 text-sm font-semibold">
                {members.length}/{maxMembers}
              </Badge>
            )}
          </div>

          {maxMembers && members.length >= maxMembers && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <p className="text-sm text-destructive">
                This group has reached maximum capacity. Remove a member to add new ones.
              </p>
            </div>
          )}

          {groupType === 'icpc' && members.length < (maxMembers || 3) && (
            <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-500 shrink-0" />
              <p className="text-sm text-blue-400">
                <strong>ICPC Rules:</strong> All team members must be from the same college. Maximum 3
                members per team.
              </p>
            </div>
          )}

          <Tabs value={inviteTab} onValueChange={(v) => setInviteTab(v as 'email' | 'link')} className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full max-w-xs bg-white/5">
              <TabsTrigger value="link" className="gap-2">
                <Link2 className="h-4 w-4" />
                Direct Link
              </TabsTrigger>
              <TabsTrigger value="email" className="gap-2">
                <Mail className="h-4 w-4" />
                Email Invite
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Shareable Link</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={generateInviteCode}
                      disabled={isGeneratingCode}
                      className="h-8 w-8 p-0"
                    >
                      <RefreshCw className={cn('h-4 w-4', isGeneratingCode && 'animate-spin')} />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={inviteLink || 'Generating...'}
                      className="bg-white/5 border-white/10 text-xs font-mono"
                    />
                    <Button
                      onClick={copyInviteLink}
                      disabled={isGeneratingCode || !inviteLink}
                      className={cn(
                        'shrink-0 transition-all duration-300',
                        copiedInvite && 'bg-green-500 hover:bg-green-500'
                      )}
                    >
                      {copiedInvite ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Anyone with this link can request to join
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 border-dashed flex flex-col items-center justify-center gap-2 min-h-[120px]">
                  <div className="p-3 rounded-lg bg-white/5">
                    <QrCode className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">QR Code (Coming Soon)</span>
                </div>
              </div>

              <Dialog open={showAddByHandleDialog} onOpenChange={setShowAddByHandleDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto gap-2 bg-white/5 border-white/10 hover:bg-white/10"
                    disabled={maxMembers ? members.length >= maxMembers : false}
                  >
                    <UserPlus className="h-4 w-4" />
                    Add by Codeforces Handle
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add by Codeforces Handle</DialogTitle>
                    <DialogDescription>
                      Enter the handle to directly add someone to {groupName}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="e.g., tourist, Benq"
                      value={addHandle}
                      onChange={(e) => setAddHandle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addHandle.trim() && handleAddByHandle()}
                    />
                    <p className="text-xs text-muted-foreground">
                      If their handle isn't verified, they'll be prompted after joining.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddByHandleDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddByHandle} disabled={!addHandle.trim() || isAdding}>
                      {isAdding ? 'Adding...' : 'Add Member'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    id="invite-email-input"
                    type="email"
                    placeholder="teammate@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && inviteEmail.trim() && handleInvite()}
                    className="bg-white/5 border-white/10"
                  />
                </div>

                {canManageMembers && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assign Role</label>
                    <Select
                      value={inviteRole}
                      onValueChange={(value: 'member' | 'moderator') => setInviteRole(value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Member</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="moderator">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <span>Moderator</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Preview:</strong> A professional invite email
                    will be sent with a link to join {groupName}.
                  </p>
                </div>

                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || isInviting}
                  className="w-full gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </GlassCard>
      )}

      <GlassCard>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Team Members</h2>
                <p className="text-sm text-muted-foreground">
                  {groupType === 'icpc'
                    ? 'Your ICPC team roster'
                    : groupType === 'friends'
                      ? 'Friends in your practice group'
                      : 'Members of your college group'}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1.5 text-sm font-semibold">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </Badge>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse"
                >
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 bg-white/10 rounded-full mb-3" />
                    <div className="h-4 bg-white/10 rounded w-24 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-16 mb-2" />
                    <div className="h-6 bg-white/10 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <EmptyState
              onInvite={() => setShowInviteDialog(true)}
              groupType={groupType}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member, index) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  index={index}
                  canManageMembers={canManageMembers}
                  onChangeRole={handleChangeRole}
                  onRemove={handleRemoveMember}
                />
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {pendingInvites.length > 0 && (
        <GlassCard>
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Pending Invites</h2>
                  <p className="text-sm text-muted-foreground">Waiting to be accepted</p>
                </div>
              </div>
              <Badge variant="secondary" className="px-3 py-1.5 text-sm font-semibold bg-amber-500/10 text-amber-500 border-amber-500/20">
                {pendingInvites.length}
              </Badge>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-500/10">
                    <Mail className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Sent {new Date(invite.createdAt).toLocaleDateString()} • Joining as{' '}
                      <span className="capitalize">{invite.role}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                    Pending
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleResendInvite(invite.id, invite.email)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend Invite
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCancelInvite(invite.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel Invite
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
