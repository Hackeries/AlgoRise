import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export function Speedrun() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Speedrun Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Race against time to solve problems and improve your speed.
        </p>
        <Button variant="outline" className="w-full">
          Start Speedrun
        </Button>
      </CardContent>
    </Card>
  );
}
