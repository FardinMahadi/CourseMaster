import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';
import { createBatchSchema, batchQuerySchema } from '@/lib/validations/batch.schema';

import Batch from '@/models/Batch';
import Course from '@/models/Course';

// GET /api/batches - List batches (with filters)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const queryParams = {
      course: searchParams.get('course') || undefined,
      instructor: searchParams.get('instructor') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const validatedQuery = batchQuerySchema.parse(queryParams);

    const filter: Record<string, unknown> = {};

    if (validatedQuery.course) {
      filter.course = validatedQuery.course;
    }

    if (validatedQuery.instructor) {
      filter.instructor = validatedQuery.instructor;
    }

    if (validatedQuery.status) {
      filter.status = validatedQuery.status;
    }

    const batches = await Batch.find(filter)
      .populate('course', 'title')
      .populate('instructor', 'name email')
      .sort({ startDate: -1 })
      .lean();

    return NextResponse.json(
      {
        data: {
          batches,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    return handleAuthError(error);
  }
}

// POST /api/batches - Create batch (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = requireAdmin(request);
    const userId = user.userId;

    const body = await request.json();
    const validatedData = createBatchSchema.parse(body);

    // Verify course exists and admin owns it
    const course = await Course.findById(validatedData.course);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.instructor.toString() !== userId) {
      return NextResponse.json(
        { error: 'Forbidden. You can only create batches for your own courses.' },
        { status: 403 }
      );
    }

    // Validate end date is after start date
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    if (endDate <= startDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    // Determine status based on dates
    const now = new Date();
    let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
    if (startDate <= now && endDate >= now) {
      status = 'ongoing';
    } else if (endDate < now) {
      status = 'completed';
    }

    const batch = await Batch.create({
      ...validatedData,
      instructor: validatedData.instructor || userId,
      status,
    });

    await batch.populate('course', 'title');
    await batch.populate('instructor', 'name email');

    return NextResponse.json(
      {
        message: 'Batch created successfully',
        data: batch,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    return handleAuthError(error);
  }
}
