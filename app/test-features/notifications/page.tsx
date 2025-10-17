'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Loader2, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TestNotificationsPage() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const { toast } = useToast();

  const triggerNotification = async (type: string, displayName: string) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      const response = await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResults(prev => ({
          ...prev,
          [type]: { success: true, message: data.message }
        }));
        toast({
          title: "Success",
          description: `${displayName} triggered successfully`,
        });
      } else {
        setResults(prev => ({
          ...prev,
          [type]: { success: false, message: data.error || 'Failed to trigger notification' }
        }));
        toast({
          title: "Error",
          description: `Failed to trigger ${displayName}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [type]: { success: false, message: 'Network error occurred' }
      }));
      toast({
        title: "Error",
        description: `Network error while triggering ${displayName}`,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const notificationTypes = [
    { id: 'daily_problem_reminder', name: 'Daily Problem Reminder' },
    { id: 'upcoming_contest', name: 'Upcoming Contest' },
    { id: 'rating_change', name: 'Rating Change' },
    { id: 'friend_joined', name: 'Friend Joined Contest' },
    { id: 'all', name: 'All Notifications' },
  ];

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white">Test Smart Notifications</h1>
        <p className="text-white/70 text-lg">
          Test the various notification types in the AlgoRise platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notificationTypes.map((notification) => (
          <Card key={notification.id} className="bg-[#1a1f36] border-[#2a3441]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {notification.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/70 text-sm">
                {notification.id === 'daily_problem_reminder' && 'Sends daily problem reminders to users to maintain streaks'}
                {notification.id === 'upcoming_contest' && 'Notifies users about contests starting soon'}
                {notification.id === 'rating_change' && 'Alerts users about potential Codeforces rating changes'}
                {notification.id === 'friend_joined' && 'Informs users when friends join the same contests'}
                {notification.id === 'all' && 'Triggers all notification types at once'}
              </p>
              
              <Button
                onClick={() => triggerNotification(notification.id, notification.name)}
                disabled={loading[notification.id]}
                className="w-full bg-blue-600 hover:bg-blue-600/90"
              >
                {loading[notification.id] ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Triggering...
                  </>
                ) : (
                  'Trigger Notification'
                )}
              </Button>
              
              {results[notification.id] && (
                <div className={`p-3 rounded-lg border ${
                  results[notification.id].success 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {results[notification.id].success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm ${
                      results[notification.id].success ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {results[notification.id].message}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1a1f36] border-[#2a3441]">
        <CardHeader>
          <CardTitle className="text-white">How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-white/70">
          <p>1. Make sure you're authenticated (log in to the app first)</p>
          <p>2. Click on any "Trigger Notification" button above</p>
          <p>3. Check the response message to see if the notification was triggered successfully</p>
          <p>4. View notifications in the app's notification panel</p>
        </CardContent>
      </Card>
    </main>
  );
}