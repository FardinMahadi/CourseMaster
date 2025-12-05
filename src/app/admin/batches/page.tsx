import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

import Batch from '@/models/Batch';
import Course from '@/models/Course';

import {
  extractId,
  isPopulated,
  type PopulatedCourse,
  type PopulatedUser,
} from '@/types/populated.types';

async function getBatches(adminId: string, courseFilter?: string, statusFilter?: string) {
  await connectDB();

  const filter: Record<string, unknown> = {};

  // Get courses owned by this admin
  const adminCourses = await Course.find({ instructor: adminId }).select('_id').lean();
  const courseIds = adminCourses.map(c => c._id.toString());

  filter.course = { $in: courseIds };

  if (courseFilter) {
    filter.course = courseFilter;
  }

  if (statusFilter) {
    filter.status = statusFilter;
  }

  const batches = await Batch.find(filter)
    .populate('course', 'title')
    .populate('instructor', 'name email')
    .sort({ startDate: -1 })
    .lean();

  return batches.map(batch => {
    const course = isPopulated(batch.course) ? (batch.course as unknown as PopulatedCourse) : null;
    const instructor = isPopulated(batch.instructor)
      ? (batch.instructor as unknown as PopulatedUser)
      : null;

    return {
      _id: batch._id.toString(),
      name: batch.name,
      course: {
        _id: course ? extractId(course._id) : '',
        title: course ? String(course.title || '') : '',
      },
      instructor: {
        _id: instructor ? extractId(instructor._id) : '',
        name: instructor ? String(instructor.name || '') : '',
      },
      startDate: batch.startDate,
      endDate: batch.endDate,
      status: batch.status,
      maxStudents: batch.maxStudents,
      currentStudents: batch.currentStudents,
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

export default async function AdminBatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; status?: string }>;
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
  const batches = await getBatches(adminId, params.course, params.status);
  const courses = await getAdminCourses(adminId);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Batch Management</h1>
          <p className="text-muted-foreground mt-2">Manage course batches and schedules.</p>
        </div>
        <Button asChild>
          <Link href="/admin/batches/new">Create New Batch</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select defaultValue={params.course || 'all'}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <Link href="/admin/batches">All Courses</Link>
            </SelectItem>
            {courses.map(course => (
              <SelectItem key={course._id} value={course._id}>
                <Link href={`/admin/batches?course=${course._id}`}>{course.title}</Link>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue={params.status || 'all'}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <Link href="/admin/batches">All Statuses</Link>
            </SelectItem>
            <SelectItem value="upcoming">
              <Link href="/admin/batches?status=upcoming">Upcoming</Link>
            </SelectItem>
            <SelectItem value="ongoing">
              <Link href="/admin/batches?status=ongoing">Ongoing</Link>
            </SelectItem>
            <SelectItem value="completed">
              <Link href="/admin/batches?status=completed">Completed</Link>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">No batches found.</p>
          <Button asChild>
            <Link href="/admin/batches/new">Create Your First Batch</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map(batch => (
                <TableRow key={batch._id}>
                  <TableCell className="font-medium">{batch.name}</TableCell>
                  <TableCell>{batch.course.title}</TableCell>
                  <TableCell>{new Date(batch.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(batch.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        batch.status === 'ongoing'
                          ? 'default'
                          : batch.status === 'completed'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {batch.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {batch.currentStudents} / {batch.maxStudents}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/batches/${batch._id}/edit`}>Edit</Link>
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
