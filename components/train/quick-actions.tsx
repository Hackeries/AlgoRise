'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Target,
  Trophy,
  BookOpen,
  Zap,
  Users,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const actions = [
  {
    title: 'Adaptive Practice',
    description:
      'Solve problems tailored to your current level. Consistency > randomness.',
    icon: Target,
    href: '/adaptive-sheet',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    title: 'Virtual Contest',
    description: 'Compete under timed conditions. Speed + accuracy is key.',
    icon: Trophy,
    href: '/contests',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  {
    title: 'Learning Paths',
    description: 'Follow structured topics for DSA & CP mastery.',
    icon: BookOpen,
    href: '/paths',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  {
    title: 'Quick Practice',
    description: 'Pick a random problem now and grind instantly.',
    icon: Zap,
    href: '/adaptive-sheet?mode=quick',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  {
    title: 'Join Groups',
    description: 'Pair up or compete with peers. Accountability drives growth.',
    icon: Users,
    href: '/groups',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  {
    title: 'Analytics',
    description: 'Track your progress & weaknesses to optimize practice.',
    icon: BarChart3,
    href: '/analytics',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
];

export function QuickActions() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row items-start justify-between gap-2'>
        <h2 className='text-2xl font-bold text-white'>Quick Actions</h2>
        <div className='text-sm text-gray-400'>Pick your next grind</div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.07 }}
            >
              <Link href={action.href}>
                <Card
                  className={`group relative overflow-hidden border ${action.borderColor} ${action.bgColor} hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer h-full`}
                >
                  {/* Hover gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-15 blur-[2px] transition-all duration-500`}
                  />

                  <CardContent className='relative p-5'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex-1 space-y-2'>
                        <div className='flex items-center gap-3'>
                          <div
                            className={`p-3 rounded-xl bg-gradient-to-br ${action.color} shadow-lg group-hover:shadow-2xl transition-shadow duration-300`}
                          >
                            <Icon className='h-6 w-6 text-white' />
                          </div>
                          <h3 className='font-semibold text-white text-base'>
                            {action.title}
                          </h3>
                        </div>
                        <p className='text-sm text-gray-300 leading-relaxed'>
                          {action.description}
                        </p>
                      </div>

                      <ArrowRight className='h-5 w-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300 flex-shrink-0' />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}