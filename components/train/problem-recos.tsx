import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export function ProblemRecos() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Recommended Problems
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          AI-powered problem recommendations based on your skill level and practice history.
        </p>
        <Button variant="outline" className="w-full">
          Get Recommendations
        </Button>
      </CardContent>
    </Card>
  );
}
