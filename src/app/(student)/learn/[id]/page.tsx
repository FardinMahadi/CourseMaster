import type { Lesson as LessonType } from '@/types/course.types';
import type {
  AssignmentWithSubmission,
  CourseWithProgress,
  Quiz as QuizType,
} from '@/types/student.types';

import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { CoursePlayerClient } from '@/components/student/CoursePlayerClient';

import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { courseIdSchema } from '@/lib/validations/course.schema';

import Quiz from '@/models/Quiz';
import Course from '@/models/Course';
import Lesson from '@/models/Lesson';
import Progress from '@/models/Progress';
import Enrollment from '@/models/Enrollment';
import Assignment from '@/models/Assignment';
import Submission from '@/models/Submission';

async function getCourseData(courseId: string, userId: string) {
  await connectDB();

  // Validate course ID
  if (!courseIdSchema.safeParse(courseId).success) {
    return null;
  }

  // Verify enrollment
  const enrollment = await Enrollment.findOne({
    student: userId,
    course: courseId,
    status: 'enrolled',
  });

  if (!enrollment) {
    return null;
  }

  // Get course
  const course = await Course.findById(courseId).populate('instructor', 'name email').lean();

  if (!course) {
    return null;
  }

  // Get lessons
  const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 }).lean();

  // Get progress for all lessons
  const progressRecords = await Progress.find({
    student: userId,
    course: courseId,
  }).lean();

  // Create Set for calculation, then convert to Array for serialization
  const completedLessonIdsSet = new Set(
    progressRecords.filter(p => p.isCompleted).map(p => p.lesson.toString())
  );
  const completedLessonIdsArray = Array.from(completedLessonIdsSet);

  // Get assignments
  const assignments = await Assignment.find({ course: courseId }).sort({ createdAt: -1 }).lean();

  // Get submissions for assignments
  const assignmentIds = assignments.map(a => a._id);
  const submissions = await Submission.find({
    student: userId,
    assignment: { $in: assignmentIds },
  }).lean();

  // Serialize assignments to plain objects
  const assignmentsWithSubmissions = assignments.map(assignment => {
    const submission = submissions.find(s => s.assignment.toString() === assignment._id.toString());

    return {
      _id: assignment._id.toString(),
      course: assignment.course.toString(),
      lesson: assignment.lesson ? assignment.lesson.toString() : undefined,
      title: assignment.title || '',
      description: assignment.description || '',
      instructions: assignment.instructions || '',
      dueDate: assignment.dueDate ? new Date(assignment.dueDate) : undefined,
      maxScore: assignment.maxScore || 0,
      createdAt: assignment.createdAt ? new Date(assignment.createdAt) : new Date(),
      updatedAt: assignment.updatedAt ? new Date(assignment.updatedAt) : new Date(),
      submission: submission
        ? {
            _id: submission._id.toString(),
            assignment: submission.assignment.toString(),
            student: submission.student.toString(),
            submissionText: submission.submissionText || undefined,
            submissionUrl: submission.submissionUrl || undefined,
            submittedAt: submission.submittedAt ? new Date(submission.submittedAt) : new Date(),
            gradedAt: submission.gradedAt ? new Date(submission.gradedAt) : undefined,
            score: submission.score || undefined,
            feedback: submission.feedback || undefined,
            status: submission.status || 'submitted',
            createdAt: submission.createdAt ? new Date(submission.createdAt) : new Date(),
            updatedAt: submission.updatedAt ? new Date(submission.updatedAt) : new Date(),
          }
        : undefined,
    };
  });

  // Get quizzes
  const quizzes = await Quiz.find({ course: courseId }).sort({ createdAt: -1 }).lean();

  // Calculate course progress
  const totalLessons = lessons.length;
  const completedLessons = completedLessonIdsSet.size;
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Serialize lessons to plain objects - explicitly extract only needed properties
  const serializedLessons = lessons.map(l => ({
    _id: l._id.toString(),
    title: l.title || '',
    description: l.description || undefined,
    videoUrl: l.videoUrl || undefined,
    duration: l.duration || 0,
    order: l.order || 0,
    isPreview: l.isPreview || false,
    createdAt: l.createdAt ? new Date(l.createdAt) : new Date(),
    updatedAt: l.updatedAt ? new Date(l.updatedAt) : new Date(),
  }));

  // Serialize instructor
  const instructor =
    typeof course.instructor === 'object' && course.instructor !== null
      ? {
          _id: (course.instructor as any)._id.toString(),
          name: (course.instructor as any).name,
          email: (course.instructor as any).email,
        }
      : {
          _id: (course.instructor as any).toString(),
          name: '',
          email: '',
        };

  // Serialize course to plain object - explicitly construct to avoid Mongoose document methods
  const serializedCourse: CourseWithProgress = {
    _id: course._id.toString(),
    title: course.title || '',
    description: course.description || '',
    thumbnail: course.thumbnail || undefined,
    price: course.price || 0,
    category: course.category || '',
    tags: Array.isArray(course.tags) ? course.tags : [],
    instructor,
    lessons: serializedLessons,
    duration: course.duration || undefined,
    level: course.level || undefined,
    language: course.language || undefined,
    progress: {
      courseId,
      completedLessons,
      totalLessons,
      percentage,
    },
    createdAt: course.createdAt ? new Date(course.createdAt) : new Date(),
    updatedAt: course.updatedAt ? new Date(course.updatedAt) : new Date(),
  };

  // Serialize quizzes to plain objects
  const serializedQuizzes = quizzes.map(q => ({
    _id: q._id.toString(),
    course: q.course.toString(),
    lesson: q.lesson?.toString(),
    title: q.title || '',
    description: q.description || '',
    questions: Array.isArray(q.questions)
      ? q.questions.map((question: any) => ({
          question: question.question || '',
          options: Array.isArray(question.options) ? question.options : [],
          correctAnswer: question.correctAnswer ?? 0,
          points: question.points || 0,
        }))
      : [],
    timeLimit: q.timeLimit || undefined,
    passingScore: q.passingScore || 0,
    createdAt: q.createdAt ? new Date(q.createdAt) : new Date(),
    updatedAt: q.updatedAt ? new Date(q.updatedAt) : new Date(),
  }));

  return {
    course: serializedCourse,
    lessons: serializedLessons as LessonType[],
    completedLessonIds: completedLessonIdsArray, // Pass as array for serialization
    assignmentsWithSubmissions,
    quizzes: serializedQuizzes,
  };
}

export default async function CoursePlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lesson?: string }>;
}) {
  // Get token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  let userId: string;
  try {
    const payload = verifyToken(token);
    userId = payload.userId;

    // Only students can access course player
    if (payload.role !== 'student') {
      redirect('/');
    }
  } catch {
    redirect('/login');
  }

  const { id } = await params;
  const { lesson: lessonId } = await searchParams;

  const data = await getCourseData(id, userId);

  if (!data) {
    notFound();
  }

  const { course, lessons, completedLessonIds, assignmentsWithSubmissions, quizzes } = data;

  // Determine current lesson
  const currentLessonId =
    lessonId && lessons.find(l => l._id === lessonId) ? lessonId : lessons[0]?._id || '';

  return (
    <CoursePlayerClient
      course={course as CourseWithProgress}
      lessons={lessons}
      completedLessonIds={completedLessonIds}
      assignmentsWithSubmissions={assignmentsWithSubmissions as AssignmentWithSubmission[]}
      quizzes={quizzes as QuizType[]}
      currentLessonId={currentLessonId}
      courseId={id}
    />
  );
}
