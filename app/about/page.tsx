'use client'

import { motion } from 'framer-motion'
import {
  Target,
  TrendingUp,
  Users,
  Zap,
  BookOpen,
  BarChart3,
  Globe,
  Code2,
  Award,
  Rocket,
} from 'lucide-react'
import Link from 'next/link'

const stats = [
  { value: '15,000+', label: 'Curated Problems', icon: Code2 },
  { value: '50+', label: 'Learning Paths', icon: BookOpen },
  { value: '5+', label: 'Platforms Integrated', icon: Globe },
]

const features = [
  {
    icon: Target,
    title: 'Adaptive Problem Selection',
    description:
      'Our algorithm analyzes your solving patterns, strengths, and weaknesses to recommend problems that push you just beyond your comfort zone—the sweet spot for growth.',
  },
  {
    icon: TrendingUp,
    title: 'Real Progress Tracking',
    description:
      'Track your Codeforces rating, problem-solving streaks, topic mastery, and compare your progress with peers. No more guessing if you are improving.',
  },
  {
    icon: BarChart3,
    title: 'Structured Learning Paths',
    description:
      'From arrays to advanced DP, each path is battle-tested by competitive programmers. No random problem picking—every problem serves a purpose.',
  },
  {
    icon: Users,
    title: 'Group Competitions',
    description:
      'Create or join groups with your college, company, or friends. Compete on leaderboards, participate in group contests, and push each other to improve.',
  },
  {
    icon: Zap,
    title: 'Multi-Platform Integration',
    description:
      'Sync your progress from Codeforces, AtCoder, LeetCode, and more. Practice anywhere, track everything in one place.',
  },
  {
    icon: Award,
    title: 'Contest Analytics',
    description:
      'Deep-dive into your contest performance. Understand time management, problem selection strategy, and rating predictions.',
  },
]

const differentiators = [
  {
    title: 'Not Another Problem List',
    description:
      'Unlike static problem sheets, AlgoRise adapts to YOUR level. Solved a problem easily? We will challenge you harder. Struggled? We will reinforce fundamentals first.',
  },
  {
    title: 'Built for the Long Game',
    description:
      'We focus on sustainable improvement over months, not quick hacks. Our paths are designed by people who have climbed from Newbie to Candidate Master and beyond.',
  },
  {
    title: 'Community-Driven Curation',
    description:
      'Every problem in our database is tagged, rated, and reviewed by competitive programmers. No AI-generated filler—just proven, effective practice material.',
  },
]

export default function AboutPage() {
  return (
    <main className='min-h-screen bg-gradient-to-br from-background via-muted/20 to-background'>
      {/* Hero Section */}
      <section className='relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10' />
        <div className='relative max-w-5xl mx-auto px-4 py-20 text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className='inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6'>
              <Rocket className='w-4 h-4 text-primary' />
              <span className='text-sm font-medium text-primary'>
                About AlgoRise
              </span>
            </div>

            <h1 className='text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
              Helping Competitive Programmers Level Up
            </h1>
            <p className='text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed'>
              AlgoRise is an adaptive competitive programming platform that
              combines intelligent problem recommendations, structured learning
              paths, and community features to help you improve systematically.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-16 border-y border-border/50 bg-muted/20'>
        <div className='max-w-5xl mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className='text-center'
              >
                <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4'>
                  <stat.icon className='w-6 h-6 text-primary' />
                </div>
                <div className='text-4xl font-bold text-foreground mb-2'>
                  {stat.value}
                </div>
                <div className='text-muted-foreground'>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className='py-20 px-4'>
        <div className='max-w-4xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-16'
          >
            <h2 className='text-3xl font-bold mb-6'>Our Mission</h2>
            <p className='text-xl text-muted-foreground leading-relaxed'>
              Competitive programming should not feel like wandering in the
              dark. We built AlgoRise to give every programmer a clear path from
              where they are to where they want to be—whether that is cracking
              your first Div2 B or qualifying for ICPC World Finals.
            </p>
          </motion.div>

          {/* What Makes Us Different */}
          <div className='space-y-8'>
            <h3 className='text-2xl font-bold text-center mb-8'>
              What Makes AlgoRise Different
            </h3>
            {differentiators.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className='p-6 rounded-2xl bg-card/60 border border-border/40 hover:border-primary/50 transition-all'
              >
                <h4 className='text-xl font-semibold mb-3 text-foreground'>
                  {item.title}
                </h4>
                <p className='text-muted-foreground leading-relaxed'>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className='py-20 px-4 bg-muted/20'>
        <div className='max-w-6xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-12'
          >
            <h2 className='text-3xl font-bold mb-4'>Platform Features</h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Everything you need to improve at competitive programming, all in
              one place.
            </p>
          </motion.div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className='p-6 rounded-2xl bg-card/60 border border-border/40 hover:border-primary/50 hover:shadow-lg transition-all'
              >
                <div className='inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-4'>
                  <feature.icon className='w-5 h-5 text-primary' />
                </div>
                <h3 className='text-lg font-semibold mb-2 text-foreground'>
                  {feature.title}
                </h3>
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className='py-20 px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6'>
              <Users className='w-8 h-8 text-primary' />
            </div>
            <h2 className='text-3xl font-bold mb-6'>
              Built by Competitive Programmers, for Competitive Programmers
            </h2>
            <p className='text-lg text-muted-foreground leading-relaxed mb-8'>
              We have been through the grind ourselves—the frustration of
              plateaus, the joy of rating jumps, the endless hours on
              Codeforces. AlgoRise is the tool we wished we had when we started.
              Every feature is designed with one goal: helping you become a
              better competitive programmer.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-16 px-4 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 border-t border-border/50'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-2xl font-bold mb-4'>Ready to Level Up?</h2>
          <p className='text-muted-foreground mb-8'>
            Join thousands of competitive programmers improving with AlgoRise.
          </p>
          <div className='flex flex-wrap gap-4 justify-center'>
            <Link
              href='/auth/signup'
              className='px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition'
            >
              Get Started Free
            </Link>
            <Link
              href='/contact'
              className='px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition'
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className='py-12 px-4 border-t border-border/50'>
        <div className='max-w-4xl mx-auto text-center text-muted-foreground'>
          <p className='mb-2'>
            Have questions? Reach out to us at{' '}
            <a
              href='mailto:support@myalgorise.in'
              className='text-primary hover:underline'
            >
              support@myalgorise.in
            </a>
          </p>
          <p className='text-sm'>
            <Link href='/faqs' className='text-primary hover:underline'>
              View FAQs
            </Link>{' '}
            ·{' '}
            <Link href='/privacy' className='text-primary hover:underline'>
              Privacy Policy
            </Link>{' '}
            ·{' '}
            <Link href='/terms' className='text-primary hover:underline'>
              Terms of Service
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
