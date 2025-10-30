'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sword,
  Users,
  Trophy,
  History,
  Zap,
  Flame,
  Crown,
  ArrowRight,
  Sparkles,
  Clock,
  Users2,
} from 'lucide-react';
import { motion } from 'framer-motion';
export default function BattleArenaPage() {
  const [selectedMode, setSelectedMode] = useState<'1v1' | '3v3' | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as const },
    },
  };

  const BattleCard = ({
    icon: Icon,
    title,
    description,
    stats,
    href,
    gradient,
    accentColor,
    id,
  }: any) => (
    <motion.div
      variants={itemVariants}
      onHoverStart={() => setHoveredCard(id)}
      onHoverEnd={() => setHoveredCard(null)}
    >
      <Link href={href}>
        <motion.div
          className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 cursor-pointer group h-full`}
          style={{
            background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
            borderColor: accentColor,
          }}
          whileHover={{
            scale: 1.02,
            boxShadow: `0 20px 40px ${accentColor}40`,
          }}
        >
          <motion.div
            className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            style={{
              background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${accentColor}20, transparent 80%)`,
            }}
          />

          <div className='relative p-6 md:p-8 h-full flex flex-col'>
            {/* Header with icon */}
            <div className='flex items-start justify-between mb-6'>
              <motion.div
                animate={
                  hoveredCard === id
                    ? { scale: 1.1, rotate: 5 }
                    : { scale: 1, rotate: 0 }
                }
                transition={{ duration: 0.3 }}
                className={`p-3 rounded-xl ${accentColor} bg-opacity-20`}
              >
                <Icon className='w-6 h-6' style={{ color: accentColor }} />
              </motion.div>
              <motion.div
                animate={hoveredCard === id ? { x: 5 } : { x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight
                  className='w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity'
                  style={{ color: accentColor }}
                />
              </motion.div>
            </div>

            {/* Title and description */}
            <div className='mb-6 flex-grow'>
              <h3 className='text-2xl md:text-3xl font-bold text-white mb-2'>
                {title}
              </h3>
              <p className='text-sm md:text-base opacity-90 text-white/80'>
                {description}
              </p>
            </div>

            {/* Stats grid */}
            <div className='grid grid-cols-3 gap-3 mb-6'>
              {stats.map((stat: any, idx: number) => (
                <motion.div
                  key={idx}
                  className='p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20'
                  whileHover={{ scale: 1.05 }}
                >
                  <p className='text-xs opacity-75 text-white/70 mb-1'>
                    {stat.label}
                  </p>
                  <p className='font-semibold text-white text-sm'>
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className='w-full font-semibold py-6 text-base rounded-xl text-white border-0 transition-all duration-300'
                style={{ backgroundColor: accentColor }}
              >
                Get Started
                <motion.div
                  animate={hoveredCard === id ? { x: 5 } : { x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className='w-4 h-4 ml-2' />
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 md:p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-orange-500/20 border border-orange-500/30 backdrop-blur-sm'
        >
          <div className='flex items-start gap-3'>
            <div className='mt-0.5'>
              <div className='p-2 rounded-lg bg-orange-500/20'>
                <Trophy className='w-5 h-5 text-orange-400' />
              </div>
            </div>
            <div className='flex-1'>
              <h3 className='font-bold text-white mb-1 text-sm sm:text-base'>Battle Arena vs Private Contests</h3>
              <p className='text-xs sm:text-sm text-gray-300'>
                <strong className='text-orange-400'>⚔️ Battle Arena:</strong> Real-time competitive matches with instant matchmaking and live battles. Perfect for quick competitive practice!
              </p>
              <p className='text-xs sm:text-sm text-gray-300 mt-1'>
                <strong className='text-purple-400'>🎯 Private Contests:</strong> Looking for custom contests? Visit the <Link href='/contests' className='underline hover:text-purple-300'>Contests page</Link> to create or join private training sessions!
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className='mb-12 text-center'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className='inline-block mb-4'>
            <motion.div
              className='flex items-center justify-center gap-3 mb-4'
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              <Flame className='w-8 h-8 text-orange-500' />
              <h1 className='text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent'>
                Battle Arena
              </h1>
              <Flame className='w-8 h-8 text-orange-500' />
            </motion.div>
          </div>
          <p className='text-lg text-blue-200 max-w-2xl mx-auto mb-2'>
            Compete in real-time duels or team battles. Climb the leaderboards
            and prove your algorithmic mastery.
          </p>
          <motion.div
            className='flex items-center justify-center gap-2 text-sm text-blue-300/70'
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            <Sparkles className='w-4 h-4' />
            <span>Choose your battle mode below</span>
          </motion.div>
        </motion.div>

        <Tabs defaultValue='quick-play' className='w-full'>
          <TabsList className='grid w-full grid-cols-4 bg-slate-900/50 border border-blue-500/20 rounded-xl p-1 mb-8 gap-1'>
            <TabsTrigger
              value='quick-play'
              className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 rounded-lg transition-all duration-300'
            >
              <Sword className='w-4 h-4 mr-2' />
              Quick Play
            </TabsTrigger>
            <TabsTrigger
              value='team-battles'
              className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 rounded-lg transition-all duration-300'
            >
              <Users className='w-4 h-4 mr-2' />
              Team Battles
            </TabsTrigger>
            <TabsTrigger
              value='leaderboards'
              className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600 rounded-lg transition-all duration-300'
            >
              <Trophy className='w-4 h-4 mr-2' />
              Leaderboards
            </TabsTrigger>
            <TabsTrigger
              value='history'
              className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 rounded-lg transition-all duration-300'
            >
              <History className='w-4 h-4 mr-2' />
              History
            </TabsTrigger>
          </TabsList>

          {/* Quick Play Tab */}
          <TabsContent value='quick-play' className='space-y-4'>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='space-y-4'
            >
              <BattleCard
                id='1v1'
                icon={Sword}
                title='1v1 Duels'
                description='Fast-paced head-to-head battles where speed and accuracy matter'
                stats={[
                  { label: 'Format', value: 'Best of 1 or 3' },
                  { label: 'Scoring', value: 'Fastest AC' },
                  { label: 'Reward', value: 'ELO Points' },
                ]}
                href='/battle-arena/queue/1v1'
                gradient={[
                  'rgba(59, 130, 246, 0.2)',
                  'rgba(34, 211, 238, 0.2)',
                ]}
                accentColor='#3b82f6'
              />
            </motion.div>
          </TabsContent>

          {/* Team Battles Tab */}
          <TabsContent value='team-battles' className='space-y-4'>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='space-y-4'
            >
              <BattleCard
                id='3v3'
                icon={Users}
                title='3v3 ICPC-Style Battles'
                description='Collaborative team competitions with strategic problem-solving'
                stats={[
                  { label: 'Team Size', value: 'Exactly 3' },
                  { label: 'Scoring', value: 'ICPC Rules' },
                  { label: 'Duration', value: '60 Minutes' },
                ]}
                href='/battle-arena/team/create'
                gradient={[
                  'rgba(168, 85, 247, 0.2)',
                  'rgba(236, 72, 153, 0.2)',
                ]}
                accentColor='#a855f7'
              />
            </motion.div>
          </TabsContent>

          {/* Leaderboards Tab */}
          <TabsContent value='leaderboards' className='space-y-4'>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='grid grid-cols-1 md:grid-cols-2 gap-4'
            >
              <BattleCard
                id='1v1-lb'
                icon={Trophy}
                title='1v1 Rankings'
                description='Top individual competitors and their ELO ratings'
                stats={[
                  { label: 'Players', value: 'Ranked' },
                  { label: 'Rating', value: 'ELO Based' },
                  { label: 'Updated', value: 'Real-time' },
                ]}
                href='/battle-arena/leaderboards/1v1'
                gradient={['rgba(234, 179, 8, 0.2)', 'rgba(249, 115, 22, 0.2)']}
                accentColor='#eab308'
              />
              <BattleCard
                id='3v3-lb'
                icon={Users2}
                title='3v3 Rankings'
                description='Top teams and their collective performance metrics'
                stats={[
                  { label: 'Teams', value: 'Ranked' },
                  { label: 'Rating', value: 'Team ELO' },
                  { label: 'Updated', value: 'Real-time' },
                ]}
                href='/battle-arena/leaderboards/3v3'
                gradient={['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.2)']}
                accentColor='#f97316'
              />
            </motion.div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value='history' className='space-y-4'>
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              className='space-y-4'
            >
              <BattleCard
                id='history'
                icon={History}
                title='Battle History'
                description='Review your past battles, statistics, and performance trends'
                stats={[
                  { label: 'Battles', value: 'All Time' },
                  { label: 'Stats', value: 'Detailed' },
                  { label: 'Trends', value: 'Analytics' },
                ]}
                href='/battle-arena/history'
                gradient={['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.2)']}
                accentColor='#22c55e'
              />
            </motion.div>
          </TabsContent>
        </Tabs>
        <motion.div
          className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-4'
          variants={containerVariants}
          initial='hidden'
          animate='visible'
        >
          <motion.div
            variants={itemVariants}
            className='p-6 rounded-xl bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/20 backdrop-blur-sm'
          >
            <div className='flex items-center gap-3 mb-2'>
              <Zap className='w-5 h-5 text-blue-400' />
              <p className='text-sm text-blue-300/70'>Live Matchmaking</p>
            </div>
            <p className='text-base text-blue-200'>Realtime rooms powered by Supabase</p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className='p-6 rounded-xl bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 backdrop-blur-sm'
          >
            <div className='flex items-center gap-3 mb-2'>
              <Clock className='w-5 h-5 text-purple-400' />
              <p className='text-sm text-purple-300/70'>Seamless Experience</p>
            </div>
            <p className='text-base text-purple-200'>Smooth animations and modern UI theme</p>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className='p-6 rounded-xl bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/20 backdrop-blur-sm'
          >
            <div className='flex items-center gap-3 mb-2'>
              <Crown className='w-5 h-5 text-yellow-400' />
              <p className='text-sm text-yellow-300/70'>Private Beta</p>
            </div>
            <p className='text-base text-yellow-200'>No placeholder stats shown during beta</p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
