import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

const contests = [
  { name: 'Codeforces Round #900', time: 'Today at 14:35 UTC', platform: 'Codeforces' },
  { name: 'AtCoder Beginner Contest', time: 'Tomorrow at 12:00 UTC', platform: 'AtCoder' },
];

export function UpcomingContests() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Upcoming Contests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contests.map((contest) => (
            <div
              key={contest.name}
              className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium">{contest.name}</p>
                <p className="text-sm text-muted-foreground">{contest.time}</p>
              </div>
              <Badge>{contest.platform}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
