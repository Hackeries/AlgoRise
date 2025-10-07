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
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Thank you for signing up!</CardTitle>
              <CardDescription>Check your email to confirm your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                  📧 Email Verification Required
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  We've sent you a confirmation email. Please check your inbox and click the verification link.
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  After confirming your email, you can:
                </p>
                
                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link href="/auth/login">Go to Login</Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/">Return to Homepage</Link>
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900 p-2 rounded">
                <strong>Note:</strong> You must verify your email before you can sign in to your account.
    <div className='flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <div className='w-full max-w-sm'>
        <Card className='shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl transform hover:scale-[1.02] transition-all duration-300'>
          <CardHeader className='text-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-white py-6 rounded-t-2xl'>
            <div className='text-5xl mb-2 animate-bounce'>🎉</div>
            <CardTitle className='text-2xl md:text-3xl font-bold'>
              Thank you for signing up!
            </CardTitle>
            <CardDescription className='text-sm md:text-base text-white/90'>
              Check your email to confirm your account
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4 px-6 py-8'>
            <div className='p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
              <p className='text-sm text-blue-800 dark:text-blue-200 font-medium'>
                📧 Email Verification Required
              </p>
              <p className='text-xs text-blue-700 dark:text-blue-300 mt-1'>
                We've sent you a confirmation email. Please check your inbox and
                click the verification link.
              </p>
            </div>

            <div className='space-y-3'>
              <p className='text-sm text-muted-foreground'>
                After confirming your email, you can:
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

            <div className='text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900 p-2 rounded'>
              <strong>Note:</strong> You must verify your email before you can
              sign in to your account.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
