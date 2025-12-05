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

import Course from '@/models/Course';
import Submission from '@/models/Submission';
import Assignment from '@/models/Assignment';

import {
  extractId,
  isPopulated,
  type PopulatedUser,
  type PopulatedAssignment,
  type PopulatedCourse,
} from '@/types/populated.types';

async function getSubmissions(adminId: string, courseFilter?: string, statusFilter?: string) {
  await connectDB();

  // Get courses owned by this admin
  const adminCourses = await Course.find({ instructor: adminId }).select('_id').lean();
  const courseIds = adminCourses.map(c => c._id.toString());

  // Get assignments for these courses
  const filter: Record<string, unknown> = { course: { $in: courseIds } };
  if (courseFilter) {
    filter.course = courseFilter;
  }

  const assignments = await Assignment.find(filter).select('_id').lean();
  const assignmentIds = assignments.map(a => a._id.toString());

  const submissionFilter: Record<string, unknown> = { assignment: { $in: assignmentIds } };

  if (statusFilter) {
    submissionFilter.status = statusFilter;
  }

  const submissions = await Submission.find(submissionFilter)
    .populate('assignment', 'title maxScore')
    .populate('student', 'name email')
    .populate({
      path: 'assignment',
      populate: {
        path: 'course',
        select: 'title',
      },
    })
    .sort({ submittedAt: -1 })
    .limit(100)
    .lean();

  return submissions.map(submission => {
    const assignment = isPopulated(submission.assignment)
      ? (submission.assignment as unknown as PopulatedAssignment)
      : null;
    const student = isPopulated(submission.student)
      ? (submission.student as unknown as PopulatedUser)
      : null;
    const course =
      assignment && assignment.course && isPopulated(assignment.course)
        ? (assignment.course as unknown as PopulatedCourse)
        : null;

    return {
      _id: submission._id.toString(),
      assignment: {
        _id: assignment ? extractId(assignment._id) : '',
        title: assignment ? String(assignment.title || '') : '',
        maxScore: assignment ? Number(assignment.maxScore || 100) : 100,
        course: course
          ? {
              _id: extractId(course._id),
              title: String(course.title || ''),
            }
          : null,
      },
      student: {
        _id: student ? extractId(student._id) : '',
        name: student ? String(student.name || '') : '',
        email: student ? String(student.email || '') : '',
      },
      submittedAt: submission.submittedAt,
      score: submission.score,
      status: submission.status,
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

export default async function AdminAssignmentsPage({
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
  const submissions = await getSubmissions(adminId, params.course, params.status);
  const courses = await getAdminCourses(adminId);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assignment Review</h1>
        <p className="text-muted-foreground mt-2">
          Review and grade student assignment submissions.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
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
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No submissions found.</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map(submission => (
                <TableRow key={submission._id}>
                  <TableCell className="font-medium">{submission.student.name}</TableCell>
                  <TableCell>{submission.assignment.title}</TableCell>
                  <TableCell>{submission.assignment.course?.title || '-'}</TableCell>
                  <TableCell>{new Date(submission.submittedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {submission.score !== undefined
                      ? `${submission.score} / ${submission.assignment.maxScore}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        submission.status === 'graded'
                          ? 'default'
                          : submission.status === 'returned'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/assignments/${submission._id}`}>Review</Link>
                    </Button>
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
