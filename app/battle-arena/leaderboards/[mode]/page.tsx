'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Medal, Crown } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  name: string;
  elo: number;
  wins: number;
  losses: number;
}

export default function LeaderboardPage({
  params,
}: {
  params: { mode: string };
}) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRank, setHoveredRank] = useState<number | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('battle_ratings')
        .select('entity_id, elo, wins, losses')
        .eq('mode', params.mode)
        .eq('entity_type', params.mode === '3v3' ? 'team' : 'user')
        .order('elo', { ascending: false })
        .limit(100);

      if (!error && data) {
        const formatted: LeaderboardEntry[] = data.map(
          (entry: any, idx: number) => ({
            rank: idx + 1,
            name:
              params.mode === '3v3'
                ? `Team ${entry.entity_id.slice(0, 8)}`
                : `Player ${entry.entity_id.slice(0, 8)}`,
            elo: entry.elo,
            wins: entry.wins || 0,
            losses: entry.losses || 0,
          })
        );
        setEntries(formatted);
      }

      setLoading(false);
    };

    fetchLeaderboard();
  }, [params.mode]);

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className='w-6 h-6 text-yellow-400' />;
    if (rank === 2) return <Medal className='w-6 h-6 text-gray-300' />;
    if (rank === 3) return <Medal className='w-6 h-6 text-orange-400' />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-600 to-yellow-400';
    if (rank === 2) return 'from-gray-400 to-gray-200';
    if (rank === 3) return 'from-orange-600 to-orange-400';
    return 'from-blue-600 to-cyan-600';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
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

  const topThree = entries.slice(0, 3);
  const restEntries = entries.slice(3);

  return (
    <main className='min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 md:p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <motion.div
          className='mb-12'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className='flex items-center gap-3 mb-2'>
            <Crown className='w-8 h-8 text-yellow-400' />
            <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent'>
              {params.mode === '1v1' ? '1v1 Duels' : '3v3 Team Battles'}{' '}
              Leaderboard
            </h1>
          </div>
          <p className='text-blue-200 text-lg'>
            Top competitors ranked by ELO rating
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
            <p className='text-blue-300'>Loading leaderboard...</p>
          </motion.div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && (
              <motion.div
                className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-12'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* 2nd Place */}
                {topThree[1] && (
                  <motion.div
                    className='md:order-1'
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className='p-6 bg-gradient-to-br from-gray-900/50 to-slate-900/50 border border-gray-500/30 backdrop-blur-sm h-full flex flex-col items-center text-center'>
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                        className='mb-4'
                      >
                        <Medal className='w-12 h-12 text-gray-300 mx-auto' />
                      </motion.div>
                      <p className='text-gray-400 text-sm font-semibold mb-2'>
                        2nd Place
                      </p>
                      <p className='text-2xl font-bold text-white mb-2'>
                        {topThree[1].name}
                      </p>
                      <div className='w-full h-1 bg-gradient-to-r from-gray-400 to-gray-200 rounded-full mb-4' />
                      <div className='space-y-2 w-full'>
                        <div className='flex justify-between items-center'>
                          <span className='text-gray-300 text-sm'>ELO</span>
                          <span className='font-bold text-gray-200'>
                            {topThree[1].elo}
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='text-gray-300 text-sm'>
                            Win Rate
                          </span>
                          <span className='font-bold text-gray-200'>
                            {(
                              (topThree[1].wins /
                                (topThree[1].wins + topThree[1].losses)) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <motion.div
                    className='md:order-2'
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className='p-6 bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border border-yellow-500/50 backdrop-blur-sm h-full flex flex-col items-center text-center relative overflow-hidden'>
                      <motion.div
                        className='absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10'
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                      />
                      <motion.div
                        animate={{ rotate: 360, y: [0, -15, 0] }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                        className='mb-4 relative z-10'
                      >
                        <Trophy className='w-14 h-14 text-yellow-400' />
                      </motion.div>
                      <p className='text-yellow-300 text-sm font-semibold mb-2 relative z-10'>
                        1st Place
                      </p>
                      <p className='text-3xl font-bold text-white mb-2 relative z-10'>
                        {topThree[0].name}
                      </p>
                      <div className='w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mb-4 relative z-10' />
                      <div className='space-y-2 w-full relative z-10'>
                        <div className='flex justify-between items-center'>
                          <span className='text-yellow-200 text-sm'>ELO</span>
                          <span className='font-bold text-yellow-300 text-lg'>
                            {topThree[0].elo}
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='text-yellow-200 text-sm'>
                            Win Rate
                          </span>
                          <span className='font-bold text-yellow-300'>
                            {(
                              (topThree[0].wins /
                                (topThree[0].wins + topThree[0].losses)) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <motion.div
                    className='md:order-3'
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Card className='p-6 bg-gradient-to-br from-orange-900/50 to-red-900/50 border border-orange-500/30 backdrop-blur-sm h-full flex flex-col items-center text-center'>
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: 0.2,
                        }}
                        className='mb-4'
                      >
                        <Medal className='w-12 h-12 text-orange-400 mx-auto' />
                      </motion.div>
                      <p className='text-orange-300 text-sm font-semibold mb-2'>
                        3rd Place
                      </p>
                      <p className='text-2xl font-bold text-white mb-2'>
                        {topThree[2].name}
                      </p>
                      <div className='w-full h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mb-4' />
                      <div className='space-y-2 w-full'>
                        <div className='flex justify-between items-center'>
                          <span className='text-orange-200 text-sm'>ELO</span>
                          <span className='font-bold text-orange-200'>
                            {topThree[2].elo}
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='text-orange-200 text-sm'>
                            Win Rate
                          </span>
                          <span className='font-bold text-orange-200'>
                            {(
                              (topThree[2].wins /
                                (topThree[2].wins + topThree[2].losses)) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Rest of Leaderboard */}
            {restEntries.length > 0 && (
              <Card className='overflow-hidden bg-gradient-to-br from-slate-900/50 to-blue-900/50 border border-blue-500/20 backdrop-blur-sm'>
                <div className='overflow-x-auto'>
                  <motion.table
                    className='w-full'
                    variants={containerVariants}
                    initial='hidden'
                    animate='visible'
                  >
                    <thead className='bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-b border-blue-500/20 sticky top-0'>
                      <tr>
                        <th className='px-6 py-4 text-left text-sm font-semibold text-blue-300'>
                          Rank
                        </th>
                        <th className='px-6 py-4 text-left text-sm font-semibold text-blue-300'>
                          Player
                        </th>
                        <th className='px-6 py-4 text-right text-sm font-semibold text-blue-300'>
                          ELO
                        </th>
                        <th className='px-6 py-4 text-right text-sm font-semibold text-blue-300'>
                          Wins
                        </th>
                        <th className='px-6 py-4 text-right text-sm font-semibold text-blue-300'>
                          Losses
                        </th>
                        <th className='px-6 py-4 text-right text-sm font-semibold text-blue-300'>
                          Win Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-blue-500/10'>
                      {restEntries.map(entry => (
                        <motion.tr
                          key={entry.rank}
                          variants={itemVariants}
                          className='hover:bg-blue-900/30 transition-all duration-300 cursor-pointer'
                          onHoverStart={() => setHoveredRank(entry.rank)}
                          onHoverEnd={() => setHoveredRank(null)}
                          whileHover={{ scale: 1.01, paddingLeft: 8 }}
                        >
                          <td className='px-6 py-4'>
                            <motion.div
                              className='flex items-center gap-3'
                              animate={
                                hoveredRank === entry.rank
                                  ? { scale: 1.1 }
                                  : { scale: 1 }
                              }
                            >
                              <span className='font-bold text-white text-lg'>
                                #{entry.rank}
                              </span>
                            </motion.div>
                          </td>
                          <td className='px-6 py-4 font-medium text-white'>
                            {entry.name}
                          </td>
                          <td className='px-6 py-4 text-right'>
                            <motion.span
                              className='font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'
                              animate={
                                hoveredRank === entry.rank
                                  ? { scale: 1.1 }
                                  : { scale: 1 }
                              }
                            >
                              {entry.elo}
                            </motion.span>
                          </td>
                          <td className='px-6 py-4 text-right'>
                            <motion.span
                              className='font-semibold text-green-400'
                              animate={
                                hoveredRank === entry.rank
                                  ? { scale: 1.1 }
                                  : { scale: 1 }
                              }
                            >
                              {entry.wins}
                            </motion.span>
                          </td>
                          <td className='px-6 py-4 text-right'>
                            <motion.span
                              className='font-semibold text-red-400'
                              animate={
                                hoveredRank === entry.rank
                                  ? { scale: 1.1 }
                                  : { scale: 1 }
                              }
                            >
                              {entry.losses}
                            </motion.span>
                          </td>
                          <td className='px-6 py-4 text-right'>
                            <motion.span
                              className='font-semibold text-blue-300'
                              animate={
                                hoveredRank === entry.rank
                                  ? { scale: 1.1 }
                                  : { scale: 1 }
                              }
                            >
                              {(
                                (entry.wins / (entry.wins + entry.losses)) *
                                100
                              ).toFixed(1)}
                              %
                            </motion.span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </motion.table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}
