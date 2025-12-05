'use client';

import { Progress } from '@/components/ui/progress';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // Percentage (0-100)
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, size = 'md', showLabel = true, className }: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full space-y-1', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <Progress value={clampedValue} className={cn(sizeClasses[size])} />
    </div>
  );
}
