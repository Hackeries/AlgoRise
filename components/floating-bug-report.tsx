'use client';

import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

interface FloatingBugReportProps {
  section?: string;
}

export function FloatingBugReport({ section }: FloatingBugReportProps) {
  const pathname = usePathname();

  // 🔍 Automatically detect section based on current route
  const detectedSection = useMemo(() => {
    if (section) return section;
    if (pathname.includes('dashboard')) return 'Dashboard';
    if (pathname.includes('profile')) return 'Profile';
    if (pathname.includes('train')) return 'Practice / Training';
    if (pathname.includes('contest')) return 'Contests';
    if (pathname.includes('groups')) return 'Groups';
    if (pathname.includes('analytics')) return 'Analytics';
    return 'General';
  }, [pathname, section]);

  // 📝 Base Google Form link (yours)
  const baseFormUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSeO9rL7zhqWgiiPmM6rx60Zpu-FPo4t_nv9f8rPEiTxuZdrQQ/viewform?usp=sharing';

  // ✅ Optional prefill for section (only works if your form supports it)
  const formUrl = `${baseFormUrl}&entry.123456789=${encodeURIComponent(
    detectedSection
  )}`;

  // 🧭 Opens Google Form in new tab
  const handleReportClick = () => {
    window.open(formUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handleReportClick}
      className={cn(
        'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-xl',
        'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
        'text-white transition-all duration-300 hover:scale-110 focus-visible:ring-4 focus-visible:ring-red-300',
        'flex items-center justify-center group'
      )}
      aria-label='Report a bug or send feedback'
    >
      <Bug className='h-6 w-6 group-hover:rotate-12 transition-transform' />
    </Button>
  );
}
