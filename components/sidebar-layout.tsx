'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { useCFVerification } from '@/lib/context/cf-verification';
import { useState, useEffect } from 'react';
import {
  Calendar,
  Target,
  Trophy,
  BookOpen,
  Users,
  PieChart,
  BarChart3,
  Menu,
} from 'lucide-react';

// ------------------ CF Rating System ------------------
const getCFTier = (rating: number) => {
  if (rating < 1200)
    return { label: 'Newbie', color: 'text-gray-400', bg: 'bg-gray-800' };
  if (rating < 1400)
    return { label: 'Pupil', color: 'text-green-400', bg: 'bg-green-900/40' };
  if (rating < 1600)
    return {
      label: 'Specialist',
      color: 'text-cyan-400',
      bg: 'bg-cyan-900/40',
    };
  if (rating < 1900)
    return { label: 'Expert', color: 'text-blue-400', bg: 'bg-blue-900/40' };
  if (rating < 2100)
    return {
      label: 'Candidate Master',
      color: 'text-purple-400',
      bg: 'bg-purple-900/40',
    };
  if (rating < 2300)
    return {
      label: 'Master',
      color: 'text-orange-400',
      bg: 'bg-orange-900/40',
    };
  if (rating < 2400)
    return {
      label: 'International Master',
      color: 'text-red-400',
      bg: 'bg-red-900/40',
    };
  if (rating < 2600)
    return { label: 'Grandmaster', color: 'text-red-500', bg: 'bg-red-900/40' };
  if (rating < 3000)
    return {
      label: 'International GM',
      color: 'text-red-600',
      bg: 'bg-red-950/40',
    };
  return {
    label: 'Legendary GM',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/40',
  };
};

// ------------------ Menu Items ------------------
const menuItems = [
  { href: '/', label: 'Dashboard', icon: Calendar },
  { href: '/adaptive-sheet', label: 'Practice Problems', icon: Target },
  { href: '/contests', label: 'Contests', icon: Trophy },
  { href: '/paths', label: 'Learning Paths', icon: BookOpen },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/visualizers', label: 'Visualizers', icon: PieChart },
  { href: '/groups', label: 'Groups', icon: Users },
];

// ------------------ Sidebar Item ------------------
const SidebarItem = ({
  href,
  label,
  icon: Icon,
  isActive,
  isOpen,
  delay,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  isOpen: boolean;
  delay: number;
}) => {
  return (
    <Link
      href={href}
      title={!isOpen ? label : undefined}
      className={cn(
        'relative flex items-center p-2 rounded-xl transition-all duration-150 cursor-pointer group justify-start gap-3',
        isActive
          ? 'bg-[#2563EB]/40 text-[#2563EB] shadow-glow border-l-4 border-[#2563EB]'
          : 'text-white/70 hover:text-white hover:bg-[#2563EB]/20 hover:scale-105'
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <Icon className='h-5 w-5 flex-shrink-0' />
      <span
        className={cn(
          'text-sm font-medium transition-opacity duration-150',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {label}
      </span>
    </Link>
  );
};

// ------------------ Sidebar Footer ------------------
const SidebarFooter = ({
  cfData,
  isOpen,
}: {
  cfData: any;
  isOpen: boolean;
}) => {
  if (!cfData) return null;
  const tier = getCFTier(cfData.rating);

  return (
    <div
      className={cn(
        'cursor-pointer transition-transform duration-150 hover:scale-105 flex items-center',
        !isOpen && 'justify-center'
      )}
      title={`${cfData.handle} (${cfData.rating})`}
    >
      {isOpen ? (
        <div className={`p-3 rounded-xl border ${tier.bg} ${tier.color}`}>
          <p className='text-sm font-bold'>{cfData.handle}</p>
          <p className='text-xs'>
            {tier.label} · {cfData.rating}
          </p>
        </div>
      ) : (
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-full border ${tier.bg} ${tier.color} text-[10px] font-bold`}
        >
          {tier.label.split(' ')[0]}
        </div>
      )}
    </div>
  );
};

// ------------------ Sidebar Layout ------------------
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isVerified, verificationData } = useCFVerification();
  const [isOpen, setIsOpen] = useState(true);
  const [cfData, setCfData] = useState(verificationData);

  // Fetch latest CF rating
  useEffect(() => {
    const fetchLatestCFData = async () => {
      if (verificationData?.handle) {
        try {
          const res = await fetch(
            `https://codeforces.com/api/user.info?handles=${verificationData.handle}`
          );
          const data = await res.json();
          if (data.status === 'OK') {
            const user = data.result[0];
            setCfData({
              ...verificationData,
              rating: user.rating || 0,
              maxRating: user.maxRating || 0,
              rank: user.rank,
            });
          }
        } catch (err) {
          console.error('Failed to fetch CF data:', err);
        }
      }
    };
    fetchLatestCFData();
  }, [verificationData?.handle]);

  return (
    <div className='flex min-h-screen bg-[#0B1020] text-white'>
      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 z-50 h-full flex flex-col bg-[#0B1020] border-r border-white/10 shadow-lg transition-width duration-150 overflow-hidden',
          isOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Top: Hamburger always left */}
        <div className='flex items-center justify-start p-4 border-b border-white/10'>
          <button
            className='p-2 rounded-md hover:bg-white/10 transition'
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className='h-5 w-5' />
          </button>
        </div>

        {/* Main Menu */}
        <div className='flex-1 mt-4 overflow-y-auto px-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30'>
          <nav className='space-y-2'>
            {menuItems.map((item, idx) => (
              <SidebarItem
                key={item.href}
                {...item}
                isActive={
                  pathname === item.href ||
                  (item.href !== '/' && pathname?.startsWith(item.href))
                }
                isOpen={isOpen}
                delay={idx * 30}
              />
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className='p-4 border-t border-white/10 flex flex-col items-start'>
          {isVerified && <SidebarFooter cfData={cfData} isOpen={isOpen} />}
        </div>
      </div>

      {/* Main Content */}
      <div
        className='flex-1 flex flex-col h-screen transition-all duration-150'
        style={{ marginLeft: isOpen ? '16rem' : '4rem' }}
      >
        <Header />
        <main className='flex-1 overflow-y-auto p-4'>{children}</main>
      </div>
    </div>
  );
}
