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
      <div className='flex-1 w-full flex flex-col gap-10 p-6 md:p-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen'>
        {/* Greeting */}
        <div className='flex flex-col gap-4 text-center md:text-left'>
          <h1 className='text-3xl md:text-4xl font-bold'>
            👋 Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className='text-muted-foreground text-sm md:text-base'>
            Ready to continue your competitive programming journey?
          </p>
        </div>

        {/* Feature Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[
            {
              title: 'Daily Training',
              desc: 'Start your daily problem-solving session',
              href: '/train',
            },
            {
              title: 'Adaptive Sheet',
              desc: 'Practice with personalized problem recommendations',
              href: '/adaptive-sheet',
              outline: true,
            },
            {
              title: 'Analytics',
              desc: 'Track your progress and performance',
              href: '/analytics',
              outline: true,
            },
            {
              title: 'Contests',
              desc: 'Participate in competitive programming contests',
              href: '/contests',
              outline: true,
            },
            {
              title: 'Groups',
              desc: 'Join study groups and collaborate',
              href: '/groups',
              outline: true,
            },
            {
              title: 'Visualizers',
              desc: 'Visualize algorithms and data structures',
              href: '/visualizers',
              outline: true,
            },
          ].map((item, idx) => (
            <Card
              key={idx}
              className='hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300'
            >
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className={`w-full ${
                    item.outline
                      ? 'bg-transparent border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                      : ''
                  }`}
                >
                  <Link href={item.href}>
                    {item.outline ? 'Open' : 'Start'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Account Info */}
        <div className='mt-8'>
          <Card className='border border-gray-200 dark:border-gray-700 shadow-lg'>
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
              <div className='mt-4 flex justify-end'>
                <Button
                  variant='outline'
                  asChild
                  className='text-red-500 border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                >
                  <Link href='/auth/logout'>Logout</Link>
                </Button>
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