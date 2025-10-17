'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Eye,
  EyeOff,
  Github,
  Lock,
  Mail,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import Image from 'next/image';

type AuthMode = 'signin' | 'signup';

type OAuthProvider = 'google' | 'github';

interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  onOpenChange: (open: boolean) => void;
}

const GoogleIcon = () => (
  <svg className='h-4 w-4' viewBox='0 0 533.5 544.3'>
    <path
      d='M533.5 278.4c0-17.3-1.4-34-4.1-50.3H272v95.2h146.9c-6.3 34-25 62.8-53.4 82.1v68.1h86.3c50.6-46.6 79.7-115.4 79.7-195.1z'
      fill='#4285F4'
    />
    <path
      d='M272 544.3c72.6 0 133.5-24.1 178-65.5l-86.3-68.1c-24 16.1-54.6 25.5-91.7 25.5-70.5 0-130.3-47.6-151.7-111.4H32.2v69.8C76.6 487 168.6 544.3 272 544.3z'
      fill='#34A853'
    />
    <path
      d='M120.3 330.7c-5.7-16.8-9-34.8-9-53.2s3.3-36.4 9-53.2v-69.8H32.2c-18.3 36.6-28.8 77.7-28.8 122s10.5 85.4 28.8 122l88.1-69.8z'
      fill='#FBBC05'
    />
    <path
      d='M272 107.7c38.9 0 73.9 13.4 101.5 39.5l76.2-76.2C404.6 24.4 343.6 0 272 0 168.6 0 76.6 57.3 32.2 142.1l88.1 69.8z'
      fill='#EA4335'
    />
  </svg>
);

const buildOrigin = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';
};

