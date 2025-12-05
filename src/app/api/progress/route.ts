import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { progressQuerySchema, updateProgressSchema } from '@/lib/validations/progress.schema';

import Lesson from '@/models/Lesson';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import Enrollment from '@/models/Enrollment';

// POST /api/progress - Update or create progress (student only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get student user ID from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only students can update progress
    if (userRole !== 'student') {
      return NextResponse.json({ error: 'Only students can update progress' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateProgressSchema.parse(body);

    // Verify student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: validatedData.courseId,
      status: 'enrolled',
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You must be enrolled in this course to track progress' },
        { status: 403 }
      );
    }

    // Verify course and lesson exist
    const course = await Course.findById(validatedData.courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const lesson = await Lesson.findById(validatedData.lessonId);
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Verify lesson belongs to the course
    if (lesson.course.toString() !== validatedData.courseId) {
      return NextResponse.json({ error: 'Lesson does not belong to this course' }, { status: 400 });
    }

    // Find or create progress record
    let progress = await Progress.findOne({
      student: userId,
      course: validatedData.courseId,
      lesson: validatedData.lessonId,
    });

    if (progress) {
      // Update existing progress
      progress.isCompleted = validatedData.isCompleted;
      progress.timeSpent = (progress.timeSpent || 0) + (validatedData.timeSpent || 0);
      progress.lastAccessedAt = new Date();

      if (validatedData.isCompleted && !progress.completedAt) {
        progress.completedAt = new Date();
      }

      await progress.save();
    } else {
      // Create new progress record
      progress = await Progress.create({
        student: userId,
        course: validatedData.courseId,
        lesson: validatedData.lessonId,
        isCompleted: validatedData.isCompleted,
        timeSpent: validatedData.timeSpent || 0,
        lastAccessedAt: new Date(),
        completedAt: validatedData.isCompleted ? new Date() : undefined,
      });
    }

    return NextResponse.json(
      {
        message: 'Progress updated successfully',
        data: progress,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error }, { status: 400 });
    }

    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during progress update:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle other errors
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/progress - Get progress records (student only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get student user ID from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only students can view their progress
    if (userRole !== 'student') {
      return NextResponse.json({ error: 'Only students can view progress' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = {
      courseId: searchParams.get('courseId') || undefined,
      lessonId: searchParams.get('lessonId') || undefined,
    };

    const validatedQuery = progressQuerySchema.parse(queryParams);

    // Build filter
    const filter: Record<string, unknown> = {
      student: userId,
    };

    if (validatedQuery.courseId) {
      filter.course = validatedQuery.courseId;
    }

    if (validatedQuery.lessonId) {
      filter.lesson = validatedQuery.lessonId;
    }

    // Fetch progress records
    const progressRecords = await Progress.find(filter)
      .populate('course', 'title')
      .populate('lesson', 'title order')
      .sort({ lastAccessedAt: -1 })
      .lean();

    // Calculate course progress if courseId is provided
    let courseProgress = null;
    if (validatedQuery.courseId) {
      const totalLessons = await Lesson.countDocuments({
        course: validatedQuery.courseId,
      });

      const completedLessons = await Progress.countDocuments({
        student: userId,
        course: validatedQuery.courseId,
        isCompleted: true,
      });

      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      courseProgress = {
        courseId: validatedQuery.courseId,
        completedLessons,
        totalLessons,
        percentage,
      };
    }

    return NextResponse.json(
      {
        data: {
          progress: progressRecords,
          courseProgress,
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
      console.error('Database connection error during progress fetch:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle other errors
    console.error('Progress fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
