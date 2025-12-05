import type { Quiz, QuizAttempt, QuizResult, QuizSubmission } from '@/types/student.types';

import api from './axios';

export interface GetQuizzesResponse {
  data: {
    quizzes: Array<
      Quiz & {
        attempts?: QuizAttempt[];
        latestAttempt?: QuizAttempt;
      }
    >;
  };
}

export interface GetQuizResponse {
  data: {
    quiz: Quiz;
    attempts: QuizAttempt[];
  };
}

export interface SubmitQuizResponse {
  message: string;
  data: QuizResult & {
    correctAnswers: number[];
    totalQuestions: number;
    totalScore: number;
    earnedPoints: number;
    percentage: number;
    isPassed: boolean;
    passingScore: number;
  };
}

/**
 * Get quizzes for enrolled courses
 */
export async function getQuizzes(
  courseId?: string,
  lessonId?: string
): Promise<GetQuizzesResponse> {
  const params = new URLSearchParams();

  if (courseId) {
    params.append('courseId', courseId);
  }

  if (lessonId) {
    params.append('lessonId', lessonId);
  }

  const queryString = params.toString();
  const url = queryString ? `/api/quizzes?${queryString}` : '/api/quizzes';

  const response = await api.get<GetQuizzesResponse>(url);

  return response.data;
}

/**
 * Get quiz details without correct answers
 */
export async function getQuiz(id: string): Promise<GetQuizResponse> {
  const response = await api.get<GetQuizResponse>(`/api/quizzes/${id}`);

  return response.data;
}

/**
 * Submit quiz answers and get results
 */
export async function submitQuiz(
  quizId: string,
  answers: QuizSubmission['answers']
): Promise<SubmitQuizResponse> {
  const response = await api.post<SubmitQuizResponse>(`/api/quizzes/${quizId}/submit`, {
    quizId,
    answers,
  });

  return response.data;
}
