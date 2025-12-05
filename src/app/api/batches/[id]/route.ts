import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';
import { batchIdSchema, updateBatchSchema } from '@/lib/validations/batch.schema';

import Batch from '@/models/Batch';
import Course from '@/models/Course';

// GET /api/batches/[id] - Get batch details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!batchIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid batch ID' }, { status: 400 });
    }

    const batch = await Batch.findById(id)
      .populate('course', 'title')
      .populate('instructor', 'name email')
      .lean();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        data: batch,
      },
      { status: 200 }
    );
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    console.error('Batch fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/batches/[id] - Update batch (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!batchIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid batch ID' }, { status: 400 });
    }

    const user = requireAdmin(request);
    const userId = user.userId;

    const batch = await Batch.findById(id).populate('course');
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const course = await Course.findById(batch.course);
    if (!course || course.instructor.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateBatchSchema.parse(body);

    // If dates are being updated, validate and recalculate status
    if (validatedData.startDate || validatedData.endDate) {
      const startDate = validatedData.startDate
        ? new Date(validatedData.startDate)
        : batch.startDate;
      const endDate = validatedData.endDate ? new Date(validatedData.endDate) : batch.endDate;

      if (endDate <= startDate) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
      }

      const now = new Date();
      if (startDate <= now && endDate >= now) {
        validatedData.status = 'ongoing';
      } else if (endDate < now) {
        validatedData.status = 'completed';
      } else {
        validatedData.status = 'upcoming';
      }
    }

    Object.assign(batch, validatedData);
    await batch.save();

    await batch.populate('course', 'title');
    await batch.populate('instructor', 'name email');

    return NextResponse.json(
      {
        message: 'Batch updated successfully',
        data: batch,
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

// DELETE /api/batches/[id] - Delete batch (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!batchIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid batch ID' }, { status: 400 });
    }

    const user = requireAdmin(request);
    const userId = user.userId;

    const batch = await Batch.findById(id).populate('course');
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const course = await Course.findById(batch.course);
    if (!course || course.instructor.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if batch has enrollments
    const Enrollment = (await import('@/models/Enrollment')).default;
    const enrollmentCount = await Enrollment.countDocuments({ batch: id });

    if (enrollmentCount > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete batch with existing enrollments. Please remove enrollments first.',
        },
        { status: 409 }
      );
    }

    await Batch.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Batch deleted successfully' }, { status: 200 });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    return handleAuthError(error);
  }
}
