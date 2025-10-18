'use client';
import Link from 'next/link';
import { Github, Mail, Linkedin, Sparkles, Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.footer
      className='relative border-t border-gray-200 dark:border-white/5 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-black dark:via-gray-950 dark:to-black backdrop-blur-md mt-auto overflow-hidden'
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated background blobs */}
      <div className='absolute top-0 left-0 w-96 h-96 bg-blue-400/10 dark:bg-[#63EDA1]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2' />
      <div className='absolute bottom-0 right-0 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2' />
      
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative z-10'>
        <motion.div
          className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
        >
          {/* About Section */}
          <motion.div variants={itemVariants}>
            <div className='flex items-center gap-2 mb-4'>
              <Code2 className='h-5 w-5 text-blue-600 dark:text-[#63EDA1]' />
              <h3 className='text-base font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:from-[#63EDA1] dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent'>
                AlgoRise
              </h3>
            </div>
            <p className='text-sm text-slate-700 dark:text-gray-300 leading-relaxed'>
              Practice that adapts. Compete when it counts. Master competitive
              programming with personalized learning paths and real-time
              contests.
            </p>
            <motion.div
              className='mt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-gray-400'
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className='h-3 w-3 text-yellow-500 dark:text-[#63EDA1]' />
              <span>Empowering 10K+ developers</span>
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h3 className='text-sm font-bold text-slate-800 dark:text-gray-200 mb-4 tracking-wide'>
              Quick Links
            </h3>
            <ul className='space-y-2.5 text-sm'>
              {[
                { name: 'Train', href: '/train' },
                { name: 'Contests', href: '/contests' },
                { name: 'Learning Paths', href: '/paths' },
                { name: 'Visualizers', href: '/visualizers' },
              ].map(item => (
                <motion.li
                  key={item.name}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    href={item.href}
                    className='text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-[#63EDA1] transition-colors inline-flex items-center gap-2 group'
                  >
                    <span className='w-1 h-1 rounded-full bg-slate-400 dark:bg-gray-500 group-hover:bg-blue-600 dark:group-hover:bg-[#63EDA1] transition-colors' />
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div variants={itemVariants}>
            <h3 className='text-sm font-bold text-slate-800 dark:text-gray-200 mb-4 tracking-wide'>
              Resources
            </h3>
            <ul className='space-y-2.5 text-sm'>
              {[
                { name: 'Analytics', href: '/analytics' },
                { name: 'Groups', href: '/groups' },
                { name: 'Practice Problems', href: '/adaptive-sheet' },
                { name: 'Profile', href: '/profile/overview' },
              ].map(item => (
                <motion.li
                  key={item.name}
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    href={item.href}
                    className='text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-[#63EDA1] transition-colors inline-flex items-center gap-2 group'
                  >
                    <span className='w-1 h-1 rounded-full bg-slate-400 dark:bg-gray-500 group-hover:bg-blue-600 dark:group-hover:bg-[#63EDA1] transition-colors' />
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div variants={itemVariants}>
            <h3 className='text-sm font-bold text-slate-800 dark:text-gray-200 mb-4 tracking-wide'>
              Connect
            </h3>
            <div className='flex gap-3'>
              <motion.a
                href='https://github.com/Hackeries'
                target='_blank'
                rel='noopener noreferrer'
                className='p-2.5 rounded-xl bg-slate-200 dark:bg-black text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-gray-950 hover:text-slate-900 dark:hover:text-[#63EDA1] transition-all border dark:border-gray-800'
                aria-label='GitHub'
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className='h-5 w-5' />
              </motion.a>

              <motion.a
                href='https://www.linkedin.com/in/aviral-joshi15/'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='LinkedIn'
                className='p-2.5 rounded-xl bg-slate-200 dark:bg-black text-slate-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-950 hover:text-blue-600 dark:hover:text-[#0A66C2] transition-all border dark:border-gray-800'
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin className='h-5 w-5' />
              </motion.a>

              <motion.a
                href='mailto:algo.rise2025@gmail.com'
                className='p-2.5 rounded-xl bg-slate-200 dark:bg-black text-slate-700 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-gray-950 hover:text-slate-900 dark:hover:text-[#63EDA1] transition-all border dark:border-gray-800'
                aria-label='Email'
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className='h-5 w-5' />
              </motion.a>
            </div>

            <motion.p
              className='text-xs text-slate-600 dark:text-gray-400 mt-5 leading-relaxed'
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Built with <span className='text-red-500'>❤️</span> for competitive programmers
            </motion.p>
            <p className='text-xs text-slate-600 dark:text-gray-400 mt-2'>
              by{' '}
              <a
                href='https://www.linkedin.com/in/aviral-joshi15/'
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-slate-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-[#0A66C2] transition-colors'
              >
                Aviral Joshi 💻
              </a>
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          className='mt-10 pt-8 border-t border-gray-300 dark:border-gray-800'
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
            <p className='text-xs text-slate-600 dark:text-gray-400'>
              © {new Date().getFullYear()}{' '}
              <Link
                href='/'
                className='font-semibold text-slate-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-[#63EDA1] transition-colors'
              >
                AlgoRise
              </Link>
              . All rights reserved.
            </p>
            <div className='flex gap-6 text-xs text-slate-600 dark:text-gray-400'>
              <Link
                href='/privacy'
                className='hover:text-blue-600 dark:hover:text-[#63EDA1] transition-colors'
              >
                Privacy Policy
              </Link>
              <span className='text-slate-400 dark:text-gray-600'>•</span>
              <Link
                href='/terms'
                className='hover:text-blue-600 dark:hover:text-[#63EDA1] transition-colors'
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
