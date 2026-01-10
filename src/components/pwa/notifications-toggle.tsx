'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function NotificationsToggle() {
  const [status, setStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setStatus(Notification.permission);
    }
  }, []);

  const request = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setStatus(perm);
  };

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>Notifications</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <p className='text-sm text-white/70'>
          Enable notifications to get your daily problems and contest reminders.
        </p>
        <div className='flex items-center gap-3'>
          <Badge variant='outline'>Status: {status}</Badge>
          {status !== 'granted' ? (
            <Button
              className='bg-blue-600 hover:bg-blue-600/90'
              onClick={request}
            >
              Enable notifications
            </Button>
          ) : (
            <span className='text-sm text-white/70'>You’re all set.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
