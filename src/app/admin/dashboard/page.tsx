import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';

import User from '@/models/User';
import Quiz from '@/models/Quiz';
import Course from '@/models/Course';
import Lesson from '@/models/Lesson';
import Enrollment from '@/models/Enrollment';
import Assignment from '@/models/Assignment';

import { isPopulated, type PopulatedUser, type PopulatedCourse } from '@/types/populated.types';

async function getAdminDashboardData(adminId: string) {
  await connectDB();

  // Get all statistics
  const [
    totalCourses,
    publishedCourses,
    totalStudents,
    totalEnrollments,
    activeEnrollments,
    totalLessons,
    totalAssignments,
    totalQuizzes,
    recentCourses,
    recentEnrollments,
  ] = await Promise.all([
    Course.countDocuments({ instructor: adminId }),
    Course.countDocuments({ instructor: adminId, isPublished: true }),
    User.countDocuments({ role: 'student' }),
    Enrollment.countDocuments(),
    Enrollment.countDocuments({ status: 'enrolled' }),
    Lesson.countDocuments(),
    Assignment.countDocuments(),
    Quiz.countDocuments(),
    Course.find({ instructor: adminId }).sort({ createdAt: -1 }).limit(5).lean(),
    Enrollment.find()
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ enrolledAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    stats: {
      totalCourses,
      publishedCourses,
      totalStudents,
      totalEnrollments,
      activeEnrollments,
      totalLessons,
      totalAssignments,
      totalQuizzes,
    },
    recentCourses: recentCourses.map(course => ({
      _id: course._id.toString(),
      title: course.title,
      isPublished: course.isPublished,
      createdAt: course.createdAt,
    })),
    recentEnrollments: recentEnrollments.map(enrollment => {
      const student = isPopulated(enrollment.student)
        ? (enrollment.student as unknown as PopulatedUser)
        : null;
      const course = isPopulated(enrollment.course)
        ? (enrollment.course as unknown as PopulatedCourse)
        : null;

      return {
        _id: enrollment._id.toString(),
        student: {
          _id: student?._id ? String(student._id) : '',
          name: student?.name || '',
          email: student?.email || '',
        },
        course: {
          _id: course?._id ? String(course._id) : '',
          title: course?.title || '',
        },
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
      };
    }),
  };
}

export default async function AdminDashboardPage() {
  // Get token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/admin-login');
  }

  let adminId: string;
  try {
    const payload = verifyToken(token);
    adminId = payload.userId;

    // Only admins can access admin dashboard
    if (payload.role !== 'admin') {
      redirect('/dashboard');
    }
  } catch {
    redirect('/admin-login');
  }

  const { stats, recentCourses, recentEnrollments } = await getAdminDashboardData(adminId);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage courses, enrollments, and platform data.
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Courses</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalCourses}</p>
          <p className="text-sm text-muted-foreground mt-1">{stats.publishedCourses} published</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Students</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Enrollments</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalEnrollments}</p>
          <p className="text-sm text-muted-foreground mt-1">{stats.activeEnrollments} active</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Content</h3>
          <p className="text-lg font-semibold mt-2">
            {stats.totalLessons} lessons, {stats.totalAssignments} assignments, {stats.totalQuizzes}{' '}
            quizzes
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
          {recentCourses.length === 0 ? (
            <p className="text-muted-foreground">No courses yet.</p>
          ) : (
            <div className="space-y-3">
              {recentCourses.map(course => (
                <div
                  key={course._id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.isPublished ? 'Published' : 'Draft'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Enrollments</h2>
          {recentEnrollments.length === 0 ? (
            <p className="text-muted-foreground">No enrollments yet.</p>
          ) : (
            <div className="space-y-3">
              {recentEnrollments.map(enrollment => (
                <div
                  key={enrollment._id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <p className="font-medium">{enrollment.student.name}</p>
                    <p className="text-sm text-muted-foreground">{enrollment.course.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{enrollment.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
