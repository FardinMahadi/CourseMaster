import { NextRequest as NextRequestType, NextResponse } from 'next/server';

import { invalidateCourseListCache } from '@/lib/cache';
import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { courseIdSchema, updateCourseSchema } from '@/lib/validations/course.schema';

import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';

// GET /api/courses/[id] - Get course details
export async function GET(
  request: NextRequestType,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate course ID
    if (!courseIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    // Get user info from headers (if authenticated)
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    // Find course
    const course = await Course.findById(id).populate('instructor', 'name email').lean();

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if course is published or if user is admin
    if (!course.isPublished && userRole !== 'admin') {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Populate lessons if needed
    const Lesson = (await import('@/models/Lesson')).default;
    const lessons = await Lesson.find({ course: id }).sort({ order: 1 }).lean();

    return NextResponse.json(
      {
        data: {
          ...course,
          lessons,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during course fetch:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle other errors
    console.error('Course fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/courses/[id] - Update course (admin only)
export async function PUT(
  request: NextRequestType,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate course ID
    if (!courseIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    // Get admin user ID from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Find course
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Verify admin owns the course (or is admin)
    if (course.instructor.toString() !== userId) {
      return NextResponse.json(
        { error: 'Forbidden. You can only update your own courses.' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateCourseSchema.parse(body);

    // Update course
    Object.assign(course, validatedData);
    await course.save();

    // Populate instructor for response
    await course.populate('instructor', 'name email');

    // Invalidate course list cache since course was updated
    await invalidateCourseListCache();

    return NextResponse.json(
      {
        message: 'Course updated successfully',
        data: course.toJSON(),
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during course update:', error);
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

    // Handle other errors
    console.error('Course update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/courses/[id] - Delete course (admin only)
export async function DELETE(
  request: NextRequestType,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate course ID
    if (!courseIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid course ID' }, { status: 400 });
    }

    // Get admin user ID from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Find course
    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Verify admin owns the course
    if (course.instructor.toString() !== userId) {
      return NextResponse.json(
        { error: 'Forbidden. You can only delete your own courses.' },
        { status: 403 }
      );
    }

    // Check if course has enrollments
    const enrollmentCount = await Enrollment.countDocuments({ course: id });
    if (enrollmentCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete course with existing enrollments. Please remove enrollments first.',
        },
        { status: 409 }
      );
    }

    // Delete course
    await Course.findByIdAndDelete(id);

    // Invalidate course list cache since course was deleted
    await invalidateCourseListCache();

    return NextResponse.json(
      {
        message: 'Course deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during course deletion:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle other errors
    console.error('Course deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
