'use client';

import type { Lesson } from '@/types/course.types';

import { CheckCircle2, Lock, PlayCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import { cn } from '@/lib/utils';

interface LessonSidebarProps {
  lessons: Lesson[];
  currentLessonId?: string;
  completedLessonIds: Set<string>;
  onLessonClick: (lessonId: string) => void;
}

export function LessonSidebar({
  lessons,
  currentLessonId,
  completedLessonIds,
  onLessonClick,
}: LessonSidebarProps) {
  return (
    <div className="w-full md:w-80 border-r bg-muted/50">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Lessons</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="p-2 space-y-1">
          {lessons.map((lesson, index) => {
            const isCompleted = completedLessonIds.has(lesson._id);
            const isCurrent = currentLessonId === lesson._id;
            const isLocked = index > 0 && !completedLessonIds.has(lessons[index - 1]?._id);

            return (
              <Button
                key={lesson._id}
                variant={isCurrent ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start text-left h-auto py-3 px-4',
                  isCurrent && 'bg-secondary font-medium',
                  isLocked && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !isLocked && onLessonClick(lesson._id)}
                disabled={isLocked}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-0.5">
                    {isLocked ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <PlayCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                      <p
                        className={cn(
                          'text-sm font-medium line-clamp-2',
                          isCurrent && 'text-primary'
                        )}
                      >
                        {lesson.title}
                      </p>
                    </div>
                    {lesson.duration && (
                      <p className="text-xs text-muted-foreground mt-1">{lesson.duration} min</p>
                    )}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
