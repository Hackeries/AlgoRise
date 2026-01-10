'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Layers3, ListChecks, LineChart, Trophy, Code2, Target, Zap } from 'lucide-react';

export function TrainHero({
  onQuickNav,
}: {
  onQuickNav: (key: 'blind75' | 'neet250' | 'cses' | 'leetcode') => void;
}) {
  return (
    <section className='relative overflow-hidden py-16 sm:py-20 md:py-24'>
      {/* Animated background with 3D effect */}
      <div className='absolute inset-0 -z-10'>
        <div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background' />
        <div className='absolute top-0 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px] animate-pulse' />
        <div className='absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full blur-[120px] animate-pulse' style={{ animationDelay: '1s' }} />
      </div>

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Hero Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className='flex justify-center mb-6'
        >
          <div className='glass inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg hover-glow'>
            <Sparkles className='h-4 w-4 text-primary animate-pulse' />
            <span className='gradient-text font-bold'>Accelerate Your Competitive Programming Journey</span>
          </div>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className='text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4'
        >
          <span className='block bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient'>
            Master DSA, ICPC & Tech Interviews
          </span>
        </motion.h1>

        {/* Hero Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className='text-center text-muted-foreground text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed'
        >
          <span className='font-semibold text-foreground'>Solve curated problem sets</span>, track your progress with analytics, and{' '}
          <span className='font-semibold text-foreground'>dominate</span> competitive programming contests and technical interviews.
        </motion.p>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className='grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12'
        >
          <StatCard icon={<Target />} value='2000+' label='Problems' />
          <StatCard icon={<Code2 />} value='50+' label='Topics' />
          <StatCard icon={<Trophy />} value='ICPC' label='Focused' />
          <StatCard icon={<Zap />} value='Live' label='Practice' />
        </motion.div>

        {/* Quick Nav Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto'
        >
          <QuickNavCard
            icon={<ListChecks className='h-6 w-6' />}
            title='Blind 75'
            desc='Essential interview problems'
            gradient='from-orange-500 to-pink-600'
            color='orange'
            onClick={() => onQuickNav('blind75')}
          />
          <QuickNavCard
            icon={<Layers3 className='h-6 w-6' />}
            title='NeetCode 250'
            desc='Structured learning path'
            gradient='from-blue-500 to-cyan-600'
            color='blue'
            onClick={() => onQuickNav('neet250')}
          />
          <QuickNavCard
            icon={<Trophy className='h-6 w-6' />}
            title='CSES'
            desc='Competitive mastery'
            gradient='from-green-500 to-emerald-600'
            color='green'
            onClick={() => onQuickNav('cses')}
          />
          <QuickNavCard
            icon={<LineChart className='h-6 w-6' />}
            title='LeetCode'
            desc='Interview preparation'
            gradient='from-purple-500 to-indigo-600'
            color='purple'
            onClick={() => onQuickNav('leetcode')}
          />
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className='glass-intense rounded-xl p-4 text-center hover-lift'>
      <div className='text-primary mb-2 flex justify-center'>{icon}</div>
      <div className='text-lg font-bold text-foreground mb-1'>{value}</div>
      <div className='text-xs text-muted-foreground uppercase tracking-wide'>{label}</div>
    </div>
  );
}

function QuickNavCard({
  icon,
  title,
  desc,
  gradient,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  gradient: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <Card
      onClick={onClick}
      className='cursor-pointer card-3d-ultra group border-border/50 hover:border-primary/50 overflow-hidden hover-shine'
    >
      <CardContent className='p-6 flex flex-col items-center text-center space-y-4 relative'>
        {/* Icon with 3D effect */}
        <div className='relative'>
          <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
          <div
            className={`relative w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} text-white shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
          >
            {icon}
          </div>
        </div>
        
        {/* Content */}
        <div className='space-y-2'>
          <h3 className='text-lg font-bold text-foreground group-hover:text-primary transition-colors'>{title}</h3>
          <p className='text-muted-foreground text-sm leading-relaxed'>{desc}</p>
        </div>

        {/* Hover indicator */}
        <div className='text-xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1'>
          Start now <span>→</span>
        </div>
      </CardContent>
    </Card>
  );
}
