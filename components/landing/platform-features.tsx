'use client';

import { motion } from 'framer-motion';
import { Brain, Zap, LineChart, Users, Shield, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
      icon: Users,
      title: 'Group Competitions',
      description:
        'Create or join study groups, compete with friends on leaderboards, and participate in group challenges to stay motivated and accountable.',
      gradient: 'from-orange-500 to-red-500',
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
    <section className='relative z-10 py-24 px-4 overflow-hidden'>
      {/* Animated Background Blobs */}
      <div className='absolute top-[-100px] left-[-150px] w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-3xl animate-blob' />
      <div className='absolute bottom-[-150px] right-[-100px] w-[400px] h-[400px] bg-green-400/10 rounded-full blur-3xl animate-blob animation-delay-2000' />

      <div className='max-w-7xl mx-auto relative'>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl md:text-5xl font-bold mb-6 text-white'>
            Everything You Need to{' '}
            <span className='bg-gradient-to-r from-[#63EDA1] via-blue-400 to-purple-400 bg-clip-text text-transparent'>
              Master Algorithms
            </span>
          </h2>
          <p className='text-lg text-white/80 max-w-3xl mx-auto leading-relaxed'>
            MyAlgoRise combines adaptive learning, real-time contest tracking,
            and community features to create the ultimate competitive
            programming platform.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative'>
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
                className='h-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all duration-300 shadow-lg'
              >
                <CardContent className='p-0'>
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 transition-transform duration-300`}
                  >
                    <feature.icon className='h-8 w-8 text-white' />
                  </motion.div>

                  {/* Title */}
                  <h3 className='text-xl font-semibold text-white mb-4 group-hover:text-[#63EDA1] transition-colors'>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className='text-white/70 leading-relaxed'>
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