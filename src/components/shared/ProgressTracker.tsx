'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressTrackerProps {
  completed: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
}

export function ProgressTracker({
  completed,
  total,
  label,
  showPercentage = true,
}: ProgressTrackerProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{label || 'Progress'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completed</span>
            <span className="font-medium">
              {completed} / {total}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
          {showPercentage && (
            <p className="text-sm text-muted-foreground text-right">{percentage}% Complete</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
