'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Github,
  Mail,
  Linkedin,
  Code2,
  Heart,
  ArrowUpRight,
  Trophy,
} from 'lucide-react';
import { Container } from '@/components/ui/container';

type FooterLink = { name: string; href: string };

const footerLinks = {
  quickLinks: [
    { name: 'Train', href: '/train' },
    { name: 'Contests', href: '/contests' },
    { name: 'Learning Paths', href: '/paths' },
    { name: 'Visualizers', href: '/visualizers' },
  ] satisfies FooterLink[],
  resources: [
    { name: 'Analytics', href: '/analytics' },
    { name: 'Groups', href: '/groups' },
    { name: 'Practice Problems', href: '/adaptive-sheet' },
    { name: 'Profile', href: '/profile/overview' },
  ] satisfies FooterLink[],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ] satisfies FooterLink[],
};

const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/Hackeries',
    icon: Github,
    hover:
      'hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/aviral-joshi15/',
    icon: Linkedin,
    hover: 'hover:bg-[#0A66C2] hover:text-white',
  },
  {
    name: 'Email',
    href: 'mailto:algo.rise2025@gmail.com',
    icon: Mail,
    hover: 'hover:bg-red-500 hover:text-white',
  },
] as const;

// Motion settings
const EASE = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

export function Footer() {
  const reducedMotion = useReducedMotion();

  const animatedOrbs = useMemo(
    () => ({
      left: reducedMotion
        ? { opacity: 0.25, scale: 1 }
        : { opacity: [0.3, 0.2, 0.3], scale: [1, 1.2, 1] },
      right: reducedMotion
        ? { opacity: 0.25, scale: 1 }
        : { opacity: [0.2, 0.3, 0.2], scale: [1, 1.3, 1] },
    }),
    [reducedMotion]
  );

  return (
    <motion.footer
      className='relative border-t border-border/50 bg-card/30 backdrop-blur-xl mt-auto overflow-hidden'
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE }}
      aria-labelledby='site-footer-heading'
    >
      {/* Animated gradient orbs */}
      <div
        className='absolute inset-0 overflow-hidden pointer-events-none'
        aria-hidden='true'
      >
        <motion.div
          className='absolute -top-1/2 -left-1/4 w-96 h-96 bg-linear-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl'
          animate={animatedOrbs.left}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className='absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-linear-to-tl from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl'
          animate={animatedOrbs.right}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <Container className='py-12 sm:py-16 relative z-10'>
        <h2 id='site-footer-heading' className='sr-only'>
          Footer
        </h2>

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
              aria-label='AlgoRise Home'
            >
              <motion.div
                className='p-2 rounded-xl bg-linear-to-br from-primary to-primary/60 shadow-lg'
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                <Code2
                  className='h-5 w-5 text-primary-foreground'
                  aria-hidden='true'
                />
              </motion.div>
              <span className='text-xl font-bold bg-linear-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent'>
                AlgoRise
              </span>
            </Link>

            <p className='text-sm text-muted-foreground leading-relaxed mb-4'>
              Master competitive programming through ICPC‑focused training,
              Codeforces contests, and comprehensive DSA practice.
            </p>

            <motion.div
              className='flex items-center gap-2 text-sm text-muted-foreground'
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, ease: EASE }}
            >
              <Trophy className='h-4 w-4 text-primary' aria-hidden='true' />
              <span className='font-medium'>
                CF • AtCoder • LeetCode • ICPC
              </span>
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.nav variants={itemVariants} aria-label='Quick Links'>
            <h3 className='text-sm font-semibold mb-4 text-foreground'>
              Quick Links
            </h3>
            <ul className='space-y-3'>
              {footerLinks.quickLinks.map((item, idx) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, ease: EASE }}
                  whileHover={{ x: 5 }}
                >
                  <Link
                    href={item.href}
                    className='text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group'
                  >
                    <span className='w-1.5 h-1.5 rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors' />
                    {item.name}
                    <ArrowUpRight
                      className='h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all'
                      aria-hidden='true'
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          {/* Resources */}
          <motion.nav variants={itemVariants} aria-label='Resources'>
            <h3 className='text-sm font-semibold mb-4 text-foreground'>
              Resources
            </h3>
            <ul className='space-y-3'>
              {footerLinks.resources.map((item, idx) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, ease: EASE }}
                  whileHover={{ x: 5 }}
                >
                  <Link
                    href={item.href}
                    className='text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group'
                  >
                    <span className='w-1.5 h-1.5 rounded-full bg-muted-foreground/40 group-hover:bg-primary transition-colors' />
                    {item.name}
                    <ArrowUpRight
                      className='h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all'
                      aria-hidden='true'
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>

          {/* Connect & Social */}
          <motion.section variants={itemVariants} aria-label='Connect'>
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
                  className={`p-2.5 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/50 transition-all ${social.hover}`}
                  aria-label={social.name}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className='h-5 w-5' aria-hidden='true' />
                </motion.a>
              ))}
            </div>

            <motion.div
              className='space-y-2'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, ease: EASE }}
            >
              <p className='text-xs text-muted-foreground leading-relaxed'>
                Built with{' '}
                <Heart
                  className='inline h-3 w-3 text-red-500 fill-red-500'
                  aria-hidden='true'
                />{' '}
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
          </motion.section>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className='mt-12 pt-8 border-t border-border/50'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
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

            <nav aria-label='Legal'>
              <ul className='flex items-center gap-4 text-xs'>
                {footerLinks.legal.map((item, idx) => (
                  <li key={item.name} className='flex items-center gap-4'>
                    {idx > 0 && (
                      <span
                        className='text-muted-foreground/30'
                        aria-hidden='true'
                      >
                        •
                      </span>
                    )}
                    <Link
                      href={item.href}
                      className='text-muted-foreground hover:text-primary transition-colors'
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </motion.div>
      </Container>
    </motion.footer>
  );
}
