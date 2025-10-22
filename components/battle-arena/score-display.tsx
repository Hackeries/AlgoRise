'use client';

import { motion } from 'framer-motion';

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  label?: string;
  animated?: boolean;
}

export function ScoreDisplay({
  score,
  maxScore,
  label,
  animated = true,
}: ScoreDisplayProps) {
  return (
    <motion.div
      className='text-center'
      animate={animated ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
    >
      <p className='text-xs text-blue-300/70 mb-1'>{label}</p>
      <motion.div
        className='text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'
        animate={animated ? { y: [0, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        {score}
        {maxScore && (
          <span className='text-lg text-blue-300/50'>/{maxScore}</span>
        )}
      </motion.div>
    </motion.div>
  );
}
