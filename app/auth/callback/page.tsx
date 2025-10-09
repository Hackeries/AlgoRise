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

    const sanitizeNext = (raw: string | null) => {
      const dec = raw ?? '';
      // URLSearchParams already decodes, this guards and defaults
      return dec.startsWith('/') ? dec : '/profile';
    };
    (async () => {
      try {
        const supabase = createClient();

        const providerError =
          params.get('error') || params.get('error_description');
        if (providerError) throw new Error(providerError);

        const hasCode = params.get('code') || params.get('access_token');
        if (typeof window !== 'undefined' && hasCode) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(window.location.href);
          if (exchangeError) throw exchangeError;
        }

        // Wait until a session with user exists to avoid 404s on the next page
        let attempts = 0;
        let userOk = false;
        while (attempts < 6 && !userOk) {
          const { data, error: sErr } = await supabase.auth.getSession();
          if (sErr) throw sErr;
          if (data.session?.user) {
            userOk = true;
            break;
          }
          await new Promise(r => setTimeout(r, 250));
          attempts++;
        }

        const next = sanitizeNext(params.get('next'));
        if (mounted) {
          // Use hard redirect to ensure SSR sees fresh cookies
          window.location.replace(next);
        }
      } catch (e) {
        if (mounted)
          setError(e instanceof Error ? e.message : 'Authentication failed');
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
