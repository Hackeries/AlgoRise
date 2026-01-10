'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export type CompanySet = {
  id: string;
  name: string;
  logoUrl?: string;
  problems?: {
    id: string;
    title: string;
    url: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    companies?: string[];
  }[];
};

export function CompanyGrid({ companies }: { companies: CompanySet[] }) {
  return (
    <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {companies.map(c => (
        <CompanyCard key={c.id} company={c} />
      ))}
    </div>
  );
}

function CompanyCard({ company }: { company: CompanySet }) {
  const difficultyColors = {
    Easy: 'text-emerald-600 border-emerald-600',
    Medium: 'text-yellow-500 border-yellow-500',
    Hard: 'text-red-600 border-red-600',
  };

  const groups = ['Easy', 'Medium', 'Hard'] as const;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 12 }}
    >
      <Card className='flex flex-col p-4 bg-background/50 border border-border/40 shadow-md rounded-2xl'>
        {/* Header */}
        <div className='flex items-center gap-3 mb-4'>
          <div className='h-12 w-12 rounded-xl overflow-hidden border border-border/40 bg-muted/30 grid place-items-center'>
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className='h-full w-full object-cover'
              />
            ) : (
              <span className='text-sm font-bold text-muted-foreground'>
                {company.name[0]}
              </span>
            )}
          </div>
          <h3 className='font-semibold text-base truncate'>{company.name}</h3>
        </div>

        {/* Problem List */}
        <div className='space-y-4 max-h-[60vh] overflow-auto'>
          {groups.map(level => {
            const items =
              company.problems?.filter(p => p.difficulty === level) ?? [];
            if (!items.length) return null;

            return (
              <div key={level}>
                {/* Difficulty Header */}
                <div
                  className={cn(
                    'flex items-center gap-2 mb-2 font-semibold text-sm',
                    difficultyColors[level]
                  )}
                >
                  {level === 'Easy' && <CheckCircle className='h-4 w-4' />}
                  {level === 'Medium' && <TrendingUp className='h-4 w-4' />}
                  {level === 'Hard' && <Zap className='h-4 w-4' />}
                  {level}
                </div>

                {/* Problems */}
                <div className='flex flex-col divide-y divide-border/30'>
                  {items.map(p => (
                    <a
                      key={p.id}
                      href={p.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex justify-between items-center p-2 hover:bg-accent/10 transition-all rounded-md'
                      title={p.title}
                    >
                      <span className='truncate font-medium text-sm'>
                        {p.title}
                      </span>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='outline'
                          className={cn(
                            'text-xs',
                            difficultyColors[p.difficulty]
                          )}
                        >
                          {p.difficulty}
                        </Badge>
                        {p.companies && (
                          <div className='flex gap-1'>
                            {p.companies.map(c => (
                              <Badge
                                key={c}
                                variant='secondary'
                                className='text-[10px]'
                              >
                                {c}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
          {/* Empty state */}
          {company.problems?.length === 0 && (
            <p className='text-muted-foreground text-sm text-center py-4'>
              No problems available
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
