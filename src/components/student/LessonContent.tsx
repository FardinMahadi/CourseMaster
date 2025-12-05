'use client';

import type { Lesson } from '@/types/course.types';

import { VideoPlayer } from '@/components/student/VideoPlayer';
import { MarkCompleteButton } from '@/components/student/MarkCompleteButton';

interface LessonContentProps {
  lesson: Lesson;
  courseId: string;
  isCompleted: boolean;
  onComplete?: () => void;
}

export function LessonContent({ lesson, courseId, isCompleted, onComplete }: LessonContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-muted-foreground text-lg">{lesson.description}</p>
        )}
      </div>

      {lesson.videoUrl && (
        <div>
          <VideoPlayer videoUrl={lesson.videoUrl} title={lesson.title} />
        </div>
      )}

      <div>
        <MarkCompleteButton
          courseId={courseId}
          lessonId={lesson._id}
          isCompleted={isCompleted}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}
