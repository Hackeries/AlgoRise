'use client';

import { motion } from 'framer-motion';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className='flex flex-col items-center gap-2'>
      <div className='relative' style={{ width: size, height: size }}>
        <svg width={size} height={size} className='transform -rotate-90'>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke='rgba(255,255,255,0.1)'
            strokeWidth={strokeWidth}
            fill='none'
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill='none'
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap='round'
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        </svg>
        <div className='absolute inset-0 flex items-center justify-center'>
          <motion.span
            className='text-2xl font-bold text-white'
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            {Math.round(percentage)}%
          </motion.span>
        </div>
      </div>
      {label && <p className='text-sm text-blue-300'>{label}</p>}
    </div>
  );
}
