'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Ensure the "next" path is safe and defaults to /profile
    const sanitizeNext = (raw: string | null) => {
      const dec = raw ?? '';
      return dec.startsWith('/') ? dec : '/profile';
    };
    (async () => {
      try {
        const supabase = createClient();

        // Check if OAuth provider returned an error
        const providerError =
          params.get('error') || params.get('error_description');
        if (providerError) {
          throw new Error(`OAuth provider error: ${providerError}`);
        }

        // Get the code or access_token from callback URL
        const hasCode = params.get('code') || params.get('access_token');
        if (!hasCode) {
          throw new Error('Missing authorization code in callback URL');
        }

        let hasPkce = false;
        if (typeof window !== 'undefined') {
          try {
            // Check for any Supabase PKCE verifier in sessionStorage
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i)?.toLowerCase() || '';
              if (
                key.includes('verifier') ||
                key.includes('pkce') ||
                key.includes('supabase')
              ) {
                hasPkce = true;
                break;
              }
            }
          } catch {}
        }

        // Exchange the code for a session
        if (typeof window !== 'undefined' && hasCode) {
          try {
            const { error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(window.location.href);
            if (exchangeError) {
              // Only throw if it's not a PKCE-related error
              if (
                !exchangeError.message.includes('verifier') &&
                !exchangeError.message.includes('PKCE')
              ) {
                throw new Error(
                  `Failed to exchange code for session: ${exchangeError.message}`
                );
              }
              // For PKCE errors, try to get session directly
              console.log(
                'PKCE exchange failed, attempting direct session check'
              );
            }
          } catch (e) {
            console.error('Exchange error:', e);
          }
        }

        // Wait until a valid session is established
        let attempts = 0;
        while (attempts < 10) {
          const { data, error: sessionError } =
            await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (data.session?.user) break;
          await new Promise(resolve => setTimeout(resolve, 300));
          attempts++;
        }

        // Check if we have a session after all attempts
        const { data: finalSession } = await supabase.auth.getSession();
        if (!finalSession.session?.user) {
          throw new Error(
            'Unable to establish session. Please try signing in again.'
          );
        }

        // Redirect user to next page (default: /profile)
        const next = sanitizeNext(params.get('next'));
        if (mounted) window.location.replace(next);
      } catch (e) {
        // Display user-friendly error messages
        const msg = e instanceof Error ? e.message : 'Authentication failed';
        if (mounted) setError(msg);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [params]);

  return (
    <div className='min-h-[60vh] flex items-center justify-center'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Loader2 className='h-4 w-4 animate-spin' />
        {error ? (
          <span>Sign-in failed: {error}</span>
        ) : (
          <span>Completing sign-in…</span>
        )}
      </div>
    </div>
  );
}
