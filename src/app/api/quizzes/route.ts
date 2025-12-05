import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { quizQuerySchema } from '@/lib/validations/quiz.schema';
import { handleAuthError, requireStudent } from '@/lib/auth-helpers';

import Quiz from '@/models/Quiz';
import Enrollment from '@/models/Enrollment';
import QuizAttempt from '@/models/QuizAttempt';

// GET /api/quizzes - Get quizzes for enrolled courses (student only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Require authentication and student role
    const user = requireStudent(request);
    const userId = user.userId;

    const { searchParams } = new URL(request.url);
    const queryParams = {
      courseId: searchParams.get('courseId') || undefined,
      lessonId: searchParams.get('lessonId') || undefined,
    };

    const validatedQuery = quizQuerySchema.parse(queryParams);

    // Build filter for quizzes
    const quizFilter: Record<string, unknown> = {};

    if (validatedQuery.courseId) {
      // Verify student is enrolled in the course
      const enrollment = await Enrollment.findOne({
        student: userId,
        course: validatedQuery.courseId,
        status: 'enrolled',
      });

      if (!enrollment) {
        return NextResponse.json(
          { error: 'You must be enrolled in this course to view quizzes' },
          { status: 403 }
        );
      }

      quizFilter.course = validatedQuery.courseId;
    } else {
      // Get all enrolled courses
      const enrollments = await Enrollment.find({
        student: userId,
        status: 'enrolled',
      }).select('course');

      const courseIds = enrollments.map(e => e.course);
      quizFilter.course = { $in: courseIds };
    }

    if (validatedQuery.lessonId) {
      quizFilter.lesson = validatedQuery.lessonId;
    }

    // Fetch quizzes (without correct answers for list view)
    const quizzes = await Quiz.find(quizFilter)
      .populate('course', 'title')
      .populate('lesson', 'title')
      .sort({ createdAt: -1 })
      .lean();

    // Remove correct answers from questions for list view
    const quizzesWithoutAnswers = quizzes.map(quiz => ({
      ...quiz,
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: q.options,
        points: q.points,
        // Don't include correctAnswer
      })),
    }));

    // Fetch quiz attempts for these quizzes
    const quizIds = quizzes.map(q => q._id);
    const attempts = await QuizAttempt.find({
      student: userId,
      quiz: { $in: quizIds },
    })
      .sort({ completedAt: -1 })
      .lean();

    // Map attempts to quizzes
    const quizzesWithAttempts = quizzesWithoutAnswers.map(quiz => {
      const quizAttempts = attempts.filter(a => a.quiz.toString() === quiz._id.toString());

      return {
        ...quiz,
        attempts: quizAttempts,
        latestAttempt: quizAttempts[0] || undefined,
      };
    });

    return NextResponse.json(
      {
        data: {
          quizzes: quizzesWithAttempts,
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
      console.error('Database connection error during quiz fetch:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle authentication errors
    return handleAuthError(error);
  }
}
