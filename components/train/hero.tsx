'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Layers3, ListChecks, LineChart, Trophy } from 'lucide-react';

export function TrainHero({
  onQuickNav,
}: {
  onQuickNav: (key: 'blind75' | 'neet250' | 'cses' | 'leetcode') => void;
}) {
  return (
    <section className='relative overflow-hidden py-20 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950'>
      {/* Background radial gradient */}
      <div className='absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(99,102,241,0.08),transparent_70%)] animate-spin-slow -z-10' />

      <div className='relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        {/* Hero Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className='inline-flex items-center gap-2 px-6 py-2 rounded-full text-purple-400 font-semibold bg-purple-500/10 border border-purple-400/20 backdrop-blur-sm mb-6'
        >
          <Sparkles className='h-4 w-4' />
          Accelerate Your DSA & ICPC Journey
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-6'
        >
          Train Like a Pro — Master DSA, ICPC, and HFT Interviews
        </motion.h1>

        {/* Hero Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className='text-gray-400 text-lg max-w-2xl mx-auto mb-12 leading-relaxed'
        >
          Solve curated problems, track your growth, and prepare for world-class
          competitions and interviews.
        </motion.p>

        {/* Quick Nav Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto'
        >
          <QuickNavCard
            icon={<ListChecks className='h-6 w-6' />}
            title='Blind 75'
            desc='Essential interview problems'
            gradient='from-orange-400 to-pink-500'
            onClick={() => onQuickNav('blind75')}
          />
          <QuickNavCard
            icon={<Layers3 className='h-6 w-6' />}
            title='NeetCode 250'
            desc='Structured roadmap to mastery'
            gradient='from-blue-400 to-cyan-400'
            onClick={() => onQuickNav('neet250')}
          />
          <QuickNavCard
            icon={<Trophy className='h-6 w-6' />}
            title='CSES'
            desc='Competitive programming grind'
            gradient='from-green-400 to-emerald-400'
            onClick={() => onQuickNav('cses')}
          />
          <QuickNavCard
            icon={<LineChart className='h-6 w-6' />}
            title='LeetCode'
            desc='Real interview prep problems'
            gradient='from-purple-400 to-indigo-400'
            onClick={() => onQuickNav('leetcode')}
          />
        </motion.div>
      </div>
    </section>
  );
}

function QuickNavCard({
  icon,
  title,
  desc,
  gradient,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer group border border-gray-800/50 bg-gray-950/40 backdrop-blur-md overflow-hidden transition-transform transform hover:-translate-y-2 hover:shadow-2xl`}
    >
      <CardContent className='p-6 flex flex-col items-center text-center space-y-3'>
        <div
          className={`w-14 h-14 rounded-lg flex items-center justify-center bg-gradient-to-r ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        <h3 className='text-lg font-bold text-white'>{title}</h3>
        <p className='text-gray-400 text-sm'>{desc}</p>
      </CardContent>
    </Card>
  );
}
