'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

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
  const activeOption = isRight ? rightOption : leftOption;

  return (
    <div className='space-y-8'>
      {/* Toggle Buttons */}
      <div className='flex items-center justify-center gap-3 sm:gap-4'>
        <motion.button
          onClick={() => setIsRight(false)}
          className={`
            relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold 
            transition-all duration-300 overflow-hidden group
            ${
              !isRight
                ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20 text-red-300 border-2 border-red-500/50 shadow-lg shadow-red-500/20'
                : 'bg-card/50 backdrop-blur-sm text-muted-foreground border-2 border-border/50 hover:border-red-500/30'
            }
          `}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Animated background */}
          {!isRight && (
            <motion.div
              className='absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10'
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}

          <span className='relative z-10 text-sm sm:text-base'>
            {leftOption.title}
          </span>

          {/* Glow effect */}
          {!isRight && (
            <motion.div
              className='absolute inset-0 rounded-xl bg-red-500/20 blur-xl -z-10'
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}
        </motion.button>

        {/* Arrow indicator */}
        <motion.div
          animate={{ x: isRight ? 10 : -10 }}
          transition={{ duration: 0.3 }}
          className='text-primary'
        >
          <ArrowRight className='h-5 w-5 sm:h-6 sm:w-6' />
        </motion.div>

        <motion.button
          onClick={() => setIsRight(true)}
          className={`
            relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold 
            transition-all duration-300 overflow-hidden group
            ${
              isRight
                ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-300 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                : 'bg-card/50 backdrop-blur-sm text-muted-foreground border-2 border-border/50 hover:border-emerald-500/30'
            }
          `}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Animated background */}
          {isRight && (
            <motion.div
              className='absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10'
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}

          <span className='relative z-10 text-sm sm:text-base'>
            {rightOption.title}
          </span>

          {/* Glow effect */}
          {isRight && (
            <motion.div
              className='absolute inset-0 rounded-xl bg-emerald-500/20 blur-xl -z-10'
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}
        </motion.button>
      </div>

      {/* Content Card */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={isRight ? 'right' : 'left'}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`
            relative p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl 
            backdrop-blur-xl border-2 overflow-hidden
            ${
              isRight
                ? 'bg-gradient-to-br from-emerald-500/10 via-card to-teal-500/10 border-emerald-500/30'
                : 'bg-gradient-to-br from-red-500/10 via-card to-orange-500/10 border-red-500/30'
            }
          `}
        >
          {/* Background glow */}
          <motion.div
            className={`
              absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 blur-3xl -z-10
              ${isRight ? 'bg-emerald-500/20' : 'bg-red-500/20'}
            `}
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          />

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className='mb-6 sm:mb-8'
          >
            <h3
              className={`
                text-xl sm:text-2xl lg:text-3xl font-bold
                ${isRight ? 'text-emerald-300' : 'text-red-300'}
              `}
            >
              {activeOption.title}
            </h3>
            <div
              className={`h-1 w-20 mt-3 rounded-full ${
                isRight
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-red-500 to-orange-500'
              }`}
            />
          </motion.div>

          {/* Items List */}
          <ul className='space-y-4'>
            {activeOption.items.map((item, idx) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: 0.15 + idx * 0.05,
                  duration: 0.4,
                }}
                whileHover={{ x: 5 }}
                className={`
                  flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl
                  bg-card/30 backdrop-blur-sm border border-border/30
                  hover:bg-card/50 transition-all duration-300
                  group
                `}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2 + idx * 0.05,
                    type: 'spring',
                    stiffness: 200,
                  }}
                  className={`
                    flex-shrink-0 mt-0.5
                    ${isRight ? 'text-emerald-400' : 'text-red-400'}
                  `}
                >
                  {isRight ? (
                    <CheckCircle2 className='h-5 w-5 sm:h-6 sm:w-6' />
                  ) : (
                    <XCircle className='h-5 w-5 sm:h-6 sm:w-6' />
                  )}
                </motion.div>

                <span className='text-sm sm:text-base text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed'>
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
