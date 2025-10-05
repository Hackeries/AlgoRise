'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SRMode = 'standard' | 'aggressive';

export function SheetSettings({
  snoozeMinutes,
  onSnoozeMinutesChange,
  srMode,
  onSrModeChange,
}: {
  snoozeMinutes?: number;
  onSnoozeMinutesChange?: (m: number) => void;
  srMode: SRMode;
  onSrModeChange: (m: SRMode) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          aria-label='Sheet settings'
          className='border-muted hover:bg-muted/5'
        >
          Settings
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='min-w-56 p-2'>
        <DropdownMenuLabel className='text-muted-foreground'>Spaced repetition</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onSrModeChange('standard')}
          aria-checked={srMode === 'standard'}
          role='menuitemradio'
          className={`cursor-pointer ${srMode === 'standard' ? 'bg-primary/10 text-primary font-medium' : ''}`}
        >
          {srMode === 'standard' ? '• ' : ''}Standard
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onSrModeChange('aggressive')}
          aria-checked={srMode === 'aggressive'}
          role='menuitemradio'
          className={`cursor-pointer ${srMode === 'aggressive' ? 'bg-primary/10 text-primary font-medium' : ''}`}
        >
          {srMode === 'aggressive' ? '• ' : ''}Aggressive
        </DropdownMenuItem>

        {snoozeMinutes !== undefined && onSnoozeMinutesChange && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className='text-muted-foreground'>Snooze duration</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onSnoozeMinutesChange(10)}
              className={`cursor-pointer ${snoozeMinutes === 10 ? 'bg-primary/10 text-primary font-medium' : ''}`}
            >
              10 minutes
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSnoozeMinutesChange(30)}
              className={`cursor-pointer ${snoozeMinutes === 30 ? 'bg-primary/10 text-primary font-medium' : ''}`}
            >
              30 minutes
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSnoozeMinutesChange(60)}
              className={`cursor-pointer ${snoozeMinutes === 60 ? 'bg-primary/10 text-primary font-medium' : ''}`}
            >
              60 minutes
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}