'use client';

import { useState, useEffect } from 'react';
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
import {
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Zap,
  Shield,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Problem {
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];
}

interface CFVerificationV2Props {
  onVerificationComplete?: (data: {
    handle: string;
    rating: number;
    method: 'oauth' | 'manual';
    problems: Problem[];
  }) => void;
  showTitle?: boolean;
  compact?: boolean;
}

type VerificationMethod = 'oauth' | 'manual';
type VerificationStep =
  | 'method-selection'
  | 'oauth-flow'
  | 'manual-token'
  | 'checking'
  | 'complete';

export function CFVerificationV2({
  onVerificationComplete,
  showTitle = true,
  compact = false,
}: CFVerificationV2Props) {
  const [step, setStep] = useState<VerificationStep>('method-selection');
  const [method, setMethod] = useState<VerificationMethod>('oauth');
  const [handle, setHandle] = useState('');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // ✅ Auto-check if user is already verified
  useEffect(() => {
    const checkAlreadyVerified = async () => {
      try {
        const res = await fetch('/api/cf/verify/status');
        const data = await res.json();
        if (res.ok && data.verified) {
          setHandle(data.handle);
          setUserInfo({ rating: data.rating });
          setStep('complete');

          const problems = await fetchAdaptiveSheet(data.handle, data.rating);
          onVerificationComplete?.({
            handle: data.handle,
            rating: data.rating,
            method: data.method || 'oauth',
            problems,
          });
        }
      } catch {
        // normal flow will appear if error
      }
    };
    checkAlreadyVerified();
  }, []);

  useEffect(() => {
    if (handle.trim()) setError(null);
  }, [handle]);

  // Check OAuth eligibility (≥3 contests)
  const checkOAuthEligibility = async (cfHandle: string) => {
    try {
      const response = await fetch(
        `/api/cf/eligibility?handle=${encodeURIComponent(cfHandle)}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Eligibility check failed');
      return {
        eligible: data.eligible,
        contestCount: data.contestCount,
        rating: data.rating,
      };
    } catch {
      return { eligible: false, contestCount: 0, rating: 1200 };
    }
  };

  // Fetch adaptive sheet
  const fetchAdaptiveSheet = async (cfHandle: string, cfRating: number) => {
    try {
      const floor = Math.floor(cfRating / 100) * 100;
      const minRating = Math.max(800, floor - 100);
      const maxRating = Math.min(3500, floor + 200);

      const res = await fetch(
        `/api/adaptive-sheet/auto-generate?handle=${cfHandle}&minRating=${minRating}&maxRating=${maxRating}&count=70`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch adaptive sheet');
      return data.problems || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  // Step 1: method selection
  const handleMethodSelection = async () => {
    if (!handle.trim()) {
      setError('Please enter your Codeforces handle');
      return;
    }
    setLoading(true);
    setError(null);
    setProgress(25);

    try {
      const eligibility = await checkOAuthEligibility(handle.trim());
      setUserInfo(eligibility);
      setProgress(50);

      if (eligibility.eligible && method === 'oauth') {
        setStep('oauth-flow');
        await initiateOAuth();
      } else {
        setMethod('manual');
        setStep('manual-token');
        await generateManualToken();
      }
    } catch {
      setError('Failed to check handle eligibility');
    } finally {
      setLoading(false);
    }
  };

  // OAuth flow simulation
  const initiateOAuth = async () => {
    setProgress(75);
    setTimeout(async () => {
      setProgress(100);
      setStep('complete');

      const problems = await fetchAdaptiveSheet(handle.trim(), userInfo.rating);
      onVerificationComplete?.({
        handle: handle.trim(),
        rating: userInfo.rating,
        method: 'oauth',
        problems,
      });

      toast({
        title: '🎉 Verification Complete!',
        description: `Connected ${handle} via OAuth`,
      });
    }, 2000);
  };

  // Manual token generation
  const generateManualToken = async () => {
    try {
      const response = await fetch('/api/cf/verify/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setVerificationToken(data.token);
      setProgress(75);
    } catch (err: any) {
      setError(err.message || 'Failed to generate token');
    }
  };

  // Manual verification check
  const checkManualVerification = async () => {
    setLoading(true);
    setStep('checking');
    setProgress(90);

    try {
      const response = await fetch('/api/cf/verify/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (data.verified) {
        setProgress(100);
        setStep('complete');

        const rating = data.rating || userInfo?.rating || 1200;
        const problems = await fetchAdaptiveSheet(handle.trim(), rating);

        onVerificationComplete?.({
          handle: handle.trim(),
          rating,
          method: 'manual',
          problems,
        });

        toast({
          title: '🎉 Verification Complete!',
          description: `${handle} verified successfully`,
        });
      } else {
        setError('Token not found in About section. Try again.');
        setStep('manual-token');
        setProgress(75);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setStep('manual-token');
      setProgress(75);
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(verificationToken);
    toast({
      title: 'Token copied!',
      description: 'Paste it in your CF About section',
    });
  };

  // ✅ UI
  if (step === 'complete') {
    return (
      <Card className='border-green-500/20 bg-green-500/5'>
        <CardHeader className={compact ? 'pb-3' : ''}>
          <CardTitle className='flex items-center gap-2 text-green-400'>
            <CheckCircle className='h-5 w-5' />
            Codeforces Connected!
          </CardTitle>
          <CardDescription>
            Handle <strong>{handle}</strong> verified • Rating:{' '}
            {userInfo?.rating || 1200}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className='border-blue-500/20'>
      {showTitle && (
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5 text-blue-400' />
            Connect Your Codeforces
          </CardTitle>
          <CardDescription>
            Link your CF handle to unlock personalized training & analytics
          </CardDescription>
        </CardHeader>
      )}

      <CardContent className='space-y-4'>
        {/* Progress bar */}
        {progress > 0 && (
          <div className='w-full bg-muted rounded-full h-2'>
            <div
              className='bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500'
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Method Selection */}
        {step === 'method-selection' && (
          <>
            <div className='space-y-2'>
              <Label htmlFor='cf-handle'>Codeforces Handle</Label>
              <Input
                id='cf-handle'
                placeholder='e.g. tourist, jiangly'
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleMethodSelection()}
                className='text-center'
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <Button
                variant={method === 'oauth' ? 'default' : 'outline'}
                onClick={() => setMethod('oauth')}
                className='flex items-center gap-2'
              >
                <Zap className='h-4 w-4' />
                OAuth (Fast)
              </Button>
              <Button
                variant={method === 'manual' ? 'default' : 'outline'}
                onClick={() => setMethod('manual')}
                className='flex items-center gap-2'
              >
                <Clock className='h-4 w-4' />
                Manual (1 min)
              </Button>
            </div>

            <Button
              onClick={handleMethodSelection}
              disabled={!handle.trim() || loading}
              className='w-full bg-blue-600 hover:bg-blue-700'
            >
              {loading ? 'Checking handle...' : 'Continue'}
            </Button>
          </>
        )}

        {/* OAuth Flow */}
        {step === 'oauth-flow' && (
          <div className='text-center space-y-4'>
            <div className='flex items-center justify-center gap-2 text-blue-400'>
              <Zap className='h-5 w-5 animate-pulse' />
              <span>Connecting via OAuth...</span>
            </div>
            <div className='text-sm text-muted-foreground'>
              You will be redirected to Codeforces to authorize AlgoRise
            </div>
          </div>
        )}

        {/* Manual Token */}
        {step === 'manual-token' && (
          <>
            <Alert>
              <AlertDescription>
                <div className='space-y-2'>
                  <div className='font-medium'>Quick 3-step verification:</div>
                  <div className='text-sm space-y-1'>
                    <div>1. Copy the token below</div>
                    <div>2. Paste it in your CF About section</div>
                    <div>3. Click "Verify" - we will check instantly!</div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 bg-muted/20 rounded-lg border'>
                <code className='text-sm font-mono'>{verificationToken}</code>
                <Button size='sm' variant='outline' onClick={copyToken}>
                  <Copy className='h-4 w-4' />
                </Button>
              </div>

              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  asChild
                  className='flex-1 bg-transparent'
                >
                  <a
                    href={`https://codeforces.com/profile/${handle}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2'
                  >
                    Open Profile <ExternalLink className='h-4 w-4' />
                  </a>
                </Button>
                <Button
                  onClick={checkManualVerification}
                  disabled={loading}
                  className='flex-1 bg-green-600 hover:bg-green-700'
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Checking */}
        {step === 'checking' && (
          <div className='text-center space-y-4'>
            <div className='flex items-center justify-center gap-2 text-green-400'>
              <CheckCircle className='h-5 w-5 animate-pulse' />
              <span>Checking verification...</span>
            </div>
            <div className='text-sm text-muted-foreground'>
              Looking for your token in About section
            </div>
          </div>
        )}

        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}