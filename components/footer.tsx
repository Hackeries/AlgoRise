'use client';

import React from 'react';
import Link from 'next/link';
import {
  Github,
  Mail,
  Linkedin,
  Code2,
  Heart,
  ArrowUpRight,
  Trophy,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/container';

const footerLinks = {
  quickLinks: [
    { name: 'Train', href: '/train' },
    { name: 'Contests', href: '/contests' },
    { name: 'Learning Paths', href: '/paths' },
    { name: 'Visualizers', href: '/visualizers' },
  ],
  resources: [
    { name: 'Analytics', href: '/analytics' },
    { name: 'Groups', href: '/groups' },
    { name: 'Practice Problems', href: '/adaptive-sheet' },
    { name: 'Profile', href: '/profile/overview' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
};

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/Hackeries',
    icon: Github,
    hoverColor:
      'hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/aviral-joshi15/',
    icon: Linkedin,
    hoverColor: 'hover:bg-[#0A66C2] hover:text-white',
  },
  {
    name: 'Email',
    href: 'mailto:algo.rise2025@gmail.com',
    icon: Mail,
    hoverColor: 'hover:bg-red-500 hover:text-white',
  },
];

export function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as any, // Fixed TypeScript error
      },
    },
  };

  return (
    <motion.footer
      className='relative border-t border-border/50 bg-card/30 backdrop-blur-xl mt-auto overflow-hidden'
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated gradient orbs */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          className='absolute -top-1/2 -left-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl'
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
          className='absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-gradient-to-tl from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl'
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

      <Container className='py-12 sm:py-16 relative z-10'>
        <motion.div
          className='grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4'
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className='lg:col-span-1'>
            <Link
              href='/'
              className='inline-flex items-center gap-2 mb-4 group'
            >
              <motion.div
                className='p-2 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg'
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Code2 className='h-5 w-5 text-primary-foreground' />
              </motion.div>
              <h3 className='text-xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent'>
                AlgoRise
              </h3>
            </Link>

            <p className='text-sm text-muted-foreground leading-relaxed mb-4'>
              Master competitive programming through ICPC-focused training,
              Codeforces contests, and comprehensive DSA practice.
            </p>

            <motion.div
              className='flex items-center gap-2 text-sm text-muted-foreground'
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Trophy className='h-4 w-4 text-primary' />
              <span className='font-medium'>
                CF • AtCoder • LeetCode • ICPC
              </span>
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className='text-sm font-semibold mb-4 text-foreground'>
              Quick Links
            </h3>
            <ul className='space-y-3'>
              {footerLinks.quickLinks.map((item, idx) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  <Link
                    href={item.href}
                    className='text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group'
                  >
                    <span className='w-1.5 h-1.5 rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors' />
                    {item.name}
                    <ArrowUpRight className='h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all' />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h3 className='text-sm font-semibold mb-4 text-foreground'>
              Resources
            </h3>
            <ul className='space-y-3'>
              {footerLinks.resources.map((item, idx) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  <Link
                    href={item.href}
                    className='text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group'
                  >
                    <span className='w-1.5 h-1.5 rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors' />
                    {item.name}
                    <ArrowUpRight className='h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all' />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Connect & Social */}
          <motion.div variants={itemVariants}>
            <h3 className='text-sm font-semibold mb-4 text-foreground'>
              Connect
            </h3>

            <div className='flex gap-3 mb-6'>
              {socialLinks.map(social => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`p-2.5 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/50 transition-all ${social.hoverColor}`}
                  aria-label={social.name}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className='h-5 w-5' />
                </motion.a>
              ))}
            </div>

            <motion.div
              className='space-y-2'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className='text-xs text-muted-foreground leading-relaxed'>
                Built with{' '}
                <Heart className='inline h-3 w-3 text-red-500 fill-red-500' />{' '}
                for competitive programmers
              </p>
              <p className='text-xs text-muted-foreground'>
                by{' '}
                <a
                  href='https://www.linkedin.com/in/aviral-joshi15/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium text-foreground hover:text-primary transition-colors'
                >
                  Aviral Joshi
                </a>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className='mt-12 pt-8 border-t border-border/50'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
            <p className='text-xs text-muted-foreground'>
              © {new Date().getFullYear()}{' '}
              <Link
                href='/'
                className='font-semibold text-foreground hover:text-primary transition-colors'
              >
                AlgoRise
              </Link>
              . All rights reserved.
            </p>

            <div className='flex items-center gap-4 text-xs'>
              {footerLinks.legal.map((item, idx) => (
                <React.Fragment key={item.name}>
                  {idx > 0 && (
                    <span className='text-muted-foreground/30'>•</span>
                  )}
                  <Link
                    href={item.href}
                    className='text-muted-foreground hover:text-primary transition-colors'
                  >
                    {item.name}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>
        </motion.div>
      </Container>
    </motion.footer>
  );
}
