'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Trophy,
  BarChart3,
  Brain,
  Users,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';

type Slide = {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
};

const SLIDES: Slide[] = [
  {
    icon: Layers,
    title: 'Smart Problem Ladder',
    description:
      'Our AI-powered ladder adapts to your skill level in real-time. Start where you are, not where the curriculum says. Problems automatically adjust difficulty based on your solving patterns and speed.',
    gradient: 'from-violet-500 via-purple-500 to-indigo-600',
    iconColor: 'text-violet-100',
  },
  {
    icon: Trophy,
    title: 'Private Contests',
    description:
      'Create custom contests for your study group, college, or organization. Set your own rules, choose problem sets, and compete on your terms. Real Codeforces-style experience, private leaderboards.',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    iconColor: 'text-amber-100',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description:
      'Track every aspect of your competitive programming journey. Visualize topic strengths, identify weak areas, monitor consistency streaks, and see exactly where you stand against your goals.',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    iconColor: 'text-emerald-100',
  },
  {
    icon: Brain,
    title: 'Spaced Repetition',
    description:
      'Never forget a technique again. Our spaced repetition system schedules review problems at optimal intervals, ensuring concepts move from short-term to long-term memory permanently.',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    iconColor: 'text-pink-100',
  },
  {
    icon: Users,
    title: 'Group Challenges',
    description:
      'Form teams and compete in collaborative challenges. Weekly group competitions, team leaderboards, and shared progress tracking keep everyone motivated and accountable.',
    gradient: 'from-blue-500 via-indigo-500 to-purple-600',
    iconColor: 'text-blue-100',
  },
];

const AUTOPLAY_INTERVAL = 5000;

export default function ProductShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduced = useReducedMotion();

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    if (isPaused || reduced) return;

    const interval = setInterval(nextSlide, AUTOPLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, reduced]);

  const currentSlide = SLIDES[currentIndex];
  const Icon = currentSlide.icon;

  return (
    <section
      aria-labelledby="product-showcase-heading"
      className="py-20 sm:py-24 lg:py-32 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Platform</span>
          </div>

          <h2
            id="product-showcase-heading"
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Built for serious competitors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every feature designed to accelerate your competitive programming
            journey from beginner to expert.
          </p>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -100 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="grid md:grid-cols-2 gap-0"
              >
                {/* Gradient Illustration Area */}
                <div
                  className={`relative h-64 sm:h-80 md:h-[400px] bg-gradient-to-br ${currentSlide.gradient} flex items-center justify-center`}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="relative"
                  >
                    {/* Background glow */}
                    <div className="absolute inset-0 blur-3xl opacity-50 bg-white/20 rounded-full scale-150" />

                    {/* Icon container */}
                    <div className="relative p-8 sm:p-12 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20">
                      <Icon
                        className={`w-20 h-20 sm:w-28 sm:h-28 ${currentSlide.iconColor}`}
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Floating decorative elements */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm"
                    />
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="absolute -bottom-6 -left-6 w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm"
                    />
                  </motion.div>
                </div>

                {/* Content Area */}
                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                  >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm mb-4">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Feature {currentIndex + 1} of {SLIDES.length}
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                      {currentSlide.title}
                    </h3>

                    <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                      {currentSlide.description}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 z-10">
            <Button
              variant="secondary"
              size="icon"
              onClick={prevSlide}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 z-10">
            <Button
              variant="secondary"
              size="icon"
              onClick={nextSlide}
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm hover:bg-background"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.title}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${index + 1}: ${slide.title}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
