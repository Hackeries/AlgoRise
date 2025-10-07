import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Page() {
  return (
    <div className='flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='w-full max-w-sm'>
        <Card className='shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl transform hover:scale-[1.02] transition-all duration-300'>
          <CardHeader className='text-center bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white py-6 rounded-t-2xl'>
            <div className='text-5xl mb-2 animate-bounce'>🎉</div>
            <CardTitle className='text-2xl md:text-3xl font-bold'>
              Hooray! You're almost ready.
            </CardTitle>
            <CardDescription className='text-sm md:text-base text-white/90'>
              A confirmation email has been sent to your inbox
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6 px-6 py-8'>
            <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
              <p className='text-sm text-blue-800 dark:text-blue-200 font-semibold'>
                📧 Verify Your Email
              </p>
              <p className='text-xs text-blue-700 dark:text-blue-300 mt-1'>
                Click the verification link in the email we just sent to
                complete your account setup.
              </p>
              <p className='text-xs text-blue-700 dark:text-blue-300 mt-1'>
                Didn't receive it? Check your spam folder or{' '}
                <Link
                  href='/auth/resend-verification'
                  className='text-blue-500 hover:underline'
                >
                  resend the email
                </Link>
                .
              </p>
            </div>

            <div className='space-y-3'>
              <p className='text-sm text-muted-foreground'>
                Once verified, you can:
              </p>
              <div className='flex flex-col gap-2'>
                <Button
                  asChild
                  className='w-full bg-blue-500 hover:bg-blue-600 text-white transition duration-300'
                >
                  <Link href='/auth/login'>Go to Login</Link>
                </Button>
                <Button
                  variant='outline'
                  asChild
                  className='w-full border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300'
                >
                  <Link href='/'>Return to Homepage</Link>
                </Button>
              </div>
            </div>

            <div className='text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700'>
              <strong>Note:</strong> You must verify your email before logging
              in. Verification usually happens instantly, but it may take a few
              minutes.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}