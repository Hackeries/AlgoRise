import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

interface HandleData {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  ratingDelta: number;
  lastContestAt: string | null;
  nextContestAt: string | null;
  nextContestName: string | null;
}

interface ComparisonResult {
  mainHandle: HandleData;
  comparisonHandle: HandleData | null;
}

export function HandleComparisonDisplay({
  userHandle,
}: {
  userHandle: string;
}) {
  const [compareHandleInput, setCompareHandleInput] = useState('');
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/profile?handle=${userHandle}&compareHandle=${compareHandleInput}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }
      const data: ComparisonResult = await response.json();
      setComparisonData(data);
    } catch (err) {
      setError((err as Error).message);
      setComparisonData(null);
    } finally {
      setLoading(false);
    }
  };

  const renderHandleCard = (data: HandleData) => (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={'/placeholder-user.jpg'} alt={data.handle} />
            <AvatarFallback>
              {data.handle.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {data.handle}
          <Badge variant='secondary'>{data.rank}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='grid gap-2'>
        <p>Rating: {data.rating}</p>
        <p>Max Rating: {data.maxRating}</p>
        <p>
          Rating Delta:{' '}
          {data.ratingDelta > 0 ? `+${data.ratingDelta}` : data.ratingDelta}
        </p>
        <p>
          Last Contest:{' '}
          {data.lastContestAt
            ? new Date(data.lastContestAt).toLocaleDateString()
            : 'N/A'}
        </p>
        <p>Next Contest: {data.nextContestName || 'N/A'}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row gap-2'>
        <Input
          placeholder='Enter Codeforces handle to compare'
          value={compareHandleInput}
          onChange={e => setCompareHandleInput(e.target.value)}
          className='flex-1 min-w-0'
        />
        <Button
          onClick={fetchComparison}
          disabled={loading || !compareHandleInput}
        >
          {loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
          Compare
        </Button>
      </div>

      {error && <p className='text-red-500'>{error}</p>}

      {comparisonData && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {renderHandleCard(comparisonData.mainHandle)}
          {comparisonData.comparisonHandle ? (
            renderHandleCard(comparisonData.comparisonHandle)
          ) : (
            <Card className='w-full flex items-center justify-center'>
              <CardContent>
                <p className='text-muted-foreground'>
                  No comparison handle data available.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
