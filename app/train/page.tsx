'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCFVerification } from '@/lib/context/cf-verification';
import { useAuth } from '@/lib/auth/context';

import { GamifiedStrip } from '@/components/train/gamified-strip';
import { QuickActions } from '@/components/train/quick-actions';
import { ProblemRecommendations } from '@/components/train/problem-recommendations';
import { UpcomingContests } from '@/components/train/upcoming-contests';
import { RecentActivity } from '@/components/train/recent-activity';
import { WelcomeBanner } from '@/components/train/welcome-banner';

export default function TrainingHub() {
  const { user } = useAuth();
  const { isVerified, verificationData } = useCFVerification();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const isNewUser = sessionStorage.getItem('profile_just_completed');
    if (isNewUser) {
      setShowWelcome(true);
      sessionStorage.removeItem('profile_just_completed');
      setTimeout(() => setShowWelcome(false), 10000);
    }
  }, []);

  return (
    <main className='flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-neutral-900 to-gray-950 text-white'>
      <section className='flex-1 overflow-auto'>
        <div className='max-w-7xl mx-auto p-6 sm:p-8 lg:p-10 space-y-8'>
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'
          >
            <div>
              <h1 className='text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'>
                Training Hub
              </h1>
              <p className='mt-2 text-gray-300 text-sm sm:text-base'>
                {isVerified && verificationData
                  ? `Welcome back, ${verificationData.handle}! Let's conquer some problems.`
                  : 'Track progress, solve problems, and level up your skills.'}
              </p>
            </div>
          </motion.div>

          {/* WELCOME BANNER */}
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
            >
              <WelcomeBanner onDismiss={() => setShowWelcome(false)} />
            </motion.div>
          )}

          {/* GAMIFIED STRIP */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className='rounded-xl overflow-hidden shadow-lg mb-6'
          >
            <GamifiedStrip />
          </motion.div>

          {/* QUICK ACTIONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className='mb-8'
          >
            <QuickActions />
          </motion.div>

          {/* DASHBOARD GRID */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            {/* LEFT COLUMN */}
            <div className='lg:col-span-2 space-y-6'>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <ProblemRecommendations />
              </motion.div>
            </div>

            {/* RIGHT COLUMN */}
            <div className='space-y-6'>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <UpcomingContests />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <RecentActivity />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
