'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  Loader2,
} from 'lucide-react';

export default function ProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [handle, setHandle] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [maxRating, setMaxRating] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cfSettingsUrl = 'https://codeforces.com/settings/social';

  useEffect(() => {
    const checkOnMount = async () => {
      setChecking(true);
      try {
        const res = await fetch('/api/cf/verify/check', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
          if (data?.verified) {
            setVerified(true);
            if (typeof data.rating === 'number') setRating(data.rating);
            if (typeof data.maxRating === 'number')
              setMaxRating(data.maxRating);
          } else {
            setVerified(false);
          }
        } else {
          if (data?.error === 'no handle to verify') {
            setVerified(null);
          } else {
            setError(data?.error || 'Unable to check verification');
          }
        }
      } catch (e: any) {
        setError(e?.message || 'Unable to check verification');
      } finally {
        setChecking(false);
      }
    };
    checkOnMount();
  }, []);

  const canStart = useMemo(() => handle.trim().length >= 2, [handle]);

  async function startVerification() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cf/verify/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim() }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error || 'Failed to start verification');
      setToken(data.token);
      setVerified(false);
      toast({
        title: 'Verification started',
        description:
          'Copy the token and paste it into your Codeforces Organization field, then click Check.',
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to start verification');
      toast({
        title: 'Error',
        description: e?.message || 'Failed to start verification',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function checkVerification() {
    setChecking(true);
    setError(null);
    try {
      const res = await fetch('/api/cf/verify/check', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === 'no handle to verify') {
          setVerified(null);
          setToken(null);
          throw new Error('No handle found. Please start verification first.');
        }
        throw new Error(data?.error || 'Verification check failed');
      }
      if (data?.verified) {
        setVerified(true);
        setToken(null);
        setRating(typeof data.rating === 'number' ? data.rating : null);
        setMaxRating(
          typeof data.maxRating === 'number' ? data.maxRating : null
        );
        toast({
          title: 'Handle verified',
          description: 'Your Codeforces handle is now verified.',
        });
      } else {
        setVerified(false);
        toast({
          title: 'Not verified yet',
          description:
            'Token not found in your Organization field. Paste it and try again.',
        });
      }
    } catch (e: any) {
      setError(e?.message || 'Verification check failed');
      toast({
        title: 'Error',
        description: e?.message || 'Verification check failed',
        variant: 'destructive',
      });
    } finally {
      setChecking(false);
    }
  }

  function copyToken() {
    if (!token) return;
    navigator.clipboard.writeText(token).then(() => {
      toast({
        title: 'Token copied',
        description: 'Paste it into your Codeforces Organization field.',
      });
    });
  }

  return (
    <main className='min-h-screen w-full '>
      <div className='mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header Section */}
        <header className='mb-8 animate-in fade-in slide-in-from-top-4 duration-500'>
          <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>
            Profile
          </h1>
          <p className='mt-3 text-base text-muted-foreground max-w-2xl'>
            Link and verify your Codeforces handle to earn a verified badge,
            improve recommendations, and appear on leaderboards.
          </p>
        </header>

        <div className='grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100'>
          {/* Verification Card */}
          <Card className='border-2 transition-all hover:shadow-lg'>
            <CardHeader className='space-y-1'>
              <CardTitle className='text-2xl'>
                Codeforces Verification
              </CardTitle>
              <CardDescription className='text-base'>
                Link your CF handle and verify ownership with a one-time token.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Status Section */}
              <div className='rounded-lg border bg-muted/50 p-4 transition-all'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <span className='text-sm font-medium text-muted-foreground'>
                      Verification Status
                    </span>
                    {checking ? (
                      <Badge variant='secondary' className='gap-1.5'>
                        <Loader2 className='h-3 w-3 animate-spin' />
                        Checking...
                      </Badge>
                    ) : verified ? (
                      <Badge className='bg-green-600 hover:bg-green-600/90 gap-1.5 transition-all'>
                        <CheckCircle2 className='h-3 w-3' />
                        Verified
                      </Badge>
                    ) : verified === false ? (
                      <Badge variant='secondary' className='gap-1.5'>
                        <Clock className='h-3 w-3' />
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant='outline' className='gap-1.5'>
                        <AlertCircle className='h-3 w-3' />
                        Not linked
                      </Badge>
                    )}
                  </div>
                  {verified && (rating !== null || maxRating !== null) && (
                    <div className='flex gap-4 text-sm'>
                      {rating !== null && (
                        <div className='text-right'>
                          <div className='text-muted-foreground'>
                            Current Rating
                          </div>
                          <div className='text-lg font-semibold'>{rating}</div>
                        </div>
                      )}
                      {maxRating !== null && (
                        <div className='text-right'>
                          <div className='text-muted-foreground'>
                            Max Rating
                          </div>
                          <div className='text-lg font-semibold text-primary'>
                            {maxRating}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Handle Input Section */}
              <div className='space-y-3'>
                <Label htmlFor='handle' className='text-base font-medium'>
                  Codeforces Handle
                </Label>
                <div className='flex flex-col sm:flex-row gap-3'>
                  <Input
                    id='handle'
                    placeholder='e.g. tourist'
                    value={handle}
                    onChange={e => setHandle(e.target.value)}
                    className='flex-1 h-11 text-base transition-all focus:ring-2'
                    disabled={loading}
                  />
                  <Button
                    onClick={startVerification}
                    disabled={!canStart || loading}
                    className='h-11 px-6 transition-all hover:scale-105 active:scale-95'
                    size='lg'
                  >
                    {loading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Starting...
                      </>
                    ) : (
                      'Start Verification'
                    )}
                  </Button>
                </div>
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  We'll create a one-time token. Paste it in{' '}
                  <span className='font-medium'>
                    Codeforces → Settings → Social → Organization
                  </span>
                  .
                </p>
              </div>

              {/* Token Display Section */}
              {token && (
                <div className='space-y-4 rounded-lg border-2 border-primary/20 bg-primary/5 p-5 animate-in fade-in slide-in-from-top-2 duration-300'>
                  <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
                    <div className='space-y-1'>
                      <div className='text-base font-semibold flex items-center gap-2'>
                        <CheckCircle2 className='h-4 w-4 text-primary' />
                        Verification Token
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        Paste this token into your CF Organization field, save,
                        then click Check below.
                      </div>
                    </div>
                    <Button
                      variant='secondary'
                      onClick={copyToken}
                      className='transition-all hover:scale-105 active:scale-95 whitespace-nowrap'
                      size='sm'
                    >
                      <Copy className='mr-2 h-4 w-4' />
                      Copy Token
                    </Button>
                  </div>

                  <code className='block rounded-md bg-black/40 px-4 py-3 text-sm font-mono break-all border'>
                    {token}
                  </code>

                  <div className='flex flex-col sm:flex-row gap-3 pt-2'>
                    <Button
                      asChild
                      variant='outline'
                      className='flex-1 transition-all hover:scale-105'
                      size='lg'
                    >
                      <Link
                        href={cfSettingsUrl}
                        target='_blank'
                        rel='noreferrer'
                      >
                        <ExternalLink className='mr-2 h-4 w-4' />
                        Open Codeforces Settings
                      </Link>
                    </Button>
                    <Button
                      onClick={checkVerification}
                      disabled={checking}
                      className='flex-1 transition-all hover:scale-105 active:scale-95'
                      size='lg'
                    >
                      {checking ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Checking...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className='mr-2 h-4 w-4' />
                          Check Verification
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Manual Check Section */}
              {!token && (
                <div className='flex flex-col sm:flex-row gap-3'>
                  <Button
                    variant='outline'
                    onClick={checkVerification}
                    disabled={checking}
                    className='flex-1 h-11 transition-all hover:scale-105'
                  >
                    {checking ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Checking...
                      </>
                    ) : (
                      'Check Verification Status'
                    )}
                  </Button>
                  <Button
                    asChild
                    variant='ghost'
                    className='flex-1 h-11 transition-all hover:scale-105'
                  >
                    <Link href={cfSettingsUrl} target='_blank' rel='noreferrer'>
                      <ExternalLink className='mr-2 h-4 w-4' />
                      Open CF Settings
                    </Link>
                  </Button>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className='rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300'>
                  <div className='flex gap-3'>
                    <AlertCircle className='h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5' />
                    <div>
                      <p className='text-sm font-medium text-red-800 dark:text-red-200'>
                        Verification Error
                      </p>
                      <p className='text-sm text-red-700 dark:text-red-300 mt-1'>
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className='border transition-all hover:shadow-lg'>
            <CardHeader className='space-y-1'>
              <CardTitle className='text-2xl'>Preferences</CardTitle>
              <CardDescription className='text-base'>
                Set your training defaults and notification preferences (coming
                soon).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='rounded-lg border border-dashed bg-muted/30 p-8 text-center'>
                <Clock className='mx-auto h-12 w-12 text-muted-foreground/50 mb-3' />
                <p className='text-sm text-muted-foreground max-w-md mx-auto'>
                  Customization options will be available after completing your
                  Codeforces verification.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
