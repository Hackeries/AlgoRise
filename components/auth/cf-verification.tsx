'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useCFVerification } from '@/lib/context/cf-verification';

interface CFVerificationProps {
  currentHandle?: string;
  isVerified?: boolean;
  onVerificationComplete?: () => void;
}

export function CFVerification({
  currentHandle,
  isVerified: propIsVerified,
  onVerificationComplete,
}: CFVerificationProps) {
  const {
    isVerified: globalIsVerified,
    verificationData,
    resetVerificationUI,
  } = useCFVerification();
  const [handle, setHandle] = useState(
    currentHandle || verificationData?.handle || ''
  );
  const [verificationToken, setVerificationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use global verification status, fallback to prop
  const isActuallyVerified = globalIsVerified || propIsVerified;
  const displayHandle = verificationData?.handle || currentHandle || handle;

  const [step, setStep] = useState<'input' | 'verify' | 'complete'>(
    isActuallyVerified ? 'complete' : displayHandle ? 'verify' : 'input'
  );

  const generateToken = async () => {
    if (!handle.trim()) {
      setError('Please enter your Codeforces handle');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cf/verify/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate verification token');
      }

      setVerificationToken(data.token);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkVerification = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cf/verify/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setStep('complete');
      onVerificationComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'complete' || isActuallyVerified) {
    return (
      <Card className='border-green-200 bg-green-50'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-green-700'>
            <CheckCircle className='h-5 w-5' />
            Codeforces Verified
          </CardTitle>
          <CardDescription>
            Your Codeforces handle <strong>{displayHandle}</strong> has been
            verified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-2'>
            <Button variant='outline' size='sm' asChild>
              <a
                href={`https://codeforces.com/profile/${displayHandle}`}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-1'
              >
                View Profile <ExternalLink className='h-3 w-3' />
              </a>
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                resetVerificationUI();
                setStep('input');
                setHandle('');
                setError(null);
              }}
            >
              Re-verify
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <AlertCircle className='h-5 w-5 text-orange-500' />
          Verify Codeforces Handle
        </CardTitle>
        <CardDescription>
          Connect your Codeforces account to unlock advanced features and
          analytics
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {step === 'input' && (
          <>
            <div className='space-y-2'>
              <Label htmlFor='cf-handle'>Codeforces Handle</Label>
              <Input
                id='cf-handle'
                placeholder='your_handle'
                value={handle}
                onChange={e => setHandle(e.target.value)}
              />
            </div>
            <Button
              onClick={generateToken}
              disabled={loading}
              className='w-full'
            >
              {loading ? 'Generating...' : 'Generate Verification Token'}
            </Button>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>
                  Or
                </span>
              </div>
            </div>

            <Button
              variant='outline'
              onClick={() => {
                if (!handle.trim()) {
                  setError('Please enter your Codeforces handle first');
                  return;
                }
                window.open(
                  `/api/cf/oauth/start?handle=${handle.trim()}`,
                  '_blank'
                );
              }}
              disabled={loading}
              className='w-full'
            >
              Quick Verify with OAuth
            </Button>
          </>
        )}

        {step === 'verify' && (
          <>
            <Alert>
              <AlertDescription>
                <strong>Step 1:</strong> Copy this verification token:
                <code className='block mt-2 p-2 bg-muted rounded text-sm font-mono'>
                  {verificationToken}
                </code>
              </AlertDescription>
            </Alert>

            <Alert>
              <AlertDescription>
                <strong>Step 2:</strong> Add this token to your Codeforces
                profile's "About" section.
                <Button variant='link' className='p-0 h-auto ml-2' asChild>
                  <a
                    href={`https://codeforces.com/profile/${handle}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1'
                  >
                    Open Profile <ExternalLink className='h-3 w-3' />
                  </a>
                </Button>
              </AlertDescription>
            </Alert>

            <Button
              onClick={checkVerification}
              disabled={loading}
              className='w-full'
            >
              {loading ? 'Verifying...' : 'Check Verification'}
            </Button>
          </>
        )}

        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
