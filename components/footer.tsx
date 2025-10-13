'use client';
import Link from 'next/link';
import { Github, Mail, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

export function Footer() {
  return (
    <motion.footer
      className='border-t border-border bg-gradient-to-t from-black/80 to-gray-900/80 backdrop-blur-sm mt-auto'
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {/* About Section */}
          <div>
            <h3 className='text-sm font-semibold text-white/90 mb-4'>
              About AlgoRise
            </h3>
            <p className='text-sm text-white/70'>
              Practice that adapts. Compete when it counts. Master competitive
              programming with personalized learning paths and real-time
              contests.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-sm font-semibold text-white/90 mb-4'>
              Quick Links
            </h3>
            <ul className='space-y-2 text-sm'>
              {[
                { name: 'Train', href: '/train' },
                { name: 'Contests', href: '/contests' },
                { name: 'Learning Paths', href: '/paths' },
                { name: 'Visualizers', href: '/visualizers' },
              ].map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className='text-white/70 hover:text-[#63EDA1] hover:underline transition-colors'
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className='text-sm font-semibold text-white/90 mb-4'>
              Resources
            </h3>
            <ul className='space-y-2 text-sm'>
              {[
                { name: 'Analytics', href: '/analytics' },
                { name: 'Groups', href: '/groups' },
                { name: 'Practice Problems', href: '/adaptive-sheet' },
                { name: 'Profile', href: '/profile/overview' },
              ].map(item => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className='text-white/70 hover:text-[#63EDA1] hover:underline transition-colors'
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className='text-sm font-semibold text-white/90 mb-4'>
              Connect
            </h3>
            <div className='flex gap-4'>
              <a
                href='https://github.com/Hackeries'
                target='_blank'
                rel='noopener noreferrer'
                className='text-white/70 hover:text-[#63EDA1] transition-transform transform hover:scale-110 hover:rotate-6'
                aria-label='GitHub'
              >
                <Github className='h-5 w-5' />
              </a>

              <a
                href='https://www.linkedin.com/in/aviral-joshi15/'
                target='_blank'
                rel='noopener noreferrer'
                aria-label='LinkedIn'
                className='text-white/70 hover:text-[#0A66C2] transition-transform transform hover:scale-110 hover:rotate-6'
              >
                <Linkedin className='h-5 w-5' />
              </a>

              <a
                href='mailto:algo.rise2025@gmail.com'
                className='text-white/70 hover:text-[#63EDA1] transition-transform transform hover:scale-110 hover:rotate-6'
                aria-label='Email'
              >
                <Mail className='h-5 w-5' />
              </a>
            </div>

            <p className='text-xs text-white/50 mt-4'>
              Built with ❤️ for competitive programmers
            </p>
            <p className='text-xs text-white/50 mt-1'>
              by{' '}
              <a
                href='https://www.linkedin.com/in/aviral-joshi15/'
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-white/80 hover:text-[#0A66C2] transition-colors'
              >
                Aviral Joshi 💻
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='mt-8 pt-6 border-t border-border'>
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
            <p className='text-xs text-white/50'>
              © {new Date().getFullYear()}{' '}
              <Link
                href='/'
                className='hover:text-[#63EDA1] hover:underline transition-colors'
              >
                AlgoRise
              </Link>
              . All rights reserved.
            </p>
            <div className='flex gap-6 text-xs text-white/50'>
              <Link
                href='/privacy'
                className='hover:text-[#63EDA1] hover:underline transition-colors'
              >
                Privacy Policy
              </Link>
              <Link
                href='/terms'
                className='hover:text-[#63EDA1] hover:underline transition-colors'
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
