import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { quizIdSchema } from '@/lib/validations/quiz.schema';
import connectDB, { isDatabaseConnectionError } from '@/lib/db';

import Quiz from '@/models/Quiz';
import Enrollment from '@/models/Enrollment';
import QuizAttempt from '@/models/QuizAttempt';

// GET /api/quizzes/[id] - Get quiz details without correct answers (student only)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    // Get student user ID from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only students can view quizzes
    if (userRole !== 'student') {
      return NextResponse.json({ error: 'Only students can view quizzes' }, { status: 403 });
    }

    const { id } = await params;

    // Validate quiz ID
    if (!quizIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    // Find the quiz
    const quiz = await Quiz.findById(id)
      .populate('course', 'title')
      .populate('lesson', 'title')
      .lean();

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Verify student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: quiz.course,
      status: 'enrolled',
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You must be enrolled in this course to view quizzes' },
        { status: 403 }
      );
    }

    // Remove correct answers from questions
    const quizWithoutAnswers = {
      ...quiz,
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: q.options,
        points: q.points,
        // Don't include correctAnswer
      })),
    };

    // Get previous attempts
    const attempts = await QuizAttempt.find({
      student: userId,
      quiz: id,
    })
      .sort({ completedAt: -1 })
      .lean();

    return NextResponse.json(
      {
        data: {
          quiz: quizWithoutAnswers,
          attempts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during quiz fetch:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle other errors
    console.error('Quiz fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
