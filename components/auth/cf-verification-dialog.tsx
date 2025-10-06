'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CFVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (handle: string) => void;
}

export default function CFVerificationDialog({
  open,
  onOpenChange,
  onSuccess,
}: CFVerificationDialogProps) {
  const [step, setStep] = useState<'method' | 'oauth' | 'manual'>('method');
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMethodSelect = (method: 'oauth' | 'manual') => {
    setStep(method);
    setError('');
  };

  const handleOAuthVerification = async () => {
    if (!handle.trim()) {
      setError('Please enter your Codeforces handle');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First validate the handle and check eligibility
      const eligibilityResponse = await fetch(
        `/api/cf/eligibility?handle=${encodeURIComponent(handle.trim())}`
      );
      const eligibilityData = await eligibilityResponse.json();

      if (!eligibilityResponse.ok) {
        throw new Error(eligibilityData.error || 'Failed to validate handle');
      }

      if (!eligibilityData.eligible) {
        setError(
          `Insufficient contest participation. This account has participated in ${eligibilityData.contestCount} contests. At least 3 contest participations are required for verification.`
        );
        return;
      }

      // Redirect to OAuth verification
      window.location.href = `/api/cf/oauth/start?handle=${encodeURIComponent(handle.trim())}`;
    } catch (error) {
      console.error('OAuth verification error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to start OAuth verification'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerification = () => {
    // Redirect to manual verification flow
    window.location.href = `/auth/cf-verify?handle=${encodeURIComponent(handle.trim())}`;
  };

  const resetDialog = () => {
    setStep('method');
    setHandle('');
    setError('');
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={newOpen => {
        if (!newOpen) resetDialog();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className='sm:max-w-[600px] bg-slate-900 border-slate-700'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-white'>
            Verify Codeforces Account
          </DialogTitle>
          {step === 'method' && (
            <DialogDescription className='text-slate-300'>
              Choose your preferred method to verify your Codeforces account:
            </DialogDescription>
          )}
        </DialogHeader>

        {step === 'method' && (
          <div className='space-y-4'>
            {/* OAuth Verification Option */}
            <div
              className='p-6 border border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-slate-800/50'
              onClick={() => handleMethodSelect('oauth')}
            >
              <div className='flex items-start gap-4'>
                <div className='flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center'>
                  <Zap className='w-6 h-6 text-white' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    OAuth Verification (Recommended)
                  </h3>
                  <p className='text-slate-300 text-sm mb-4'>
                    Quick and secure verification using Codeforces' official
                    OAuth system. No challenges required - just log in with your
                    Codeforces account.
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    <Badge
                      variant='secondary'
                      className='bg-green-900/30 text-green-400 border-green-700'
                    >
                      <CheckCircle className='w-3 h-3 mr-1' />
                      Instant verification
                    </Badge>
                    <Badge
                      variant='secondary'
                      className='bg-green-900/30 text-green-400 border-green-700'
                    >
                      <Shield className='w-3 h-3 mr-1' />
                      Secure & official
                    </Badge>
                    <Badge
                      variant='secondary'
                      className='bg-green-900/30 text-green-400 border-green-700'
                    >
                      <CheckCircle className='w-3 h-3 mr-1' />
                      No manual steps
                    </Badge>
                  </div>
                </div>
              </div>
              <div className='mt-4 flex justify-end'>
                <Button className='bg-blue-600 hover:bg-blue-700'>
                  Verify with Codeforces OAuth
                  <ArrowRight className='w-4 h-4 ml-2' />
                </Button>
              </div>
            </div>

            {/* Manual Verification Option */}
            <div
              className='p-6 border border-slate-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors bg-slate-800/50'
              onClick={() => handleMethodSelect('manual')}
            >
              <div className='flex items-start gap-4'>
                <div className='flex-shrink-0 w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center'>
                  <Shield className='w-6 h-6 text-white' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-lg font-semibold text-white mb-2'>
                    Manual Verification
                  </h3>
                  <p className='text-slate-300 text-sm mb-4'>
                    Traditional verification method using a contest submission
                    challenge. Requires solving a problem within a time limit.
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    <Badge
                      variant='outline'
                      className='border-yellow-600 text-yellow-400'
                    >
                      <AlertCircle className='w-3 h-3 mr-1' />
                      More work
                    </Badge>
                    <Badge
                      variant='outline'
                      className='border-yellow-600 text-yellow-400'
                    >
                      <Clock className='w-3 h-3 mr-1' />
                      2-minute time limit
                    </Badge>
                  </div>
                </div>
              </div>
              <div className='mt-4 flex justify-end'>
                <Button
                  variant='outline'
                  className='border-purple-600 text-purple-400 hover:bg-purple-600/20'
                >
                  Use Manual Verification
                  <ArrowRight className='w-4 h-4 ml-2' />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'oauth' && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-white mb-2'>
                OAuth Verification
              </h3>
              <p className='text-slate-300 text-sm'>
                Enter your Codeforces handle to validate eligibility for OAuth
                verification:
              </p>
            </div>

            <Alert className='bg-blue-900/30 border-blue-700'>
              <AlertCircle className='h-4 w-4 text-blue-400' />
              <AlertDescription className='text-blue-200'>
                <strong>Requirements:</strong> Your account must have
                participated in at least 3 contests and not be connected to
                another account.
              </AlertDescription>
            </Alert>

            <div className='space-y-4'>
              <div>
                <Label htmlFor='cf-handle' className='text-white'>
                  Codeforces Handle
                </Label>
                <Input
                  id='cf-handle'
                  placeholder='AviraJoshi'
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  className='mt-2 bg-slate-800 border-slate-600 text-white placeholder-slate-400'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleOAuthVerification();
                    }
                  }}
                />
              </div>

              {error && (
                <Alert className='bg-red-900/30 border-red-700'>
                  <AlertCircle className='h-4 w-4 text-red-400' />
                  <AlertDescription className='text-red-200'>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={() => setStep('method')}
                className='flex-1 border-slate-600 text-slate-300 hover:bg-slate-800'
              >
                Cancel
              </Button>
              <Button
                onClick={handleOAuthVerification}
                disabled={loading || !handle.trim()}
                className='flex-1 bg-blue-600 hover:bg-blue-700'
              >
                {loading ? 'Validating...' : 'Validate & Continue'}
              </Button>
            </div>
          </div>
        )}

        {step === 'manual' && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-white mb-2'>
                Manual Verification
              </h3>
              <p className='text-slate-300 text-sm'>
                Enter your Codeforces handle to start the manual verification
                process:
              </p>
            </div>

            <div className='space-y-4'>
              <div>
                <Label htmlFor='cf-handle-manual' className='text-white'>
                  Codeforces Handle
                </Label>
                <Input
                  id='cf-handle-manual'
                  placeholder='Enter your handle...'
                  value={handle}
                  onChange={e => setHandle(e.target.value)}
                  className='mt-2 bg-slate-800 border-slate-600 text-white placeholder-slate-400'
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleManualVerification();
                    }
                  }}
                />
              </div>
            </div>

            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={() => setStep('method')}
                className='flex-1 border-slate-600 text-slate-300 hover:bg-slate-800'
              >
                Cancel
              </Button>
              <Button
                onClick={handleManualVerification}
                disabled={!handle.trim()}
                className='flex-1 bg-purple-600 hover:bg-purple-700'
              >
                Start Manual Verification
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
