'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Card,
  CardContent as UICardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Flame,
  Code2,
  BookOpen,
  Zap,
  TrendingUp,
} from 'lucide-react';
import RazorpayCheckoutButton from '@/components/payments/razorpay-checkout-button';

interface CardContent {
  topics: string[];
  divProblems: Record<string, number>;
  atcoderProblems: number;
  leetcodeProblems: Record<string, number>;
}

interface FlipPricingCardProps {
  name: string;
  subtitle?: string;
  amountInr: number;
  description: string;
  gradient: string;
  benefits: string[];
  popular?: boolean;
  ctaLabel: string;
  sheetCode?: string;
  cardContent?: CardContent;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export function FlipPricingCard({
  name,
  subtitle,
  amountInr,
  description,
  gradient,
  benefits,
  popular,
  ctaLabel,
  sheetCode,
  cardContent,
}: FlipPricingCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const totalProblems = cardContent
    ? Object.values(cardContent.divProblems).reduce((a, b) => a + b, 0) +
      cardContent.atcoderProblems +
      Object.values(cardContent.leetcodeProblems).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -12 }}
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
      className='h-full cursor-pointer perspective'
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className='relative w-full h-full'
      >
        {/* Front of card */}
        <motion.div
          style={{ backfaceVisibility: 'hidden' }}
          className='w-full h-full'
        >
          <Card
            className={`relative overflow-hidden border transition-all duration-300 h-full flex flex-col group ${
              popular
                ? 'border-red-500/50 bg-gradient-to-br from-red-500/10 via-slate-800/50 to-orange-500/10 ring-2 ring-red-500/20 shadow-lg shadow-red-500/10'
                : 'border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-slate-600/50 hover:shadow-lg hover:shadow-slate-700/20'
            }`}
          >
            <motion.div
              className={`absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${gradient}`}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              aria-hidden='true'
            />

            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              style={{
                background: `radial-gradient(circle at 50% 0%, ${
                  gradient.includes('red')
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(59, 130, 246, 0.1)'
                }, transparent 70%)`,
              }}
              aria-hidden='true'
            />

            {popular && (
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
                className='absolute top-4 right-4 z-10'
              >
                <Badge className='bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/50 border-0'>
                  <Flame className='h-3 w-3 mr-1' />
                  Most Brutal
                </Badge>
              </motion.div>
            )}

            <CardHeader className='relative z-10'>
              <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
              >
                <motion.div variants={itemVariants}>
                  <CardTitle className='text-2xl font-black bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent'>
                    {name}
                  </CardTitle>
                </motion.div>

                {subtitle && (
                  <motion.div variants={itemVariants} className='mt-2'>
                    <Badge
                      variant='outline'
                      className='border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 transition-colors'
                    >
                      {subtitle}
                    </Badge>
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className='mt-6'>
                  <motion.div
                    className='text-5xl font-black bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent'
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    ₹{amountInr}
                  </motion.div>
                  <p className='text-xs text-slate-400 mt-2 font-medium'>
                    One-time. Lifetime access.
                  </p>
                </motion.div>
              </motion.div>
            </CardHeader>

            <UICardContent className='flex flex-col flex-1 relative z-10'>
              {description && (
                <motion.div variants={itemVariants} className='mb-6'>
                  <CardDescription className='text-slate-300 text-sm leading-relaxed'>
                    {description}
                  </CardDescription>
                </motion.div>
              )}

              <motion.ul
                className='space-y-3 mb-8 flex-1'
                variants={containerVariants}
                initial='hidden'
                animate='visible'
              >
                {benefits.map((benefit, idx) => (
                  <motion.li
                    key={benefit}
                    variants={itemVariants}
                    className='flex items-start gap-3 group/item'
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 2,
                        delay: idx * 0.1,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                    >
                      <CheckCircle2 className='h-5 w-5 text-red-400 flex-shrink-0 mt-0.5 group-hover/item:text-red-300 transition-colors' />
                    </motion.div>
                    <span className='text-sm text-slate-300 group-hover/item:text-slate-200 transition-colors'>
                      {benefit}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>

              {totalProblems > 0 && (
                <motion.div
                  variants={itemVariants}
                  className='mb-6 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 flex items-center gap-2'
                >
                  <Code2 className='h-4 w-4 text-blue-400' />
                  <span className='text-xs text-slate-300'>
                    <span className='font-bold text-blue-300'>
                      {totalProblems}+ problems
                    </span>{' '}
                    across all platforms
                  </span>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className='relative z-10'>
                <RazorpayCheckoutButton
                  amount={amountInr}
                  sheetCode={sheetCode}
                  label={ctaLabel}
                />
              </motion.div>
            </UICardContent>
          </Card>
        </motion.div>

        {/* Back of card */}
        <motion.div
          style={{ backfaceVisibility: 'hidden', rotateY: 180 }}
          className='absolute inset-0 w-full h-full'
        >
          <Card className='relative overflow-hidden border border-slate-700/50 bg-gradient-to-br from-slate-800/90 to-slate-900/90 h-full flex flex-col p-6 group'>
            <motion.div
              className={`absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r ${gradient}`}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              aria-hidden='true'
            />

            <motion.div
              className='space-y-4 flex-1 overflow-y-auto scrollbar-thin'
              variants={containerVariants}
              initial='hidden'
              animate='visible'
            >
              {cardContent && (
                <>
                  {/* Topics */}
                  <motion.div variants={itemVariants}>
                    <div className='flex items-center gap-2 mb-3'>
                      <BookOpen className='h-4 w-4 text-blue-400' />
                      <h4 className='text-sm font-bold text-blue-300'>
                        Topics Covered
                      </h4>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {cardContent.topics.map((topic, idx) => (
                        <motion.div
                          key={topic}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Badge
                            variant='outline'
                            className='text-xs bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition-colors cursor-default'
                          >
                            {topic}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Codeforces Problems */}
                  <motion.div
                    variants={itemVariants}
                    className='border-t border-slate-700/50 pt-4'
                  >
                    <div className='flex items-center gap-2 mb-3'>
                      <TrendingUp className='h-4 w-4 text-purple-400' />
                      <h4 className='text-sm font-bold text-purple-300'>
                        Codeforces Problems
                      </h4>
                    </div>
                    <div className='space-y-2'>
                      {Object.entries(cardContent.divProblems).map(
                        ([div, count], idx) => (
                          <motion.div
                            key={div}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className='flex justify-between items-center text-xs text-slate-300 p-2 rounded bg-slate-700/20 hover:bg-slate-700/40 transition-colors'
                          >
                            <span className='font-medium'>{div}</span>
                            <motion.span
                              className='text-purple-400 font-bold'
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{
                                duration: 2,
                                delay: idx * 0.1,
                                repeat: Number.POSITIVE_INFINITY,
                              }}
                            >
                              {count}
                            </motion.span>
                          </motion.div>
                        )
                      )}
                    </div>
                  </motion.div>

                  {/* AtCoder Problems */}
                  <motion.div
                    variants={itemVariants}
                    className='border-t border-slate-700/50 pt-4'
                  >
                    <div className='flex items-center gap-2 mb-3'>
                      <Zap className='h-4 w-4 text-orange-400' />
                      <h4 className='text-sm font-bold text-orange-300'>
                        AtCoder ABC
                      </h4>
                    </div>
                    <div className='text-xs text-slate-300 p-2 rounded bg-slate-700/20'>
                      <motion.span
                        className='text-orange-400 font-bold'
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                      >
                        {cardContent.atcoderProblems}
                      </motion.span>
                      <span> problems</span>
                    </div>
                  </motion.div>

                  {/* LeetCode Problems */}
                  <motion.div
                    variants={itemVariants}
                    className='border-t border-slate-700/50 pt-4'
                  >
                    <div className='flex items-center gap-2 mb-3'>
                      <Code2 className='h-4 w-4 text-green-400' />
                      <h4 className='text-sm font-bold text-green-300'>
                        LeetCode
                      </h4>
                    </div>
                    <div className='space-y-2'>
                      {Object.entries(cardContent.leetcodeProblems).map(
                        ([difficulty, count], idx) => (
                          <motion.div
                            key={difficulty}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className='flex justify-between items-center text-xs text-slate-300 p-2 rounded bg-slate-700/20 hover:bg-slate-700/40 transition-colors'
                          >
                            <span className='font-medium'>{difficulty}</span>
                            <motion.span
                              className='text-green-400 font-bold'
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{
                                duration: 2,
                                delay: idx * 0.1,
                                repeat: Number.POSITIVE_INFINITY,
                              }}
                            >
                              {count}
                            </motion.span>
                          </motion.div>
                        )
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}