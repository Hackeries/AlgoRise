'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

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

  return (
    <main className='min-h-screen bg-background p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-foreground mb-2'>
            Battle History
          </h1>
          <p className='text-muted-foreground'>Your past battles and results</p>
        </div>

        {/* History */}
        {loading ? (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <Card className='p-8 text-center'>
            <p className='text-muted-foreground'>
              No battles yet. Start your first battle!
            </p>
          </Card>
        ) : (
          <div className='space-y-3'>
            {history.map(entry => (
              <Card key={entry.id} className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4 flex-1'>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                        entry.result === 'win'
                          ? 'bg-green-500/10 text-green-600'
                          : entry.result === 'loss'
                          ? 'bg-red-500/10 text-red-600'
                          : 'bg-yellow-500/10 text-yellow-600'
                      }`}
                    >
                      {entry.result === 'win'
                        ? 'W'
                        : entry.result === 'loss'
                        ? 'L'
                        : 'D'}
                    </div>
                    <div className='flex-1'>
                      <p className='font-semibold'>{entry.opponent}</p>
                      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Badge variant='outline' className='text-xs'>
                          {entry.mode}
                        </Badge>
                        <Clock className='w-3 h-3' />
                        <span>{entry.duration} min</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='flex items-center gap-1'>
                      {entry.eloChange > 0 ? (
                        <TrendingUp className='w-4 h-4 text-green-600' />
                      ) : (
                        <TrendingDown className='w-4 h-4 text-red-600' />
                      )}
                      <span
                        className={`font-bold ${
                          entry.eloChange > 0
                            ? 'text-green-600'
                            : entry.eloChange < 0
                            ? 'text-red-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {entry.eloChange > 0 ? '+' : ''}
                        {entry.eloChange}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
