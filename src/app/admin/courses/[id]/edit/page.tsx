import type { Course } from '@/types/course.types';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { CourseForm } from '@/components/admin/CourseForm';

import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';

import Quiz from '@/models/Quiz';
import Lesson from '@/models/Lesson';
import CourseModel from '@/models/Course';
import Assignment from '@/models/Assignment';

async function getCourseData(courseId: string, adminId: string) {
  await connectDB();

  const course = await CourseModel.findOne({ _id: courseId, instructor: adminId }).lean();

  if (!course) {
    return null;
  }

  const [lessons, assignments, quizzes] = await Promise.all([
    Lesson.find({ course: courseId }).sort({ order: 1 }).lean(),
    Assignment.find({ course: courseId }).lean(),
    Quiz.find({ course: courseId }).lean(),
  ]);

  return {
    course: {
      ...course,
      _id: course._id.toString(),
      instructor: course.instructor.toString(),
    } as Course,
    lessons: lessons.map(lesson => ({
      _id: lesson._id.toString(),
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration,
      order: lesson.order,
      isPreview: lesson.isPreview,
    })),
    assignments: assignments.map(assignment => ({
      _id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description || '',
      instructions: assignment.instructions,
      dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString() : undefined,
      maxScore: assignment.maxScore,
    })),
    quizzes: quizzes.map(quiz => ({
      _id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description || '',
      questions: quiz.questions,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
    })),
  };
}

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/admin-login');
  }

  let adminId: string;
  try {
    const payload = verifyToken(token);
    adminId = payload.userId;

    if (payload.role !== 'admin') {
      redirect('/dashboard');
    }
  } catch {
    redirect('/admin-login');
  }

  const { id } = await params;
  const courseData = await getCourseData(id, adminId);

  if (!courseData) {
    redirect('/admin/courses');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground mt-2">Update course details and content.</p>
      </div>
      <CourseForm courseId={id} initialData={courseData} />
    </div>
  );
}
