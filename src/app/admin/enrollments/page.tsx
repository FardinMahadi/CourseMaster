import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';

import {
  extractId,
  isPopulated,
  type PopulatedUser,
  type PopulatedCourse,
  type PopulatedBatch,
} from '@/types/populated.types';

async function getEnrollments(adminId: string, courseFilter?: string, statusFilter?: string) {
  await connectDB();

  const filter: Record<string, unknown> = {};

  // Get courses owned by this admin
  const adminCourses = await Course.find({ instructor: adminId }).select('_id').lean();
  const courseIds = adminCourses.map(c => c._id.toString());

  if (courseFilter) {
    filter.course = courseFilter;
  } else {
    filter.course = { $in: courseIds };
  }

  if (statusFilter) {
    filter.status = statusFilter;
  }

  const enrollments = await Enrollment.find(filter)
    .populate('student', 'name email')
    .populate('course', 'title')
    .populate('batch', 'name')
    .sort({ enrolledAt: -1 })
    .limit(100)
    .lean();

  return enrollments.map(enrollment => {
    const student = isPopulated(enrollment.student)
      ? (enrollment.student as unknown as PopulatedUser)
      : null;
    const course = isPopulated(enrollment.course)
      ? (enrollment.course as unknown as PopulatedCourse)
      : null;
    const batch =
      enrollment.batch && isPopulated(enrollment.batch)
        ? (enrollment.batch as unknown as PopulatedBatch)
        : null;

    return {
      _id: enrollment._id.toString(),
      student: {
        _id: student ? extractId(student._id) : '',
        name: student ? String(student.name || '') : '',
        email: student ? String(student.email || '') : '',
      },
      course: {
        _id: course ? extractId(course._id) : '',
        title: course ? String(course.title || '') : '',
      },
      batch: batch
        ? {
            _id: extractId(batch._id),
            name: String(batch.name || ''),
          }
        : null,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status,
    };
  });
}

async function getAdminCourses(adminId: string) {
  await connectDB();

  const courses = await Course.find({ instructor: adminId })
    .select('_id title')
    .sort({ title: 1 })
    .lean();

  return courses.map(course => ({
    _id: course._id.toString(),
    title: course.title,
  }));
}

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; status?: string; search?: string }>;
}) {
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

  const params = await searchParams;
  const enrollments = await getEnrollments(adminId, params.course, params.status);
  const courses = await getAdminCourses(adminId);

  // Filter by search term if provided
  let filteredEnrollments = enrollments;
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredEnrollments = enrollments.filter(
      e =>
        e.student.name.toLowerCase().includes(searchLower) ||
        e.student.email.toLowerCase().includes(searchLower) ||
        e.course.title.toLowerCase().includes(searchLower)
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enrollment Management</h1>
        <p className="text-muted-foreground mt-2">View and manage all course enrollments.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by student name or email..."
          defaultValue={params.search || ''}
          className="max-w-sm"
        />
        <Select defaultValue={params.course || 'all'}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(course => (
              <SelectItem key={course._id} value={course._id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue={params.status || 'all'}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="enrolled">Enrolled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No enrollments found.</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Enrolled At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map(enrollment => (
                <TableRow key={enrollment._id}>
                  <TableCell className="font-medium">{enrollment.student.name}</TableCell>
                  <TableCell>{enrollment.student.email}</TableCell>
                  <TableCell>{enrollment.course.title}</TableCell>
                  <TableCell>{enrollment.batch?.name || '-'}</TableCell>
                  <TableCell>{new Date(enrollment.enrolledAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        enrollment.status === 'enrolled'
                          ? 'default'
                          : enrollment.status === 'completed'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {enrollment.status}
                    </Badge>
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
