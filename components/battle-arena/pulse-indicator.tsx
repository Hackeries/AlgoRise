'use client';

import { motion } from 'framer-motion';

interface PulseIndicatorProps {
  active: boolean;
  label?: string;
  color?: 'green' | 'red' | 'yellow' | 'blue';
}

export function PulseIndicator({
  active,
  label,
  color = 'green',
}: PulseIndicatorProps) {
  const colorMap = {
    green: 'bg-green-400',
    red: 'bg-red-400',
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-400',
  };

  return (
    <div className='flex items-center gap-2'>
      <div className='relative w-3 h-3'>
        <motion.div
          className={`absolute inset-0 rounded-full ${colorMap[color]}`}
          animate={
            active
              ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }
              : { scale: 1, opacity: 0.5 }
          }
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
        <div className={`absolute inset-0 rounded-full ${colorMap[color]}`} />
      </div>
      {label && <span className='text-xs text-white/70'>{label}</span>}
    </div>
  );
}
