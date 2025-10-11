'use client';

import { motion } from 'framer-motion';
import { UserPlus, Target, TrendingUp, Award } from 'lucide-react';

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
      icon: Award,
      title: 'Compete & Excel',
      description:
        'Join contests, compete with peers, and climb the leaderboards as you master algorithms.',
      step: '04',
    },
  ];

  return (
    <section className='relative z-10 py-24 px-4 overflow-hidden'>
      {/* 🎨 Background Blobs */}
      <div className='absolute top-[-150px] left-[-100px] w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-3xl animate-blob' />
      <div className='absolute bottom-[-120px] right-[-80px] w-[400px] h-[400px] bg-green-400/10 rounded-full blur-3xl animate-blob animation-delay-2000' />

      <div className='max-w-6xl mx-auto relative'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className='text-center mb-20'
        >
          <h2 className='text-4xl md:text-5xl font-bold mb-6 text-white'>
            How It Works
          </h2>
          <p className='text-lg text-white/80 max-w-2xl mx-auto leading-relaxed'>
            Get started in minutes and begin your journey to competitive
            programming mastery
          </p>
        </motion.div>

        {/* Steps */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative'>
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
                <div className='hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent -translate-x-1/2 z-0' />
              )}

              <motion.div
                whileHover={{ scale: 1.05 }}
                className='relative bg-black/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#63EDA1]/50 transition-all duration-300 shadow-lg'
              >
                {/* Step number */}
                <div className='absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-[#63EDA1] to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-xl animate-pulse'>
                  {step.step}
                </div>

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  className='inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mb-6 transition-transform duration-300'
                >
                  <step.icon className='h-8 w-8 text-[#63EDA1]' />
                </motion.div>

                {/* Content */}
                <h3 className='text-xl font-semibold text-white mb-3 hover:text-[#63EDA1] transition-colors'>
                  {step.title}
                </h3>
                <p className='text-white/70 leading-relaxed text-sm'>
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