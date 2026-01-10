'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  BookOpen,
  Route,
  Target,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { motion, useReducedMotion, useInView } from 'framer-motion';

type Stat = {
  icon: LucideIcon;
  value: number;
  suffix: string;
  label: string;
  gradient: string;
};

const STATS: Stat[] = [
  {
    icon: BookOpen,
    value: 15000,
    suffix: '+',
    label: 'Problems',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Route,
    value: 50,
    suffix: '+',
    label: 'Learning Paths',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Target,
    value: 10,
    suffix: '+',
    label: 'Rating Levels',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Globe,
    value: 5,
    suffix: '+',
    label: 'Platforms',
    gradient: 'from-blue-500 to-indigo-600',
  },
];

function AnimatedCounter({
  value,
  suffix,
  inView,
}: {
  value: number;
  suffix: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;

    if (reduced) {
      setCount(value);
      return;
    }

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, value, reduced]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return num.toString();
  };

  return (
    <span>
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const reduced = useReducedMotion();
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <motion.div
        animate={
          reduced
            ? {}
            : {
                y: [0, -8, 0],
              }
        }
        transition={{
          duration: 4 + index * 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative p-6 sm:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
      >
        {/* Background gradient glow on hover */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
        />

        {/* Icon */}
        <div
          className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.gradient} mb-4`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Value */}
        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
          <AnimatedCounter
            value={stat.value}
            suffix={stat.suffix}
            inView={inView}
          />
        </div>

        {/* Label */}
        <p className="text-muted-foreground font-medium">{stat.label}</p>

        {/* Decorative element */}
        <motion.div
          animate={
            reduced
              ? {}
              : {
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.3,
          }}
          className={`absolute -top-2 -right-2 w-20 h-20 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl`}
        />
      </motion.div>
    </motion.div>
  );
}

export default function StatsSection() {
  const reduced = useReducedMotion();

  return (
    <section
      aria-labelledby="stats-section-heading"
      className="py-20 sm:py-24 lg:py-32 bg-muted/30 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <motion.div
        animate={
          reduced
            ? {}
            : {
                x: [0, 50, 0],
                y: [0, 30, 0],
              }
        }
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl"
      />
      <motion.div
        animate={
          reduced
            ? {}
            : {
                x: [0, -30, 0],
                y: [0, 50, 0],
              }
        }
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-chart-1/5 blur-3xl"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              By the Numbers
            </span>
          </div>

          <h2
            id="stats-section-heading"
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Trusted by competitive programmers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform with everything you need to master
            competitive programming across multiple platforms.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>

        {/* Bottom trust indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12 sm:mt-16"
        >
          <p className="text-muted-foreground text-sm">
            Aggregating problems from{' '}
            <span className="font-semibold text-foreground">Codeforces</span>,{' '}
            <span className="font-semibold text-foreground">LeetCode</span>,{' '}
            <span className="font-semibold text-foreground">AtCoder</span>,{' '}
            <span className="font-semibold text-foreground">SPOJ</span>, and
            more.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
