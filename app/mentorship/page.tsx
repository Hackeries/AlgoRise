'use client';

import { useState } from 'react';
import { MentorMatching } from '@/components/mentorship/mentor-matching';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, Users, Target, Sparkles } from 'lucide-react';

const checklist = [
  'Request a mentor by topic and share your goals',
  'Track pending and accepted mentorships in one place',
  'Unlock mentor badges once you hit 100 solved with 90% success',
];

export default function MentorshipPage() {
  const [activeTab, setActiveTab] = useState<'matching' | 'requests'>('matching');

  return (
    <main className='mx-auto max-w-6xl px-4 py-8 space-y-8'>
      <section className='bg-gradient-to-r from-primary/10 via-purple-500/5 to-primary/10 border border-primary/20 rounded-2xl p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-3'>
          <Badge variant='secondary' className='bg-white/10 text-primary uppercase tracking-wide'>Part 7 · Team & Social</Badge>
          <h1 className='text-3xl sm:text-4xl font-semibold text-primary-foreground drop-shadow-sm'>Mentorship & Peer Learning</h1>
          <p className='text-sm sm:text-base text-muted-foreground max-w-2xl'>Find mentors who are certified experts in your weak topics, form focused study groups, and stay accountable with weekly challenges.</p>
          <div className='grid gap-2 text-sm text-primary-foreground/80'>
            {checklist.map(item => (
              <div key={item} className='flex items-start gap-2'>
                <Check className='h-4 w-4 mt-0.5 text-primary' />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className='flex flex-col gap-3 text-sm text-primary-foreground/80'>
          <div className='flex items-center gap-2'>
            <Users className='h-5 w-5 text-primary' />
            <span>Peer groups for ICPC & placements</span>
          </div>
          <div className='flex items-center gap-2'>
            <Target className='h-5 w-5 text-primary' />
            <span>Group challenges like “Solve 50 problems this week”</span>
          </div>
          <div className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-primary' />
            <span>Badges unlock once mentors meet success criteria</span>
          </div>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'matching' | 'requests')}>
        <TabsList className='grid grid-cols-2 w-full sm:w-auto'>
          <TabsTrigger value='matching'>Mentor Matching</TabsTrigger>
          <TabsTrigger value='requests'>My Requests</TabsTrigger>
        </TabsList>

        <TabsContent value='matching' className='mt-6'>
          <MentorMatching />
        </TabsContent>

        <TabsContent value='requests' className='mt-6'>
          <Card>
            <CardContent className='p-6 text-sm text-muted-foreground'>
              Mentor request tracking is coming next! You’ll see outgoing and incoming mentorships here with status updates.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
