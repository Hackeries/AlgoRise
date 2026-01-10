'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  email_daily_problem_reminder: boolean;
  email_contest_starting: boolean;
  email_rating_change: boolean;
  email_friend_joined_contest: boolean;
  push_daily_problem_reminder: boolean;
  push_contest_starting: boolean;
  push_rating_change: boolean;
  push_friend_joined_contest: boolean;
  digest_frequency: 'none' | 'daily' | 'weekly';
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
}

export function NotificationSettingsForm() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_daily_problem_reminder: true,
    email_contest_starting: true,
    email_rating_change: true,
    email_friend_joined_contest: true,
    push_daily_problem_reminder: true,
    push_contest_starting: true,
    push_rating_change: true,
    push_friend_joined_contest: true,
    digest_frequency: 'daily',
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/notifications/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setSettings((prev: NotificationSettings) => ({
              ...prev,
              ...data.settings
            }));
          }
        } else {
          throw new Error('Failed to fetch settings');
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notification settings. Using default values.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification settings updated successfully',
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (field: keyof NotificationSettings, value: boolean | string) => {
    setSettings((prev: NotificationSettings) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuietHoursToggle = (enabled: boolean) => {
    if (!enabled) {
      handleToggle('quiet_hours_start', '');
      handleToggle('quiet_hours_end', '');
    } else {
      handleToggle('quiet_hours_start', '22:00');
      handleToggle('quiet_hours_end', '08:00');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Notification Preferences</CardTitle>
          <CardDescription>Loading your notification settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Notification Preferences</CardTitle>
        <CardDescription>
          Customize how and when you receive notifications from AlgoRise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Daily Problem Reminders</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-daily-problem" className="flex flex-col space-y-1">
              <span>Email Notifications</span>
              <span className="font-normal text-muted-foreground">
                Receive daily problem reminders via email
              </span>
            </Label>
            <Switch
              id="email-daily-problem"
              checked={settings.email_daily_problem_reminder}
              onCheckedChange={(checked) => 
                handleToggle('email_daily_problem_reminder', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-daily-problem" className="flex flex-col space-y-1">
              <span>Push Notifications</span>
              <span className="font-normal text-muted-foreground">
                Receive push notifications for daily problems
              </span>
            </Label>
            <Switch
              id="push-daily-problem"
              checked={settings.push_daily_problem_reminder}
              onCheckedChange={(checked) => 
                handleToggle('push_daily_problem_reminder', checked)
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contest Notifications</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-contest" className="flex flex-col space-y-1">
              <span>Email Notifications</span>
              <span className="font-normal text-muted-foreground">
                Get notified about upcoming contests
              </span>
            </Label>
            <Switch
              id="email-contest"
              checked={settings.email_contest_starting}
              onCheckedChange={(checked) => 
                handleToggle('email_contest_starting', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-contest" className="flex flex-col space-y-1">
              <span>Push Notifications</span>
              <span className="font-normal text-muted-foreground">
                Receive push notifications for contests
              </span>
            </Label>
            <Switch
              id="push-contest"
              checked={settings.push_contest_starting}
              onCheckedChange={(checked) => 
                handleToggle('push_contest_starting', checked)
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Rating Change Notifications</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-rating" className="flex flex-col space-y-1">
              <span>Email Notifications</span>
              <span className="font-normal text-muted-foreground">
                Get notified about Codeforces rating changes
              </span>
            </Label>
            <Switch
              id="email-rating"
              checked={settings.email_rating_change}
              onCheckedChange={(checked) => 
                handleToggle('email_rating_change', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-rating" className="flex flex-col space-y-1">
              <span>Push Notifications</span>
              <span className="font-normal text-muted-foreground">
                Receive push notifications for rating changes
              </span>
            </Label>
            <Switch
              id="push-rating"
              checked={settings.push_rating_change}
              onCheckedChange={(checked) => 
                handleToggle('push_rating_change', checked)
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Friend Activity Notifications</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="email-friend" className="flex flex-col space-y-1">
              <span>Email Notifications</span>
              <span className="font-normal text-muted-foreground">
                Get notified when friends join contests
              </span>
            </Label>
            <Switch
              id="email-friend"
              checked={settings.email_friend_joined_contest}
              onCheckedChange={(checked) => 
                handleToggle('email_friend_joined_contest', checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-friend" className="flex flex-col space-y-1">
              <span>Push Notifications</span>
              <span className="font-normal text-muted-foreground">
                Receive push notifications for friend activity
              </span>
            </Label>
            <Switch
              id="push-friend"
              checked={settings.push_friend_joined_contest}
              onCheckedChange={(checked) => 
                handleToggle('push_friend_joined_contest', checked)
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Digest</h3>
          <div className="flex items-center justify-between">
            <Label htmlFor="digest-frequency" className="flex flex-col space-y-1">
              <span>Digest Frequency</span>
              <span className="font-normal text-muted-foreground">
                How often to receive notification summaries
              </span>
            </Label>
            <Select
              value={settings.digest_frequency}
              onValueChange={(value: 'none' | 'daily' | 'weekly') => 
                handleToggle('digest_frequency', value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Quiet Hours</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quiet-hours-start">Start Time</Label>
              <Input
                id="quiet-hours-start"
                type="time"
                value={settings.quiet_hours_start}
                onChange={(e) => handleToggle('quiet_hours_start', e.target.value)}
                disabled={!settings.quiet_hours_start && !settings.quiet_hours_end}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiet-hours-end">End Time</Label>
              <Input
                id="quiet-hours-end"
                type="time"
                value={settings.quiet_hours_end}
                onChange={(e) => handleToggle('quiet_hours_end', e.target.value)}
                disabled={!settings.quiet_hours_start && !settings.quiet_hours_end}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="enable-quiet-hours"
              checked={!!(settings.quiet_hours_start && settings.quiet_hours_end)}
              onCheckedChange={handleQuietHoursToggle}
            />
            <Label htmlFor="enable-quiet-hours">Enable Quiet Hours</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            During quiet hours, you will only receive high-priority notifications.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            setSettings({
              email_daily_problem_reminder: true,
              email_contest_starting: true,
              email_rating_change: true,
              email_friend_joined_contest: true,
              push_daily_problem_reminder: true,
              push_contest_starting: true,
              push_rating_change: true,
              push_friend_joined_contest: true,
              digest_frequency: 'daily',
              quiet_hours_start: '22:00',
              quiet_hours_end: '08:00',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
          }}
        >
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}