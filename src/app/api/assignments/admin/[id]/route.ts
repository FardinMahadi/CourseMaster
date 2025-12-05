import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';
import { handleApiError } from '@/lib/api-error-handler';
import { assignmentIdSchema, gradeAssignmentSchema } from '@/lib/validations/assignment.schema';

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

// GET /api/assignments/admin/[id] - Get submission details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!assignmentIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid submission ID' }, { status: 400 });
    }

    const user = requireAdmin(request);
    const userId = user.userId;

    const submission = await Submission.findById(id)
      .populate('assignment', 'title description instructions maxScore')
      .populate('student', 'name email')
      .populate({
        path: 'assignment',
        populate: {
          path: 'course',
          select: 'title',
        },
      })
      .lean();

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Verify admin owns the course
    const assignment = await Assignment.findById(submission.assignment);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const course = await Course.findById(assignment.course);
    if (!course || course.instructor.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const populatedAssignment = isPopulated(submission.assignment)
      ? (submission.assignment as unknown as PopulatedAssignment)
      : null;
    const populatedStudent = isPopulated(submission.student)
      ? (submission.student as unknown as PopulatedUser)
      : null;
    const populatedCourse =
      populatedAssignment && populatedAssignment.course && isPopulated(populatedAssignment.course)
        ? (populatedAssignment.course as unknown as PopulatedCourse)
        : null;

    return NextResponse.json(
      {
        data: {
          _id: submission._id.toString(),
          assignment: {
            _id: populatedAssignment ? extractId(populatedAssignment._id) : '',
            title: populatedAssignment ? String(populatedAssignment.title || '') : '',
            description: populatedAssignment ? String(populatedAssignment.description || '') : '',
            instructions: populatedAssignment ? String(populatedAssignment.instructions || '') : '',
            maxScore: populatedAssignment ? Number(populatedAssignment.maxScore || 100) : 100,
            course: populatedCourse
              ? {
                  _id: extractId(populatedCourse._id),
                  title: String(populatedCourse.title || ''),
                }
              : null,
          },
          student: {
            _id: populatedStudent ? extractId(populatedStudent._id) : '',
            name: populatedStudent ? String(populatedStudent.name || '') : '',
            email: populatedStudent ? String(populatedStudent.email || '') : '',
          },
          submissionText: submission.submissionText,
          submissionUrl: submission.submissionUrl,
          submittedAt: submission.submittedAt,
          gradedAt: submission.gradedAt,
          score: submission.score,
          feedback: submission.feedback,
          status: submission.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'get submission details');
  }
}

// PUT /api/assignments/admin/[id] - Grade submission (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!assignmentIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid submission ID' }, { status: 400 });
    }

    const user = requireAdmin(request);
    const userId = user.userId;

    const submission = await Submission.findById(id).populate('assignment');
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Verify admin owns the course
    const assignment = await Assignment.findById(submission.assignment);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const course = await Course.findById(assignment.course);
    if (!course || course.instructor.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = gradeAssignmentSchema.parse(body);

    // Validate score doesn't exceed max score
    if (validatedData.score > assignment.maxScore) {
      return NextResponse.json(
        { error: `Score cannot exceed maximum score of ${assignment.maxScore}` },
        { status: 400 }
      );
    }

    // Update submission
    submission.score = validatedData.score;
    submission.feedback = validatedData.feedback;
    submission.status = validatedData.status;
    submission.gradedAt = new Date();
    await submission.save();

    await submission.populate('assignment', 'title maxScore');
    await submission.populate('student', 'name email');

    return NextResponse.json(
      {
        message: 'Submission graded successfully',
        data: submission,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'grade submission');
  }
}
