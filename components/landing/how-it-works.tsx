'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Target,
  TrendingUp,
  Award,
  Sword,
  ArrowRight,
} from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up & Verify',
    description:
      'Create your account and connect your Codeforces handle to get started with personalized learning.',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: Target,
    title: 'Adaptive Practice',
    description:
      'Our AI analyzes your skill level and recommends problems that match your current abilities.',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description:
      'Monitor your improvement with detailed analytics, streaks, and performance insights.',
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-500/20 to-red-500/20',
  },
  {
    icon: Sword,
    title: 'Battle Arena',
    description:
      'Challenge other programmers in real-time 1v1 duels or team-based 3v3 battles with ELO ratings.',
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    icon: Award,
    title: 'Compete & Excel',
    description:
      'Join contests, compete with peers, and climb the leaderboards as you master algorithms.',
    gradient: 'from-yellow-500 to-orange-500',
    bgGradient: 'from-yellow-500/20 to-orange-500/20',
  },
];

export default function HowItWorks() {
  return (
    <section className='relative py-20 sm:py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-background via-background to-muted/30'>
      {/* Animated gradient orbs */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          className='absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-full blur-3xl'
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
          className='absolute bottom-1/4 -right-1/4 w-96 h-96 bg-gradient-to-tl from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl'
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
            <div className='w-2 h-2 rounded-full bg-primary animate-pulse' />
            <span className='text-sm font-medium text-primary'>
              How It Works
            </span>
          </motion.div>

          <h2 className='text-2xl sm:text-3xl lg:text-4xl font-bold mb-4'>
            <span className='bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent'>
              Your Path to Mastery
            </span>
          </h2>
          <p className='text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
            Get started in minutes and begin your journey to competitive
            programming excellence
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4'>
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className='relative group'
            >
              {/* Connecting Arrow - Desktop Only */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className='hidden lg:flex absolute top-20 -right-4 z-10 items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary/20 to-transparent'
                >
                  <ArrowRight className='h-4 w-4 text-primary' />
                </motion.div>
              )}

              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className={`
                  relative h-full p-6 rounded-2xl 
                  bg-card/50 backdrop-blur-xl border border-border/50
                  hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20
                  transition-all duration-300
                `}
              >
                {/* Step Number Badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  className={`
                    absolute -top-3 -right-3 w-12 h-12 rounded-full 
                    bg-gradient-to-br ${step.gradient}
                    flex items-center justify-center
                    shadow-lg shadow-primary/30
                  `}
                >
                  <span className='text-white font-bold text-lg'>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </motion.div>

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={`
                    inline-flex p-4 rounded-xl mb-4
                    bg-gradient-to-br ${step.bgGradient}
                    border border-primary/20
                  `}
                >
                  <step.icon className='h-7 w-7 text-primary' />
                </motion.div>

                {/* Content */}
                <h3 className='text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors'>
                  {step.title}
                </h3>
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {step.description}
                </p>

                {/* Hover Glow Effect */}
                <div
                  className={`
                  absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
                  bg-gradient-to-br ${step.bgGradient}
                  blur-xl -z-10 transition-opacity duration-300
                `}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className='text-center mt-16'
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all'
          >
            Get Started Now
            <ArrowRight className='h-5 w-5' />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
