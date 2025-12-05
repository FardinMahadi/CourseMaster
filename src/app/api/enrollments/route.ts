import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { sendEnrollmentEmail } from '@/lib/email';
import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { handleAuthError, requireStudent } from '@/lib/auth-helpers';
import { createEnrollmentSchema, enrollmentQuerySchema } from '@/lib/validations/enrollment.schema';

import User from '@/models/User';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';

// POST /api/enrollments - Enroll in a course (student only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Require authentication and student role
    // This replaces the middleware header checks with direct token verification
    const user = requireStudent(request);
    const userId = user.userId;

    const body = await request.json();
    const validatedData = createEnrollmentSchema.parse(body);

    // Check if course exists and is published
    const course = await Course.findById(validatedData.courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (!course.isPublished) {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 403 }
      );
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: userId,
      course: validatedData.courseId,
    });

    if (existingEnrollment) {
      return NextResponse.json(
        {
          error: 'You are already enrolled in this course',
          data: {
            enrollment: await existingEnrollment.populate('course', 'title description thumbnail'),
          },
        },
        { status: 409 }
      );
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: userId,
      course: validatedData.courseId,
      batch: validatedData.batchId,
      status: 'enrolled',
      enrolledAt: new Date(),
    });

    await enrollment.save();

    // Populate course data for response
    await enrollment.populate('course', 'title description thumbnail price category');

    // Send enrollment email (non-blocking)
    const student = await User.findById(userId).select('name email');
    if (student && course) {
      sendEnrollmentEmail(student.name, student.email, course.title, course._id.toString()).catch(
        error => {
          console.error('Failed to send enrollment email:', error);
          // Email failure shouldn't break enrollment
        }
      );
    }

    return NextResponse.json(
      {
        message: 'Successfully enrolled in course',
        data: enrollment.toJSON(),
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during enrollment:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors (unique constraint)
    if (error instanceof Error && (error as any).code === 11000) {
      return NextResponse.json(
        {
          error: 'You are already enrolled in this course',
        },
        { status: 409 }
      );
    }

    // Handle authentication errors
    return handleAuthError(error);
  }
}

// GET /api/enrollments - List enrollments (student only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Require authentication and student role
    const user = requireStudent(request);
    const userId = user.userId;

    const { searchParams } = new URL(request.url);
    const queryParams = {
      courseId: searchParams.get('courseId') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const validatedQuery = enrollmentQuerySchema.parse(queryParams);

    // Build filter
    const filter: Record<string, unknown> = {
      student: userId,
    };

    if (validatedQuery.courseId) {
      filter.course = validatedQuery.courseId;
    }

    if (validatedQuery.status) {
      filter.status = validatedQuery.status;
    }

    // Fetch enrollments
    const enrollments = await Enrollment.find(filter)
      .populate('course', 'title description thumbnail price category duration level')
      .sort({ enrolledAt: -1 })
      .lean();

    return NextResponse.json(
      {
        data: {
          enrollments,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during enrollment fetch:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Handle authentication errors
    return handleAuthError(error);
  }
}
