import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComplexityInfoProps {
  timeComplexity: string;
  spaceComplexity: string;
  description: string;
  stable?: boolean;
}

export function ComplexityInfo({
  timeComplexity,
  spaceComplexity,
  description,
  stable,
}: ComplexityInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Algorithm Info</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div>
          <p className='text-xs font-semibold text-muted-foreground'>
            Time Complexity
          </p>
          <p className='text-lg font-mono font-bold'>{timeComplexity}</p>
        </div>

        <div>
          <p className='text-xs font-semibold text-muted-foreground'>
            Space Complexity
          </p>
          <p className='text-lg font-mono font-bold'>{spaceComplexity}</p>
        </div>

        {stable !== undefined && (
          <div>
            <p className='text-xs font-semibold text-muted-foreground'>
              Stable
            </p>
            <Badge variant={stable ? 'default' : 'secondary'}>
              {stable ? 'Yes' : 'No'}
            </Badge>
          </div>
        )}

        <div>
          <p className='text-xs font-semibold text-muted-foreground mb-1'>
            Description
          </p>
          <p className='text-sm leading-relaxed'>{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
