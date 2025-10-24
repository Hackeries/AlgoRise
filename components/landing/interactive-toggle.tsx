'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToggleOption {
  title: string;
  items: string[];
  color: string;
}

interface InteractiveToggleProps {
  leftOption: ToggleOption;
  rightOption: ToggleOption;
}

export function InteractiveToggle({
  leftOption,
  rightOption,
}: InteractiveToggleProps) {
  const [isRight, setIsRight] = useState(false);

  return (
    <div className='space-y-6'>
      <div className='flex justify-center gap-4'>
        <motion.button
          onClick={() => setIsRight(false)}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            !isRight
              ? 'bg-red-500/20 text-red-300 border border-red-500/50'
              : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:border-slate-600/50'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {leftOption.title}
        </motion.button>
        <motion.button
          onClick={() => setIsRight(true)}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            isRight
              ? 'bg-green-500/20 text-green-300 border border-green-500/50'
              : 'bg-slate-700/50 text-slate-400 border border-slate-600/30 hover:border-slate-600/50'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {rightOption.title}
        </motion.button>
      </div>

      <motion.div
        key={isRight ? 'right' : 'left'}
        initial={{ opacity: 0, x: isRight ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isRight ? -20 : 20 }}
        transition={{ duration: 0.3 }}
        className={`p-8 rounded-lg border ${
          isRight
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}
      >
        <h3
          className={`text-xl font-bold mb-6 ${
            isRight ? 'text-green-300' : 'text-red-300'
          }`}
        >
          {isRight ? rightOption.title : leftOption.title}
        </h3>
        <ul className='space-y-3'>
          {(isRight ? rightOption.items : leftOption.items).map(item => (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className='flex items-start gap-3 text-slate-300'
            >
              <span
                className={`flex-shrink-0 mt-1 ${
                  isRight ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {isRight ? (
                  <CheckCircle2 className='h-4 w-4' />
                ) : (
                  <span>✗</span>
                )}
              </span>
              <span className='text-sm'>{item}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
