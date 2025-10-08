import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProtectedPage() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user) {
      redirect('/auth/login');
    }

    const user = data.user;

    return (
      <div className='flex-1 w-full flex flex-col gap-8 p-6'>
        <div className='flex flex-col gap-4'>
          <h1 className='text-3xl font-bold'>
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className='text-muted-foreground'>
            Ready to continue your competitive programming journey?
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>Daily Training</CardTitle>
              <CardDescription>
                Start your daily problem-solving session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className='w-full'>
                <Link href='/train'>Start Training</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adaptive Sheet</CardTitle>
              <CardDescription>
                Practice with personalized problem recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant='outline'
                className='w-full bg-transparent'
              >
                <Link href='/adaptive-sheet'>Open Sheet</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Track your progress and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant='outline'
                className='w-full bg-transparent'
              >
                <Link href='/analytics'>View Analytics</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contests</CardTitle>
              <CardDescription>
                Participate in competitive programming contests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant='outline'
                className='w-full bg-transparent'
              >
                <Link href='/contests'>Browse Contests</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Groups</CardTitle>
              <CardDescription>
                Join study groups and collaborate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant='outline'
                className='w-full bg-transparent'
              >
                <Link href='/groups'>My Groups</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visualizers</CardTitle>
              <CardDescription>
                Visualize algorithms and data structures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant='outline'
                className='w-full bg-transparent'
              >
                <Link href='/visualizers'>Open Visualizers</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className='mt-8'>
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>User ID:</strong> {user.id}
                </p>
                <p>
                  <strong>Last Sign In:</strong>{' '}
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Protected page error:', error);
    redirect('/auth/login');
  }
}
