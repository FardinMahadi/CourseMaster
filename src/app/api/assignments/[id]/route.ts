import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { assignmentIdSchema } from '@/lib/validations/assignment.schema';

import Assignment from '@/models/Assignment';
import Enrollment from '@/models/Enrollment';
import Submission from '@/models/Submission';

// GET /api/assignments/[id] - Get assignment details with submission status (student only)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    // Get student user ID from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only students can view assignments
    if (userRole !== 'student') {
      return NextResponse.json({ error: 'Only students can view assignments' }, { status: 403 });
    }

    const { id } = await params;

    // Validate assignment ID
    if (!assignmentIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
    }

    // Find the assignment
    const assignment = await Assignment.findById(id)
      .populate('course', 'title')
      .populate('lesson', 'title')
      .lean();

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Verify student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: assignment.course,
      status: 'enrolled',
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You must be enrolled in this course to view assignments' },
        { status: 403 }
      );
    }

    // Find submission if exists
    const submission = await Submission.findOne({
      student: userId,
      assignment: id,
    }).lean();

    return NextResponse.json(
      {
        data: {
          assignment,
          submission: submission || undefined,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during assignment fetch:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle other errors
    console.error('Assignment fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
