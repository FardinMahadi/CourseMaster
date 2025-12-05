import type { Course } from '@/types/course.types';

import { notFound } from 'next/navigation';

import { Skeleton } from '@/components/ui/skeleton';
import { CourseDetails } from '@/components/course/CourseDetails';

import connectDB from '@/lib/db';
import { courseIdSchema } from '@/lib/validations/course.schema';

import Lesson from '@/models/Lesson';
import CourseModel from '@/models/Course';

async function getCourse(id: string): Promise<Course | null> {
  await connectDB();

  // Validate course ID
  if (!courseIdSchema.safeParse(id).success) {
    return null;
  }

  // Find course
  const course = await CourseModel.findById(id).populate('instructor', 'name email').lean();

  if (!course || !course.isPublished) {
    return null;
  }

  // Get lessons
  const lessons = await Lesson.find({ course: id }).sort({ order: 1 }).lean();

  const instructor =
    typeof course.instructor === 'object' &&
    course.instructor !== null &&
    'name' in course.instructor &&
    'email' in course.instructor
      ? {
          _id: (course.instructor as any)._id.toString(),
          name: (course.instructor as any).name,
          email: (course.instructor as any).email,
        }
      : course.instructor.toString();

  return {
    ...course,
    _id: course._id.toString(),
    instructor,
    lessons: lessons.map(lesson => ({
      ...lesson,
      _id: lesson._id.toString(),
    })),
  } as unknown as Course;
}

function CourseDetailsSkeleton() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Skeleton className="h-64 w-full md:h-96" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}

export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CourseDetails course={course} />
    </div>
  );
}
