'use client';
import type { EnrollmentWithProgress } from '@/types/student.types';

import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/student/ProgressBar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface EnrolledCourseCardProps {
  enrollment: EnrollmentWithProgress;
}

export function EnrolledCourseCard({ enrollment }: EnrolledCourseCardProps) {
  const { course, progress } = enrollment;

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          {course.thumbnail ? (
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No thumbnail</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4">
        <CardTitle className="text-lg mb-2 line-clamp-2">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2 mb-4">{course.description}</CardDescription>

        {progress && (
          <div className="mt-4">
            <ProgressBar value={progress.percentage} size="sm" />
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>{course.duration ? `${course.duration} min` : 'N/A'}</span>
          {course.level && (
            <>
              <span>•</span>
              <span className="capitalize">{course.level}</span>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/learn/${course._id}`}>Continue Learning</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
