// app/profile/overview/page.tsx
import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, CheckCircle2, AlertCircle } from 'lucide-react';

// Fetch profile data from API (SSR-safe)
async function getProfile() {
  try {
    // Await cookies if your Next.js version requires it
    const cookieStore = await cookies(); // type is inferred automatically

    // Map cookies; define type inline for TS
    const cookieHeader = cookieStore
      .getAll()
      .map((c: { name: string; value: string }) => `${c.name}=${c.value}`)
      .join('; ');

    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/profile`, {
      cache: 'no-store',
      headers: { cookie: cookieHeader },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch profile:', err);
    return null;
  }
}

// Reusable row component
interface ProfileRowProps {
  label: React.ReactNode;
  value?: string | null;
}
function ProfileRow({ label, value }: ProfileRowProps) {
  return (
    <div className='flex items-center justify-between'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-medium capitalize'>{value || '—'}</span>
    </div>
  );
}

// Main page component
export default async function ProfileOverviewPage() {
  const data = await getProfile();

  const name = data?.name || data?.full_name || 'Your Profile';
  const status = data?.status;
  const college = data?.college_name || data?.college || null;
  const year = data?.year || null;
  const company =
    data?.company_name || data?.company || data?.custom_company || null;
  const cf = data?.cf_handle || data?.cf || null;
  const cfVerified = data?.cf_verified || false;

  return (
    <main className='min-h-screen w-full bg-gradient-to-b from-background to-muted/20'>
      <div className='mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-2xl'>{name}</CardTitle>
            <Link href='/profile'>
              <Button variant='outline' size='sm'>
                <Pencil className='h-4 w-4 mr-2' />
                Edit Profile
              </Button>
            </Link>
          </CardHeader>
          <CardContent className='space-y-3'>
            <ProfileRow label='Status' value={status} />

            {status === 'student' && (
              <>
                <ProfileRow label='College' value={college} />
                <ProfileRow label='Year' value={year} />
              </>
            )}

            {status === 'working' && (
              <ProfileRow label='Company' value={company} />
            )}

            <ProfileRow
              label={
                <div className='flex items-center gap-1'>
                  Codeforces Handle
                  {cfVerified ? (
                    <CheckCircle2 className='h-4 w-4 text-green-600' />
                  ) : (
                    <AlertCircle className='h-4 w-4 text-red-500' />
                  )}
                </div>
              }
              value={cf}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}