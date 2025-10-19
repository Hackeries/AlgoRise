'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateTeamPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [memberIds, setMemberIds] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/arena/team/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName,
          memberIds: memberIds.filter(id => id.trim()),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create team');
        return;
      }

      const data = await response.json();
      router.push(`/battle-arena/queue/3v3?teamId=${data.team.id}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('[v0] Team creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='min-h-screen bg-background p-4 md:p-8'>
      <div className='max-w-2xl mx-auto'>
        <Card className='p-8'>
          <h1 className='text-3xl font-bold mb-2'>Create Team</h1>
          <p className='text-muted-foreground mb-6'>
            Form a team of 3 players for 3v3 ICPC-style battles
          </p>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <Label htmlFor='teamName'>Team Name</Label>
              <Input
                id='teamName'
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder='e.g., Code Warriors'
                required
              />
            </div>

            <div>
              <Label>Team Members (2 more players needed)</Label>
              <div className='space-y-3'>
                {memberIds.map((id, idx) => (
                  <Input
                    key={idx}
                    value={id}
                    onChange={e => {
                      const newIds = [...memberIds];
                      newIds[idx] = e.target.value;
                      setMemberIds(newIds);
                    }}
                    placeholder={`Member ${idx + 1} User ID`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className='p-4 bg-destructive/10 text-destructive rounded-lg'>
                {error}
              </div>
            )}

            <div className='flex gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={
                  loading || !teamName || memberIds.some(id => !id.trim())
                }
                className='flex-1'
              >
                {loading ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
