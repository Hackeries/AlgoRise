'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return children without theme on server
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      storageKey='algorise-theme'
      disableTransitionOnChange={false} // Enable smooth transitions
      enableColorScheme
      themes={['light', 'dark', 'system']}
      {...props}
    >
      <ThemeWatcher />
      {children}
    </NextThemesProvider>
  );
}

// Component to watch theme changes and update meta tags
function ThemeWatcher() {
  const [theme, setTheme] = useState<string | undefined>();

  useEffect(() => {
    // Detect theme changes
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          const isDark = document.documentElement.classList.contains('dark');
          setTheme(isDark ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Set initial theme
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!theme) return;

    // Update theme-color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#0a0a0a' : '#0084FF'
      );
    }

    // Update Apple status bar
    const metaAppleStatusBar = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]'
    );
    if (metaAppleStatusBar) {
      metaAppleStatusBar.setAttribute(
        'content',
        theme === 'dark' ? 'black-translucent' : 'default'
      );
    }

    // Add smooth transition class
    document.documentElement.classList.add('theme-transition');

    // Remove transition class after animation completes
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);

    return () => clearTimeout(timer);
  }, [theme]);

  return null;
}
