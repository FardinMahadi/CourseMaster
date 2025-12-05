import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { NextResponse } from 'next/server';

import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';

import Lesson from '@/models/Lesson';
import Course from '@/models/Course';

const createLessonSchema = z.object({
  course: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().optional(),
  videoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  duration: z.number().min(0),
  order: z.number().min(1),
  isPreview: z.boolean().default(false),
});

// POST /api/lessons - Create lesson (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = requireAdmin(request);
    const userId = user.userId;

    const body = await request.json();
    const validatedData = createLessonSchema.parse(body);

    // Verify course exists and admin owns it
    const course = await Course.findById(validatedData.course);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.instructor.toString() !== userId) {
      return NextResponse.json(
        { error: 'Forbidden. You can only add lessons to your own courses.' },
        { status: 403 }
      );
    }

    const lesson = await Lesson.create(validatedData);

    return NextResponse.json(
      {
        message: 'Lesson created successfully',
        data: lesson,
      },
      { status: 201 }
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

    return handleAuthError(error);
  }
}
