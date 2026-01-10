'use client';

import * as React from 'react';
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme,
} from 'next-themes';

/**
 * Public ThemeProvider wrapper
 * - Sets attribute="class" for Tailwind dark mode
 * - Persists preference under a custom storageKey
 * - Exposes optional transition-on-change UX
 */
export function ThemeProvider({
  children,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps & { disableTransitionOnChange?: boolean }) {
  // We defer rendering until mounted to avoid SSR mismatch
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Render children early to avoid layout shift; theme will apply once mounted
  return (
    <NextThemesProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      enableColorScheme
      storageKey='algorise-theme'
      disableTransitionOnChange={disableTransitionOnChange}
      themes={['light', 'dark', 'system']}
      {...props}
    >
      {mounted && (
        <ThemeMetaSync enableTransition={!disableTransitionOnChange} />
      )}
      {children}
    </NextThemesProvider>
  );
}

/**
 * Synchronizes theme-dependent meta tags (theme-color, Apple status bar)
 * and applies a short-lived transition class for smooth theme changes.
 */
function ThemeMetaSync({ enableTransition }: { enableTransition: boolean }) {
  const { resolvedTheme, theme, setTheme } = useTheme();
  const [lastApplied, setLastApplied] = React.useState<string | null>(null);

  // Optional: auto-correct invalid theme values (defensive)
  React.useEffect(() => {
    if (theme && !['light', 'dark', 'system'].includes(theme)) {
      setTheme('system');
    }
  }, [theme, setTheme]);

  React.useEffect(() => {
    const current = resolvedTheme;
    if (!current || current === lastApplied) return;

    // Update <meta name="theme-color">
    const metaThemeColor = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    if (metaThemeColor) {
      metaThemeColor.content = current === 'dark' ? '#0a0a0a' : '#0084FF';
    }

    // Update Apple status bar style (iOS PWA)
    const appleStatusMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="apple-mobile-web-app-status-bar-style"]'
    );
    if (appleStatusMeta) {
      appleStatusMeta.content =
        current === 'dark' ? 'black-translucent' : 'default';
    }

    // Respect reduced motion
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (enableTransition && !prefersReduced) {
      document.documentElement.classList.add('theme-transition');
      const timeout = window.setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 320);
      return () => window.clearTimeout(timeout);
    }

    setLastApplied(current);
  }, [resolvedTheme, enableTransition, lastApplied]);

  return null;
}
