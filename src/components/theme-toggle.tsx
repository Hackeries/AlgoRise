'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Transition,
} from 'framer-motion';

type Mode = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Computed booleans
  const effectiveTheme = resolvedTheme || theme;
  const isDark = effectiveTheme === 'dark';
  const currentMode: Mode = (theme as Mode) || 'system';
  const isSystem = currentMode === 'system';

  const label = !mounted
    ? 'Toggle theme'
    : isSystem
    ? `Theme: System (${isDark ? 'Dark' : 'Light'})`
    : `Theme: ${isDark ? 'Dark' : 'Light'}`;

  // Base transition (typed)
  const baseTransition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : {
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      };

  const iconVariants = {
    initial: { y: -14, opacity: 0, rotate: -90 },
    animate: { y: 0, opacity: 1, rotate: 0 },
    exit: { y: 14, opacity: 0, rotate: 90 },
  };

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!mounted) return;
      // Alt / Option click => system
      if (e.altKey) {
        setTheme('system');
        return;
      }
      // Normal click toggles light/dark (explicit)
      setTheme(isDark ? 'light' : 'dark');
    },
    [mounted, isDark, setTheme]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      // Right-click cycles through: light -> dark -> system -> light...
      if (!mounted) return;
      const next: Mode = isSystem ? 'light' : isDark ? 'system' : 'dark';
      setTheme(next);
    },
    [mounted, isDark, isSystem, setTheme]
  );

  // Placeholder (pre-mount) to avoid flicker
  if (!mounted) {
    return (
      <Button
        variant='ghost'
        size='icon'
        aria-label='Toggle theme (loading)'
        className='relative w-10 h-10 rounded-full opacity-70'
        disabled
      >
        <Sun className='h-5 w-5 text-muted-foreground' />
      </Button>
    );
  }

  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      aria-label={label}
      title={`${label} — click to toggle Light/Dark, Alt-click for System, right-click cycles modes`}
      role='switch'
      aria-checked={isDark}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      data-mode={currentMode}
      className='relative w-10 h-10 rounded-full overflow-hidden group hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors'
    >
      {/* Decorative gradient */}
      <div
        className={`absolute inset-0 rounded-full pointer-events-none ${
          isDark
            ? 'bg-[radial-gradient(120%_120%_at_30%_25%,rgba(251,191,36,0.22),rgba(0,0,0,0)_65%)]'
            : 'bg-[radial-gradient(120%_120%_at_70%_75%,rgba(59,130,246,0.22),rgba(0,0,0,0)_65%)]'
        }`}
      />

      {/* Hover glow */}
      {!prefersReducedMotion && (
        <motion.div
          className='absolute inset-0 rounded-full pointer-events-none opacity-0 group-hover:opacity-100'
          initial={false}
          animate={{
            boxShadow: isDark
              ? '0 0 24px rgba(251,191,36,0.35)'
              : '0 0 24px rgba(59,130,246,0.35)',
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Tap ripple */}
      {!prefersReducedMotion && (
        <motion.span
          className='absolute inset-0 rounded-full bg-foreground/10 pointer-events-none'
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.18 }}
        />
      )}

      {/* Icon */}
      <AnimatePresence mode='wait' initial={false}>
        <motion.div
          key={
            isSystem
              ? `system-${isDark ? 'dark' : 'light'}`
              : isDark
              ? 'sun'
              : 'moon'
          }
          variants={iconVariants}
          initial='initial'
          animate='animate'
          exit='exit'
          transition={baseTransition}
          className='absolute inset-0 flex items-center justify-center'
        >
          {isSystem ? (
            <div className='relative'>
              <Monitor className='h-5 w-5 text-foreground/80' />
              <span
                className={`absolute -right-1 -bottom-1 h-2.5 w-2.5 rounded-full ring-2 ring-background ${
                  isDark ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                aria-hidden
              />
            </div>
          ) : isDark ? (
            <Sun className='h-5 w-5 text-amber-500' />
          ) : (
            <Moon className='h-5 w-5 text-blue-500' />
          )}
        </motion.div>
      </AnimatePresence>

      <span className='sr-only'>
        {label}. Click to toggle. Alt-click sets System. Right-click cycles all
        modes.
      </span>
    </Button>
  );
}
