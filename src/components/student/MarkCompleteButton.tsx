'use client';

import { toast } from 'sonner';
import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { updateProgress } from '@/lib/api/progress';

interface MarkCompleteButtonProps {
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
  onComplete?: () => void;
}

export function MarkCompleteButton({
  courseId,
  lessonId,
  isCompleted,
  onComplete,
}: MarkCompleteButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleMarkComplete = async () => {
    if (isCompleted) {
      return;
    }

    setLoading(true);

    try {
      await updateProgress(courseId, lessonId, {
        isCompleted: true,
        timeSpent: 0,
      });

      toast.success('Lesson marked as complete!');
      onComplete?.();
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
      toast.error('Failed to mark lesson as complete. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <Button disabled variant="outline" className="w-full">
        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
        Completed
      </Button>
    );
  }

  return (
    <Button onClick={handleMarkComplete} disabled={loading} className="w-full">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Marking as complete...
        </>
      ) : (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Mark as Complete
        </>
      )}
    </Button>
  );
}
