import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';

interface HandleComparisonProps {
  userHandle: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const HandleComparison: React.FC<HandleComparisonProps> = ({ userHandle }) => {
  const [compareHandle, setCompareHandle] = useState('');
  const [query, setQuery] = useState<string | null>(null);

  const { data, error, isLoading } = useSWR(
    query
      ? `/api/cf/profile?handle1=${userHandle}&handle2=${compareHandle}`
      : null,
    fetcher
  );

  const handleCompare = () => {
    if (compareHandle.trim()) {
      setQuery(
        `/api/cf/profile?handle1=${userHandle}&handle2=${compareHandle}`
      );
    }
  };

  return (
    <Card className='p-4'>
      <h2 className='text-xl font-bold mb-4'>Handle Comparison</h2>
      <div className='flex items-center gap-2 mb-4'>
        <Input
          placeholder='Enter handle to compare'
          value={compareHandle}
          onChange={e => setCompareHandle(e.target.value)}
        />
        <Button onClick={handleCompare}>Compare</Button>
      </div>

      {isLoading && <p>Loading...</p>}
      {error && (
        <p className='text-red-500'>Error fetching data. Please try again.</p>
      )}

      {data && (
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <h3 className='text-lg font-semibold'>{data.user1.user.handle}</h3>
            <p>Rating: {data.user1.stats.currentRating}</p>
            <p>Max Rating: {data.user1.stats.maxRating}</p>
            <p>Total Solved: {data.user1.stats.totalSolved}</p>
          </div>
          {data.user2 && (
            <div>
              <h3 className='text-lg font-semibold'>
                {data.user2.user.handle}
              </h3>
              <p>Rating: {data.user2.stats.currentRating}</p>
              <p>Max Rating: {data.user2.stats.maxRating}</p>
              <p>Total Solved: {data.user2.stats.totalSolved}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default HandleComparison;
