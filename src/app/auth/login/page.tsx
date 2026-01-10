'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AuthConfigurationAlert } from '@/components/auth/auth-configuration-alert'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Github,
  Loader2,
  ArrowRight,
  Code2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

const features = [
  'AI-powered problem recommendations',
  'Real-time progress analytics',
  'Compete in private contests',
  'Sync with Codeforces profile',
]

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOAuthLoading] = useState<'google' | 'github' | null>(null)
  const [isConfigured, setIsConfigured] = useState(true)

  const redirectTo = searchParams.get('redirect') || '/profile'

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      supabaseUrl.includes('your-project-ref') ||
      supabaseAnonKey.includes('your-anon-key')
    ) {
      setIsConfigured(false)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) throw error

      await refreshUser()
      router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    if (oauthLoading) return

    setOAuthLoading(provider)
    setError(null)

    try {
      const supabase = createClient()
      const origin = window.location.origin

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
          queryParams: { prompt: 'select_account' },
        },
      })

      if (error) {
        throw error
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OAuth login failed'
      setError(`Failed to sign in with ${provider === 'google' ? 'Google' : 'GitHub'}: ${message}`)
      setOAuthLoading(null)
    }
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <AuthConfigurationAlert
          title="Login Unavailable"
          description="Authentication is not configured. Please set up Supabase."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />

        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 border border-white/20 rounded-full" />
          <div className="absolute top-40 left-40 w-96 h-96 border border-white/10 rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 border border-white/15 rounded-full" />
          <div className="absolute bottom-40 right-20 w-48 h-48 border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-2xl rotate-45" />
          <div className="absolute bottom-1/4 right-1/3 w-24 h-24 bg-white/5 rounded-xl rotate-12" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                <Code2 className="h-8 w-8 text-white" />
              </div>
              <span className="text-3xl font-bold text-white">AlgoRise</span>
            </div>

            {/* Tagline */}
            <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
              Master Competitive Programming
            </h1>
            <p className="text-lg text-white/80 mb-10 leading-relaxed">
              Practice smarter with personalized problem recommendations, track your progress, and
              compete with friends.
            </p>

            {/* Feature Highlights */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-white/90 group"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-base">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="p-2.5 rounded-xl bg-primary shadow-lg">
              <Code2 className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">AlgoRise</span>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-2 text-base">
              Sign in to continue your journey
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-8">
            <Button
              variant="outline"
              className="w-full h-12 gap-3 font-medium text-base border-2 hover:bg-accent/50 hover:border-accent transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() => handleOAuth('google')}
              disabled={!!oauthLoading}
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span>Continue with Google</span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 gap-3 font-medium text-base border-2 hover:bg-accent/50 hover:border-accent transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() => handleOAuth('github')}
              disabled={!!oauthLoading}
            >
              {oauthLoading === 'github' ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Github className="h-5 w-5" />
              )}
              <span>Continue with GitHub</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-sm text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-base border-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-all duration-200"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-12 h-12 text-base border-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary transition-all duration-200"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 gap-2 font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-base text-muted-foreground mt-8">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/sign-up"
              className="text-primary font-semibold hover:text-primary/80 hover:underline transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
