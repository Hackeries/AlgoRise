'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
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
import { Mail, Lock, Eye, EyeOff, Github } from 'lucide-react';

// Google SVG
const GoogleIcon = () => (
  <svg className='h-5 w-5' viewBox='0 0 533.5 544.3'>
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
      d='M272 107.7c38.9 0 73.9 13.4 101.5 39.5l76.2-76.2C404.6 24.4 343.6 0 272 0 168.6 0 76.6 57.3 32.2 142.1l88.1 69.8c21.4-63.8 81.2-111.4 151.7-111.4z'
      fill='#EA4335'
    />
  </svg>
);

// Spinner
const Spinner = () => (
  <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full' />
);

// Input with icon & eye toggle
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

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<
    'google' | 'github' | null
  >(null);
  const [isConfigured, setIsConfigured] = useState(true);
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      supabaseUrl === 'https://your-project-ref.supabase.co' ||
      supabaseAnonKey === 'your-anon-key-here' ||
      supabaseAnonKey === '[YOUR-ANON-KEY-HERE]'
    ) {
      setIsConfigured(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      await refreshUser();
      router.push('/profile'); // Redirect email/password flow to profile
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setError(null);
    setIsOAuthLoading(provider);
    try {
      const supabase = createClient();

      const getBaseUrl = () => {
        if (typeof window !== 'undefined' && window.location?.origin) {
          return window.location.origin;
        }
        return (
          process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
        );
      };

      const origin = getBaseUrl();
      const nextPath = '/profile';
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
        nextPath
      )}&o=${encodeURIComponent(origin)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' },
          skipBrowserRedirect: false,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OAuth login failed');
    } finally {
      setIsOAuthLoading(null);
    }
  };

  if (!isConfigured) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <AuthConfigurationAlert
          title='Login Unavailable'
          description='Authentication is not configured. Please set up Supabase to enable user login.'
        />
      </div>
    );
  }

  return (
    <div className='flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden'>
      <div className='w-full max-w-md'>
        <Card className='shadow-xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transform transition duration-300 max-h-[90vh] overflow-y-auto'>
          <CardHeader className='text-center'>
            <Mail className='mx-auto mb-4 h-10 w-10 text-blue-500' />
            <CardTitle className='text-2xl md:text-3xl font-bold'>
              Login
            </CardTitle>
            <CardDescription className='text-gray-600 dark:text-gray-300'>
              Login with email or social accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Social login */}
            <div className='flex flex-col gap-3 mb-4'>
              <Button
                onClick={() => handleOAuthLogin('google')}
                disabled={!!isOAuthLoading}
                className={`flex items-center justify-center gap-2 w-full text-white transition-all duration-300 transform hover:scale-105 ${
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
                onClick={() => handleOAuthLogin('github')}
                disabled={!!isOAuthLoading}
                className={`flex items-center justify-center gap-2 w-full text-white transition-all duration-300 transform hover:scale-105 ${
                  isOAuthLoading === 'github'
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                {isOAuthLoading === 'github' ? (
                  <Spinner />
                ) : (
                  <Github className='h-5 w-5' />
                )}
                {isOAuthLoading === 'github'
                  ? 'Signing in...'
                  : 'Sign in with GitHub'}
              </Button>
            </div>

            <form onSubmit={handleLogin} className='space-y-6'>
              <div className='flex flex-col gap-4'>
                <InputWithIcon
                  id='email'
                  label='Email'
                  type='email'
                  placeholder='you@example.com'
                  icon={Mail}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                {error && (
                  <p className='text-sm text-red-500 text-center'>{error}</p>
                )}
                <Button
                  type='submit'
                  className='w-full bg-blue-500 hover:bg-blue-600 text-white transition duration-300'
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
              <div className='mt-4 text-center text-sm text-gray-600 dark:text-gray-400'>
                Don&apos;t have an account?{' '}
                <Link
                  href='/auth/sign-up'
                  className='text-blue-500 hover:underline'
                >
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
