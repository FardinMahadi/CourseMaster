import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { NextResponse } from 'next/server';

import connectDB from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error-handler';

import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';

import {
  extractId,
  isPopulated,
  type PopulatedUser,
  type PopulatedCourse,
  type PopulatedBatch,
} from '@/types/populated.types';

const enrollmentQuerySchema = z.object({
  course: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  batch: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  status: z.enum(['enrolled', 'completed', 'dropped']).optional(),
  student: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
});

// GET /api/enrollments/admin - List all enrollments (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = requireAdmin(request);
    const userId = user.userId;

    const { searchParams } = new URL(request.url);
    const queryParams = {
      course: searchParams.get('course') || undefined,
      batch: searchParams.get('batch') || undefined,
      status: searchParams.get('status') || undefined,
      student: searchParams.get('student') || undefined,
    };

    const validatedQuery = enrollmentQuerySchema.parse(queryParams);

    const filter: Record<string, unknown> = {};

    // Only show enrollments for courses owned by this admin
    const adminCourses = await Course.find({ instructor: userId }).select('_id').lean();
    const courseIds = adminCourses.map(c => c._id.toString());

    if (validatedQuery.course) {
      // Verify admin owns this course
      if (!courseIds.includes(validatedQuery.course)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      filter.course = validatedQuery.course;
    } else {
      filter.course = { $in: courseIds };
    }

    if (validatedQuery.batch) {
      filter.batch = validatedQuery.batch;
    }

    if (validatedQuery.status) {
      filter.status = validatedQuery.status;
    }

    if (validatedQuery.student) {
      filter.student = validatedQuery.student;
    }

    const enrollments = await Enrollment.find(filter)
      .populate('student', 'name email')
      .populate('course', 'title')
      .populate('batch', 'name')
      .sort({ enrolledAt: -1 })
      .lean();

    return NextResponse.json(
      {
        data: {
          enrollments: enrollments.map(enrollment => {
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
          }),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'list enrollments');
  }
}
