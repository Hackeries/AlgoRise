'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { Bug, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

/**
 * Props:
 * - section: override auto-detected section label
 * - email: default reporter email to prefill
 * - formBaseUrl: Google Form "viewform?usp=pp_url" base
 * - emailEntryId / sectionEntryId / extraContextEntryId: Google Form entry IDs
 * - extraContext: optional extra notes (eg. feature version, build info)
 * - hotkey: keyboard shortcut (e.g. 'Alt+B')
 * - onOpen: callback after opening the form
 * - trackEvent: optional analytics callback
 */
export interface FloatingBugReportProps {
  section?: string;
  email?: string;
  formBaseUrl?: string;
  emailEntryId?: string;
  sectionEntryId?: string;
  extraContextEntryId?: string;
  extraContext?: string;
  hotkey?: string;
  onOpen?: (url: string) => void;
  trackEvent?: (event: { type: 'bug-report-open'; section: string }) => void;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const DEFAULT_FORM_BASE =
  'https://docs.google.com/forms/d/e/1FAIpQLSeO9rL7zhqWgiiPmM6rx60Zpu-FPo4t_nv9f8rPEiTxuZdrQQ/viewform?usp=pp_url';

const SIZE_MAP: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-12 w-12',
  md: 'h-14 w-14',
  lg: 'h-16 w-16',
};

export function FloatingBugReport({
  section,
  email = 'itssaj15@gmail.com',
  formBaseUrl = DEFAULT_FORM_BASE,
  emailEntryId = 'entry.123456789',
  sectionEntryId = 'entry.987654321',
  extraContextEntryId = 'entry.555555555',
  extraContext,
  hotkey = 'Alt+B',
  onOpen,
  trackEvent,
  className,
  disabled = false,
  size = 'lg',
}: FloatingBugReportProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Ensure no SSR mismatch
  useEffect(() => setMounted(true), []);

  // Auto-detect section from pathname (fallback to 'General')
  const detectedSection = useMemo(() => {
    if (section) return section;
    if (!pathname) return 'General';
    if (pathname.includes('dashboard')) return 'Dashboard';
    if (pathname.includes('profile')) return 'Profile';
    if (pathname.includes('train')) return 'Practice / Training';
    if (pathname.includes('contest')) return 'Contests';
    if (pathname.includes('groups')) return 'Groups';
    if (pathname.includes('analytics')) return 'Analytics';
    if (pathname === '/') return 'Landing';
    return 'General';
  }, [pathname, section]);

  // Build prefilled Google Form URL safely
  const formUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set(emailEntryId, email);
    params.set(sectionEntryId, detectedSection);
    if (extraContext && extraContextEntryId) {
      params.set(extraContextEntryId, extraContext);
    }
    // If formBaseUrl already contains params, append
    const baseHasQuery = formBaseUrl.includes('?');
    return `${formBaseUrl}${baseHasQuery ? '&' : '?'}${params.toString()}`;
  }, [
    email,
    detectedSection,
    extraContext,
    formBaseUrl,
    emailEntryId,
    sectionEntryId,
    extraContextEntryId,
  ]);

  // Hotkey activation (Alt+B by default)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (disabled) return;
      // Normalize hotkey (supports Alt+B or Ctrl+Shift+F kind patterns)
      const parts = hotkey
        .toLowerCase()
        .split('+')
        .map(p => p.trim());
      const wantAlt = parts.includes('alt');
      const wantCtrl =
        parts.includes('ctrl') ||
        parts.includes('cmd') ||
        parts.includes('meta');
      const wantShift = parts.includes('shift');
      const main = parts.find(
        p => !['alt', 'ctrl', 'cmd', 'meta', 'shift'].includes(p)
      );

      if (!main) return;

      const keyMatch = e.key.toLowerCase() === main;
      if (
        keyMatch &&
        (!wantAlt || e.altKey) &&
        (!wantCtrl || e.ctrlKey || e.metaKey) &&
        (!wantShift || e.shiftKey)
      ) {
        e.preventDefault();
        openForm();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hotkey, disabled, formUrl, detectedSection]);

  const openForm = useCallback(() => {
    if (disabled || !mounted) return;
    setIsOpening(true);
    try {
      window.open(formUrl, '_blank', 'noopener,noreferrer');
      trackEvent?.({ type: 'bug-report-open', section: detectedSection });
      onOpen?.(formUrl);
    } catch (err) {
      console.error('Failed to open form:', err);
      // Fallback: use mailto if blocked
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(
        'Bug Report / Feedback'
      )}&body=${encodeURIComponent(
        `Section: ${detectedSection}\nDescribe the issue here...`
      )}`;
    } finally {
      // small delay for loader effect
      setTimeout(() => setIsOpening(false), 600);
    }
  }, [disabled, mounted, formUrl, detectedSection, email, trackEvent, onOpen]);

  // Accessibility announce string
  const ariaLabel = `Report a bug or send feedback for ${detectedSection}`;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex flex-col items-center group',
        className
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-live='polite'
    >
      {/* Tooltip */}
      <div
        className={cn(
          'mb-2 text-sm px-2 py-1 rounded-md transition-opacity duration-200 pointer-events-none',
          'bg-black/75 text-white shadow-lg',
          hover ? 'opacity-100' : 'opacity-0'
        )}
        role='status'
      >
        {isOpening ? 'Opening...' : 'Report a Bug / Feedback'}
      </div>

      <Button
        ref={buttonRef}
        type='button'
        onClick={openForm}
        disabled={disabled || isOpening}
        aria-label={ariaLabel}
        className={cn(
          'relative flex items-center justify-center rounded-full shadow-2xl focus-visible:ring-4 focus-visible:ring-red-300 outline-none',
          'transition-all duration-300',
          SIZE_MAP[size],
          disabled
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-linear-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white',
          !disabled && 'hover:scale-110 active:scale-[1.03]'
        )}
      >
        {isOpening ? (
          <Loader2 className='h-7 w-7 animate-spin' aria-hidden='true' />
        ) : (
          <Bug
            className={cn(
              'h-7 w-7 transition-transform',
              'group-hover:animate-bounce'
            )}
            aria-hidden='true'
          />
        )}

        {/* Hotkey hint badge */}
        <span
          className={cn(
            'absolute -top-2 -left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide',
            'bg-red-600 text-white shadow',
            'opacity-0 group-hover:opacity-100 transition-opacity'
          )}
        >
          {hotkey}
        </span>
      </Button>

      {/* Hidden extras for screen readers */}
      <span className='sr-only'>
        Opens a feedback form prefilled with section {detectedSection}.
      </span>
    </div>
  );
}
