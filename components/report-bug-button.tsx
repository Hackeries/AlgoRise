'use client';

import { Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ReportBugButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  section?: string;
}

export function ReportBugButton({
  variant = 'outline',
  size = 'default',
  className,
  section,
}: ReportBugButtonProps) {
  const baseFormUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSewjEvIxa8wFKwXhhG2v85OjaurUxE4KKvVjNT0zGp1iWPYw/viewform';

  const reportOptions = [
    {
      label: 'Dashboard Issues',
      section: 'Dashboard',
      description: 'Problems with the main dashboard or training hub',
    },
    {
      label: 'Profile Page Issues',
      section: 'Profile',
      description: 'Issues with profile editing, saving, or viewing',
    },
    {
      label: 'Practice Problems',
      section: 'Adaptive Sheet',
      description: 'Problems with adaptive sheet or problem recommendations',
    },
    {
      label: 'Contest Issues',
      section: 'Contests',
      description: 'Problems with joining or participating in contests',
    },
    {
      label: 'Groups & Leaderboards',
      section: 'Groups',
      description: 'Issues with groups or leaderboard display',
    },
    {
      label: 'Analytics Issues',
      section: 'Analytics',
      description: 'Problems with analytics or data visualization',
    },
    {
      label: 'Codeforces Verification',
      section: 'CF Verification',
      description: 'Issues with Codeforces handle verification',
    },
    {
      label: 'Learning Paths',
      section: 'Learning Paths',
      description: 'Problems with learning path content or navigation',
    },
    {
      label: 'General Feedback',
      section: 'General',
      description: 'Suggestions or general feedback about AlgoRise',
    },
  ];

  const handleReportClick = (selectedSection: string) => {
    // Open the Google Form in a new tab
    // Note: To pre-fill the form, you need to get the entry IDs from your Google Form
    // and append them as URL parameters like: ?entry.123456789=Profile
    window.open(baseFormUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Bug className='w-4 h-4 mr-2' />
          Report a Bug
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-72 bg-card border-border'>
        <div className='px-3 py-2 border-b border-border'>
          <p className='text-sm font-semibold text-foreground'>
            Report an Issue
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            Select the section where you encountered the problem
          </p>
        </div>
        <div className='max-h-96 overflow-y-auto'>
          {reportOptions.map((option, index) => (
            <div key={option.section}>
              <DropdownMenuItem
                onClick={() => handleReportClick(option.section)}
                className='flex flex-col items-start py-3 cursor-pointer hover:bg-muted/50'
              >
                <span className='font-medium text-foreground'>
                  {option.label}
                </span>
                <span className='text-xs text-muted-foreground mt-0.5'>
                  {option.description}
                </span>
              </DropdownMenuItem>
              {index < reportOptions.length - 1 && (
                <DropdownMenuSeparator className='bg-border' />
              )}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}