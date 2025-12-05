import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { NextResponse } from 'next/server';

import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { requireAdmin, handleAuthError } from '@/lib/auth-helpers';

import Quiz from '@/models/Quiz';
import Course from '@/models/Course';

const quizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).min(2).max(6),
  correctAnswer: z.number().min(0),
  points: z.number().min(0).default(1),
});

const createQuizSchema = z.object({
  course: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID'),
  lesson: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  questions: z.array(quizQuestionSchema).min(1),
  timeLimit: z.number().min(1).optional(),
  passingScore: z.number().min(0).max(100).default(60),
});

// POST /api/quizzes/admin - Create quiz (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = requireAdmin(request);
    const userId = user.userId;

    const body = await request.json();
    const validatedData = createQuizSchema.parse(body);

    // Verify course exists and admin owns it
    const course = await Course.findById(validatedData.course);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    if (course.instructor.toString() !== userId) {
      return NextResponse.json(
        { error: 'Forbidden. You can only add quizzes to your own courses.' },
        { status: 403 }
      );
    }

    const quiz = await Quiz.create(validatedData);

    return NextResponse.json(
      {
        message: 'Quiz created successfully',
        data: quiz,
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

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return handleAuthError(error);
  }
}
