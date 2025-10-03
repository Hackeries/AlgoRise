'use client';

import { CFDashboard } from '@/components/dashboard/cf-dashboard';
import { RightRailToday } from '@/components/today/right-rail';

export default function TrainingHub() {
  return (
    <main className='flex flex-1 min-h-screen bg-gradient-to-b from-gray-900 via-neutral-900 to-gray-950 text-white'>
      {/* Left / Main Dashboard */}
      <section className='flex-1 p-8 overflow-auto'>
        {/* Page Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
          <h1 className='text-4xl font-bold text-blue-400'>
            Codeforces Training Hub
          </h1>
          <p className='mt-2 sm:mt-0 text-gray-300'>
            Track your progress, streaks, and today's challenges
          </p>
        </div>

        {/* Dashboard Container */}
        <div className='rounded-xl bg-neutral-900/80 p-6 shadow-lg backdrop-blur-sm border border-gray-800'>
          <CFDashboard />
        </div>
      </section>

      {/* Right Rail / Sidebar */}
      <aside className='w-96 border-l border-gray-800 bg-neutral-950/90 p-6 flex-shrink-0 overflow-y-auto shadow-inner'>
        <div className='sticky top-0 space-y-6'>
          <RightRailToday />
        </div>
      </aside>
    </main>
  );
}
