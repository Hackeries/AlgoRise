"use client";

import PixelBlast from "@/components/bg/pixelblast";
import { Target, Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function BannerLanding() {
  return (
    <section className="relative flex flex-col justify-center items-center text-center overflow-hidden min-h-[320px] md:min-h-[520px] px-4">
      {/* Background */}
      <div className="absolute inset-0 -z-10 w-full h-full">
        <PixelBlast />
      </div>

      {/* Floating particles */}
      <motion.div
        className="absolute top-20 left-10 w-6 h-6 rounded-full bg-sky-500/40 blur-xl"
        animate={{ y: [0, 30, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 6 }}
      />
      <motion.div
        className="absolute bottom-24 right-16 w-10 h-10 rounded-full bg-indigo-500/30 blur-2xl"
        animate={{ y: [0, -40, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 8 }}
      />

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-7xl font-extrabold leading-tight font-[Bricolage_Grotesque] mb-6 
        bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 
        bg-clip-text text-transparent animate-gradient-x"
      >
        AlgoRise
      </motion.h1>

      {/* Subheading */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl leading-relaxed"
      >
        Level up your competitive programming with{" "}
        <span className="font-semibold text-foreground">adaptive practice</span>
        ,{" "}
        <span className="font-semibold text-foreground">
          real-time contest tracking
        </span>
        , and{" "}
        <span className="font-semibold text-foreground">
          progress analytics
        </span>
        .
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button
          asChild
          className="group relative text-lg px-8 py-6 font-medium 
          bg-gradient-to-r from-blue-500 to-indigo-600 text-white 
          hover:from-blue-600 hover:to-indigo-700 shadow-lg transition-all duration-300"
        >
          <Link href="/adaptive-sheet" className="flex items-center">
            <Target className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
            Start Adaptive Practice
          </Link>
        </Button>

        <Button
          asChild
          className="text-lg px-8 py-6 font-medium border border-slate-400 dark:border-slate-600 
          bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 
          hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
        >
          <Link href="/contests" className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            View Contests
          </Link>
        </Button>

        <Button
          asChild
          className="text-lg px-8 py-6 font-medium bg-gradient-to-r from-emerald-500 to-teal-600 
          text-white hover:from-emerald-600 hover:to-teal-700 shadow-md transition-all duration-300"
        >
          <Link href="/paths" className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Explore Learning Paths
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
