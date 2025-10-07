import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className='flex min-h-screen w-full items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm'>
        <div className='flex flex-col gap-6'>
          <Card className='shadow-lg border border-gray-200 dark:border-gray-700'>
            <CardHeader>
              <CardTitle className='text-2xl font-bold text-red-600'>
                Oops! Something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <p className='text-sm text-gray-700 dark:text-gray-300 mb-4'>
                  Error code: <span className='font-mono'>{params.error}</span>
                </p>
              ) : (
                <p className='text-sm text-gray-700 dark:text-gray-300 mb-4'>
                  An unexpected error occurred. Please try again later.
                </p>
              )}
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                You can{' '}
                <Link href='/' className='text-blue-500 hover:underline'>
                  return to the homepage
                </Link>{' '}
                or contact support if the issue persists.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
