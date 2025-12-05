import type { Lesson } from '@/types/course.types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LessonListProps {
  lessons: Lesson[];
}

export function LessonList({ lessons }: LessonListProps) {
  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Syllabus</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lessons.map((lesson, index) => (
            <div
              key={typeof lesson === 'object' ? lesson._id : lesson}
              className="flex items-start gap-4 rounded-lg border p-4"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">
                  {typeof lesson === 'object' ? lesson.title : 'Lesson'}
                </h4>
                {typeof lesson === 'object' && lesson.description && (
                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                )}
                {typeof lesson === 'object' && lesson.duration && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Duration: {formatDuration(lesson.duration)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
