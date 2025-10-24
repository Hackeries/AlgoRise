'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface InteractiveStatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  onClick?: () => void;
}

export function InteractiveStatCard({
  icon,
  label,
  value,
  change,
  trend,
  color,
  onClick,
}: InteractiveStatCardProps) {
  const colorMap = {
    blue: 'from-blue-900/30 to-cyan-900/30 border-blue-500/20 hover:border-blue-400/50',
    green:
      'from-green-900/30 to-emerald-900/30 border-green-500/20 hover:border-green-400/50',
    red: 'from-red-900/30 to-orange-900/30 border-red-500/20 hover:border-red-400/50',
    yellow:
      'from-yellow-900/30 to-amber-900/30 border-yellow-500/20 hover:border-yellow-400/50',
    purple:
      'from-purple-900/30 to-pink-900/30 border-purple-500/20 hover:border-purple-400/50',
  };

  const textColorMap = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    purple: 'text-purple-400',
  };

  return (
    <motion.div
      onClick={onClick}
      className={`p-4 rounded-lg bg-gradient-to-br ${colorMap[color]} border backdrop-blur-sm transition-all duration-300 cursor-pointer`}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className='flex items-start justify-between mb-3'>
        <motion.div
          className={`p-2 rounded-lg ${textColorMap[color]} bg-opacity-20`}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        >
          {icon}
        </motion.div>
        {change !== undefined && (
          <motion.div
            className={`text-xs font-bold ${
              trend === 'up'
                ? 'text-green-400'
                : trend === 'down'
                ? 'text-red-400'
                : 'text-blue-300'
            }`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}{' '}
            {Math.abs(change)}
          </motion.div>
        )}
      </div>
      <p className='text-xs text-white/70 mb-1'>{label}</p>
      <motion.p
        className={`text-2xl font-bold ${textColorMap[color]}`}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        {value}
      </motion.p>
    </motion.div>
  );
}
