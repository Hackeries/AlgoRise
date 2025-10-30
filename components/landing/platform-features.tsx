'use client';

import React from 'react';
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

const features = [
  {
    icon: Brain,
    title: 'Adaptive Learning Engine',
    description:
      "Our AI-powered system analyzes your solving patterns and adapts problem difficulty in real-time, ensuring you're always challenged at the right level.",
    gradient: 'from-blue-500 to-cyan-500',
    glowColor: 'blue-500',
  },
  {
    icon: Zap,
    title: 'Codeforces Integration',
    description:
      'Seamlessly sync your Codeforces profile, track contest performance, and get personalized recommendations based on your competitive programming journey.',
    gradient: 'from-emerald-500 to-teal-500',
    glowColor: 'emerald-500',
  },
  {
    icon: LineChart,
    title: 'Progress Analytics',
    description:
      'Visualize your growth with detailed analytics, topic-wise breakdowns, and performance trends that help you identify strengths and areas for improvement.',
    gradient: 'from-purple-500 to-pink-500',
    glowColor: 'purple-500',
  },
  {
    icon: Sword,
    title: 'Real-time Battle Arena',
    description:
      'Compete in 1v1 duels or 3v3 team battles with real-time matchmaking, ELO ratings, and collaborative team features for ultimate competitive programming experience.',
    gradient: 'from-red-500 to-orange-500',
    glowColor: 'red-500',
  },
  {
    icon: Users,
    title: 'Group Competitions',
    description:
      'Create or join study groups, compete with friends on leaderboards, and participate in group challenges to stay motivated and accountable.',
    gradient: 'from-orange-500 to-yellow-500',
    glowColor: 'orange-500',
  },
  {
    icon: Shield,
    title: 'Verified Profiles',
    description:
      'Connect your Codeforces handle with secure verification to unlock personalized features and compete with confidence in a trusted community.',
    gradient: 'from-indigo-500 to-blue-500',
    glowColor: 'indigo-500',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description:
      'Get curated problem sets based on your skill level, learning goals, and upcoming contests to maximize your practice efficiency.',
    gradient: 'from-yellow-500 to-amber-500',
    glowColor: 'yellow-500',
  },
];

export default function PlatformFeatures() {
  return (
    <section className='relative py-20 sm:py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background'>
      {/* Animated gradient orbs */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          className='absolute top-1/3 -left-1/4 w-96 h-96 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-full blur-3xl'
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className='absolute bottom-1/3 -right-1/4 w-96 h-96 bg-gradient-to-tl from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl'
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16 sm:mb-20'
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6'
          >
            <Sparkles className='w-4 h-4 text-primary' />
            <span className='text-sm font-medium text-primary'>
              Platform Features
            </span>
          </motion.div>

          <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-4'>
            <span className='bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent'>
              Everything You Need to Master Algorithms
            </span>
          </h2>
          <p className='text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
            AlgoRise combines adaptive learning, real-time contest tracking,
            competitive battles, and community features to create the ultimate
            competitive programming platform.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className='group relative'
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className='
                  h-full p-6 sm:p-8 rounded-2xl
                  bg-card/50 backdrop-blur-xl border border-border/50
                  hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10
                  transition-all duration-300
                '
              >
                {/* Icon Container */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`
                    inline-flex p-4 rounded-xl mb-5
                    bg-gradient-to-br ${feature.gradient}
                    shadow-lg
                  `}
                >
                  <feature.icon className='h-7 w-7 text-white' />
                </motion.div>

                {/* Title */}
                <h3 className='text-lg sm:text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors'>
                  {feature.title}
                </h3>

                {/* Description */}
                <p className='text-sm sm:text-base text-muted-foreground leading-relaxed'>
                  {feature.description}
                </p>

                {/* Hover Glow Effect */}
                <motion.div
                  className={`
                    absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                    bg-gradient-to-br ${feature.gradient}
                    blur-xl -z-10 transition-opacity duration-300
                  `}
                  style={{ opacity: 0.1 }}
                />

                {/* Subtle Border Animation */}
                <div className='absolute inset-0 rounded-2xl overflow-hidden'>
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20`}
                    initial={false}
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA or Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className='text-center mt-16'
        >
          <p className='text-muted-foreground text-sm sm:text-base'>
            Join thousands of competitive programmers who trust AlgoRise for
            their practice and growth
          </p>
        </motion.div>
      </div>
    </section>
  );
}
