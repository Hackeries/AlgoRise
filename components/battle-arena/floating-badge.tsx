'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FloatingBadgeProps {
  children: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  icon?: ReactNode;
}

export function FloatingBadge({
  children,
  color = 'blue',
  icon,
}: FloatingBadgeProps) {
  const colorMap = {
    blue: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
    green: 'bg-green-500/20 border-green-500/50 text-green-300',
    red: 'bg-red-500/20 border-red-500/50 text-red-300',
    yellow: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
    purple: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
  };

  return (
    <motion.div
      className={`${colorMap[color]} px-3 py-1.5 rounded-full border backdrop-blur-sm flex items-center gap-2 text-sm font-semibold`}
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      whileHover={{ scale: 1.05 }}
    >
      {icon && (
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        >
          {icon}
        </motion.div>
      )}
      {children}
    </motion.div>
  );
}
