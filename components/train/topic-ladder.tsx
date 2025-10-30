import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';

const topics = [
  { name: 'Arrays & Strings', problems: 120, difficulty: 'Easy' },
  { name: 'Dynamic Programming', problems: 85, difficulty: 'Hard' },
  { name: 'Graphs', problems: 95, difficulty: 'Medium' },
  { name: 'Trees', problems: 78, difficulty: 'Medium' },
];

export function TopicLadder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Topic Ladder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topics.map((topic) => (
            <div
              key={topic.name}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-medium">{topic.name}</p>
                <p className="text-sm text-muted-foreground">{topic.problems} problems</p>
              </div>
              <Badge variant="secondary">{topic.difficulty}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
