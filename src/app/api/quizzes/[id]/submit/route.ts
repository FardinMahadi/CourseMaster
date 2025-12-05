import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { quizIdSchema, submitQuizSchema } from '@/lib/validations/quiz.schema';

import Quiz from '@/models/Quiz';
import Enrollment from '@/models/Enrollment';
import QuizAttempt from '@/models/QuizAttempt';

// POST /api/quizzes/[id]/submit - Submit quiz answers and get results (student only)
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    // Get student user ID from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only students can submit quizzes
    if (userRole !== 'student') {
      return NextResponse.json({ error: 'Only students can submit quizzes' }, { status: 403 });
    }

    const { id } = await params;

    // Validate quiz ID
    if (!quizIdSchema.safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid quiz ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = submitQuizSchema.parse(body);

    // Verify quiz ID matches
    if (validatedData.quizId !== id) {
      return NextResponse.json(
        { error: 'Quiz ID in body does not match URL parameter' },
        { status: 400 }
      );
    }

    // Find the quiz
    const quiz = await Quiz.findById(id).lean();

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
        { error: 'You must be enrolled in this course to submit quizzes' },
        { status: 403 }
      );
    }

    // Validate answers array length matches questions
    if (validatedData.answers.length !== quiz.questions.length) {
      return NextResponse.json(
        { error: 'Number of answers does not match number of questions' },
        { status: 400 }
      );
    }

    // Calculate score
    let totalScore = 0;
    let earnedPoints = 0;
    const correctAnswers: number[] = [];

    quiz.questions.forEach((question, index) => {
      totalScore += question.points;
      correctAnswers.push(question.correctAnswer);

      const studentAnswer = validatedData.answers.find(a => a.questionIndex === index);

      if (studentAnswer && studentAnswer.selectedAnswer === question.correctAnswer) {
        earnedPoints += question.points;
      }
    });

    const percentage = totalScore > 0 ? Math.round((earnedPoints / totalScore) * 100) : 0;
    const isPassed = percentage >= quiz.passingScore;

    // Create quiz attempt
    const attempt = await QuizAttempt.create({
      quiz: id,
      student: userId,
      answers: validatedData.answers,
      score: percentage,
      isPassed,
      startedAt: new Date(),
      completedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: 'Quiz submitted successfully',
        data: {
          attempt,
          correctAnswers,
          totalQuestions: quiz.questions.length,
          totalScore,
          earnedPoints,
          percentage,
          isPassed,
          passingScore: quiz.passingScore,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input data', details: error }, { status: 400 });
    }

    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during quiz submission:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle other errors
    console.error('Quiz submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
