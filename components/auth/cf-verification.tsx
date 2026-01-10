'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  Clock,
  Loader2,
  Shield,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CFVerificationV3Props {
  onVerificationComplete?: (handle: string, rating: number) => void;
  className?: string;
}

type VerificationState = 'initial' | 'pending' | 'verified';

interface VerificationStatus {
  state: VerificationState;
  handle?: string;
  token?: string;
  expiresAt?: string;
  rating?: number;
  maxRating?: number;
}

const AUTO_CHECK_INTERVAL = 10000;

export function CFVerificationV3({
  onVerificationComplete,
  className,
}: CFVerificationV3Props) {
  const [state, setState] = useState<VerificationState>('initial');
  const [handle, setHandle] = useState('');
  const [token, setToken] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [verifiedHandle, setVerifiedHandle] = useState('');
  const [rating, setRating] = useState(0);
  const [maxRating, setMaxRating] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [copied, setCopied] = useState(false);

  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoCheckRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = useCallback(() => {
    if (autoCheckRef.current) {
      clearInterval(autoCheckRef.current);
      autoCheckRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/cf/verify/status');
      const data = await response.json();

      if (!response.ok) {
        if (response.status !== 404) {
          throw new Error(data.error || 'Failed to fetch status');
        }
        setState('initial');
        return;
      }

      const status: VerificationStatus = data;

      if (status.state === 'verified' && status.handle) {
        setState('verified');
        setVerifiedHandle(status.handle);
        setRating(status.rating || 0);
        setMaxRating(status.maxRating || 0);
        clearTimers();
      } else if (status.state === 'pending' && status.token && status.handle) {
        setState('pending');
        setHandle(status.handle);
        setToken(status.token);
        if (status.expiresAt) {
          setExpiresAt(new Date(status.expiresAt));
        }
      } else {
        setState('initial');
      }
    } catch (err) {
      console.error('Failed to fetch verification status:', err);
      setState('initial');
    } finally {
      setIsLoadingStatus(false);
    }
  }, [clearTimers]);

  useEffect(() => {
    fetchStatus();
    return () => clearTimers();
  }, [fetchStatus, clearTimers]);

  useEffect(() => {
    if (state !== 'pending' || !expiresAt) {
      clearTimers();
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        setError('Verification token has expired. Please start again.');
        setState('initial');
        clearTimers();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    countdownRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [state, expiresAt, clearTimers]);

  const checkVerification = useCallback(async () => {
    if (isChecking) return;

    setIsChecking(true);
    setError(null);

    try {
      const response = await fetch('/api/cf/verify/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification check failed');
      }

      if (data.verified) {
        setState('verified');
        setVerifiedHandle(data.handle || handle);
        setRating(data.rating || 0);
        setMaxRating(data.maxRating || 0);
        clearTimers();
        onVerificationComplete?.(data.handle || handle, data.rating || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification check failed');
    } finally {
      setIsChecking(false);
    }
  }, [handle, isChecking, clearTimers, onVerificationComplete]);

  useEffect(() => {
    if (state !== 'pending') return;

    autoCheckRef.current = setInterval(() => {
      checkVerification();
    }, AUTO_CHECK_INTERVAL);

    return () => {
      if (autoCheckRef.current) {
        clearInterval(autoCheckRef.current);
      }
    };
  }, [state, checkVerification]);

  const startVerification = async () => {
    if (!handle.trim()) {
      setError('Please enter your Codeforces handle');
      return;
    }

    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch('/api/cf/verify/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start verification');
      }

      setToken(data.token);
      if (data.expiresAt) {
        setExpiresAt(new Date(data.expiresAt));
      }
      setState('pending');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start verification');
    } finally {
      setIsStarting(false);
    }
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy token to clipboard');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isStarting) {
      startVerification();
    }
  };

  if (isLoadingStatus) {
    return (
      <Card className={cn('border-border', className)}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (state === 'verified') {
    return (
      <Card className={cn('border-green-500/30 bg-green-500/5', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            Codeforces Verified
          </CardTitle>
          <CardDescription>
            Your Codeforces account has been successfully linked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">
                  {verifiedHandle}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Rating: <span className="font-medium text-foreground">{rating}</span>
                {maxRating > 0 && maxRating !== rating && (
                  <span className="ml-2">
                    (Max: <span className="font-medium">{maxRating}</span>)
                  </span>
                )}
              </div>
            </div>
            <a
              href={`https://codeforces.com/profile/${verifiedHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state === 'pending') {
    return (
      <Card className={cn('border-blue-500/30', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Verification Pending
              </CardTitle>
              <CardDescription>
                Verifying handle: <strong>{handle}</strong>
              </CardDescription>
            </div>
            {timeRemaining && (
              <Badge
                variant="outline"
                className={cn(
                  'font-mono',
                  timeRemaining === 'Expired' && 'border-destructive text-destructive'
                )}
              >
                {timeRemaining}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Verification Token</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-border bg-muted/50 px-4 py-3">
                <code className="font-mono text-sm text-foreground">{token}</code>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToken}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Follow these steps:</p>
                <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                  <li>Copy the verification token above</li>
                  <li>
                    Go to your{' '}
                    <a
                      href="https://codeforces.com/settings/social"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-500 underline-offset-4 hover:underline"
                    >
                      Codeforces settings
                    </a>
                  </li>
                  <li>Paste the token in the "Organization" field</li>
                  <li>Save your settings and click "Check Verification" below</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              variant="outline"
              asChild
              className="flex-1"
            >
              <a
                href="https://codeforces.com/settings/social"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open CF Settings
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              onClick={checkVerification}
              disabled={isChecking}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Verification
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Auto-checking every 10 seconds
          </p>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearTimers();
              setState('initial');
              setToken('');
              setExpiresAt(null);
              setError(null);
            }}
            className="w-full text-muted-foreground"
          >
            Cancel and start over
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-border', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          Verify Codeforces Handle
        </CardTitle>
        <CardDescription>
          Link your Codeforces account to unlock personalized features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cf-handle-v3">Codeforces Handle</Label>
          <Input
            id="cf-handle-v3"
            placeholder="e.g. tourist"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStarting}
          />
        </div>

        <Button
          onClick={startVerification}
          disabled={!handle.trim() || isStarting}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isStarting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting Verification...
            </>
          ) : (
            'Start Verification'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
