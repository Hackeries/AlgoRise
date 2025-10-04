'use client';

import PixelBlast from '@/components/bg/pixelblast';
import { Target, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BannerLanding() {
  return (
    <section className='relative flex flex-col justify-center items-center text-center overflow-hidden min-h-[320px] md:min-h-[520px] px-4'>
      {/* Background */}
      <div className='absolute inset-0 -z-10 w-full h-full'>
        <PixelBlast />
      </div>

      {/* Floating particles */}
      <motion.div
        className='absolute top-20 left-10 w-6 h-6 rounded-full bg-sky-200/20 blur-xl'
        animate={{ y: [0, 20, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
      <motion.div
        className='absolute bottom-24 right-16 w-10 h-10 rounded-full bg-indigo-200/20 blur-2xl'
        animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='text-5xl md:text-7xl font-extrabold leading-tight font-[Bricolage_Grotesque] mb-6 
          bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 
          bg-clip-text text-transparent animate-gradient-x'
      >
        AlgoRise
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className='text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl leading-relaxed'
      >
        Level up your competitive programming with{' '}
        <span className='font-semibold text-foreground'>adaptive practice</span>
        ,{' '}
        <span className='font-semibold text-foreground'>
          real-time contest tracking
        </span>
        , and{' '}
        <span className='font-semibold text-foreground'>
          progress analytics
        </span>
        .
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className='flex flex-col sm:flex-row gap-4 justify-center'
      >
        <Link href='/adaptive-sheet'>
          <Button className='px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition'>
            <Target className='mr-2 h-5 w-5' />
            Start Adaptive Practice
          </Button>
        </Link>

        <Link href='/contests'>
          <Button className='px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded hover:bg-gray-300 transition'>
            <Calendar className='mr-2 h-5 w-5' />
            View Contests
          </Button>
        </Link>

        <Link href='/paths'>
          <Button className='px-6 py-3 bg-green-500 text-white font-medium rounded hover:bg-green-600 transition'>
            <BookOpen className='mr-2 h-5 w-5' />
            Explore Learning Paths
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
