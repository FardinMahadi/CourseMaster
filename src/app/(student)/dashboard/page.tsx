import type { EnrollmentWithProgress } from '@/types/student.types';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SendEmailForm } from '@/components/email/SendEmailForm';
import { RecentActivity } from '@/components/student/RecentActivity';
import { EnrolledCourseCard } from '@/components/student/EnrolledCourseCard';

import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';

import Lesson from '@/models/Lesson';
import Progress from '@/models/Progress';
import Enrollment from '@/models/Enrollment';
import Submission from '@/models/Submission';
import QuizAttempt from '@/models/QuizAttempt';

async function getDashboardData(userId: string) {
  await connectDB();

  // Get enrollments
  const enrollments = await Enrollment.find({
    student: userId,
    status: 'enrolled',
  })
    .populate('course', 'title description thumbnail price category duration level')
    .sort({ enrolledAt: -1 })
    .lean();

  // Get progress for each course
  const enrollmentsWithProgress: EnrollmentWithProgress[] = await Promise.all(
    enrollments.map(async enrollment => {
      const courseId = enrollment.course._id.toString();

      // Get total lessons
      const totalLessons = await Lesson.countDocuments({ course: courseId });

      // Get completed lessons
      const completedLessons = await Progress.countDocuments({
        student: userId,
        course: courseId,
        isCompleted: true,
      });

      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        _id: enrollment._id.toString(),
        student: enrollment.student.toString(),
        course: {
          _id: courseId,
          title: (enrollment.course as any).title,
          description: (enrollment.course as any).description,
          thumbnail: (enrollment.course as any).thumbnail,
          price: (enrollment.course as any).price,
          category: (enrollment.course as any).category,
          duration: (enrollment.course as any).duration,
          level: (enrollment.course as any).level,
        },
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
        progress: {
          courseId,
          completedLessons,
          totalLessons,
          percentage,
        },
      };
    })
  );

  // Get recent progress
  const recentProgress = await Progress.find({
    student: userId,
    isCompleted: true,
  })
    .sort({ completedAt: -1 })
    .limit(5)
    .lean();

  // Get recent submissions
  const recentSubmissions = await Submission.find({
    student: userId,
  })
    .sort({ submittedAt: -1 })
    .limit(5)
    .lean();

  // Get recent quiz attempts
  const recentQuizAttempts = await QuizAttempt.find({
    student: userId,
  })
    .sort({ completedAt: -1 })
    .limit(5)
    .lean();

  return {
    enrollments: enrollmentsWithProgress,
    recentProgress: recentProgress.map(p => ({
      ...p,
      _id: p._id.toString(),
      student: p.student.toString(),
      course: p.course.toString(),
      lesson: p.lesson.toString(),
    })),
    recentSubmissions: recentSubmissions.map(s => ({
      ...s,
      _id: s._id.toString(),
      assignment: s.assignment.toString(),
      student: s.student.toString(),
    })),
    recentQuizAttempts: recentQuizAttempts.map(a => ({
      ...a,
      _id: a._id.toString(),
      quiz: a.quiz.toString(),
      student: a.student.toString(),
    })),
  };
}

export default async function DashboardPage() {
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

    // Only students can access dashboard
    if (payload.role !== 'student') {
      redirect('/');
    }
  } catch {
    redirect('/login');
  }

  const { enrollments, recentProgress, recentSubmissions, recentQuizAttempts } =
    await getDashboardData(userId);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Continue your learning journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">My Courses</h2>
            {enrollments.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">
                  You haven&apos;t enrolled in any courses yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enrollments.map(enrollment => (
                  <EnrolledCourseCard key={enrollment._id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <SendEmailForm />
          <RecentActivity
            recentProgress={recentProgress as any}
            recentSubmissions={recentSubmissions as any}
            recentQuizAttempts={recentQuizAttempts as any}
          />
        </div>
      </div>
    </div>
  );
}
