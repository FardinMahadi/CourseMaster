import { z } from 'zod';

// Schema for quiz answer
export const quizAnswerSchema = z.object({
  questionIndex: z.number().min(0, 'Question index must be non-negative'),
  selectedAnswer: z.number().min(0, 'Selected answer index must be non-negative'),
});

// Schema for submitting a quiz
export const submitQuizSchema = z.object({
  quizId: z.string().min(1, 'Quiz ID is required'),
  answers: z.array(quizAnswerSchema).min(1, 'At least one answer is required'),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;

// Schema for querying quizzes
export const quizQuerySchema = z.object({
  courseId: z.string().min(1, 'Invalid course ID').optional(),
  lessonId: z.string().min(1, 'Invalid lesson ID').optional(),
});

export type QuizQueryInput = z.infer<typeof quizQuerySchema>;

// Schema for quiz ID validation
export const quizIdSchema = z
  .string()
  .min(1, 'Quiz ID is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid quiz ID format');
