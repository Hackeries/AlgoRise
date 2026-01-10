'use client';

import type * as React from 'react';

export function DashboardShell({
  left,
  center,
  right,
}: {
  left: React.ReactNode;
  center: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section
      aria-label='Dashboard'
      className='mx-auto max-w-screen-2xl px-4 py-6 lg:py-8'
    >
      {/* Layout: mobile-first flex, switches to grid on lg screens */}
      <div className='flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:gap-8'>
        {/* Left rail / navigation */}
        <aside
          aria-label='Section navigation'
          className='hidden lg:block lg:col-span-2'
        >
          {left}
        </aside>

        {/* Main content */}
        <main className='lg:col-span-7'>{center}</main>

        {/* Right rail / status insights */}
        {right && (
          <aside aria-label='Status and insights' className='lg:col-span-3'>
            {right}
          </aside>
        )}
      </div>
    </section>
  );
}
