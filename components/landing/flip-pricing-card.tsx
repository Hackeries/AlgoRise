'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as any,
    },
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
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as any }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
      className='h-full cursor-pointer perspective-1000'
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className='relative w-full h-full min-h-[600px]'
      >
        {/* Front of card */}
        <motion.div
          style={{ backfaceVisibility: 'hidden' }}
          className='w-full h-full absolute inset-0'
        >
          <Card
            className={`relative overflow-hidden border transition-all duration-300 h-full flex flex-col group ${
              popular
                ? 'border-primary/50 bg-gradient-to-br from-primary/10 via-card to-primary/5 ring-2 ring-primary/20 shadow-2xl shadow-primary/20'
                : 'border-border/50 bg-card/80 backdrop-blur-xl hover:border-primary/30 hover:shadow-xl'
            }`}
          >
            {/* Top gradient line */}
            <motion.div
              className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${gradient}`}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Hover glow effect */}
            <div
              className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'
              style={{
                background: `radial-gradient(circle at 50% 0%, ${
                  popular
                    ? 'rgba(var(--primary-rgb, 59, 130, 246), 0.15)'
                    : 'rgba(var(--primary-rgb, 59, 130, 246), 0.08)'
                }, transparent 70%)`,
              }}
            />

            {/* Popular badge - ONLY ONE NOW */}
            <AnimatePresence>
              {popular && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className='absolute top-4 right-4 z-10'
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 3, -3, 0],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <Badge className='bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/50 border-0 px-3 py-1.5'>
                      <Flame className='h-3.5 w-3.5 mr-1' />
                      Most Popular
                    </Badge>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <CardHeader className='relative z-10 pb-4 pt-6'>
              <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
              >
                <motion.div variants={itemVariants}>
                  <CardTitle className='text-2xl sm:text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent'>
                    {name}
                  </CardTitle>
                </motion.div>

                {subtitle && (
                  <motion.div variants={itemVariants} className='mt-3'>
                    <Badge
                      variant='outline'
                      className='border-border bg-muted/50 text-muted-foreground hover:bg-muted transition-colors'
                    >
                      {subtitle}
                    </Badge>
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className='mt-6'>
                  <div className='flex items-baseline gap-2'>
                    <motion.div
                      className={`text-5xl sm:text-6xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      ₹{amountInr}
                    </motion.div>
                  </div>
                  <p className='text-xs text-muted-foreground mt-2 font-medium'>
                    One-time payment • Lifetime access
                  </p>
                </motion.div>
              </motion.div>
            </CardHeader>

            <UICardContent className='flex flex-col flex-1 relative z-10 pt-0'>
              {description && (
                <motion.div variants={itemVariants} className='mb-6'>
                  <CardDescription className='text-sm leading-relaxed'>
                    {description}
                  </CardDescription>
                </motion.div>
              )}

              <motion.ul
                className='space-y-3 mb-6 flex-1'
                variants={containerVariants}
                initial='hidden'
                animate='visible'
              >
                {benefits.map(benefit => (
                  <motion.li
                    key={benefit}
                    variants={itemVariants}
                    className='flex items-start gap-3 group/item'
                  >
                    <CheckCircle2 className='h-5 w-5 text-primary flex-shrink-0 mt-0.5' />
                    <span className='text-sm text-muted-foreground group-hover/item:text-foreground transition-colors'>
                      {benefit}
                    </span>
                  </motion.li>
                ))}
              </motion.ul>

              {totalProblems > 0 && (
                <motion.div
                  variants={itemVariants}
                  className='mb-6 p-3 bg-muted/50 rounded-lg border border-border/50 flex items-center gap-2'
                >
                  <Code2 className='h-4 w-4 text-primary' />
                  <span className='text-xs text-muted-foreground'>
                    <span className='font-bold text-foreground'>
                      {totalProblems}+ problems
                    </span>{' '}
                    across all platforms
                  </span>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
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
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className='absolute inset-0 w-full h-full'
        >
          <Card className='relative overflow-hidden border border-border/50 bg-card/95 backdrop-blur-xl h-full flex flex-col'>
            {/* Top gradient line */}
            <motion.div
              className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${gradient}`}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <div className='p-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'>
              <motion.div
                className='space-y-5'
                variants={containerVariants}
                initial='hidden'
                animate='visible'
              >
                {cardContent && (
                  <>
                    {/* Topics */}
                    <motion.div variants={itemVariants}>
                      <div className='flex items-center gap-2 mb-3'>
                        <BookOpen className='h-4 w-4 text-primary' />
                        <h4 className='text-sm font-semibold'>
                          Topics Covered
                        </h4>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {cardContent.topics.map((topic, idx) => (
                          <motion.div
                            key={topic}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.03 }}
                          >
                            <Badge
                              variant='outline'
                              className='text-xs bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 transition-colors'
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
                      className='border-t border-border pt-4'
                    >
                      <div className='flex items-center gap-2 mb-3'>
                        <TrendingUp className='h-4 w-4 text-purple-500' />
                        <h4 className='text-sm font-semibold'>
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
                              transition={{ delay: idx * 0.04 }}
                              className='flex justify-between items-center text-xs p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors'
                            >
                              <span className='font-medium text-muted-foreground'>
                                {div}
                              </span>
                              <span className='text-purple-500 font-bold'>
                                {count}
                              </span>
                            </motion.div>
                          )
                        )}
                      </div>
                    </motion.div>

                    {/* AtCoder Problems */}
                    <motion.div
                      variants={itemVariants}
                      className='border-t border-border pt-4'
                    >
                      <div className='flex items-center gap-2 mb-3'>
                        <Zap className='h-4 w-4 text-orange-500' />
                        <h4 className='text-sm font-semibold'>AtCoder ABC</h4>
                      </div>
                      <div className='p-2 rounded-lg bg-muted/50 text-sm'>
                        <span className='text-orange-500 font-bold'>
                          {cardContent.atcoderProblems}
                        </span>
                        <span className='text-muted-foreground'> problems</span>
                      </div>
                    </motion.div>

                    {/* LeetCode Problems */}
                    <motion.div
                      variants={itemVariants}
                      className='border-t border-border pt-4'
                    >
                      <div className='flex items-center gap-2 mb-3'>
                        <Code2 className='h-4 w-4 text-green-500' />
                        <h4 className='text-sm font-semibold'>LeetCode</h4>
                      </div>
                      <div className='space-y-2'>
                        {Object.entries(cardContent.leetcodeProblems).map(
                          ([difficulty, count], idx) => (
                            <motion.div
                              key={difficulty}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.04 }}
                              className='flex justify-between items-center text-xs p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors'
                            >
                              <span className='font-medium text-muted-foreground'>
                                {difficulty}
                              </span>
                              <span className='text-green-500 font-bold'>
                                {count}
                              </span>
                            </motion.div>
                          )
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}