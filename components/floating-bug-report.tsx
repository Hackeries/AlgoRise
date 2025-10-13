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

  // Detect current section based on route
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

  // Your email to prefill
  const email = 'itssaj15@gmail.com';

  // Base Google Form URL (replace with your actual form)
  const baseFormUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSeO9rL7zhqWgiiPmM6rx60Zpu-FPo4t_nv9f8rPEiTxuZdrQQ/viewform?usp=pp_url';

  // Prefill email and section (replace with your actual entry IDs)
  const formUrl = `${baseFormUrl}&entry.123456789=${encodeURIComponent(
    email
  )}&entry.987654321=${encodeURIComponent(detectedSection)}`;

  // Open Google Form in new tab
  const handleReportClick = () => {
    window.open(formUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className='fixed bottom-6 right-6 z-50 flex flex-col items-center group'>
      {/* Tooltip on hover */}
      <div className='mb-2 text-sm text-white bg-black bg-opacity-70 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity'>
        Report a Bug / Feedback
      </div>

      {/* Floating button */}
      <Button
        onClick={handleReportClick}
        className={cn(
          'h-16 w-16 rounded-full shadow-2xl',
          'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
          'text-white transition-all duration-300 hover:scale-110 focus-visible:ring-4 focus-visible:ring-red-300',
          'flex items-center justify-center'
        )}
        aria-label='Report a bug or send feedback'
      >
        <Bug className='h-7 w-7 text-white group-hover:animate-bounce transition-transform' />
      </Button>
    </div>
  );
}