export function AuthModal({ open, mode, onModeChange, onOpenChange }: AuthModalProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const supabaseConfigured = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return false;
    return !url.includes('your-project-ref') && !key.includes('your-anon-key');
  }, []);

  const [activeTab, setActiveTab] = useState<AuthMode>(mode);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInShowPassword, setSignInShowPassword] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signInLoading, setSignInLoading] = useState(false);

  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpShowPassword, setSignUpShowPassword] = useState(false);
  const [signUpShowConfirm, setSignUpShowConfirm] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpLoading, setSignUpLoading] = useState(false);

  const [oauthLoading, setOauthLoading] = useState<
    { provider: OAuthProvider; context: AuthMode } | null
  >(null);

  useEffect(() => {
    if (open) {
      setActiveTab(mode);
    }
  }, [mode, open]);

  const handleTabChange = (value: string) => {
    const nextMode = (value as AuthMode) || 'signin';
    setActiveTab(nextMode);
    onModeChange?.(nextMode);
    setSignInError(null);
    setSignUpError(null);
  };

  const handleOAuth = async (provider: OAuthProvider, context: AuthMode) => {
    if (!supabaseConfigured) return;
    setOauthLoading({ provider, context });
    context === 'signin' ? setSignInError(null) : setSignUpError(null);
    try {
      const supabase = createClient();
      const origin = buildOrigin();
      const nextPath = context === 'signin' ? '/profile' : '/auth/sign-up-success';
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}&o=${encodeURIComponent(origin)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) throw error;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to start social sign-in right now.';
      context === 'signin' ? setSignInError(message) : setSignUpError(message);
    } finally {
      setOauthLoading(null);
    }
  };

  const handleEmailSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabaseConfigured) return;
    setSignInError(null);
    setSignInLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail.trim(),
        password: signInPassword,
      });
      if (error) throw error;
      await refreshUser();
      onOpenChange(false);
      router.push('/profile');
    } catch (error) {
      setSignInError(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setSignInLoading(false);
    }
  };

  const handleEmailSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabaseConfigured) return;
    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match.');
      return;
    }
    setSignUpError(null);
    setSignUpLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: signUpEmail.trim(),
        password: signUpPassword,
        options: {
          emailRedirectTo: `${buildOrigin()}/auth/sign-up-success`,
        },
      });
      if (error) throw error;
      onOpenChange(false);
      router.push('/auth/sign-up-success');
    } catch (error) {
      setSignUpError(error instanceof Error ? error.message : 'Unable to create your account.');
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className='max-w-xs border border-border/20 bg-gradient-to-br from-background/95 via-background/90 to-background/95 p-0 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] ring-1 ring-border/10'
      >
        <VisuallyHidden>
          <DialogTitle>Authentication</DialogTitle>
        </VisuallyHidden>
        <div className='relative overflow-hidden'>
          {/* Gradient overlay */}
          <div className='absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none' />
          
          {/* Animated background pattern */}
          {/* Enhanced glowing background animation */}
          <div className='absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden'>
            <div className='absolute top-1/4 left-1/4 w-40 h-40 bg-primary rounded-full blur-[100px] animate-pulse' />
            <div className='absolute bottom-1/4 right-1/4 w-32 h-32 bg-blue-500 rounded-full blur-[80px] animate-pulse delay-1000' />
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-500 rounded-full blur-[60px] animate-pulse delay-500' />
          </div>

          <div className='relative p-6 space-y-6'>
            <div className='text-center space-y-3'>
              {/* Just the logo with glow effect */}
              <div className='flex justify-center mb-6'>
                <div className='relative'>
                  <div className='absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse'></div>
                  <Image
                    src="/algorise-logo.png"
                    alt="AlgoRise"
                    width={64}
                    height={64}
                    className="relative object-contain"
                  />
                </div>
              </div>
              <h2 className='text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent'>
                {activeTab === 'signin' ? 'Welcome back' : 'Join AlgoRise'}
              </h2>
              <p className='text-sm text-muted-foreground/80 leading-relaxed'>
                {activeTab === 'signin' 
                  ? 'Continue your competitive programming journey' 
                  : 'Start mastering algorithms and data structures'
                }
              </p>
            </div>

          {!supabaseConfigured && (
            <Alert className='border-amber-500/50 bg-amber-500/10 backdrop-blur-sm rounded-xl'>
              <AlertTitle className='text-amber-600 dark:text-amber-400'>Authentication not configured</AlertTitle>
              <AlertDescription className='text-xs text-amber-600/80 dark:text-amber-400/80'>
                Supabase credentials needed for authentication.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange} className='space-y-4'>
            <TabsList className='grid w-full grid-cols-2 h-10 bg-muted/30 backdrop-blur-sm rounded-xl border border-border/20'>
              <TabsTrigger 
                value='signin' 
                className='rounded-lg font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border/20'
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value='signup'
                className='rounded-lg font-medium text-sm transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-border/20'
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value='signin' className='space-y-4 mt-4'>
              <div className='grid grid-cols-2 gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={!supabaseConfigured || oauthLoading !== null}
                  onClick={() => handleOAuth('google', 'signin')}
                  className='relative flex items-center justify-center gap-2 h-11 bg-background/50 border-border/40 hover:bg-background/80 hover:border-border/60 transition-all duration-200 backdrop-blur-sm'
                >
                  {oauthLoading?.provider === 'google' && oauthLoading?.context === 'signin' ? (
                    <LoaderIcon />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span className='font-medium'>Google</span>
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={!supabaseConfigured || oauthLoading !== null}
                  onClick={() => handleOAuth('github', 'signin')}
                  className='relative flex items-center justify-center gap-2 h-11 bg-background/50 border-border/40 hover:bg-background/80 hover:border-border/60 transition-all duration-200 backdrop-blur-sm'
                >
                  {oauthLoading?.provider === 'github' && oauthLoading?.context === 'signin' ? (
                    <LoaderIcon />
                  ) : (
                    <Github className='h-4 w-4' />
                  )}
                  <span className='font-medium'>GitHub</span>
                </Button>
              </div>

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t border-border/30' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-3 text-muted-foreground/60 font-medium tracking-wider'>or continue with email</span>
                </div>
              </div>

              <form className='space-y-5' onSubmit={handleEmailSignIn}>
                <div className='space-y-2'>
                  <Label htmlFor='signin-email' className='text-sm font-medium text-foreground/90'>Email</Label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60' />
                    <Input
                      id='signin-email'
                      type='email'
                      placeholder='you@example.com'
                      value={signInEmail}
                      onChange={event => setSignInEmail(event.target.value)}
                      disabled={!supabaseConfigured || signInLoading}
                      className='pl-10 h-11 bg-background/50 border-border/40 focus:bg-background/80 focus:border-primary/50 transition-all duration-200 backdrop-blur-sm'
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='signin-password' className='text-sm font-medium text-foreground/90'>Password</Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60' />
                    <Input
                      id='signin-password'
                      type={signInShowPassword ? 'text' : 'password'}
                      placeholder='Enter your password'
                      value={signInPassword}
                      onChange={event => setSignInPassword(event.target.value)}
                      disabled={!supabaseConfigured || signInLoading}
                      className='pl-10 pr-10 h-11 bg-background/50 border-border/40 focus:bg-background/80 focus:border-primary/50 transition-all duration-200 backdrop-blur-sm'
                    />
                    <button
                      type='button'
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 hover:text-foreground/80 transition-colors'
                      onClick={() => setSignInShowPassword(prev => !prev)}
                    >
                      {signInShowPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </button>
                  </div>
                </div>
                {signInError && (
                  <div className='p-3 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm'>
                    <p className='text-sm text-red-500 dark:text-red-400'>{signInError}</p>
                  </div>
                )}
                <Button
                  type='submit'
                  disabled={!supabaseConfigured || signInLoading || !signInEmail || !signInPassword}
                  className='w-full h-11 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all duration-200'
                >
                  <div className='flex items-center justify-center gap-2'>
                    {signInLoading ? <LoaderIcon /> : <Mail className='h-4 w-4' />}
                    {signInLoading ? 'Signing in...' : 'Sign In'}
                  </div>
                </Button>
              </form>
            </TabsContent>

            <TabsContent value='signup' className='space-y-4 mt-4'>
              <div className='grid grid-cols-2 gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={!supabaseConfigured || oauthLoading !== null}
                  onClick={() => handleOAuth('google', 'signup')}
                  className='relative flex items-center justify-center gap-2 h-11 bg-background/50 border-border/40 hover:bg-background/80 hover:border-border/60 transition-all duration-200 backdrop-blur-sm'
                >
                  {oauthLoading?.provider === 'google' && oauthLoading?.context === 'signup' ? (
                    <LoaderIcon />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span className='font-medium'>Google</span>
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  disabled={!supabaseConfigured || oauthLoading !== null}
                  onClick={() => handleOAuth('github', 'signup')}
                  className='relative flex items-center justify-center gap-2 h-11 bg-background/50 border-border/40 hover:bg-background/80 hover:border-border/60 transition-all duration-200 backdrop-blur-sm'
                >
                  {oauthLoading?.provider === 'github' && oauthLoading?.context === 'signup' ? (
                    <LoaderIcon />
                  ) : (
                    <Github className='h-4 w-4' />
                  )}
                  <span className='font-medium'>GitHub</span>
                </Button>
              </div>

              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <span className='w-full border-t border-border/30' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-background px-3 text-muted-foreground/60 font-medium tracking-wider'>or create with email</span>
                </div>
              </div>

              <form className='space-y-3' onSubmit={handleEmailSignUp}>
                <div className='space-y-1'>
                  <Label htmlFor='signup-email' className='text-xs font-medium text-foreground/90'>Email</Label>
                  <div className='relative'>
                    <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60' />
                    <Input
                      id='signup-email'
                      type='email'
                      placeholder='you@example.com'
                      value={signUpEmail}
                      onChange={event => setSignUpEmail(event.target.value)}
                      disabled={!supabaseConfigured || signUpLoading}
                      className='pl-10 h-10 bg-background/50 border-border/40 focus:bg-background/80 focus:border-primary/50 transition-all duration-200 backdrop-blur-sm'
                    />
                  </div>
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='signup-password' className='text-xs font-medium text-foreground/90'>Password</Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60' />
                    <Input
                      id='signup-password'
                      type={signUpShowPassword ? 'text' : 'password'}
                      placeholder='Create a password'
                      value={signUpPassword}
                      onChange={event => setSignUpPassword(event.target.value)}
                      disabled={!supabaseConfigured || signUpLoading}
                      className='pl-10 pr-10 h-10 bg-background/50 border-border/40 focus:bg-background/80 focus:border-primary/50 transition-all duration-200 backdrop-blur-sm'
                    />
                    <button
                      type='button'
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 hover:text-foreground/80 transition-colors'
                      onClick={() => setSignUpShowPassword(prev => !prev)}
                    >
                      {signUpShowPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </button>
                  </div>
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='signup-confirm' className='text-xs font-medium text-foreground/90'>Confirm Password</Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60' />
                    <Input
                      id='signup-confirm'
                      type={signUpShowConfirm ? 'text' : 'password'}
                      placeholder='Confirm your password'
                      value={signUpConfirmPassword}
                      onChange={event => setSignUpConfirmPassword(event.target.value)}
                      disabled={!supabaseConfigured || signUpLoading}
                      className='pl-10 pr-10 h-10 bg-background/50 border-border/40 focus:bg-background/80 focus:border-primary/50 transition-all duration-200 backdrop-blur-sm'
                    />
                    <button
                      type='button'
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 hover:text-foreground/80 transition-colors'
                      onClick={() => setSignUpShowConfirm(prev => !prev)}
                    >
                      {signUpShowConfirm ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </button>
                  </div>
                </div>
                {signUpError && (
                  <div className='p-3 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm'>
                    <p className='text-sm text-red-500 dark:text-red-400'>{signUpError}</p>
                  </div>
                )}
                <Button
                  type='submit'
                  disabled={
                    !supabaseConfigured ||
                    signUpLoading ||
                    !signUpEmail ||
                    !signUpPassword ||
                    !signUpConfirmPassword
                  }
                  className='w-full h-11 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all duration-200'
                >
                  <div className='flex items-center justify-center gap-2'>
                    {signUpLoading ? <LoaderIcon /> : <Mail className='h-4 w-4' />}
                    {signUpLoading ? 'Creating account...' : 'Create Account'}
                  </div>
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LoaderIcon() {
  return (
    <span className='inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
  );
}
