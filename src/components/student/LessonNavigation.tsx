'use client';

import type { Lesson } from '@/types/course.types';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface LessonNavigationProps {
  lessons: Lesson[];
  currentLessonIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function LessonNavigation({
  lessons,
  currentLessonIndex,
  onPrevious,
  onNext,
}: LessonNavigationProps) {
  const isFirst = currentLessonIndex === 0;
  const isLast = currentLessonIndex === lessons.length - 1;
  const currentLesson = lessons[currentLessonIndex];
  const previousLesson = lessons[currentLessonIndex - 1];
  const nextLesson = lessons[currentLessonIndex + 1];

  return (
    <div className="flex items-center justify-between border-t pt-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirst}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        {previousLesson ? (
          <div className="text-left">
            <div className="text-xs text-muted-foreground">Previous</div>
            <div className="text-sm font-medium line-clamp-1">{previousLesson.title}</div>
          </div>
        ) : (
          <span>Previous</span>
        )}
      </Button>

      <div className="text-sm text-muted-foreground">
        Lesson {currentLessonIndex + 1} of {lessons.length}
      </div>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={isLast}
        className="flex items-center gap-2"
      >
        {nextLesson ? (
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Next</div>
            <div className="text-sm font-medium line-clamp-1">{nextLesson.title}</div>
          </div>
        ) : (
          <span>Next</span>
        )}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
