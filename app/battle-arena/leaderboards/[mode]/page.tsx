'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Medal } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

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
        .eq('entity_type', 'user')
        .order('elo', { ascending: false })
        .limit(100);

      if (!error && data) {
        const formatted: LeaderboardEntry[] = data.map(
          (entry: any, idx: number) => ({
            rank: idx + 1,
            name: `Player ${entry.entity_id.slice(0, 8)}`,
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
    if (rank === 1) return <Trophy className='w-5 h-5 text-yellow-500' />;
    if (rank === 2) return <Medal className='w-5 h-5 text-gray-400' />;
    if (rank === 3) return <Medal className='w-5 h-5 text-orange-600' />;
    return null;
  };

  return (
    <main className='min-h-screen bg-background p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold mb-2'>
            {params.mode === '1v1' ? '1v1 Duels' : '3v3 Team Battles'}{' '}
            Leaderboard
          </h1>
          <p className='text-muted-foreground'>
            Top competitors ranked by ELO rating
          </p>
        </div>

        {loading ? (
          <div className='text-center py-12'>Loading...</div>
        ) : (
          <Card className='overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-muted border-b border-border'>
                  <tr>
                    <th className='px-6 py-3 text-left text-sm font-semibold'>
                      Rank
                    </th>
                    <th className='px-6 py-3 text-left text-sm font-semibold'>
                      Player
                    </th>
                    <th className='px-6 py-3 text-right text-sm font-semibold'>
                      ELO
                    </th>
                    <th className='px-6 py-3 text-right text-sm font-semibold'>
                      Wins
                    </th>
                    <th className='px-6 py-3 text-right text-sm font-semibold'>
                      Losses
                    </th>
                    <th className='px-6 py-3 text-right text-sm font-semibold'>
                      Win Rate
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {entries.map(entry => (
                    <tr
                      key={entry.rank}
                      className='hover:bg-muted/50 transition'
                    >
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          {getMedalIcon(entry.rank)}
                          <span className='font-semibold'>#{entry.rank}</span>
                        </div>
                      </td>
                      <td className='px-6 py-4 font-medium'>{entry.name}</td>
                      <td className='px-6 py-4 text-right'>
                        <span className='font-bold text-primary'>
                          {entry.elo}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right text-green-600'>
                        {entry.wins}
                      </td>
                      <td className='px-6 py-4 text-right text-red-600'>
                        {entry.losses}
                      </td>
                      <td className='px-6 py-4 text-right'>
                        {(
                          (entry.wins / (entry.wins + entry.losses)) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
