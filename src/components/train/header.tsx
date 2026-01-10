import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export function TrainHeader() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Training Hub
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Practice with curated problem sets, daily challenges, and competitive programming resources.
        </p>
      </CardContent>
    </Card>
  );
}
