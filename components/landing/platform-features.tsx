'use client';

import { motion } from 'framer-motion';
import {
  Brain,
  Zap,
  LineChart,
  Users,
  Shield,
  Sparkles,
  Sword,
} from 'lucide-react';
import { CardContent } from '@/components/ui/card';

export default function PlatformFeatures() {
  const features = [
    {
      icon: Brain,
      title: 'Adaptive Learning Engine',
      description:
        "Our AI-powered system analyzes your solving patterns and adapts problem difficulty in real-time, ensuring you're always challenged at the right level.",
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Codeforces Integration',
      description:
        'Seamlessly sync your Codeforces profile, track contest performance, and get personalized recommendations based on your competitive programming journey.',
      gradient: 'from-[#63EDA1] to-green-500',
    },
    {
      icon: LineChart,
      title: 'Progress Analytics',
      description:
        'Visualize your growth with detailed analytics, topic-wise breakdowns, and performance trends that help you identify strengths and areas for improvement.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Sword,
      title: 'Real-time Battle Arena',
      description:
        'Compete in 1v1 duels or 3v3 team battles with real-time matchmaking, ELO ratings, and collaborative team features for ultimate competitive programming experience.',
      gradient: 'from-red-500 to-orange-500',
    },
    {
      icon: Users,
      title: 'Group Competitions',
      description:
        'Create or join study groups, compete with friends on leaderboards, and participate in group challenges to stay motivated and accountable.',
      gradient: 'from-orange-500 to-yellow-500',
    },
    {
      icon: Shield,
      title: 'Verified Profiles',
      description:
        'Connect your Codeforces handle with secure verification to unlock personalized features and compete with confidence in a trusted community.',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description:
        'Get curated problem sets based on your skill level, learning goals, and upcoming contests to maximize your practice efficiency.',
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <section className='relative z-10 py-12 sm:py-16 lg:py-24 px-3 sm:px-4 lg:px-6 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-transparent dark:via-transparent dark:to-transparent'>
      <div className='absolute top-[-80px] left-[-100px] sm:top-[-120px] sm:left-[-150px] lg:top-[-150px] lg:left-[-150px] w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] lg:w-[350px] lg:h-[350px] bg-purple-500/20 dark:bg-purple-600/15 rounded-full blur-3xl animate-blob' />
      <div className='absolute bottom-[-100px] right-[-80px] sm:bottom-[-120px] sm:right-[-100px] lg:bottom-[-150px] lg:right-[-100px] w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[400px] lg:h-[400px] bg-green-400/20 dark:bg-green-600/15 rounded-full blur-3xl animate-blob animation-delay-2000' />

      <div className='max-w-7xl mx-auto relative'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className='text-center mb-8 sm:mb-12 lg:mb-16'
        >
          <h2 className='text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6'>
            <span className='bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent'>
              Everything You Need to Master Algorithms
            </span>
          </h2>
          <p className='text-sm sm:text-base lg:text-lg text-slate-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed'>
            MyAlgoRise combines adaptive learning, real-time contest tracking,
            competitive battles, and community features to create the ultimate
            competitive programming platform.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 relative'>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                type: 'spring',
                stiffness: 120,
              }}
              className='group perspective-1000'
            >
              <motion.div
                whileHover={{ scale: 1.05, rotateX: 2, rotateY: 2 }}
                className='h-full bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 hover:border-blue-500/50 dark:hover:border-white/30 transition-all duration-300 shadow-lg'
              >
                <CardContent className='p-0'>
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    className={`inline-flex p-3 sm:p-4 rounded-lg sm:rounded-2xl bg-gradient-to-br ${feature.gradient} mb-4 sm:mb-6 transition-transform duration-300`}
                  >
                    <feature.icon className='h-6 w-6 sm:h-8 sm:w-8 text-white' />
                  </motion.div>

                  {/* Title */}
                  <h3 className='text-base sm:text-lg lg:text-xl font-semibold text-slate-800 dark:text-white mb-2 sm:mb-4 group-hover:text-blue-600 dark:group-hover:text-[#63EDA1] transition-colors'>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className='text-slate-600 dark:text-white/70 leading-relaxed text-xs sm:text-sm lg:text-base'>
                    {feature.description}
                  </p>
                </CardContent>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
