// app/profile/overview/page.tsx
import type React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import LinksEditor from '@/components/profile/links-editor';
// import { ReportBugButton } from "@/components/report-bug-button"

export const dynamic = 'force-dynamic';

function formatYear(year: string | null): string {
  if (!year) return '—';
  const yearNum = Number.parseInt(year);
  if (isNaN(yearNum)) return year;

  const suffix =
    yearNum === 1 ? 'st' : yearNum === 2 ? 'nd' : yearNum === 3 ? 'rd' : 'th';
  return `${yearNum}${suffix} Year`;
}

function formatDegreeType(degreeType: string | null): string {
  if (!degreeType) return '';

  const degreeMap: Record<string, string> = {
    btech: 'B.Tech / B.E.',
    mtech: 'M.Tech / M.E.',
    bsc: 'B.Sc.',
    msc: 'M.Sc.',
    bca: 'BCA',
    mca: 'MCA',
    mba: 'MBA',
    phd: 'Ph.D.',
    other: 'Other',
  };

  return degreeMap[degreeType] || degreeType;
}

function calculateProfileStrength(data: any): number {
  let totalWeight = 0;
  let earnedWeight = 0;

  // Core: CF Verification (25%)
  if (data?.cf_verified) {
    earnedWeight += 25;
  }
  totalWeight += 25;

  // Core: Status (15%)
  if (data?.status) {
    earnedWeight += 15;
  }
  totalWeight += 15;

  // Status-specific requirements (35%)
  if (data?.status === 'student') {
    // Student requirements
    if (data?.degree_type) earnedWeight += 8;
    if (data?.college_id) earnedWeight += 9;
    if (data?.year) earnedWeight += 9;
    totalWeight += 26;
  } else if (data?.status === 'working') {
    // Working requirements
    if (data?.company_id) earnedWeight += 26;
    totalWeight += 26;
  } else {
    totalWeight += 26;
  }

  // Coding profiles (25%)
  const codingProfiles = [
    data?.leetcode_handle,
    data?.codechef_handle,
    data?.atcoder_handle,
    data?.gfg_handle,
  ].filter(Boolean).length;

  const profilesWeight = (codingProfiles / 4) * 25;
  earnedWeight += profilesWeight;
  totalWeight += 25;

  return Math.round((earnedWeight / totalWeight) * 100);
}

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

    const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || '';
    const url = base ? `${base}/api/profile` : '/api/profile';

    const res = await fetch(url, {
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
  const status = data?.status as 'student' | 'working' | null;
  const degreeType = data?.degree_type || null;
  const college = data?.college_name || data?.college || null;
  const year = data?.year || null;
  const company =
    data?.company_name || data?.company || data?.custom_company || null;
  const cf = data?.cf_handle || data?.cf || null;
  const cfVerified = data?.cf_verified || false;
  const lc = data?.leetcode_handle || null;
  const cc = data?.codechef_handle || null;
  const ac = data?.atcoder_handle || null;
  const gfg = data?.gfg_handle || null;

  const completion = calculateProfileStrength(data);

  const getStrengthLevel = (score: number) => {
    if (score >= 90)
      return {
        label: 'Excellent',
        color: 'text-green-600',
        bg: 'bg-green-50 dark:bg-green-950',
      };
    if (score >= 70)
      return {
        label: 'Good',
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-950',
      };
    if (score >= 50)
      return {
        label: 'Fair',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50 dark:bg-yellow-950',
      };
    return {
      label: 'Incomplete',
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950',
    };
  };

  const strengthLevel = getStrengthLevel(completion);

  return (
    <main className='min-h-screen w-full bg-gradient-to-b from-background to-muted/20'>
      <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-4xl font-bold tracking-tight'>
              Profile Overview
            </h1>
            <p className='text-muted-foreground mt-2'>
              Manage your profile and track your competitive programming journey
            </p>
          </div>
        </div>

        {/* Profile Strength Card */}
        <Card className={`border-2 ${strengthLevel.bg}`}>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-2xl'>Profile Strength</CardTitle>
                <p
                  className={`text-sm mt-1 font-semibold ${strengthLevel.color}`}
                >
                  {strengthLevel.label}
                </p>
              </div>
              <div className='text-right'>
                <div className={`text-4xl font-bold ${strengthLevel.color}`}>
                  {completion}%
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className='h-3 w-full rounded-full bg-muted overflow-hidden'
              aria-label='Profile completion progress'
            >
              <div
                className={`h-full ${
                  completion >= 90
                    ? 'bg-green-600'
                    : completion >= 70
                    ? 'bg-blue-600'
                    : completion >= 50
                    ? 'bg-yellow-600'
                    : 'bg-orange-600'
                } transition-all duration-500`}
                style={{ width: `${completion}%` }}
                role='progressbar'
                aria-valuenow={completion}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <p className='mt-4 text-sm text-muted-foreground'>
              {completion >= 100
                ? 'Perfect! Your profile is complete and ready to shine.'
                : completion >= 90
                ? 'Almost perfect! Add more coding profiles to reach 100%.'
                : completion >= 70
                ? 'Great progress! Complete your profile details to unlock full potential.'
                : completion >= 50
                ? 'Good start! Add more information to improve your profile.'
                : 'Complete your profile to unlock personalized recommendations.'}
            </p>
          </CardContent>
        </Card>

        {/* Main Profile Info + Quick Actions */}
        <div className='grid gap-6 lg:grid-cols-3'>
          <Card className='lg:col-span-2 border-l-4 border-l-primary'>
            <CardHeader className='flex flex-row items-center justify-between pb-4'>
              <div>
                <CardTitle className='text-3xl'>{name}</CardTitle>
                <p className='text-muted-foreground mt-1'>
                  Competitive Programmer
                </p>
              </div>
              <Link href='/profile'>
                <Button variant='outline' size='sm'>
                  Edit Profile
                </Button>
              </Link>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2 p-3 rounded-lg bg-muted/50'>
                  <div className='text-sm text-muted-foreground font-medium'>
                    Status
                  </div>
                  <div className='font-semibold text-lg capitalize'>
                    {status || '—'}
                  </div>
                </div>

                <div className='space-y-2 p-3 rounded-lg bg-muted/50'>
                  <div className='text-sm text-muted-foreground font-medium'>
                    Codeforces
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='font-semibold text-lg'>{cf || '—'}</span>
                    {cf ? (
                      cfVerified ? (
                        <Badge className='bg-green-600 hover:bg-green-600'>
                          <CheckCircle2 className='h-3 w-3 mr-1' /> Verified
                        </Badge>
                      ) : (
                        <Badge variant='destructive'>
                          <AlertCircle className='h-3 w-3 mr-1' /> Unverified
                        </Badge>
                      )
                    ) : null}
                  </div>
                </div>

                {status === 'student' && degreeType && (
                  <div className='space-y-2 p-3 rounded-lg bg-muted/50'>
                    <div className='text-sm text-muted-foreground font-medium'>
                      Degree
                    </div>
                    <div className='font-semibold text-lg'>
                      {formatDegreeType(degreeType)}
                    </div>
                  </div>
                )}

                {status === 'student' && (
                  <div className='space-y-2 p-3 rounded-lg bg-muted/50'>
                    <div className='text-sm text-muted-foreground font-medium'>
                      College
                    </div>
                    <div className='font-semibold text-lg'>
                      {college || '—'}
                    </div>
                  </div>
                )}

                {status === 'working' && (
                  <div className='space-y-2 p-3 rounded-lg bg-muted/50'>
                    <div className='text-sm text-muted-foreground font-medium'>
                      Company
                    </div>
                    <div className='font-semibold text-lg'>
                      {company || '—'}
                    </div>
                  </div>
                )}

                {status === 'student' && (
                  <div className='space-y-2 p-3 rounded-lg bg-muted/50'>
                    <div className='text-sm text-muted-foreground font-medium'>
                      Year
                    </div>
                    <div className='font-semibold text-lg'>
                      {formatYear(year)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className='border-l-4 border-l-green-500'>
            <CardHeader>
              <CardTitle className='text-lg'>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              <Link href='/adaptive-sheet' className='w-full'>
                <Button className='w-full bg-primary hover:bg-primary/90'>
                  Open Adaptive Sheet
                </Button>
              </Link>
              <Link href='/paths' className='w-full'>
                <Button variant='secondary' className='w-full'>
                  Browse Learning Paths
                </Button>
              </Link>
              <Link href='/contests' className='w-full'>
                <Button variant='outline' className='w-full'>
                  View Contests
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Coding Profiles */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-4'>
            <CardTitle className='text-xl'>Coding Profiles</CardTitle>
            <LinksEditor
              defaultValues={{
                leetcode: lc || '',
                codechef: cc || '',
                atcoder: ac || '',
                gfg: gfg || '',
              }}
            />
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-3'>
              {cf ? (
                <a
                  href={`https://codeforces.com/profile/${encodeURIComponent(
                    cf
                  )}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 transition-colors border border-blue-500/30'
                >
                  <span className='font-semibold text-blue-600 dark:text-blue-400'>
                    Codeforces
                  </span>
                  <ExternalLink className='h-4 w-4' />
                </a>
              ) : (
                <Badge variant='outline'>Add Codeforces</Badge>
              )}

              {lc ? (
                <a
                  href={`https://leetcode.com/${encodeURIComponent(lc)}/`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 hover:from-yellow-500/30 hover:to-yellow-600/30 transition-colors border border-yellow-500/30'
                >
                  <span className='font-semibold text-yellow-600 dark:text-yellow-400'>
                    LeetCode
                  </span>
                  <ExternalLink className='h-4 w-4' />
                </a>
              ) : (
                <Badge variant='outline'>Add LeetCode</Badge>
              )}

              {cc ? (
                <a
                  href={`https://www.codechef.com/users/${encodeURIComponent(
                    cc
                  )}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 transition-colors border border-orange-500/30'
                >
                  <span className='font-semibold text-orange-600 dark:text-orange-400'>
                    CodeChef
                  </span>
                  <ExternalLink className='h-4 w-4' />
                </a>
              ) : (
                <Badge variant='outline'>Add CodeChef</Badge>
              )}

              {ac ? (
                <a
                  href={`https://atcoder.jp/users/${encodeURIComponent(ac)}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 transition-colors border border-purple-500/30'
                >
                  <span className='font-semibold text-purple-600 dark:text-purple-400'>
                    AtCoder
                  </span>
                  <ExternalLink className='h-4 w-4' />
                </a>
              ) : (
                <Badge variant='outline'>Add AtCoder</Badge>
              )}

              {gfg ? (
                <a
                  href={`https://auth.geeksforgeeks.org/user/${encodeURIComponent(
                    gfg
                  )}/`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 transition-colors border border-green-500/30'
                >
                  <span className='font-semibold text-green-600 dark:text-green-400'>
                    GeeksforGeeks
                  </span>
                  <ExternalLink className='h-4 w-4' />
                </a>
              ) : (
                <Badge variant='outline'>Add GeeksforGeeks</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
