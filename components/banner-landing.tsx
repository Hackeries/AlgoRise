'use client';

import PixelBlast from '@/components/bg/pixelblast';
import { Target, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BannerLanding() {
  return (
    <section className='relative flex flex-col justify-center items-center text-center overflow-hidden min-h-[280px] sm:min-h-[380px] md:min-h-[480px] px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16'>
      {/* Background - PixelBlast only, parent has gradient */}
      <div className='absolute inset-0 -z-10 w-full h-full opacity-30 dark:opacity-100'>
        <PixelBlast />
      </div>

      {/* Floating particles */}
      <motion.div
        className='absolute top-12 sm:top-16 md:top-20 left-4 sm:left-8 md:left-10 w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 rounded-full bg-sky-300/30 dark:bg-sky-200/20 blur-xl'
        animate={{ y: [0, 20, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 6 }}
      />
      <motion.div
        className='absolute bottom-16 sm:bottom-20 md:bottom-24 right-4 sm:right-8 md:right-16 w-8 sm:w-9 md:w-10 h-8 sm:h-9 md:h-10 rounded-full bg-indigo-300/30 dark:bg-indigo-200/20 blur-2xl'
        animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 8 }}
      />

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight font-[Bricolage_Grotesque] mb-4 sm:mb-6 md:mb-8
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
        className='text-sm sm:text-base md:text-lg lg:text-xl shadow-glow mb-8 sm:mb-10 md:mb-12 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-2 sm:px-4'
      >
        <span className='bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-gray-200 dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent font-medium'>
          Level up your competitive programming with{' '}
        </span>
        <span className='font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 dark:hover:from-blue-300 dark:hover:via-cyan-300 dark:hover:to-blue-300 transition-all duration-300 cursor-default font-[Bricolage_Grotesque]'>
          adaptive practice
        </span>
        <span className='bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-gray-200 dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent font-medium'>
          ,{' '}
        </span>
        <span className='font-bold bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent whitespace-nowrap hover:from-indigo-700 hover:via-purple-600 hover:to-pink-600 dark:hover:from-indigo-300 dark:hover:via-purple-300 dark:hover:to-pink-300 transition-all duration-300 cursor-default font-[Bricolage_Grotesque]'>
          real-time contest tracking
        </span>
        <span className='bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-gray-200 dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent font-medium'>
          , and{' '}
        </span>
        <span className='font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 dark:from-purple-400 dark:via-pink-400 dark:to-rose-400 bg-clip-text text-transparent whitespace-nowrap hover:from-purple-700 hover:via-pink-600 hover:to-rose-600 dark:hover:from-purple-300 dark:hover:via-pink-300 dark:hover:to-rose-300 transition-all duration-300 cursor-default font-[Bricolage_Grotesque]'>
          progress analytics
        </span>
        <span className='bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-gray-200 dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent font-medium'>
          .
        </span>
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className='flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center w-full max-w-2xl sm:max-w-3xl mx-auto'
      >
        <Link href='/adaptive-sheet' className='w-full sm:w-auto'>
          <Button className='w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 shadow-blue-500/25 relative group text-sm sm:text-base'>
            <div className='absolute inset-0 rounded-lg bg-blue-500/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
            <Target className='mr-2 h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0' />
            <span>Start Adaptive Practice</span>
          </Button>
        </Link>

        <Link href='/contests' className='w-full sm:w-auto'>
          <Button className='w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-gray-500/50 shadow-gray-500/25 relative group text-sm sm:text-base'>
            <div className='absolute inset-0 rounded-lg bg-gray-400/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
            <Calendar className='mr-2 h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0' />
            <span>View Contests</span>
          </Button>
        </Link>

        <Link href='/paths' className='w-full sm:w-auto'>
          <Button className='w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-green-500/50 shadow-green-500/25 relative group text-sm sm:text-base'>
            <div className='absolute inset-0 rounded-lg bg-green-400/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10' />
            <BookOpen className='mr-2 h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0' />
            <span>Explore Learning Paths</span>
          </Button>
        </Link>
      </motion.div>
    </section>
  );
}
