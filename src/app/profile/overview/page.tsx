'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Star,
  Target,
  Rocket,
} from 'lucide-react';
import LinksEditor from '@/components/profile/links-editor';

interface ProfileData {
  name: string;
  status: 'student' | 'working' | null;
  degree_type: string;
  college_name: string;
  company_name: string;
  custom_company: string;
  year: string;
  cf_handle: string;
  cf_verified: boolean;
  leetcode_handle: string;
  codechef_handle: string;
  atcoder_handle: string;
  gfg_handle: string;
  completion: {
    percentage: number;
    completed: string[];
    missing: string[];
    isComplete: boolean;
  };
}

function ProgressBar({ value }: { value: number }) {
  const color =
    value >= 90
      ? 'bg-green-500'
      : value >= 70
      ? 'bg-blue-500'
      : value >= 50
      ? 'bg-yellow-500'
      : 'bg-orange-500';
  return (
    <div className='w-full bg-muted h-3 rounded-full overflow-hidden'>
      <div
        className={`h-3 ${color} transition-all duration-700 ease-out`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <main className='min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-10 px-6 lg:px-10'>
      <div className='max-w-7xl mx-auto space-y-12'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          <div>
            <Skeleton className='h-10 w-64 mb-2' />
            <Skeleton className='h-5 w-96' />
          </div>
          <Skeleton className='h-10 w-28' />
        </div>
        <div className='grid md:grid-cols-3 gap-6'>
          {[1, 2, 3].map((i) => (
            <Card key={i} className='border-none shadow-lg'>
              <CardHeader>
                <Skeleton className='h-6 w-40' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-12 w-24 mb-4' />
                <Skeleton className='h-3 w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ProfileOverviewPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <main className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>Failed to load profile</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </main>
    );
  }

  const displayName = profile.name || 'Your Profile';
  const status = profile.status || 'student';
  const degree = profile.degree_type || '';
  const college = profile.college_name || '';
  const company = profile.company_name || profile.custom_company || '';
  const year = profile.year || '';
  const cf = profile.cf_handle || '';
  const lc = profile.leetcode_handle || '';
  const cc = profile.codechef_handle || '';
  const ac = profile.atcoder_handle || '';
  const gfg = profile.gfg_handle || '';
  const cfVerified = profile.cf_verified || false;
  const completion = profile.completion?.percentage || 0;

  return (
    <main className='min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-10 px-6 lg:px-10'>
      <div className='max-w-7xl mx-auto space-y-12'>
        {/* Page Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          <div>
            <h1 className='text-4xl font-bold tracking-tight'>
              Profile Overview
            </h1>
            <p className='text-muted-foreground'>
              Your competitive programming progress & career overview
            </p>
          </div>
          <Link href='/profile'>
            <Button variant='default' className='gap-2'>
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className='grid md:grid-cols-3 gap-6'>
          {/* Profile Completion */}
          <Card className='border-none shadow-lg bg-gradient-to-tr from-primary/10 to-green-500/10 backdrop-blur'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Star className='h-5 w-5 text-primary' /> Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex justify-between items-center'>
                <h3 className='text-4xl font-extrabold'>{completion}%</h3>
                <Badge variant='outline' className='text-sm'>
                  {completion >= 90
                    ? 'Excellent'
                    : completion >= 70
                    ? 'Good'
                    : completion >= 50
                    ? 'Fair'
                    : 'Incomplete'}
                </Badge>
              </div>
              <div className='mt-3'>
                <ProgressBar value={completion} />
              </div>
              <p className='text-sm text-muted-foreground mt-3'>
                {completion >= 90
                  ? 'Almost perfect! Add more profiles to reach 100%.'
                  : completion >= 70
                  ? 'Solid progress! Complete academic info for full score.'
                  : completion >= 50
                  ? 'Good start! Fill out your handles to improve.'
                  : 'Add more details to unlock insights and personalized learning.'}
              </p>
            </CardContent>
          </Card>

          {/* Rating Potential */}
          <Card className='border-none shadow-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Target className='h-5 w-5 text-primary' /> Progress Potential
              </CardTitle>
            </CardHeader>
            <CardContent className='text-sm'>
              <p>
                Track your CF and LeetCode metrics to see projected rank gains
                as you solve tougher problems weekly.
              </p>
              <p className='text-sm text-muted-foreground mt-2'>
                Based on your current activity patterns and contest frequency.
              </p>
            </CardContent>
          </Card>

          {/* Growth Focus */}
          <Card className='border-none shadow-lg bg-gradient-to-br from-orange-500/10 to-yellow-500/10'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Rocket className='h-5 w-5 text-primary' /> Growth Focus
              </CardTitle>
            </CardHeader>
            <CardContent className='text-sm'>
              <p>
                Your upcoming seasonal goal: reach Specialist → Expert on
                Codeforces in 8 weeks through targeted practice sets.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Base Info */}
        <div className='grid lg:grid-cols-3 gap-6'>
          <Card className='lg:col-span-2 border-l-4 border-primary/80 shadow-md bg-card/80 backdrop-blur'>
            <CardHeader>
              <CardTitle className='text-2xl font-bold'>{displayName}</CardTitle>
              <p className='text-muted-foreground'>
                {status === 'student'
                  ? `Student${college ? ` at ${college}` : ''}`
                  : `Working${company ? ` at ${company}` : ''}`}
              </p>
            </CardHeader>
            <CardContent className='grid sm:grid-cols-2 gap-4'>
              <div className='rounded-lg p-3 bg-muted/40'>
                <p className='text-xs text-muted-foreground'>Status</p>
                <p className='font-semibold capitalize'>{status || 'Not set'}</p>
              </div>
              {status === 'student' && (
                <>
                  {degree && (
                    <div className='rounded-lg p-3 bg-muted/40'>
                      <p className='text-xs text-muted-foreground'>Degree</p>
                      <p className='font-semibold'>{degree}</p>
                    </div>
                  )}
                  {year && (
                    <div className='rounded-lg p-3 bg-muted/40'>
                      <p className='text-xs text-muted-foreground'>Year</p>
                      <p className='font-semibold'>{year}</p>
                    </div>
                  )}
                  {college && (
                    <div className='rounded-lg p-3 bg-muted/40'>
                      <p className='text-xs text-muted-foreground'>College</p>
                      <p className='font-semibold'>{college}</p>
                    </div>
                  )}
                </>
              )}
              {status === 'working' && company && (
                <div className='rounded-lg p-3 bg-muted/40'>
                  <p className='text-xs text-muted-foreground'>Organization</p>
                  <p className='font-semibold'>{company}</p>
                </div>
              )}
              <div className='rounded-lg p-3 bg-muted/40 flex items-center justify-between'>
                <div>
                  <p className='text-xs text-muted-foreground'>Codeforces</p>
                  <p className='font-semibold'>{cf || '—'}</p>
                </div>
                {cf &&
                  (cfVerified ? (
                    <Badge className='bg-green-600 hover:bg-green-600'>
                      <CheckCircle2 className='h-3 w-3 mr-1' /> Verified
                    </Badge>
                  ) : (
                    <Badge variant='destructive'>
                      <AlertCircle className='h-3 w-3 mr-1' /> Unverified
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className='shadow-md border-l-4 border-green-500 bg-card/80'>
            <CardHeader>
              <CardTitle className='text-lg font-semibold'>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              <Link href='/adaptive-sheet'>
                <Button className='w-full'>Open Adaptive Sheet</Button>
              </Link>
              <Link href='/paths'>
                <Button variant='secondary' className='w-full'>
                  Explore Learning Paths
                </Button>
              </Link>
              <Link href='/contests'>
                <Button variant='outline' className='w-full'>
                  Join Contests
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Platform Integration */}
        <Card className='shadow-md border-none bg-muted/30'>
          <CardHeader className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <CardTitle className='text-xl font-bold'>
              Connected Platforms
            </CardTitle>
            <LinksEditor
              defaultValues={{
                leetcode: lc,
                codechef: cc,
                atcoder: ac,
                gfg: gfg,
              }}
            />
          </CardHeader>
          <CardContent className='flex flex-wrap gap-3'>
            {[
              { name: 'Codeforces', link: cf, baseUrl: 'https://codeforces.com/profile/' },
              { name: 'LeetCode', link: lc, baseUrl: 'https://leetcode.com/' },
              { name: 'CodeChef', link: cc, baseUrl: 'https://www.codechef.com/users/' },
              { name: 'AtCoder', link: ac, baseUrl: 'https://atcoder.jp/users/' },
              { name: 'GeeksforGeeks', link: gfg, baseUrl: 'https://www.geeksforgeeks.org/user/' },
            ].map(({ name, link, baseUrl }) =>
              link ? (
                <a
                  key={name}
                  href={`${baseUrl}${encodeURIComponent(link)}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 px-4 py-2 border border-border bg-muted/50 rounded-md hover:bg-muted transition'
                >
                  <span className='font-semibold'>{name}</span>
                  <ExternalLink className='h-4 w-4' />
                </a>
              ) : (
                <Badge key={name} variant='outline'>
                  Add {name}
                </Badge>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
