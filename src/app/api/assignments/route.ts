import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { handleAuthError, requireStudent } from '@/lib/auth-helpers';
import { assignmentQuerySchema, submitAssignmentSchema } from '@/lib/validations/assignment.schema';

import Assignment from '@/models/Assignment';
import Enrollment from '@/models/Enrollment';
import Submission from '@/models/Submission';

// GET /api/assignments - Get assignments for enrolled courses (student only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Require authentication and student role
    const user = requireStudent(request);
    const userId = user.userId;

    const { searchParams } = new URL(request.url);
    const queryParams = {
      courseId: searchParams.get('courseId') || undefined,
      lessonId: searchParams.get('lessonId') || undefined,
    };

    const validatedQuery = assignmentQuerySchema.parse(queryParams);

    // Build filter for assignments
    const assignmentFilter: Record<string, unknown> = {};

    if (validatedQuery.courseId) {
      // Verify student is enrolled in the course
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: validatedQuery.courseId,
        status: 'enrolled',
      });

      if (!enrollment) {
        return NextResponse.json(
          { error: 'You must be enrolled in this course to view assignments' },
          { status: 403 }
        );
      }

      assignmentFilter.course = validatedQuery.courseId;
    } else {
      // Get all enrolled courses
      const enrollments = await Enrollment.find({
        student: userId,
        status: 'enrolled',
      }).select('course');

      const courseIds = enrollments.map(e => e.course);
      assignmentFilter.course = { $in: courseIds };
    }

    if (validatedQuery.lessonId) {
      assignmentFilter.lesson = validatedQuery.lessonId;
    }

    // Fetch assignments
    const assignments = await Assignment.find(assignmentFilter)
      .populate('course', 'title')
      .populate('lesson', 'title')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch submissions for these assignments
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({
      student: userId,
      assignment: { $in: assignmentIds },
    }).lean();

    // Map submissions to assignments
    const assignmentsWithSubmissions = assignments.map(assignment => {
      const submission = submissions.find(
        s => s.assignment.toString() === assignment._id.toString()
      );

      return {
        ...assignment,
        submission: submission || undefined,
      };
    });

    return NextResponse.json(
      {
        data: {
          assignments: assignmentsWithSubmissions,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error },
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during assignment fetch:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle authentication errors
    return handleAuthError(error);
  }
}

// POST /api/assignments - Submit an assignment (student only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Require authentication and student role
    const user = requireStudent(request);
    const userId = user.userId;

    const body = await request.json();
    const validatedData = submitAssignmentSchema.parse(body);

    // Find the assignment
    const assignment = await Assignment.findById(validatedData.assignmentId).populate('course');

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
        { error: 'You must be enrolled in this course to submit assignments' },
        { status: 403 }
      );
    }

    // Check if assignment already submitted (prevent duplicates)
    const existingSubmission = await Submission.findOne({
      student: userId,
      assignment: validatedData.assignmentId,
    });

    if (existingSubmission) {
      return NextResponse.json(
        {
          error: 'Assignment already submitted',
          data: {
            submission: existingSubmission,
          },
        },
        { status: 400 }
      );
    }

    // Create submission
    const submission = await Submission.create({
      assignment: validatedData.assignmentId,
      student: userId,
      submissionText: validatedData.submissionText,
      submissionUrl: validatedData.submissionUrl,
      status: 'submitted',
      submittedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: 'Assignment submitted successfully',
        data: submission,
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error }, { status: 400 });
    }

    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during assignment submission:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle authentication errors
    return handleAuthError(error);
  }
}
