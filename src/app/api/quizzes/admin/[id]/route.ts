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

const updateQuizSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().optional(),
  questions: z.array(quizQuestionSchema).min(1).optional(),
  timeLimit: z.number().min(1).optional(),
  passingScore: z.number().min(0).max(100).optional(),
});

// PUT /api/quizzes/admin/[id] - Update quiz (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const { id } = await params;
    const user = requireAdmin(request);
    const userId = user.userId;

    const quiz = await Quiz.findById(id).populate('course');
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const course = await Course.findById(quiz.course);
    if (!course || course.instructor.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateQuizSchema.parse(body);

    Object.assign(quiz, validatedData);
    await quiz.save();

    return NextResponse.json(
      {
        message: 'Quiz updated successfully',
        data: quiz,
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
