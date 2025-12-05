import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { NextResponse } from 'next/server';

import connectDB from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error-handler';

import Course from '@/models/Course';
import Submission from '@/models/Submission';
import Assignment from '@/models/Assignment';

import {
  extractId,
  isPopulated,
  type PopulatedAssignment,
  type PopulatedCourse,
  type PopulatedUser,
} from '@/types/populated.types';

const submissionQuerySchema = z.object({
  course: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  assignment: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  student: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  status: z.enum(['submitted', 'graded', 'returned']).optional(),
});

// GET /api/assignments/admin - List all submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = requireAdmin(request);
    const userId = user.userId;

    const { searchParams } = new URL(request.url);
    const queryParams = {
      course: searchParams.get('course') || undefined,
      assignment: searchParams.get('assignment') || undefined,
      student: searchParams.get('student') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const validatedQuery = submissionQuerySchema.parse(queryParams);

    const filter: Record<string, unknown> = {};

    // Only show submissions for assignments in courses owned by this admin
    const adminCourses = await Course.find({ instructor: userId }).select('_id').lean();
    const courseIds = adminCourses.map(c => c._id.toString());

    const adminAssignments = await Assignment.find({ course: { $in: courseIds } })
      .select('_id')
      .lean();
    const assignmentIds = adminAssignments.map(a => a._id.toString());

    filter.assignment = { $in: assignmentIds };

    if (validatedQuery.course) {
      // Verify admin owns this course
      if (!courseIds.includes(validatedQuery.course)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const courseAssignments = await Assignment.find({ course: validatedQuery.course })
        .select('_id')
        .lean();
      const courseAssignmentIds = courseAssignments.map(a => a._id.toString());
      filter.assignment = { $in: courseAssignmentIds };
    }

    if (validatedQuery.assignment) {
      // Verify assignment belongs to admin's course
      if (!assignmentIds.includes(validatedQuery.assignment)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      filter.assignment = validatedQuery.assignment;
    }

    if (validatedQuery.student) {
      filter.student = validatedQuery.student;
    }

    if (validatedQuery.status) {
      filter.status = validatedQuery.status;
    }

    const submissions = await Submission.find(filter)
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
      .lean();

    return NextResponse.json(
      {
        data: {
          submissions: submissions.map(submission => {
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
              submissionText: submission.submissionText,
              submissionUrl: submission.submissionUrl,
              submittedAt: submission.submittedAt,
              gradedAt: submission.gradedAt,
              score: submission.score,
              feedback: submission.feedback,
              status: submission.status,
            };
          }),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'list submissions');
  }
}
