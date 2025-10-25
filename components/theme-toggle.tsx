'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = (theme ?? resolvedTheme) === 'dark';

  if (!mounted) {
    return (
      <Button
        variant='ghost'
        size='icon'
        aria-label='Toggle theme'
        className='relative rounded-full w-10 h-10'
        disabled
      >
        <Sun className='h-5 w-5' />
      </Button>
    );
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      aria-label='Toggle theme'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='relative rounded-full w-10 h-10 overflow-hidden group hover:bg-secondary/80 transition-all duration-200'
    >
      {/* Glow effect on hover */}
      <motion.div
        className='absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
        animate={{
          boxShadow: isDark
            ? '0 0 20px rgba(250, 204, 21, 0.3)'
            : '0 0 20px rgba(59, 130, 246, 0.3)',
        }}
      />

      {/* Icon container */}
      <AnimatePresence mode='wait' initial={false}>
        <motion.div
          key={isDark ? 'sun' : 'moon'}
          initial={{ y: -20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 90 }}
          transition={{
            duration: 0.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className='absolute inset-0 flex items-center justify-center'
        >
          {isDark ? (
            <Sun className='h-5 w-5 text-amber-500' />
          ) : (
            <Moon className='h-5 w-5 text-blue-500' />
          )}
        </motion.div>
      </AnimatePresence>

      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
}