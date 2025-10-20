'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Swords,
  Filter,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface BattleHistoryEntry {
  id: string;
  opponent: string;
  mode: '1v1' | '3v3';
  result: 'win' | 'loss' | 'draw';
  eloChange: number;
  date: string;
  duration: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<BattleHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '1v1' | '3v3'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: battleHistory, error } = await supabase
        .from('battle_history')
        .select('*, battles(mode, start_at, end_at)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && battleHistory) {
        const formatted: BattleHistoryEntry[] = battleHistory.map(
          (entry: any) => ({
            id: entry.id,
            opponent: 'Opponent',
            mode: entry.battles?.mode || '1v1',
            result: entry.result,
            eloChange: entry.elo_change || 0,
            date: new Date(entry.created_at).toLocaleDateString(),
            duration: entry.battles?.end_at
              ? Math.floor(
                  (new Date(entry.battles.end_at).getTime() -
                    new Date(entry.battles.start_at).getTime()) /
                    60000
                )
              : 0,
          })
        );
        setHistory(formatted);
      }

      setLoading(false);
    };

    fetchHistory();
  }, []);

  const filteredHistory = history.filter(
    entry => filter === 'all' || entry.mode === filter
  );

  const stats = {
    total: history.length,
    wins: history.filter(e => e.result === 'win').length,
    losses: history.filter(e => e.result === 'loss').length,
    draws: history.filter(e => e.result === 'draw').length,
    winRate:
      history.length > 0
        ? (
            (history.filter(e => e.result === 'win').length / history.length) *
            100
          ).toFixed(1)
        : 0,
    totalEloChange: history.reduce((sum, e) => sum + e.eloChange, 0),
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 md:p-8'>
      <div className='max-w-5xl mx-auto'>
        {/* Header */}
        <motion.div
          className='mb-8'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className='flex items-center gap-3 mb-2'>
            <Swords className='w-8 h-8 text-cyan-400' />
            <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>
              Battle History
            </h1>
          </div>
          <p className='text-blue-200'>
            Review your past battles and performance metrics
          </p>
        </motion.div>

        {loading ? (
          <motion.div
            className='text-center py-12'
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <motion.div
              className='w-12 h-12 border-4 border-blue-500/30 border-t-blue-400 rounded-full mx-auto mb-4'
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
            />
            <p className='text-blue-300'>Loading history...</p>
          </motion.div>
        ) : history.length === 0 ? (
          <Card className='p-8 text-center bg-gradient-to-br from-slate-900/50 to-blue-900/50 border border-blue-500/20 backdrop-blur-sm'>
            <Swords className='w-12 h-12 text-blue-300/50 mx-auto mb-4' />
            <p className='text-blue-200 text-lg'>
              No battles yet. Start your first battle!
            </p>
          </Card>
        ) : (
          <>
            {/* Stats Grid */}
            <motion.div
              className='grid grid-cols-2 md:grid-cols-5 gap-3 mb-8'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className='p-4 rounded-lg bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/20 backdrop-blur-sm'
                whileHover={{ scale: 1.05 }}
              >
                <p className='text-xs text-blue-300/70 mb-1'>Total Battles</p>
                <p className='text-2xl font-bold text-white'>{stats.total}</p>
              </motion.div>
              <motion.div
                className='p-4 rounded-lg bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/20 backdrop-blur-sm'
                whileHover={{ scale: 1.05 }}
              >
                <p className='text-xs text-green-300/70 mb-1'>Wins</p>
                <p className='text-2xl font-bold text-green-400'>
                  {stats.wins}
                </p>
              </motion.div>
              <motion.div
                className='p-4 rounded-lg bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-500/20 backdrop-blur-sm'
                whileHover={{ scale: 1.05 }}
              >
                <p className='text-xs text-red-300/70 mb-1'>Losses</p>
                <p className='text-2xl font-bold text-red-400'>
                  {stats.losses}
                </p>
              </motion.div>
              <motion.div
                className='p-4 rounded-lg bg-gradient-to-br from-yellow-900/30 to-amber-900/30 border border-yellow-500/20 backdrop-blur-sm'
                whileHover={{ scale: 1.05 }}
              >
                <p className='text-xs text-yellow-300/70 mb-1'>Win Rate</p>
                <p className='text-2xl font-bold text-yellow-400'>
                  {stats.winRate}%
                </p>
              </motion.div>
              <motion.div
                className='p-4 rounded-lg bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/20 backdrop-blur-sm'
                whileHover={{ scale: 1.05 }}
              >
                <p className='text-xs text-purple-300/70 mb-1'>ELO Change</p>
                <p
                  className={`text-2xl font-bold ${
                    stats.totalEloChange >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {stats.totalEloChange >= 0 ? '+' : ''}
                  {stats.totalEloChange}
                </p>
              </motion.div>
            </motion.div>

            {/* Filter Buttons */}
            <motion.div
              className='flex gap-2 mb-6'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={() => setFilter('all')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800/50 text-blue-300 border border-blue-500/20 hover:border-blue-400/50'
                }`}
              >
                <Filter className='w-4 h-4' />
                All Battles
              </motion.button>
              <motion.button
                onClick={() => setFilter('1v1')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  filter === '1v1'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-800/50 text-blue-300 border border-blue-500/20 hover:border-blue-400/50'
                }`}
              >
                1v1 Duels
              </motion.button>
              <motion.button
                onClick={() => setFilter('3v3')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  filter === '3v3'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-slate-800/50 text-blue-300 border border-blue-500/20 hover:border-blue-400/50'
                }`}
              >
                3v3 Team Battles
              </motion.button>
            </motion.div>

            {/* Battle History List */}
            <motion.div
              className='space-y-3'
              variants={containerVariants}
              initial='hidden'
              animate='visible'
            >
              {filteredHistory.map(entry => (
                <motion.div key={entry.id} variants={itemVariants}>
                  <motion.div
                    onClick={() =>
                      setExpandedId(expandedId === entry.id ? null : entry.id)
                    }
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      entry.result === 'win'
                        ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/30 hover:border-green-400/60 hover:shadow-lg hover:shadow-green-500/20'
                        : entry.result === 'loss'
                        ? 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-500/30 hover:border-red-400/60 hover:shadow-lg hover:shadow-red-500/20'
                        : 'bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-yellow-500/30 hover:border-yellow-400/60 hover:shadow-lg hover:shadow-yellow-500/20'
                    }`}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-4 flex-1'>
                        {/* Result Badge */}
                        <motion.div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                            entry.result === 'win'
                              ? 'bg-green-500/20 text-green-400'
                              : entry.result === 'loss'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {entry.result === 'win'
                            ? 'W'
                            : entry.result === 'loss'
                            ? 'L'
                            : 'D'}
                        </motion.div>

                        {/* Battle Info */}
                        <div className='flex-1 min-w-0'>
                          <p className='font-semibold text-white'>
                            {entry.opponent}
                          </p>
                          <div className='flex items-center gap-3 text-sm text-blue-300 flex-wrap mt-1'>
                            <Badge
                              variant='outline'
                              className={`text-xs border-opacity-50 ${
                                entry.mode === '1v1'
                                  ? 'border-blue-500/50 text-blue-300'
                                  : 'border-purple-500/50 text-purple-300'
                              }`}
                            >
                              {entry.mode}
                            </Badge>
                            <div className='flex items-center gap-1'>
                              <Clock className='w-3 h-3' />
                              <span>{entry.duration} min</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <Swords className='w-3 h-3' />
                              <span>{entry.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ELO Change */}
                      <motion.div
                        className='text-right flex-shrink-0'
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className='flex items-center gap-1 justify-end'>
                          {entry.eloChange > 0 ? (
                            <TrendingUp className='w-5 h-5 text-green-400' />
                          ) : entry.eloChange < 0 ? (
                            <TrendingDown className='w-5 h-5 text-red-400' />
                          ) : (
                            <BarChart3 className='w-5 h-5 text-blue-300' />
                          )}
                          <span
                            className={`font-bold text-lg ${
                              entry.eloChange > 0
                                ? 'text-green-400'
                                : entry.eloChange < 0
                                ? 'text-red-400'
                                : 'text-blue-300'
                            }`}
                          >
                            {entry.eloChange > 0 ? '+' : ''}
                            {entry.eloChange}
                          </span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Expanded Details */}
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={
                        expandedId === entry.id
                          ? { opacity: 1, height: 'auto' }
                          : { opacity: 0, height: 0 }
                      }
                      transition={{ duration: 0.3 }}
                      className='overflow-hidden'
                    >
                      <div className='mt-4 pt-4 border-t border-current border-opacity-20 space-y-2'>
                        <div className='grid grid-cols-2 gap-4 text-sm'>
                          <div>
                            <p className='text-blue-300/70 text-xs'>
                              Battle Duration
                            </p>
                            <p className='font-semibold text-white'>
                              {entry.duration} minutes
                            </p>
                          </div>
                          <div>
                            <p className='text-blue-300/70 text-xs'>
                              Battle Date
                            </p>
                            <p className='font-semibold text-white'>
                              {entry.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}
