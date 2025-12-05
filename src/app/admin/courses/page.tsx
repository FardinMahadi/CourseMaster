import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';

import CourseModel from '@/models/Course';
import Enrollment from '@/models/Enrollment';

import { isPopulated, type PopulatedUser } from '@/types/populated.types';

interface CourseWithStats {
  _id: string;
  title: string;
  category: string;
  price: number;
  isPublished: boolean;
  createdAt: Date;
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  enrollmentCount: number;
  [key: string]: unknown;
}

async function getAdminCourses(adminId: string): Promise<CourseWithStats[]> {
  await connectDB();

  // Get all courses for this admin (published and unpublished)
  const courses = await CourseModel.find({ instructor: adminId })
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  // Get enrollment counts for each course
  const coursesWithStats = await Promise.all(
    courses.map(async course => {
      const courseId = course._id.toString();
      const enrollmentCount = await Enrollment.countDocuments({
        course: courseId,
        status: 'enrolled',
      });

      const instructor = isPopulated(course.instructor)
        ? (course.instructor as unknown as PopulatedUser)
        : null;

      return {
        ...course,
        _id: courseId,
        instructor: instructor
          ? {
              _id: instructor._id ? String(instructor._id) : '',
              name: instructor.name || '',
              email: instructor.email || '',
            }
          : {
              _id: String(course.instructor),
              name: '',
              email: '',
            },
        enrollmentCount,
      } as CourseWithStats;
    })
  );

  return coursesWithStats;
}

export default async function AdminCoursesPage() {
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

    // Only admins can access
    if (payload.role !== 'admin') {
      redirect('/dashboard');
    }
  } catch {
    redirect('/admin-login');
  }

  const courses = await getAdminCourses(adminId);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground mt-2">Manage your courses and content.</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">Create New Course</Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">You haven&apos;t created any courses yet.</p>
          <Button asChild>
            <Link href="/admin/courses/new">Create Your First Course</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map(course => (
                <TableRow key={course._id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>
                    <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>${course.price}</TableCell>
                  <TableCell>{course.enrollmentCount || 0}</TableCell>
                  <TableCell>{new Date(course.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/courses/${course._id}/edit`}>Edit</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/courses/${course._id}`}>View</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
