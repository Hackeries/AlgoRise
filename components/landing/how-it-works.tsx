'use client';

import { motion } from 'framer-motion';
import { UserPlus, Target, TrendingUp, Award, Sword } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: 'Sign Up & Verify',
      description:
        'Create your account and connect your Codeforces handle to get started with personalized learning.',
      step: '01',
    },
    {
      icon: Target,
      title: 'Start Adaptive Practice',
      description:
        'Our AI analyzes your skill level and recommends problems that match your current abilities.',
      step: '02',
    },
    {
      icon: TrendingUp,
      title: 'Track Your Progress',
      description:
        'Monitor your improvement with detailed analytics, streaks, and performance insights.',
      step: '03',
    },
    {
      icon: Sword,
      title: 'Compete in Battle Arena',
      description:
        'Challenge other programmers in real-time 1v1 duels or team-based 3v3 battles with ELO ratings.',
      step: '04',
    },
    {
      icon: Award,
      title: 'Compete & Excel',
      description:
        'Join contests, compete with peers, and climb the leaderboards as you master algorithms.',
      step: '05',
    },
  ];

  return (
    <section className='relative z-10 py-12 sm:py-16 lg:py-24 px-3 sm:px-4 lg:px-6 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-transparent dark:via-transparent dark:to-transparent'>
      <div className='absolute top-[-100px] left-[-80px] sm:top-[-120px] sm:left-[-100px] lg:top-[-150px] lg:left-[-100px] w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] lg:w-[350px] lg:h-[350px] bg-purple-500/20 dark:bg-purple-600/15 rounded-full blur-3xl animate-blob' />
      <div className='absolute bottom-[-80px] right-[-60px] sm:bottom-[-100px] sm:right-[-80px] lg:bottom-[-120px] lg:right-[-80px] w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[400px] lg:h-[400px] bg-green-400/20 dark:bg-green-600/15 rounded-full blur-3xl animate-blob animation-delay-2000' />

      <div className='max-w-6xl mx-auto relative'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className='text-center mb-8 sm:mb-12 lg:mb-20'
        >
          <h2 className='text-2xl sm:text-3xl lg:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6'>
            <span className='bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent'>
              How It Works
            </span>
          </h2>
          <p className='text-sm sm:text-base lg:text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed'>
            Get started in minutes and begin your journey to competitive
            programming mastery
          </p>
        </motion.div>

        {/* Steps */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 relative'>
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className='relative'
            >
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className='hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-white/20 dark:from-white/20 to-transparent -translate-x-1/2 z-0' />
              )}

              <motion.div
                whileHover={{ scale: 1.05 }}
                className='relative bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gray-300 dark:border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-6 hover:border-primary/50 dark:hover:border-[#63EDA1]/50 transition-all duration-300 shadow-lg'
              >
                {/* Step number */}
                <div className='absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 dark:from-[#63EDA1] dark:to-green-600 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-xl'>
                  {step.step}
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  className='inline-flex p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-500/30 dark:to-purple-500/30 mb-4 sm:mb-6 transition-transform duration-300'
                >
                  <step.icon className='h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-[#63EDA1]' />
                </motion.div>

                {/* Content */}
                <h3 className='text-base sm:text-lg lg:text-xl font-semibold text-slate-800 dark:text-white mb-2 sm:mb-3 hover:text-blue-600 dark:hover:text-[#63EDA1] transition-colors'>
                  {step.title}
                </h3>
                <p className='text-slate-600 dark:text-white/70 leading-relaxed text-xs sm:text-sm lg:text-base'>
                  {step.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
