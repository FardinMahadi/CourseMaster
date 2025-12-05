import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { NextResponse } from 'next/server';

import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';

import Lesson from '@/models/Lesson';
import Course from '@/models/Course';

const updateLessonSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  duration: z.number().min(0).optional(),
  order: z.number().min(1).optional(),
  isPreview: z.boolean().optional(),
});

// PUT /api/lessons/[id] - Update lesson (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const user = requireAdmin(request);
    const userId = user.userId;

    const lesson = await Lesson.findById(id).populate('course');
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const course = await Course.findById(lesson.course);
    if (!course || course.instructor.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateLessonSchema.parse(body);

    Object.assign(lesson, validatedData);
    await lesson.save();

    return NextResponse.json(
      {
        message: 'Lesson updated successfully',
        data: lesson,
      },
      { status: 200 }
    );
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return handleAuthError(error);
  }
}

// DELETE /api/lessons/[id] - Delete lesson (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const user = requireAdmin(request);
    const userId = user.userId;

    const lesson = await Lesson.findById(id).populate('course');
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const course = await Course.findById(lesson.course);
    if (!course || course.instructor.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Lesson.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Lesson deleted successfully' }, { status: 200 });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    return handleAuthError(error);
  }
}
