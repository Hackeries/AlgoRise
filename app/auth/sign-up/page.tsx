'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthConfigurationAlert } from '@/components/auth/auth-configuration-alert';
import { Mail, Lock, Github, Eye, EyeOff } from 'lucide-react';

// Spinner component
const Spinner = () => (
  <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full' />
);

// Google icon
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

// Input with icon & optional eye toggle
const InputWithIcon = ({
  id,
  label,
  type = 'text',
  placeholder,
  icon: Icon,
  value,
  onChange,
  showPassword,
  setShowPassword,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  icon: React.ElementType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword?: boolean;
  setShowPassword?: (val: boolean) => void;
}) => (
  <div className='w-full'>
    <Label htmlFor={id} className='mb-1 block text-sm font-medium'>
      {label}
    </Label>
    <div className='relative'>
      <span className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
        <Icon className='h-5 w-5 text-gray-400' />
      </span>
      <Input
        id={id}
        type={
          showPassword !== undefined
            ? showPassword
              ? 'text'
              : 'password'
            : type
        }
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className='pl-10 pr-10 py-2 w-full focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition'
      />
      {setShowPassword && (
        <button
          type='button'
          onClick={() => setShowPassword(!showPassword)}
          className='absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400'
        >
          {showPassword ? (
            <EyeOff className='h-5 w-5' />
          ) : (
            <Eye className='h-5 w-5' />
          )}
        </button>
      )}
    </div>
  </div>
);

const OAuthModal = ({
  isOpen,
  onClose,
  provider,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  provider: 'google' | 'github' | null;
  isLoading: boolean;
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'oauth_complete') {
        onClose();
        window.location.href =
          '/auth/callback?next=' + encodeURIComponent('/profile');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <Card className='w-full max-w-md mx-4'>
        <CardHeader>
          <CardTitle>
            {provider === 'google' ? 'Google Sign Up' : 'GitHub Sign Up'}
          </CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-center gap-4'>
          <div className='animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full' />
          <p className='text-sm text-gray-600'>
            {isLoading ? 'Completing sign up...' : 'Opening sign up window...'}
          </p>
          <Button onClick={onClose} variant='outline'>
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<
    'google' | 'github' | null
  >(null);
  const [isConfigured, setIsConfigured] = useState(true);
  const [oauthModalOpen, setOAuthModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (
      !url ||
      !key ||
      url.includes('your-project-ref') ||
      key.includes('your-anon-key')
    )
      setIsConfigured(false);
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== repeatPassword) return setError('Passwords do not match');
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/sign-up-success`,
        },
      });
      if (error) throw error;
      router.push('/auth/sign-up-success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setError(null);
    setIsOAuthLoading(provider);
    setOAuthModalOpen(true);

    try {
      const supabase = createClient();
      const origin =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'http://localhost:3000';
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent('/profile')}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' },
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OAuth sign in failed');
      setOAuthModalOpen(false);
    } finally {
      setIsOAuthLoading(null);
    }
  };

  if (!isConfigured)
    return (
      <div className='flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-10'>
        <AuthConfigurationAlert
          title='Sign Up Unavailable'
          description='Authentication is not configured. Please set up Supabase.'
        />
      </div>
    );

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 md:p-10'>
      <OAuthModal
        isOpen={oauthModalOpen}
        onClose={() => setOAuthModalOpen(false)}
        provider={isOAuthLoading}
        isLoading={!!isOAuthLoading}
      />
      <div className='w-full max-w-md'>
        <Card className='shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transform transition duration-300'>
          <CardHeader className='text-center px-4 sm:px-6 py-4 sm:py-6'>
            <Mail className='mx-auto mb-4 h-8 w-8 sm:h-10 sm:w-10 text-blue-500' />
            <CardTitle className='text-xl sm:text-2xl md:text-3xl font-bold'>
              Sign Up
            </CardTitle>
            <CardDescription className='text-sm sm:text-base text-gray-600 dark:text-gray-300'>
              Create your account or sign in with Google/GitHub
            </CardDescription>
          </CardHeader>
          <CardContent className='px-4 sm:px-6 py-4 sm:py-6'>
            <div className='flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-6'>
              <Button
                onClick={() => handleOAuthSignIn('google')}
                disabled={!!isOAuthLoading}
                className={`flex items-center justify-center gap-2 w-full text-white text-sm sm:text-base transition-all duration-300 transform hover:scale-105 py-2 sm:py-3 ${
                  isOAuthLoading === 'google'
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isOAuthLoading === 'google' ? <Spinner /> : <GoogleIcon />}
                {isOAuthLoading === 'google'
                  ? 'Signing in...'
                  : 'Sign in with Google'}
              </Button>
              <Button
                onClick={() => handleOAuthSignIn('github')}
                disabled={!!isOAuthLoading}
                className={`flex items-center justify-center gap-2 w-full text-white text-sm sm:text-base transition-all duration-300 transform hover:scale-105 py-2 sm:py-3 ${
                  isOAuthLoading === 'github'
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                {isOAuthLoading === 'github' ? (
                  <Spinner />
                ) : (
                  <Github className='h-4 w-4 sm:h-5 sm:w-5' />
                )}
                {isOAuthLoading === 'github'
                  ? 'Signing in...'
                  : 'Sign in with GitHub'}
              </Button>
            </div>

            <form onSubmit={handleSignUp} className='space-y-4 sm:space-y-6'>
              <InputWithIcon
                id='email'
                label='Email'
                type='email'
                icon={Mail}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='you@example.com'
              />
              <InputWithIcon
                id='password'
                label='Password'
                icon={Lock}
                value={password}
                onChange={e => setPassword(e.target.value)}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
              <InputWithIcon
                id='repeat-password'
                label='Repeat Password'
                icon={Lock}
                value={repeatPassword}
                onChange={e => setRepeatPassword(e.target.value)}
                showPassword={showRepeatPassword}
                setShowPassword={setShowRepeatPassword}
              />
              {error && (
                <p className='text-xs sm:text-sm text-red-500 text-center animate-pulse'>
                  {error}
                </p>
              )}
              <Button
                type='submit'
                disabled={isLoading || !email || !password || !repeatPassword}
                className='w-full bg-blue-500 hover:bg-blue-600 text-white transition duration-300 py-2 sm:py-3 text-sm sm:text-base'
              >
                {isLoading ? 'Creating your account...' : 'Sign Up'}
              </Button>
              <p className='text-xs sm:text-sm text-center text-gray-600 dark:text-gray-400 mt-2'>
                Already have an account?{' '}
                <Link
                  href='/auth/login'
                  className='text-blue-500 hover:underline font-medium'
                >
                  Log in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
