'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, AlertCircle } from 'lucide-react';

export default function JoinGroupPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const code = resolvedParams.code;
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('');
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    async function joinGroup() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push(
            `/auth/login?redirect=${encodeURIComponent(`/groups/join/${code}`)}`
          );
          return;
        }

        // Find group by invite code
        const { data: group, error: gErr } = await supabase
          .from('groups')
          .select('id, name')
          .eq('invite_code', code)
          .single();
        if (gErr || !group) {
          setStatus('error');
          setMessage('Invalid or expired invite link');
          return;
        }

        setGroupName(group.name);

        // POST to join
        const res = await fetch(`/api/groups/${group.id}/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus('error');
          setMessage(data.error || 'Failed to join group');
          return;
        }

        setStatus('success');
        setMessage(`You've joined ${group.name}!`);
        setTimeout(() => router.push('/groups'), 2000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Something went wrong');
      }
    }
    joinGroup();
  }, [code, router]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-background p-4'>
      <div className='w-full max-w-md space-y-6 text-center'>
        {status === 'loading' && (
          <>
            <Loader2 className='w-12 h-12 animate-spin mx-auto text-primary' />
            <h1 className='text-2xl font-semibold'>Joining group...</h1>
            <p className='text-muted-foreground'>
              Please wait while we add you to the group.
            </p>
          </>
        )}
        {status === 'success' && (
          <>
            <UserPlus className='w-12 h-12 mx-auto text-green-500' />
            <h1 className='text-2xl font-semibold text-green-600'>Success!</h1>
            <p className='text-foreground'>{message}</p>
            <p className='text-sm text-muted-foreground'>
              Redirecting to your groups...
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className='w-12 h-12 mx-auto text-destructive' />
            <h1 className='text-2xl font-semibold text-destructive'>
              Unable to Join
            </h1>
            <p className='text-muted-foreground'>{message}</p>
            <Button onClick={() => router.push('/groups')} variant='outline'>
              Go to Groups
            </Button>
          </>
        )}
      </div>
    </div>
  );
}