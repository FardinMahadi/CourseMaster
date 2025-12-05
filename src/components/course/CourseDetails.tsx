import type { Course, Lesson } from '@/types/course.types';

import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { LessonList } from './LessonList';
import { EnrollButton } from './EnrollButton';
import { InstructorCard } from './InstructorCard';

interface CourseDetailsProps {
  course: Course;
}

export function CourseDetails({ course }: CourseDetailsProps) {
  const instructor = typeof course.instructor === 'object' ? course.instructor : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hours ${mins} minutes` : `${hours} hours`;
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="space-y-4">
        {course.thumbnail && (
          <div className="relative h-64 w-full overflow-hidden rounded-lg md:h-96">
            <Image alt={course.title} className="object-cover" fill src={course.thumbnail} />
          </div>
        )}
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{course.category}</Badge>
            {course.tags?.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">{course.title}</h1>
          <p className="text-lg text-muted-foreground">{course.description}</p>
        </div>
      </div>

      <Separator />

      {/* Course Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-semibold">{formatPrice(course.price)}</span>
            </div>
            {course.duration && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-semibold">{formatDuration(course.duration)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Level:</span>
              <Badge variant="outline" className="capitalize">
                {course.level || 'beginner'}
              </Badge>
            </div>
            {course.language && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language:</span>
                <span className="font-semibold">{course.language}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {instructor && <InstructorCard instructor={instructor} />}
      </div>

      {/* Enrollment CTA */}
      <div className="flex justify-center">
        <EnrollButton courseId={course._id} />
      </div>

      {/* Lessons/Syllabus */}
      {course.lessons &&
        Array.isArray(course.lessons) &&
        course.lessons.length > 0 &&
        course.lessons.every(lesson => typeof lesson === 'object') && (
          <>
            <Separator />
            <LessonList lessons={course.lessons as Lesson[]} />
          </>
        )}
    </div>
  );
}
