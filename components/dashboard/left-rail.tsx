'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Calendar,
  BookOpen,
  Trophy,
  BarChart2,
  Users,
  Cpu,
} from 'lucide-react';

const items = [
  { href: '/train', label: 'Today', key: 'today', icon: Calendar },
  {
    href: '/adaptive-sheet',
    label: 'Adaptive Sheet',
    key: 'sheet',
    icon: BookOpen,
  },
  { href: '/contests', label: 'Contests', key: 'contests', icon: Trophy },
  { href: '/analytics', label: 'Analytics', key: 'analytics', icon: BarChart2 },
  { href: '/groups', label: 'Groups', key: 'groups', icon: Users },
  { href: '/visualizers', label: 'Visualizers', key: 'visualizers', icon: Cpu },
];

export function LeftRail({ active }: { active?: string }) {
  return (
    <nav className='rounded-lg border bg-card p-2 text-sm w-full md:w-60'>
      <ul className='flex flex-col space-y-1'>
        {items.map(item => {
          const isActive = active === item.key;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
                  isActive
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className='h-4 w-4' />
                <span className='truncate'>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
